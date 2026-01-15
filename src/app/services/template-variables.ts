const STORAGE_KEY_PREFIX = 'template-variables-';

/**
 * Get saved variable values for a specific template
 */
export function getTemplateVariables(templateId: string): Record<string, string> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${templateId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error loading template variables:', error);
    return {};
  }
}

/**
 * Save variable values for a specific template
 */
export function saveTemplateVariables(
  templateId: string,
  variables: Record<string, string>
): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${templateId}`;
    localStorage.setItem(key, JSON.stringify(variables));
  } catch (error) {
    console.error('Error saving template variables:', error);
  }
}

/**
 * Update a single variable value for a template
 */
export function updateTemplateVariable(
  templateId: string,
  variableName: string,
  value: string
): void {
  try {
    const currentVariables = getTemplateVariables(templateId);
    currentVariables[variableName] = value;
    saveTemplateVariables(templateId, currentVariables);
  } catch (error) {
    console.error('Error updating template variable:', error);
  }
}

/**
 * Clear all saved variables for a specific template
 */
export function clearTemplateVariables(templateId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${templateId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing template variables:', error);
  }
}

/**
 * Clear all saved template variables from localStorage
 */
export function clearAllTemplateVariables(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all template variables:', error);
  }
}
