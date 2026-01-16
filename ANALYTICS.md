# Google Analytics Integration - Privacy-First Analytics

## Overview

PromptStash uses Google Analytics 4 (GA4) to track anonymous usage patterns and improve the product. We follow a **privacy-first** approach that never collects user content or personal data.

## What We Track

### ✅ Product Usage Events (Anonymous)

- **App Loaded**: When the application starts
- **Template Opened**: Template path from GitHub repository (e.g., `prompts/code-review.yaml`)
- **Prompt Sent**: Which AI provider was used (ChatGPT, Claude, Grok, Gemini)
- **Provider Selected**: User clicked on a provider button
- **Favorites**: Template added/removed from favorites (template path, e.g., `prompts/writing/blog-post.yaml`)
- **Filters Used**: Category filters, tag filters, recently used, favorites
- **Search Used**: Search bar was used (not the search terms)
- **View Mode**: Card vs list view preference
- **Permalink Shared**: Share button usage (copy, Twitter, LinkedIn)

### ❌ What We NEVER Track

- **Prompt text or content**
- **Variable values entered by users**
- **Template content**
- **Search queries**
- **User-entered data**
- **Personal information (PII)**
- **IP addresses** (anonymized by default)

## Setup Instructions

### 1. Get Your Google Analytics ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for PromptStash
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure the Analytics Service

Edit `/src/app/services/analytics.ts` and replace the placeholder with your actual Measurement ID:

```typescript
// Replace this line:
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// With your actual Measurement ID:
const GA_MEASUREMENT_ID = 'G-ABC123DEF4';
```

### 3. Test Analytics

1. Run your application in development mode
2. Open browser DevTools Console
3. Look for: `[Analytics] Initialized with privacy-first settings`
4. Interact with the app (open templates, search, etc.)
5. Check Google Analytics Real-Time reports (may take 5-10 minutes for first events)

## Privacy Configuration

The analytics service is configured with privacy-first settings:

```typescript
ReactGA.initialize(GA_MEASUREMENT_ID, {
  gtagOptions: {
    anonymize_ip: true,        // Anonymize user IP addresses
    send_page_view: false,     // Manual page view tracking only
  },
});
```

## Event Reference

### Event Categories

| Category | Description | Example Labels |
|----------|-------------|----------------|
| App | Application-level events | "Application Loaded" |
| Template | Template interactions | Template YAML paths (e.g., "prompts/code-review.yaml") |
| Prompt | Prompt sending | "chatgpt", "claude", "grok", "gemini" |
| Provider | AI provider selection | "chatgpt", "claude", "grok", "gemini" |
| Favorites | Favorites management | Template YAML paths (e.g., "prompts/writing/blog-post.yaml") |
| Feature | Feature usage | "Recently Used Filter", "Favorites Filter" |
| Filter | Filtering actions | Category names (e.g., "Code Review"), Tag names (e.g., "python, testing") |
| Search | Search usage | "Search Bar" (no queries tracked) |
| Share | Sharing actions | "copy", "twitter", "linkedin" |
| View | View preferences | "card", "list" |

### Example Events

```javascript
// Template opened
{
  category: 'Template',
  action: 'opened',
  label: 'prompts/code-review/python-best-practices.yaml' // Template path
}

// Prompt sent
{
  category: 'Prompt',
  action: 'sent',
  label: 'chatgpt' // Provider only, no content
}

// Favorite added
{
  category: 'Favorites',
  action: 'added',
  label: 'prompts/writing/blog-post.yaml' // Template path
}

// Category filter selected
{
  category: 'Filter',
  action: 'category_selected',
  label: 'Code Review' // Category name
}

// Tag filter selected
{
  category: 'Filter',
  action: 'tag_selected',
  label: 'python, testing, code-quality', // Comma-separated tag names
  value: 3 // Number of tags selected
}

// Search used
{
  category: 'Search',
  action: 'used',
  label: 'Search Bar' // No search terms tracked
}
```

## Compliance

### GDPR Compliance

- ✅ IP anonymization enabled
- ✅ No personal data collected
- ✅ No user profiling
- ✅ Anonymous usage analytics only

### Data Retention

Configure in Google Analytics Admin:
- Recommended: 14 months
- All data is automatically deleted after retention period

## Opting Out

Users can opt out of Google Analytics:

1. Install a browser extension like [Google Analytics Opt-out](https://tools.google.com/dlpage/gaoptout)
2. Use browser privacy features (Do Not Track, ad blockers)

## Transparency

We believe in complete transparency:
- All analytics code is open source in `/src/app/services/analytics.ts`
- All tracking events are clearly documented here
- No hidden tracking or third-party scripts (except GA4 itself)

## Questions?

If you have questions about our analytics implementation, please:
1. Review the source code in `/src/app/services/analytics.ts`
2. Open an issue on GitHub
3. Contact the maintainers

## Commit Message

For this implementation:

```
feat: add privacy-first Google Analytics integration

- Install react-ga4 for GA4 analytics tracking
- Create comprehensive analytics service with privacy-first approach
- Track only product usage events (app loaded, template opened, prompt sent, etc.)
- Never track user content: no prompt text, variable values, or personal data
- IP anonymization enabled by default
- Integrate analytics throughout app (navigation, filters, sharing, etc.)
- Add detailed documentation in ANALYTICS.md
- All tracking events are anonymous and respect user privacy
```