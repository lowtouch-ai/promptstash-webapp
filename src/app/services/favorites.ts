const STORAGE_KEY = 'promptstash_favorites';

/**
 * Get all favorited template IDs
 */
export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

/**
 * Add a template to favorites
 */
export function addToFavorites(templateId: string): void {
  try {
    const favorites = getFavorites();
    
    if (!favorites.includes(templateId)) {
      favorites.push(templateId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
}

/**
 * Remove a template from favorites
 */
export function removeFromFavorites(templateId: string): void {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(id => id !== templateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
}

/**
 * Toggle favorite status for a template
 */
export function toggleFavorite(templateId: string): boolean {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(templateId);
  
  if (isFavorite) {
    removeFromFavorites(templateId);
    return false;
  } else {
    addToFavorites(templateId);
    return true;
  }
}

/**
 * Check if a template is favorited
 */
export function isFavorite(templateId: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(templateId);
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
}
