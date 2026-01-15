const STORAGE_KEY = 'promptstash_recently_used';
const MAX_RECENT_ITEMS = 20;

interface RecentlyUsedItem {
  templateId: string;
  timestamp: number;
}

/**
 * Get recently used template IDs in order (most recent first)
 */
export function getRecentlyUsed(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const items: RecentlyUsedItem[] = JSON.parse(stored);
    
    // Sort by timestamp descending (most recent first)
    items.sort((a, b) => b.timestamp - a.timestamp);
    
    return items.map(item => item.templateId);
  } catch (error) {
    console.error('Error reading recently used templates:', error);
    return [];
  }
}

/**
 * Add a template to the recently used list
 */
export function addToRecentlyUsed(templateId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: RecentlyUsedItem[] = stored ? JSON.parse(stored) : [];
    
    // Remove existing entry if present (we'll re-add it with new timestamp)
    items = items.filter(item => item.templateId !== templateId);
    
    // Add new entry at the beginning
    items.unshift({
      templateId,
      timestamp: Date.now(),
    });
    
    // Limit to MAX_RECENT_ITEMS
    if (items.length > MAX_RECENT_ITEMS) {
      items = items.slice(0, MAX_RECENT_ITEMS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to recently used templates:', error);
  }
}

/**
 * Clear all recently used templates
 */
export function clearRecentlyUsed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recently used templates:', error);
  }
}

/**
 * Check if a template is in the recently used list
 */
export function isRecentlyUsed(templateId: string): boolean {
  const recentIds = getRecentlyUsed();
  return recentIds.includes(templateId);
}
