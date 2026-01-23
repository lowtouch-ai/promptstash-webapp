import { PromptTemplate } from '@/app/data/mock-templates';
import * as yaml from 'js-yaml';

const GITHUB_REPO = 'lowtouch-ai/promptstash-templates';
const GITHUB_BRANCH = 'main';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const CACHE_KEY = 'promptstash_templates_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds (extended from 1 hour)

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
  contributor?: string; // GitHub username of template owner
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

interface CacheData {
  templates: PromptTemplate[];
  timestamp: number;
}

// Load templates from cache
function loadFromCache(): PromptTemplate[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - data.timestamp < CACHE_TTL) {
      console.log('Using cached templates (fresh)');
      return data.templates;
    }

    console.log('Cache expired');
    return null;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
}

// Save templates to cache
function saveToCache(templates: PromptTemplate[]): void {
  try {
    const data: CacheData = {
      templates,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    console.log('Templates cached successfully');
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

// Load stale cache (even if expired) as fallback
function loadStaleCache(): PromptTemplate[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    console.log('Using stale cached templates as fallback');
    return data.templates;
  } catch (error) {
    console.error('Error loading stale cache:', error);
    return null;
  }
}

// Load static pre-warmed cache from public folder
async function loadStaticCache(): Promise<PromptTemplate[] | null> {
  try {
    const response = await fetch('/templates-cache.json');
    if (!response.ok) {
      console.log('No static cache file available');
      return null;
    }
    
    const data: CacheData = await response.json();
    console.log('Loaded templates from static cache file');
    
    // Save to localStorage for future use
    saveToCache(data.templates);
    
    return data.templates;
  } catch (error) {
    console.log('Static cache not available:', error);
    return null;
  }
}

export async function fetchTemplatesFromGitHub(): Promise<PromptTemplate[]> {
  // Try to load from cache first
  const cachedTemplates = loadFromCache();
  if (cachedTemplates) {
    return cachedTemplates;
  }

  // Check for stale cache - if it exists, we'll return it if GitHub fetch fails
  const staleTemplates = loadStaleCache();

  // Try to load static cache as a fallback
  const staticTemplates = await loadStaticCache();
  if (staticTemplates) {
    return staticTemplates;
  }

  try {
    // Fetch the repository tree
    const treeUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
    const treeResponse = await fetch(treeUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!treeResponse.ok) {
      // Check if it's a rate limit error
      if (treeResponse.status === 403) {
        // Return stale cache if available, otherwise empty array
        if (staleTemplates) {
          console.log('Returning stale cache due to rate limit');
          return staleTemplates;
        }
        
        // If no stale cache, return empty array - this is expected behavior
        return [];
      }
      
      const errorText = await treeResponse.text();
      console.error('GitHub API Error:', {
        status: treeResponse.status,
        statusText: treeResponse.statusText,
        body: errorText,
      });
      
      // Return stale cache or empty array instead of throwing
      if (staleTemplates) {
        console.log('Returning stale cache due to API error');
        return staleTemplates;
      }
      return [];
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

          // Fetch the last commit date for this file from GitHub API
          let lastUpdated = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          try {
            const commitsUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/commits?path=${encodeURIComponent(file.path)}&per_page=1`;
            const commitsResponse = await fetch(commitsUrl, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
              },
            });

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
          } catch (commitError) {
            console.warn(`Could not fetch commit date for ${file.path}:`, commitError);
            // Fall back to current date if commit fetch fails
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
            name: parsed.name || pathParts[pathParts.length - 1].replace(/\\.ya?ml$/, ''),
            description: parsed.description || '',
            category: parsed.category || folderTags[0] || 'Uncategorized',
            tags: Array.from(new Set(allTags)), // Remove duplicates
            template: templateText,
            placeholders,
            source: 'github',
            lastUpdated,
            githubCommit: file.sha.substring(0, 7),
            githubUrl: `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${file.path}`,
            yamlPath: file.path, // Add the relative path for permalinks
            contributor: parsed.contributor, // Add contributor GitHub username
          };

          return template;
        } catch (error) {
          console.error(`Error parsing ${file.path}:`, error);
          
          // Enhanced error message for YAML parsing errors
          if (error instanceof Error && error.name === 'YAMLException') {
            console.error(`YAMLException in ${file.path}: ${error.message}`);
          }
          
          return null;
        }
      })
    );

    // Filter out nulls and return
    const filteredTemplates = templates.filter((t): t is PromptTemplate => t !== null);
    saveToCache(filteredTemplates);
    return filteredTemplates;
  } catch (error) {
    console.error('Error fetching templates from GitHub:', error);
    // Try to load stale cache as fallback
    if (staleTemplates) {
      return staleTemplates;
    }
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