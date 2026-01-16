/**
 * Meta Tags Service for Social Media Sharing
 * 
 * Dynamically updates Open Graph and Twitter Card meta tags
 * for optimal social media previews on X (Twitter) and LinkedIn
 */

import { PromptTemplate } from '@/app/data/mock-templates';

const DEFAULT_META = {
  title: 'PromptStash.io - Built by the Community. Ready to Run Prompts',
  description: 'Discover, customize, and execute prompt templates for ChatGPT, Claude, Grok, and Gemini. Browse hundreds of community-built prompts organized by category and tags.',
  image: 'https://demo2025a.lowtouch.ai/static/favicon.png',
  url: 'https://www.promptstash.io',
  siteName: 'PromptStash.io',
  type: 'website',
};

/**
 * Update or create a meta tag
 */
function updateMetaTag(attribute: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Generate engaging description for a template
 */
function generateTemplateDescription(template: PromptTemplate): string {
  const category = template.category || 'Prompt';
  const tagsList = template.tags.slice(0, 3).join(', ');
  const placeholderCount = template.placeholders.length;
  
  return `${template.description} | ${category} template with ${placeholderCount} customizable field${placeholderCount !== 1 ? 's' : ''}. Tags: ${tagsList}. Ready to use with ChatGPT, Claude, Grok, and Gemini.`;
}

/**
 * Generate title for a template
 */
function generateTemplateTitle(template: PromptTemplate): string {
  return `${template.name} - PromptStash.io`;
}

/**
 * Get category-based image URL from Unsplash
 */
function getCategoryImage(category: string): string {
  // Map categories to relevant Unsplash search terms
  const categoryImageMap: Record<string, string> = {
    'Content Creation': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop',
    'Development': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
    'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
    'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=630&fit=crop',
    'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop',
    'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop',
    'Data Analysis': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    'Research': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=630&fit=crop',
  };
  
  return categoryImageMap[category] || DEFAULT_META.image;
}

/**
 * Update meta tags for a specific template (for social sharing)
 */
export function updateMetaTagsForTemplate(template: PromptTemplate) {
  const title = generateTemplateTitle(template);
  const description = generateTemplateDescription(template);
  const image = getCategoryImage(template.category);
  const url = template.yamlPath 
    ? `${DEFAULT_META.url}?y=${encodeURIComponent(template.yamlPath)}`
    : DEFAULT_META.url;
  
  // Update document title
  document.title = title;
  
  // Open Graph tags (for LinkedIn, Facebook, etc.)
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:image', image);
  updateMetaTag('property', 'og:url', url);
  updateMetaTag('property', 'og:type', 'article');
  updateMetaTag('property', 'og:site_name', DEFAULT_META.siteName);
  
  // Twitter Card tags
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', description);
  updateMetaTag('name', 'twitter:image', image);
  updateMetaTag('name', 'twitter:site', '@promptstash');
  
  // Standard meta tags
  updateMetaTag('name', 'description', description);
  
  // Additional OpenGraph tags for better rich previews
  updateMetaTag('property', 'og:locale', 'en_US');
  updateMetaTag('property', 'article:section', template.category);
  updateMetaTag('property', 'article:tag', template.tags.join(', '));
  
  // Canonical URL
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', url);
  
  console.log('[Meta] Updated meta tags for template:', template.name);
}

/**
 * Reset meta tags to default (home page)
 */
export function resetMetaTags() {
  // Update document title
  document.title = DEFAULT_META.title;
  
  // Open Graph tags
  updateMetaTag('property', 'og:title', DEFAULT_META.title);
  updateMetaTag('property', 'og:description', DEFAULT_META.description);
  updateMetaTag('property', 'og:image', DEFAULT_META.image);
  updateMetaTag('property', 'og:url', DEFAULT_META.url);
  updateMetaTag('property', 'og:type', DEFAULT_META.type);
  updateMetaTag('property', 'og:site_name', DEFAULT_META.siteName);
  
  // Twitter Card tags
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', DEFAULT_META.title);
  updateMetaTag('name', 'twitter:description', DEFAULT_META.description);
  updateMetaTag('name', 'twitter:image', DEFAULT_META.image);
  updateMetaTag('name', 'twitter:site', '@promptstash');
  
  // Standard meta tags
  updateMetaTag('name', 'description', DEFAULT_META.description);
  
  // Additional OpenGraph tags
  updateMetaTag('property', 'og:locale', 'en_US');
  
  // Remove article-specific tags
  const articleSection = document.querySelector('meta[property="article:section"]');
  if (articleSection) articleSection.remove();
  const articleTag = document.querySelector('meta[property="article:tag"]');
  if (articleTag) articleTag.remove();
  
  // Canonical URL
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', DEFAULT_META.url);
  
  console.log('[Meta] Reset meta tags to default');
}

/**
 * Initialize default meta tags on app load
 */
export function initializeMetaTags() {
  resetMetaTags();
  console.log('[Meta] Initialized default meta tags');
}