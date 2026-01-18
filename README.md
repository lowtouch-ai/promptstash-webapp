# PromptStash

> A modern web application for discovering, previewing, customizing, and executing prompt templates

[![GitHub](https://img.shields.io/badge/GitHub-lowtouch--ai%2Fpromptstash--webapp-blue?logo=github)](https://github.com/lowtouch-ai/promptstash-webapp)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

PromptStash is a powerful, open-source prompt management tool that helps you organize, customize, and deploy AI prompts across multiple platforms. Built with modern web technologies and designed for productivity.

**🌐 [Use PromptStash for free at promptstash.io](https://promptstash.io)** - Works seamlessly with ChatGPT, Claude, Grok, and Gemini.

**📝 Contribute to the Template Library** - Help grow the prompt collection by contributing your own templates to the [promptstash-templates repository](https://github.com/lowtouch-ai/promptstash-templates). Share your best prompts with the community!

## ✨ Features

### 🎯 Core Functionality
- **Template Management**: Browse and search through a collection of prompt templates
- **Smart Filtering**: Filter by categories, tags, favorites, and recently used templates
- **Variable System**: Parse and fill in template variables with a dedicated workspace
- **Live Preview**: Real-time preview of prompts with filled variables
- **Multi-Platform Support**: Send prompts directly to ChatGPT, Claude, Grok, and Gemini

### 💾 Persistence & State
- **Auto-Save Variables**: Input values automatically save to localStorage per template
- **Favorites System**: Mark templates as favorites with persistent storage
- **Recently Used**: Track recently accessed templates with timestamps
- **Smart Filters**: Quick filters that auto-reset when switching between different filter types

### 🎨 User Experience
- **Three-Panel Layout**: Global navigation, filterable sidebar, and main content area
- **Smooth Animations**: Motion-powered transitions between views
- **Card & List Views**: Toggle between different template display modes
- **Keyboard Shortcuts**: Ctrl/Cmd+Click for new tabs on AI platform links
- **Responsive Design**: Clean aesthetic inspired by GitHub, Vercel, and Linear

### 🔧 Advanced Features
- **Multi-Select Tags**: Select multiple tags with Ctrl/Cmd+Click or Shift+Click ranges
- **GitHub Integration**: Link templates to their source repositories
- **Date Tracking**: Show actual last commit timestamps from Git
- **Template Parser**: Automatically detect `{{variable-name}}` placeholders
- **Copy to Clipboard**: One-click copy with visual feedback
- **URL Prefilling**: Pre-populate AI platforms with your prompt (when supported)
- **Permalink Support**: Share templates and filters via URL parameters - [Learn more →](PERMALINKS.md)
- **Contributor Attribution**: Display template authors with direct links to their GitHub profiles

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lowtouch-ai/promptstash-webapp.git
cd promptstash-webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## 🏗️ Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling framework

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Motion (Framer Motion)** - Animation library
- **Sonner** - Toast notifications

### Additional Libraries
- **js-yaml** - YAML parsing for template metadata
- **date-fns** - Date formatting
- **clsx** + **tailwind-merge** - Utility class management

## 📁 Project Structure

```
promptstash-webapp/
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── sidebar.tsx  # Filterable sidebar
│   │   │   ├── template-list.tsx
│   │   │   └── template-detail.tsx
│   │   ├── data/            # Mock data and types
│   │   ├── services/        # Business logic
│   │   │   ├── favorites.ts
│   │   │   ├── recently-used.ts
│   │   │   └── template-variables.ts
│   │   └── App.tsx          # Main application
│   ├── styles/              # Global styles
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
└── package.json
```

## 🎯 Usage

### Template Workflow

1. **Browse Templates**: Use the sidebar to filter by category, tags, or quick filters
2. **Select Template**: Click on a template card to open the detail view
3. **Fill Variables**: Enter values in the "Fill Variables" tab
4. **Preview**: Check the "Preview" tab to see the rendered prompt
5. **Send to AI**: Click a platform button (ChatGPT, Claude, Grok, Gemini) to copy and open
6. **Auto-Save**: Your variable inputs are automatically saved for next time

### Keyboard Shortcuts

- **Ctrl/Cmd + Click** on AI platform buttons: Open in new tab
- **Ctrl/Cmd + Click** on tags: Toggle individual tags (multi-select)
- **Shift + Click** on tags: Select range of tags

### Quick Filters

- **Recently Used**: Shows templates you've accessed recently
- **Favorites**: Shows templates you've marked as favorites
- Selecting a quick filter auto-resets category and tag filters
- Selecting a category or tag auto-resets quick filters

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Use TypeScript for type safety
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🏢 About lowtouch.ai

PromptStash is an open-source project by [lowtouch.ai](https://lowtouch.ai), building tools for the AI-powered future.

## 🔗 Links

- **Repository**: [github.com/lowtouch-ai/promptstash-webapp](https://github.com/lowtouch-ai/promptstash-webapp)
- **Template Repository**: [github.com/lowtouch-ai/promptstash-templates](https://github.com/lowtouch-ai/promptstash-templates)
- **Issues**: [Report bugs or request features](https://github.com/lowtouch-ai/promptstash-webapp/issues)
- **Discussions**: [Join the conversation](https://github.com/lowtouch-ai/promptstash-webapp/discussions)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations powered by [Motion](https://motion.dev/)
- Design inspired by GitHub, Vercel, and Linear

## 🗺️ Sitemap.xml Support

PromptStash includes SEO-optimized sitemap generation for all template permalinks.

### Generating the Sitemap

Run the sitemap generator script to create `/public/sitemap.xml`:

```bash
npm run generate-sitemap
```

### GitHub Token (Recommended)

For the best experience and to avoid rate limits, use a GitHub personal access token:

1. **Create a token** at [github.com/settings/tokens](https://github.com/settings/tokens)
   - Select scope: `public_repo` (or no scopes for public repos)
2. **Set environment variable**:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```
3. **Run the generator**:
   ```bash
   npm run generate-sitemap
   ```

### What's Included

The sitemap contains:
- Homepage URL with priority 1.0
- Permalink for each template using the `?y=` parameter format
- Proper SEO metadata (lastmod, changefreq, priority)
- Referenced in `/public/robots.txt` for search engine discovery

### Output Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://promptstash.io</loc>
    <lastmod>2026-01-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://promptstash.io/?y=business/client/proposal/client_proposal_summary_generator_v1.yaml</loc>
    <lastmod>2026-01-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... more template URLs ... -->
</urlset>
```

For detailed instructions and troubleshooting, see [scripts/README.md](scripts/README.md).

## ⚡ Cache Warming

PromptStash includes a cache warming script that pre-fetches all templates from GitHub and saves them to a JSON file. This helps improve initial load performance and avoid GitHub API rate limits.

### Generating the Template Cache

Run the cache warming script to create `/public/templates-cache.json`:

```bash
node scripts/warm-cache.js
```

### With GitHub Token (Recommended)

For higher rate limits and better reliability, use a GitHub personal access token:

```bash
export GITHUB_TOKEN=your_token_here
node scripts/warm-cache.js
```

Or in a single command:

```bash
GITHUB_TOKEN=your_token_here node scripts/warm-cache.js
```

### What the Cache Contains

The generated cache file includes:
- All parsed template metadata (name, description, category, tags)
- Extracted placeholders from template content
- GitHub metadata (commit SHA, repository URL, YAML path)
- Timestamp and generation date for cache validation

### Benefits

- **Faster Initial Load**: Templates are pre-fetched and ready to use
- **Rate Limit Avoidance**: Reduces GitHub API calls on page load
- **Offline Development**: Work with templates without network access
- **Build Integration**: Can be run as part of your CI/CD pipeline

### Adding to package.json

You can add a convenient npm script to package.json:

```json
{
  "scripts": {
    "warm-cache": "node scripts/warm-cache.js"
  }
}
```

Then run with:

```bash
npm run warm-cache
```

### Output Example

```
🔥 Warming cache for PromptStash templates...

📂 Fetching repository tree...
✅ Found 150 items in repository

📄 Processing 45 YAML template files...

   Processing business/proposal.yaml... ✅
   Processing content/blog-post.yaml... ✅
   ...

✅ Successfully cached 45 templates!
📦 Cache file saved to: /public/templates-cache.json
📊 File size: 125.34 KB

📊 GitHub API Rate Limit:
   Remaining: 4985/5000
   Resets at: 1/18/2026, 2:30:00 PM
```

## 🔍 SEO & Social Sharing

PromptStash is optimized for sharing on social media platforms like X (Twitter) and LinkedIn with dynamic meta tags.

### Dynamic Meta Tags

When you share a permalink to a template, the app automatically generates rich preview cards with:

- **Template Name** as the title
- **Comprehensive Description** including category, tags, and field count
- **Category-Specific Images** from Unsplash for visual appeal
- **Proper URL** with the `?y=` permalink parameter

### Supported Platforms

The meta tags service generates:
- **Open Graph tags** (og:*) - for LinkedIn, Facebook, and most social platforms
- **Twitter Card tags** (twitter:*) - optimized for X (formerly Twitter)
- **Standard meta tags** - for search engines and browsers

### How It Works

1. **Template Selection**: When a user selects a template, meta tags are dynamically updated
2. **Permalink Sharing**: Share the URL with `?y=path/to/template.yaml` parameter
3. **Social Preview**: Platforms like X and LinkedIn will fetch the rich preview
4. **Reset on Close**: Meta tags reset to defaults when returning to the home page

### Meta Tag Examples

For a template like "Technical Blog Post Generator":

```html
<!-- Open Graph -->
<meta property="og:title" content="Technical Blog Post Generator - PromptStash.io">
<meta property="og:description" content="Generate comprehensive technical blog posts... | Content Creation template with 4 customizable fields. Tags: writing, technical, blog. Ready to use with ChatGPT, Claude, Grok, and Gemini.">
<meta property="og:image" content="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630">
<meta property="og:url" content="https://promptstash.io?y=templates/technical-blog.yaml">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Technical Blog Post Generator - PromptStash.io">
<meta name="twitter:description" content="Generate comprehensive technical blog posts...">
<meta name="twitter:image" content="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630">
```

### Testing Social Previews

Use these tools to test how your links will appear:

- **X (Twitter)**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: Share in a post and view the preview
- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **General**: [OpenGraph.xyz](https://www.opengraph.xyz/)

### Implementation

The meta tags service is located at `/src/app/services/meta-tags.ts` and includes:

- `initializeMetaTags()` - Sets up default meta tags on app load
- `updateMetaTagsForTemplate(template)` - Updates tags when a template is selected
- `resetMetaTags()` - Resets to defaults when closing a template

Category-specific images are automatically selected based on template categories like Content Creation, Development, Marketing, etc.

## 👥 Contributor Attribution

PromptStash recognizes and credits template authors by displaying their GitHub username directly on each template. This feature helps build community recognition and makes it easy to discover more work from talented prompt creators.

### How It Works

Template contributors are automatically displayed:
- **Card View**: Under the template name with a user icon
- **List View**: Between the template name and description
- **Detail View**: Below the description in the template header

Each contributor username is clickable and links directly to their GitHub profile, making it easy to:
- Explore more templates from the same author
- Follow contributors on GitHub
- Connect with the prompt engineering community
- Give credit where credit is due

### Adding Contributor Information

Template authors can add their GitHub username to any template YAML file using the `contributor` field:

```yaml
name: Technical Blog Post Generator
description: Generate comprehensive technical blog posts with proper structure and depth
category: Content Creation
tags:
  - writing
  - technical
  - blog
contributor: johndoe  # Add your GitHub username here

prompt:
  user: |
    Create a detailed technical blog post about {{topic}}.
    Target audience: {{audience}}
    ...

inputs:
  - name: topic
    description: The main technical topic to write about
    required: true
  - name: audience
    description: Target reader demographic
    required: true
```

### Example Display

When a user views the template, they'll see:

```
Technical Blog Post Generator
@johndoe                    [← Links to https://github.com/johndoe]
Generate comprehensive technical blog posts...
```

### Contributing Templates

Want to see your name on PromptStash? Contribute templates to the [promptstash-templates repository](https://github.com/lowtouch-ai/promptstash-templates):

1. **Fork the repository**: Create your own copy
2. **Add your template**: Include your GitHub username in the `contributor` field
3. **Submit a PR**: Share your prompt with the community
4. **Get credited**: Your username will appear on every template you create

This attribution system helps build a thriving community of prompt engineers and gives recognition to those who contribute valuable templates to the ecosystem.

---

Made with ❤️ by the lowtouch.ai team