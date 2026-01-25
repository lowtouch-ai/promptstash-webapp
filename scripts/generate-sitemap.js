import { Octokit } from '@octokit/rest';
import { parseDocument } from 'yaml';
import fs from 'fs';
import path from 'path';

const REPO_OWNER = 'lowtouch-ai';
const REPO_NAME = 'promptstash-templates';
const REPO_PATH = '';  // Templates are at root level
const BASE_URL = 'https://promptstash.io';

// Create Octokit instance with optional authentication
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Optional: set GITHUB_TOKEN env variable for higher rate limits
});

// Get the last commit date for a specific file
async function getFileLastModified(filePath) {
  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      per_page: 1,
    });

    if (commits.length > 0) {
      const commitDate = commits[0].commit.committer.date;
      return commitDate.split('T')[0]; // Return YYYY-MM-DD format
    }
  } catch (error) {
    console.warn(`Could not get last modified date for ${filePath}: ${error.message}`);
  }
  return new Date().toISOString().split('T')[0]; // Fallback to today
}

async function fetchTemplatesFromGitHub() {
  try {
    console.log('Fetching templates from GitHub...');
    
    // Check rate limit before making requests
    try {
      const { data: rateLimit } = await octokit.rateLimit.get();
      const remaining = rateLimit.rate.remaining;
      const resetTime = new Date(rateLimit.rate.reset * 1000);
      
      console.log(`GitHub API rate limit: ${remaining} requests remaining`);
      console.log(`Rate limit resets at: ${resetTime.toLocaleString()}`);
      
      if (remaining < 10) {
        console.warn('⚠️  Warning: Low API rate limit remaining');
        console.warn('   Consider setting GITHUB_TOKEN environment variable for higher limits');
        console.warn('   Create token at: https://github.com/settings/tokens');
      }
    } catch (rateLimitError) {
      console.warn('Could not check rate limit:', rateLimitError.message);
    }
    
    const templates = [];

    // Fetch the repository tree recursively
    const { data: tree } = await octokit.git.getTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree_sha: 'main',
      recursive: 'true',
    });

    // Filter for .yaml files
    const yamlFiles = tree.tree.filter(
      (item) =>
        (item.path?.endsWith('.yaml') || item.path?.endsWith('.yml')) &&
        item.type === 'blob'
    );

    console.log(`Found ${yamlFiles.length} YAML files`);

    // Fetch and parse each YAML file
    for (const file of yamlFiles) {
      try {
        const { data: fileData } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
        });

        if ('content' in fileData) {
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          const doc = parseDocument(content);
          const data = doc.toJSON();

          if (data && data.name) {
            // Use full path as yamlPath
            const yamlPath = file.path;

            // Get last modified date from git history
            const lastModified = await getFileLastModified(file.path);

            templates.push({
              name: data.name,
              yamlPath: yamlPath,
              lastModified: lastModified,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing ${file.path}:`, error.message);
      }
    }

    console.log(`Successfully parsed ${templates.length} templates`);
    return templates;
  } catch (error) {
    if (error.status === 403) {
      console.error('\n❌ GitHub API rate limit exceeded!');
      console.error('\nTo fix this issue:');
      console.error('1. Create a GitHub personal access token at: https://github.com/settings/tokens');
      console.error('2. Set the GITHUB_TOKEN environment variable:');
      console.error('   export GITHUB_TOKEN=your_token_here');
      console.error('3. Run the script again: npm run generate-sitemap\n');
      
      if (error.response?.headers) {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        if (resetTime) {
          const resetDate = new Date(parseInt(resetTime) * 1000);
          console.error(`Rate limit will reset at: ${resetDate.toLocaleString()}\n`);
        }
      }
    } else {
      console.error('Error fetching templates:', error.message);
    }
    return [];
  }
}

function generateSitemap(templates) {
  const urls = [
    // Homepage
    {
      loc: BASE_URL,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '1.0',
    },
    // Template permalinks
    ...templates.map((template) => ({
      loc: `${BASE_URL}/?y=${encodeURIComponent(template.yamlPath)}`,
      lastmod: template.lastModified,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return xml;
}

async function main() {
  console.log('Starting sitemap generation...');
  
  const templates = await fetchTemplatesFromGitHub();
  
  if (templates.length === 0) {
    console.error('No templates found. Sitemap not generated.');
    process.exit(1);
  }

  const sitemap = generateSitemap(templates);
  
  // Write to public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`   Location: ${sitemapPath}`);
  console.log(`   Total URLs: ${templates.length + 1}`);
  console.log(`   Templates: ${templates.length}`);
}

main().catch(console.error);