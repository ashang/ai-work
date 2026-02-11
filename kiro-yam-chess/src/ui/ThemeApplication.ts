/**
 * Theme Application
 * Wires theme manager to UI and applies theme changes
 */

import type { ThemeManager } from './ThemeManager';

/**
 * Apply theme to the document
 */
export function applyTheme(themeManager: ThemeManager): void {
  const currentTheme = themeManager.getCurrentTheme();
  
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

/**
 * Initialize theme application
 * Sets up theme manager and subscribes to theme changes
 */
export function initializeTheme(themeManager: ThemeManager): void {
  // Apply initial theme
  applyTheme(themeManager);
  
  // Subscribe to theme changes
  themeManager.onThemeChange(() => {
    applyTheme(themeManager);
  });
}
