/**
 * Unit tests for Theme Manager
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../../src/ui/ThemeManager';

describe('ThemeManager Unit Tests', () => {
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

  describe('Theme Initialization', () => {
    test('should initialize with default light theme', () => {
      const manager = new ThemeManager();
      expect(manager.getCurrentTheme()).toBe('light');
    });

    test('should load saved theme from localStorage', () => {
      localStorage.setItem('chess-theme', 'dark');
      
      const manager = new ThemeManager();
      expect(manager.getCurrentTheme()).toBe('dark');
    });

    test('should default to light theme if localStorage has invalid value', () => {
      localStorage.setItem('chess-theme', 'invalid');
      
      const manager = new ThemeManager();
      expect(manager.getCurrentTheme()).toBe('light');
    });
  });

  describe('Theme Switching', () => {
    test('should switch from light to dark', () => {
      const manager = new ThemeManager();
      manager.setTheme('dark');
      
      expect(manager.getCurrentTheme()).toBe('dark');
    });

    test('should switch from dark to light', () => {
      localStorage.setItem('chess-theme', 'dark');
      const manager = new ThemeManager();
      
      manager.setTheme('light');
      expect(manager.getCurrentTheme()).toBe('light');
    });

    test('should toggle from light to dark', () => {
      const manager = new ThemeManager();
      manager.toggleTheme();
      
      expect(manager.getCurrentTheme()).toBe('dark');
    });

    test('should toggle from dark to light', () => {
      localStorage.setItem('chess-theme', 'dark');
      const manager = new ThemeManager();
      
      manager.toggleTheme();
      expect(manager.getCurrentTheme()).toBe('light');
    });
  });

  describe('Theme Persistence', () => {
    test('should save theme to localStorage when set', () => {
      const manager = new ThemeManager();
      manager.setTheme('dark');
      
      expect(localStorage.getItem('chess-theme')).toBe('dark');
    });

    test('should persist theme across instances', () => {
      const manager1 = new ThemeManager();
      manager1.setTheme('dark');
      
      const manager2 = new ThemeManager();
      expect(manager2.getCurrentTheme()).toBe('dark');
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const errorStorage = {
        getItem: () => { throw new Error('localStorage unavailable'); },
        setItem: () => { throw new Error('localStorage unavailable'); },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      } as Storage;
      
      global.localStorage = errorStorage;
      
      // Should not throw and should use default theme
      const manager = new ThemeManager();
      expect(manager.getCurrentTheme()).toBe('light');
      
      // Setting theme should not throw
      expect(() => manager.setTheme('dark')).not.toThrow();
    });
  });

  describe('Theme Configuration', () => {
    test('should return light theme config', () => {
      const manager = new ThemeManager();
      const config = manager.getThemeConfig('light');
      
      expect(config.lightSquare).toBe('#f0d9b5');
      expect(config.darkSquare).toBe('#b58863');
      expect(config.background).toBe('#ffffff');
      expect(config.text).toBe('#1f2937');
    });

    test('should return dark theme config', () => {
      const manager = new ThemeManager();
      const config = manager.getThemeConfig('dark');
      
      expect(config.lightSquare).toBe('#779556');
      expect(config.darkSquare).toBe('#4a5f3a');
      expect(config.background).toBe('#0f172a');
      expect(config.text).toBe('#f1f5f9');
    });

    test('should have all required config properties', () => {
      const manager = new ThemeManager();
      const lightConfig = manager.getThemeConfig('light');
      const darkConfig = manager.getThemeConfig('dark');
      
      const requiredProps = [
        'lightSquare', 'darkSquare', 'highlightColor', 'validMoveIndicator',
        'background', 'foreground', 'border', 'buttonPrimary', 'buttonSecondary',
        'text', 'textSecondary'
      ];
      
      for (const prop of requiredProps) {
        expect(lightConfig).toHaveProperty(prop);
        expect(darkConfig).toHaveProperty(prop);
      }
    });
  });

  describe('Theme Change Callbacks', () => {
    test('should notify subscribers when theme changes', () => {
      const manager = new ThemeManager();
      const callback = vi.fn();
      
      manager.onThemeChange(callback);
      manager.setTheme('dark');
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('dark');
    });

    test('should notify multiple subscribers', () => {
      const manager = new ThemeManager();
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      manager.onThemeChange(callback1);
      manager.onThemeChange(callback2);
      manager.setTheme('dark');
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should notify subscribers on toggle', () => {
      const manager = new ThemeManager();
      const callback = vi.fn();
      
      manager.onThemeChange(callback);
      manager.toggleTheme();
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('dark');
    });

    test('should pass correct theme to callbacks', () => {
      const manager = new ThemeManager();
      let capturedTheme = null;
      
      manager.onThemeChange((theme) => {
        capturedTheme = theme;
      });
      
      manager.setTheme('dark');
      expect(capturedTheme).toBe('dark');
      
      manager.setTheme('light');
      expect(capturedTheme).toBe('light');
    });
  });
});
