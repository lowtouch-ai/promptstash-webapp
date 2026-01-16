# PromptStash Scripts

This directory contains utility scripts for PromptStash maintenance and optimization.

## Scripts

### 1. Sitemap Generator (`generate-sitemap.js`)

Generates a sitemap.xml file with all template permalinks for SEO.

#### Usage

**Without GitHub Token (Rate Limited)**
```bash
npm run generate-sitemap
```

**Note:** Unauthenticated GitHub API requests are limited to 60 per hour. This may not be enough to fetch all templates.

**With GitHub Token (Recommended)**
For higher rate limits (5,000 requests per hour), use a GitHub personal access token:

1. **Create a GitHub Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `public_repo` (or no scopes for public repositories)
   - Generate and copy the token

2. **Set the token as environment variable:**
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```

3. **Run the generator:**
   ```bash
   npm run generate-sitemap
   ```

#### Output

The script will create `/public/sitemap.xml` containing:
- Homepage URL
- Permalink for each template in the format `/?y=path/to/template.yaml`

#### SEO Setup

The sitemap is automatically referenced in `/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://promptstash.io/sitemap.xml
```

### 2. Cache Warmer (`warm-cache.js`)

Pre-fetches all templates from GitHub and creates a static cache file to avoid API rate limits.

#### Usage

**Without GitHub Token (Rate Limited)**
```bash
node scripts/warm-cache.js
```

**With GitHub Token (Recommended)**
```bash
GITHUB_TOKEN=your_token_here node scripts/warm-cache.js
```

#### Output

The script will create `/public/templates-cache.json` containing:
- All templates from the GitHub repository
- Timestamp of cache generation
- Pre-parsed template data ready for immediate use

#### Integration

This cache file can be used to:
- Pre-populate localStorage on first visit
- Provide instant loading without API calls
- Work as an offline fallback
- Reduce GitHub API usage

To use the cache in your app, load it on first visit before hitting the GitHub API.

## Troubleshooting

### Rate Limit Exceeded
If you see "GitHub API rate limit exceeded", wait for the rate limit to reset (shown in the error message) or use a GitHub token as described above.

### No Templates Found
- Check your internet connection
- Verify the repository is public: https://github.com/lowtouch-ai/promptstash-templates
- Check if the repository structure matches the expected format

## Automation

You can run these scripts:
- Before each deployment
- As part of a CI/CD pipeline
- On a schedule to keep data updated