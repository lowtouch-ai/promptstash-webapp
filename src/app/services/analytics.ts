/**
 * Privacy-First Analytics Service for PromptStash
 * 
 * This module provides anonymous analytics tracking using Google Analytics 4.
 * It tracks only product usage events, never user content or personal data.
 * 
 * What we track:
 * - App loaded
 * - Template opened
 * - Prompt sent to AI providers
 * - Provider selected
 * - Favorites added/removed
 * - Feature usage (Recently Used, Local Memory)
 * 
 * What we NEVER track:
 * - Prompt text or content
 * - Variable values
 * - Template content
 * - Any user-entered data
 * - Personal information
 */

import ReactGA from 'react-ga4';

// Google Analytics Measurement ID
// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
let isInitialized = false;

export function initializeAnalytics() {
  if (isInitialized) return;
  
  // Debug: Print measurement ID to console
  console.log('[Analytics] Attempting to initialize with Measurement ID:', GA_MEASUREMENT_ID);
  console.log('[Analytics] Environment variable VITE_GA_MEASUREMENT_ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);
  
  // Check if we have a valid measurement ID
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.warn('[Analytics] No valid GA Measurement ID configured. Analytics will not track events.');
    console.warn('[Analytics] Please set VITE_GA_MEASUREMENT_ID environment variable or update GA_MEASUREMENT_ID in analytics.ts');
    return;
  }
  
  try {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      // Privacy-first configuration
      gtagOptions: {
        anonymize_ip: true, // Anonymize IP addresses
        send_page_view: false, // We'll manually track page views
      },
    });
    isInitialized = true;
    console.log('[Analytics] ✓ Successfully initialized with privacy-first settings');
    console.log('[Analytics] ✓ Measurement ID:', GA_MEASUREMENT_ID);
  } catch (error) {
    console.error('[Analytics] ✗ Failed to initialize:', error);
  }
}

// Track app loaded
export function trackAppLoaded() {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'App',
      action: 'loaded',
      label: 'Application Loaded',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking app loaded:', error);
  }
}

// Track template opened
export function trackTemplateOpened(templatePath: string) {
  if (!isInitialized) return;
  
  try {
    // Track the template path (YAML file path), not the content
    ReactGA.event({
      category: 'Template',
      action: 'opened',
      label: templatePath || 'unknown',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking template opened:', error);
  }
}

// Track prompt sent to AI provider
export function trackPromptSent(templateId: string, provider: 'chatgpt' | 'claude' | 'grok' | 'gemini') {
  if (!isInitialized) return;
  
  try {
    // Track which provider was used, NOT the prompt content
    ReactGA.event({
      category: 'Prompt',
      action: 'sent',
      label: provider,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking prompt sent:', error);
  }
}

// Track provider selected (when user clicks a provider button)
export function trackProviderSelected(provider: 'chatgpt' | 'claude' | 'grok' | 'gemini') {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Provider',
      action: 'selected',
      label: provider,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking provider selected:', error);
  }
}

// Track favorite added
export function trackFavoriteAdded(templatePath: string) {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Favorites',
      action: 'added',
      label: templatePath || 'unknown',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking favorite added:', error);
  }
}

// Track favorite removed
export function trackFavoriteRemoved(templatePath: string) {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Favorites',
      action: 'removed',
      label: templatePath || 'unknown',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking favorite removed:', error);
  }
}

// Track recently used accessed
export function trackRecentlyUsedAccessed() {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Feature',
      action: 'recently_used_accessed',
      label: 'Recently Used Filter',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking recently used:', error);
  }
}

// Track favorites filter accessed
export function trackFavoritesFilterAccessed() {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Feature',
      action: 'favorites_filter_accessed',
      label: 'Favorites Filter',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking favorites filter:', error);
  }
}

// Track category filter used
export function trackCategoryFilterUsed(category: string) {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Filter',
      action: 'category_selected',
      label: category,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking category filter:', error);
  }
}

// Track tag filter used
export function trackTagFilterUsed(tags: string[]) {
  if (!isInitialized) return;
  
  try {
    // Track the tag names (comma-separated if multiple)
    const tagLabel = tags.length > 0 ? tags.join(', ') : 'none';
    ReactGA.event({
      category: 'Filter',
      action: 'tag_selected',
      label: tagLabel,
      value: tags.length,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking tag filter:', error);
  }
}

// Track search used
export function trackSearchUsed() {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Search',
      action: 'used',
      label: 'Search Bar',
    });
  } catch (error) {
    console.error('[Analytics] Error tracking search:', error);
  }
}

// Track permalink shared
export function trackPermalinkShared(platform: 'copy' | 'twitter' | 'linkedin') {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'Share',
      action: 'permalink_shared',
      label: platform,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking permalink share:', error);
  }
}

// Track view mode change
export function trackViewModeChanged(mode: 'card' | 'list') {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: 'View',
      action: 'mode_changed',
      label: mode,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking view mode:', error);
  }
}