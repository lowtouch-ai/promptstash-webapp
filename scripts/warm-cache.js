#!/usr/bin/env node

/**
 * Cache Warming Script for PromptStash
 *
 * This script pre-fetches all templates from GitHub and saves them to a JSON file
 * that can be used to initialize the app's cache. This helps avoid hitting GitHub
 * API rate limits on initial page load.
 *
 * Usage:
 *   node scripts/warm-cache.js
 *   GITHUB_TOKEN=your_token node scripts/warm-cache.js  # With authentication
 *
 * The generated cache file can be:
 * - Served as a static asset
 * - Used to pre-populate localStorage on first visit
 * - Committed to the repository for offline use
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_REPO = 'lowtouch-ai/promptstash-templates';
const GITHUB_BRANCH = 'main';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'templates-cache.json');

// Get GitHub token from environment variable (optional but recommended)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchWithAuth(url) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'PromptStash-Cache-Warmer',
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return fetch(url, { headers });
}

async function warmCache() {
  console.log('🔥 Warming cache for PromptStash templates...\n');
  
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  No GITHUB_TOKEN found. Using unauthenticated requests (lower rate limit).');
    console.warn('   Set GITHUB_TOKEN environment variable for higher rate limits.\n');
  }

  try {
    // Fetch the repository tree
    console.log('📂 Fetching repository tree...');
    const treeUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
    const treeResponse = await fetchWithAuth(treeUrl);
    
    if (!treeResponse.ok) {
      const errorText = await treeResponse.text();
      console.error('❌ GitHub API Error:', {
        status: treeResponse.status,
        statusText: treeResponse.statusText,
        body: errorText,
      });
      
      if (treeResponse.status === 403) {
        const rateLimitRemaining = treeResponse.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = treeResponse.headers.get('X-RateLimit-Reset');
        console.error('⏱️  Rate limit info:', { rateLimitRemaining, rateLimitReset });
      }
      
      throw new Error(`Failed to fetch repository tree: ${treeResponse.status}`);
    }

    const treeData = await treeResponse.json();
    console.log(`✅ Found ${treeData.tree.length} items in repository\n`);

    // Find all YAML files
    const yamlFiles = treeData.tree.filter(
      (item) => item.type === 'blob' && (item.path.endsWith('.yaml') || item.path.endsWith('.yml'))
    );
    
    console.log(`📄 Processing ${yamlFiles.length} YAML template files...\n`);

    // Fetch and parse each YAML file
    const templates = [];
    for (const file of yamlFiles) {
      try {
        process.stdout.write(`   Processing ${file.path}... `);
        
        const rawUrl = `${GITHUB_RAW_BASE}/${GITHUB_REPO}/${GITHUB_BRANCH}/${file.path}`;
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
          console.log(`❌ Failed (${response.status})`);
          continue;
        }

        const content = await response.text();
        const parsed = yaml.parse(content);

        // Extract folder tags from path
        const pathParts = file.path.split('/');
        const folderTags = pathParts.slice(0, -1).filter(Boolean);

        // Combine tags from YAML and folders
        const allTags = [
          ...(parsed.tags || []),
          ...folderTags,
        ];

        // Use current date as lastUpdated
        const lastUpdated = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        // Extract template text from prompt field
        let templateText = '';
        if (typeof parsed.prompt === 'string') {
          templateText = parsed.prompt;
        } else if (parsed.prompt && typeof parsed.prompt === 'object') {
          templateText = parsed.prompt.user || parsed.prompt.system || '';
        } else if (parsed.template) {
          templateText = parsed.template;
        }

        // Parse placeholders
        let placeholders = [];
        
        if (parsed.inputs && parsed.inputs.length > 0) {
          placeholders = parsed.inputs.map((input) => ({
            name: input.name,
            description: input.description,
            required: input.required ?? false,
            type: input.type,
          }));
        } else if (parsed.placeholders && parsed.placeholders.length > 0) {
          placeholders = parsed.placeholders.map((p) => ({
            name: p.name,
            description: p.description,
            required: p.required ?? true,
          }));
        } else if (templateText) {
          const regex = /\{\{([^}]+)\}\}/g;
          const matches = [...templateText.matchAll(regex)];
          const uniqueNames = new Set(matches.map(match => match[1].trim()));
          placeholders = Array.from(uniqueNames).map(name => ({
            name,
            description: undefined,
            required: false,
          }));
        }

        const template = {
          id: file.sha,
          name: parsed.name || pathParts[pathParts.length - 1].replace(/\.ya?ml$/, ''),
          description: parsed.description || '',
          category: parsed.category || folderTags[0] || 'Uncategorized',
          tags: Array.from(new Set(allTags)),
          template: templateText,
          placeholders,
          source: 'github',
          lastUpdated,
          githubCommit: file.sha.substring(0, 7),
          githubUrl: `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${file.path}`,
          yamlPath: file.path,
        };

        templates.push(template);
        console.log('✅');
      } catch (error) {
        console.log(`❌ ${error.message}`);
      }
    }

    // Create cache data structure
    const cacheData = {
      templates,
      timestamp: Date.now(),
      generatedAt: new Date().toISOString(),
    };

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cacheData, null, 2));
    
    console.log(`\n✅ Successfully cached ${templates.length} templates!`);
    console.log(`📦 Cache file saved to: ${OUTPUT_FILE}`);
    console.log(`📊 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);
    
    // Show rate limit info if available
    const rateLimitUrl = `${GITHUB_API_BASE}/rate_limit`;
    const rateLimitResponse = await fetchWithAuth(rateLimitUrl);
    if (rateLimitResponse.ok) {
      const rateLimitData = await rateLimitResponse.json();
      const core = rateLimitData.resources.core;
      console.log(`\n📊 GitHub API Rate Limit:`);
      console.log(`   Remaining: ${core.remaining}/${core.limit}`);
      console.log(`   Resets at: ${new Date(core.reset * 1000).toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error warming cache:', error.message);
    process.exit(1);
  }
}

warmCache();
