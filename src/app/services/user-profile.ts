const PROFILE_KEY = 'promptstash.user.profile';

/**
 * Get the user's profile from localStorage
 */
export function getUserProfile(): string {
  try {
    return localStorage.getItem(PROFILE_KEY) || '';
  } catch (error) {
    console.error('Error reading user profile from localStorage:', error);
    return '';
  }
}

/**
 * Save the user's profile to localStorage
 */
export function saveUserProfile(profile: string): void {
  try {
    localStorage.setItem(PROFILE_KEY, profile);
  } catch (error) {
    console.error('Error saving user profile to localStorage:', error);
  }
}

/**
 * Clear the user's profile from localStorage
 */
export function clearUserProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing user profile from localStorage:', error);
  }
}

/**
 * Prepend the profile to a prompt if it exists
 */
export function prependProfileToPrompt(prompt: string): string {
  const profile = getUserProfile();
  
  if (!profile || profile.trim().length === 0) {
    return prompt;
  }
  
  // Prepend profile section to prompt
  return `# Your Profile\n${profile}\n\n\n${prompt}`;
}
