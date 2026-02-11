/**
 * Theme Manager
 * Handles light/dark mode switching and theme persistence
 */

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  // Board colors
  lightSquare: string;
  darkSquare: string;
  highlightColor: string;
  validMoveIndicator: string;
  
  // UI colors
  background: string;
  foreground: string;
  border: string;
  buttonPrimary: string;
  buttonSecondary: string;
  text: string;
  textSecondary: string;
}

/**
 * ThemeManager class that manages theme state and persistence
 */
export class ThemeManager {
  private currentTheme: Theme;
  private themeChangeCallbacks: Array<(theme: Theme) => void>;

  constructor() {
    this.themeChangeCallbacks = [];
    // Load saved theme or default to light
    this.currentTheme = this.loadTheme();
  }

  /**
   * Get the current theme
   * @returns Current theme ('light' or 'dark')
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set the theme
   * @param theme - Theme to set ('light' or 'dark')
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    
    // Save to localStorage
    try {
      localStorage.setItem('chess-theme', theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }

    // Notify all subscribers
    this.notifyThemeChange();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Get theme configuration for a specific theme
   * @param theme - Theme to get configuration for
   * @returns Theme configuration object
   */
  getThemeConfig(theme: Theme): ThemeConfig {
    if (theme === 'dark') {
      return {
        // Board colors (dark theme)
        lightSquare: '#779556',
        darkSquare: '#4a5f3a',
        highlightColor: '#f59e0b',
        validMoveIndicator: '#059669',
        
        // UI colors (dark theme)
        background: '#0f172a',
        foreground: '#1e293b',
        border: '#334155',
        buttonPrimary: '#3b82f6',
        buttonSecondary: '#64748b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
      };
    }

    // Light theme (default)
    return {
      // Board colors (light theme)
      lightSquare: '#f0d9b5',
      darkSquare: '#b58863',
      highlightColor: '#fbbf24',
      validMoveIndicator: '#10b981',
      
      // UI colors (light theme)
      background: '#ffffff',
      foreground: '#f9fafb',
      border: '#e5e7eb',
      buttonPrimary: '#3b82f6',
      buttonSecondary: '#9ca3af',
      text: '#1f2937',
      textSecondary: '#6b7280',
    };
  }

  /**
   * Subscribe to theme changes
   * @param callback - Function to call when theme changes
   */
  onThemeChange(callback: (theme: Theme) => void): void {
    this.themeChangeCallbacks.push(callback);
  }

  /**
   * Load theme from localStorage
   * @returns Saved theme or default 'light'
   */
  private loadTheme(): Theme {
    try {
      const savedTheme = localStorage.getItem('chess-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
    
    // Default to light theme
    return 'light';
  }

  /**
   * Notify all subscribers of theme change
   */
  private notifyThemeChange(): void {
    for (const callback of this.themeChangeCallbacks) {
      callback(this.currentTheme);
    }
  }
}
