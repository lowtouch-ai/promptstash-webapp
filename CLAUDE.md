# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev          # Start development server (Vite, runs at localhost:5173)
npm run build        # Production build (outputs to dist/)
npm run generate-sitemap   # Generate sitemap.xml for SEO
node scripts/warm-cache.js # Pre-fetch templates to public/templates-cache.json
```

Set `GITHUB_TOKEN` environment variable for higher API rate limits when running cache/sitemap scripts.

## Docker

```bash
docker build -t promptstash .              # Build image
docker run -d --name promptstash -p 8197:80 promptstash   # Run container on port 8197
```

Container management:
```bash
docker stop promptstash     # Stop container
docker start promptstash    # Start container
docker rm promptstash       # Remove container
docker logs promptstash     # View logs
```

## Architecture Overview

PromptStash is a React SPA for managing and executing AI prompt templates. It fetches templates from the [promptstash-templates](https://github.com/lowtouch-ai/promptstash-templates) GitHub repository and allows users to fill in variables and send prompts to AI platforms (ChatGPT, Claude, Grok, Gemini).

### Core Application Flow

1. **App.tsx** - Main orchestrator managing global state (templates, filters, URL permalinks)
2. Templates are fetched from GitHub → cached in localStorage (24h TTL) → fallback to `public/templates-cache.json` → fallback to mock data
3. URL parameters (`?y=`, `?c=`, `?t=`, `?q=`) enable deep-linking to templates, categories, tags, and search queries

### Key Directories

- `src/app/components/` - React components (sidebar, navigation, template-list, template-detail)
- `src/app/components/ui/` - Reusable UI primitives (Radix UI + shadcn/ui pattern)
- `src/app/components/ui/use-mobile.ts` - Hook for detecting mobile viewport (768px breakpoint)
- `src/app/services/` - Business logic and data persistence
- `src/app/data/mock-templates.ts` - Fallback template data and `PromptTemplate` type definition
- `scripts/` - Node.js utilities for sitemap generation and cache warming

### Services

- **github-templates.ts** - Fetches YAML templates from GitHub API with multi-tier caching (localStorage → static file → API)
- **template-variables.ts** - Persists user's variable inputs per template to localStorage
- **favorites.ts** / **recently-used.ts** - User preferences stored in localStorage
- **analytics.ts** - Google Analytics 4 event tracking
- **meta-tags.ts** - Dynamic Open Graph/Twitter meta tags for social sharing
- **user-profile.ts** - Optional user profile that can be prepended to prompts

### Template Format

Templates are YAML files with this structure:
```yaml
name: Template Name
description: What it does
category: Category Name
tags: [tag1, tag2]
contributor: github-username
prompt:
  user: |
    Template text with {{variable-name}} placeholders
inputs:
  - name: variable-name
    description: What to enter
    required: true
```

### Path Aliases

The `@/` alias maps to `src/` directory (configured in vite.config.ts).

### Styling

Uses Tailwind CSS v4 with the `@tailwindcss/vite` plugin. UI components follow shadcn/ui patterns with Radix UI primitives.

### Responsive Design

The app is fully responsive with mobile-first considerations:

- **Breakpoint**: 768px (`md:`) - defined in `use-mobile.ts` hook
- **Sidebar**: Hidden on mobile, accessible via hamburger menu (uses Sheet component to slide in from left)
- **Navigation**: Logo text hidden on mobile, some action buttons hidden
- **Template Detail**: Compact mobile layout
  - Title row with back, title, info toggle, favorite, share
  - Details collapsed by default (description, tags, send buttons)
  - Tap info icon to expand/collapse details
- **Template List**: Single column grid on mobile, auto-fill on desktop
