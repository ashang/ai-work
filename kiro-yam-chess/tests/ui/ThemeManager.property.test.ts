/**
 * Property-based tests for Theme Manager
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { ThemeManager, type Theme } from '../../src/ui/ThemeManager';

describe('ThemeManager Property Tests', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = global.localStorage;
    
    // Mock localStorage
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
  });

  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });

  // Feature: web-chess-app, Property 17: Theme persistence round-trip
  test.prop([fc.constantFrom('light' as Theme, 'dark' as Theme)], { numRuns: 100 })(
    'Property 17: Theme persistence round-trip - theme should persist after reload',
    (theme) => {
      // Set theme
      const manager1 = new ThemeManager();
      manager1.setTheme(theme);

      // Create new instance (simulating reload)
      const manager2 = new ThemeManager();
      const loadedTheme = manager2.getCurrentTheme();

      // Theme should be the same
      expect(loadedTheme).toBe(theme);
    }
  );

  test.prop([fc.constantFrom('light' as Theme, 'dark' as Theme)], { numRuns: 100 })(
    'setting theme should update current theme',
    (theme) => {
      const manager = new ThemeManager();
      manager.setTheme(theme);

      expect(manager.getCurrentTheme()).toBe(theme);
    }
  );

  test.prop([fc.constantFrom('light' as Theme, 'dark' as Theme)], { numRuns: 100 })(
    'theme config should be consistent for same theme',
    (theme) => {
      const manager = new ThemeManager();
      const config1 = manager.getThemeConfig(theme);
      const config2 = manager.getThemeConfig(theme);

      expect(config1).toEqual(config2);
    }
  );
});
