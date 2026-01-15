import { PromptTemplate } from '@/app/data/mock-templates';
import * as yaml from 'js-yaml';

const GITHUB_REPO = 'lowtouch-ai/promptstash-templates';
const GITHUB_BRANCH = 'main';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface YAMLTemplate {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  prompt?: string | { user?: string; system?: string }; // YAML files use "prompt" field with nested "user"
  template?: string; // Fallback for backwards compatibility
  inputs?: Array<{
    name: string;
    description?: string;
    required?: boolean;
    type?: string; // Type of input field (e.g., "text", "string", etc.)
  }>; // Metadata for variables from "inputs" section
  placeholders?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>; // Fallback for backwards compatibility
}

export async function fetchTemplatesFromGitHub(): Promise<PromptTemplate[]> {
  try {
    // Fetch the repository tree
    const treeUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
    const treeResponse = await fetch(treeUrl);
    
    if (!treeResponse.ok) {
      throw new Error(`Failed to fetch repository tree: ${treeResponse.statusText}`);
    }

    const treeData: GitHubTree = await treeResponse.json();

    // Find all YAML files
    const yamlFiles = treeData.tree.filter(
      (item) => item.type === 'blob' && (item.path.endsWith('.yaml') || item.path.endsWith('.yml'))
    );

    // Fetch and parse each YAML file
    const templates = await Promise.all(
      yamlFiles.map(async (file) => {
        try {
          const rawUrl = `${GITHUB_RAW_BASE}/${GITHUB_REPO}/${GITHUB_BRANCH}/${file.path}`;
          const response = await fetch(rawUrl);
          
          if (!response.ok) {
            console.error(`Failed to fetch ${file.path}`);
            return null;
          }

          const content = await response.text();
          const parsed = yaml.load(content) as YAMLTemplate;

          // Extract folder tags from path
          const pathParts = file.path.split('/');
          const folderTags = pathParts.slice(0, -1).filter(Boolean); // All folders in path

          // Combine tags from YAML and folders
          const allTags = [
            ...(parsed.tags || []),
            ...folderTags,
          ];

          // Get last modified date from Git commits API
          let lastUpdated = 'Unknown';
          try {
            const commitsUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/commits?path=${file.path}&page=1&per_page=1`;
            const commitsResponse = await fetch(commitsUrl);
            
            if (commitsResponse.ok) {
              const commits = await commitsResponse.json();
              if (commits && commits.length > 0) {
                const commitDate = new Date(commits[0].commit.author.date);
                lastUpdated = commitDate.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
              }
            }
          } catch (error) {
            console.error(`Failed to fetch commit date for ${file.path}:`, error);
            // Fallback to current date if commit fetch fails
            lastUpdated = new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }

          // Extract template text from prompt field (could be string or nested object with "user" key)
          let templateText = '';
          if (typeof parsed.prompt === 'string') {
            templateText = parsed.prompt;
          } else if (parsed.prompt && typeof parsed.prompt === 'object') {
            templateText = parsed.prompt.user || parsed.prompt.system || '';
          } else if (parsed.template) {
            templateText = parsed.template;
          }

          // Parse placeholders: prefer "inputs" section, fallback to "placeholders", or auto-detect from template
          let placeholders: Array<{ name: string; description?: string; required?: boolean; type?: string }> = [];
          
          if (parsed.inputs && parsed.inputs.length > 0) {
            // Use inputs section for metadata
            placeholders = parsed.inputs.map((input) => ({
              name: input.name,
              description: input.description,
              required: input.required ?? false,
              type: input.type,
            }));
          } else if (parsed.placeholders && parsed.placeholders.length > 0) {
            // Fallback to placeholders section
            placeholders = parsed.placeholders.map((p) => ({
              name: p.name,
              description: p.description,
              required: p.required ?? true,
            }));
          } else if (templateText) {
            // Auto-detect placeholders from template text as last resort
            const regex = /\{\{([^}]+)\}\}/g;
            const matches = [...templateText.matchAll(regex)];
            const uniqueNames = new Set(matches.map(match => match[1].trim()));
            placeholders = Array.from(uniqueNames).map(name => ({
              name,
              description: undefined,
              required: false,
            }));
          }

          const template: PromptTemplate = {
            id: file.sha,
            name: parsed.name || pathParts[pathParts.length - 1].replace(/\.ya?ml$/, ''),
            description: parsed.description || '',
            category: parsed.category || folderTags[0] || 'Uncategorized',
            tags: Array.from(new Set(allTags)), // Remove duplicates
            template: templateText,
            placeholders,
            source: 'github',
            lastUpdated,
            githubCommit: file.sha.substring(0, 7),
            githubUrl: `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${file.path}`,
          };

          return template;
        } catch (error) {
          console.error(`Error parsing ${file.path}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls and return
    return templates.filter((t): t is PromptTemplate => t !== null);
  } catch (error) {
    console.error('Error fetching templates from GitHub:', error);
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}