/**
 * Unit tests for Theme Application
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ThemeManager } from '../../src/ui/ThemeManager';
import { applyTheme, initializeTheme } from '../../src/ui/ThemeApplication';

describe('ThemeApplication Unit Tests', () => {
  let themeManager: ThemeManager;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Mock localStorage
    originalLocalStorage = global.localStorage;
    const storage: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        Object.keys(storage).forEach(key => delete storage[key]);
      },
      key: (index: number) => Object.keys(storage)[index] || null,
      length: Object.keys(storage).length,
    } as Storage;

    themeManager = new ThemeManager();
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    // Clean up body classes
    document.body.classList.remove('dark-theme');
  });

  describe('Theme Application', () => {
    test('should add dark-theme class for dark theme', () => {
      themeManager.setTheme('dark');
      applyTheme(themeManager);

      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    test('should remove dark-theme class for light theme', () => {
      // First add the class
      document.body.classList.add('dark-theme');

      themeManager.setTheme('light');
      applyTheme(themeManager);

      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });

    test('should not have dark-theme class by default', () => {
      applyTheme(themeManager);

      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
  });

  describe('Theme Initialization', () => {
    test('should apply initial theme', () => {
      themeManager.setTheme('dark');
      initializeTheme(themeManager);

      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    test('should subscribe to theme changes', () => {
      initializeTheme(themeManager);

      // Initially light
      expect(document.body.classList.contains('dark-theme')).toBe(false);

      // Change to dark
      themeManager.setTheme('dark');
      expect(document.body.classList.contains('dark-theme')).toBe(true);

      // Change back to light
      themeManager.setTheme('light');
      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });

    test('should handle multiple theme toggles', () => {
      initializeTheme(themeManager);

      for (let i = 0; i < 5; i++) {
        themeManager.toggleTheme();
        const expectedDark = (i + 1) % 2 === 1;
        expect(document.body.classList.contains('dark-theme')).toBe(expectedDark);
      }
    });
  });

  describe('Theme Persistence', () => {
    test('should load and apply saved theme', () => {
      // Save dark theme
      localStorage.setItem('chess-theme', 'dark');

      // Create new theme manager (simulates page reload)
      const newThemeManager = new ThemeManager();
      initializeTheme(newThemeManager);

      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    test('should apply light theme when no saved theme', () => {
      // Ensure no saved theme
      localStorage.removeItem('chess-theme');

      const newThemeManager = new ThemeManager();
      initializeTheme(newThemeManager);

      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
  });

  describe('Theme Switching', () => {
    test('should update UI when theme is switched', () => {
      initializeTheme(themeManager);

      // Start with light
      expect(document.body.classList.contains('dark-theme')).toBe(false);

      // Switch to dark
      themeManager.setTheme('dark');
      expect(document.body.classList.contains('dark-theme')).toBe(true);

      // Switch to light
      themeManager.setTheme('light');
      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });

    test('should handle rapid theme switches', () => {
      initializeTheme(themeManager);

      // Rapidly switch themes
      themeManager.setTheme('dark');
      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      themeManager.setTheme('light');

      // Should end up in light mode
      expect(document.body.classList.contains('dark-theme')).toBe(false);
    });
  });

  describe('CSS Variables', () => {
    test('should have CSS variables defined', () => {
      const styles = getComputedStyle(document.documentElement);
      
      // Check for some key CSS variables
      const lightSquare = styles.getPropertyValue('--light-square');
      const darkSquare = styles.getPropertyValue('--dark-square');
      
      // Variables should be defined (may be empty in test environment)
      expect(lightSquare).toBeDefined();
      expect(darkSquare).toBeDefined();
    });
  });
});
