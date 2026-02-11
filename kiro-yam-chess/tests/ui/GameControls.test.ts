/**
 * Unit tests for Game Controls
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameControls } from '../../src/ui/GameControls';
import { ThemeManager } from '../../src/ui/ThemeManager';

describe('GameControls Unit Tests', () => {
  let controls: GameControls;
  let themeManager: ThemeManager;
  let originalLocalStorage: Storage;
  let originalConfirm: typeof window.confirm;

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

    // Mock confirm
    originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    themeManager = new ThemeManager();
    controls = new GameControls(themeManager);
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    window.confirm = originalConfirm;
  });

  describe('Difficulty Selection', () => {
    test('should default to easy difficulty', () => {
      expect(controls.getSelectedDifficulty()).toBe('easy');
    });

    test('should update difficulty when selection changes', () => {
      const elements = controls.getElements();
      const difficultySelect = elements.difficultySelect;

      if (difficultySelect) {
        difficultySelect.value = 'hard';
        difficultySelect.dispatchEvent(new Event('change'));

        expect(controls.getSelectedDifficulty()).toBe('hard');
      }
    });

    test('should disable difficulty select when game is in progress', () => {
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const difficultySelect = elements.difficultySelect;

      if (difficultySelect) {
        expect(difficultySelect.disabled).toBe(true);
      }
    });

    test('should enable difficulty select when game is not in progress', () => {
      controls.setGameInProgress(false);

      const elements = controls.getElements();
      const difficultySelect = elements.difficultySelect;

      if (difficultySelect) {
        expect(difficultySelect.disabled).toBe(false);
      }
    });
  });

  describe('New Game Button', () => {
    test('should call callback when clicked', () => {
      const callback = vi.fn();
      controls.onNewGame(callback);

      const elements = controls.getElements();
      const newGameButton = elements.newGameButton;

      if (newGameButton) {
        newGameButton.click();
        expect(callback).toHaveBeenCalled();
      }
    });

    test('should pass selected difficulty to callback', () => {
      const callback = vi.fn();
      controls.onNewGame(callback);

      const elements = controls.getElements();
      const difficultySelect = elements.difficultySelect;
      const newGameButton = elements.newGameButton;

      if (difficultySelect && newGameButton) {
        difficultySelect.value = 'hard';
        difficultySelect.dispatchEvent(new Event('change'));

        newGameButton.click();

        expect(callback).toHaveBeenCalledWith('hard');
      }
    });

    test('should show confirmation when game is in progress', () => {
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const newGameButton = elements.newGameButton;

      if (newGameButton) {
        newGameButton.click();
        expect(window.confirm).toHaveBeenCalled();
      }
    });

    test('should not show confirmation when game is not in progress', () => {
      controls.setGameInProgress(false);

      const elements = controls.getElements();
      const newGameButton = elements.newGameButton;

      if (newGameButton) {
        newGameButton.click();
        expect(window.confirm).not.toHaveBeenCalled();
      }
    });

    test('should not start new game if user cancels confirmation', () => {
      window.confirm = vi.fn(() => false);

      const callback = vi.fn();
      controls.onNewGame(callback);

      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const newGameButton = elements.newGameButton;

      if (newGameButton) {
        newGameButton.click();
        expect(callback).not.toHaveBeenCalled();
      }
    });
  });

  describe('Resign Button', () => {
    test('should be disabled initially', () => {
      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        expect(resignButton.disabled).toBe(true);
      }
    });

    test('should be enabled when game is in progress', () => {
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        expect(resignButton.disabled).toBe(false);
      }
    });

    test('should be disabled when game is not in progress', () => {
      controls.setGameInProgress(false);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        expect(resignButton.disabled).toBe(true);
      }
    });

    test('should show confirmation when clicked', () => {
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        resignButton.click();
        expect(window.confirm).toHaveBeenCalled();
      }
    });

    test('should call callback when confirmed', () => {
      const callback = vi.fn();
      controls.onResign(callback);

      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        resignButton.click();
        expect(callback).toHaveBeenCalled();
      }
    });

    test('should not call callback if user cancels', () => {
      window.confirm = vi.fn(() => false);

      const callback = vi.fn();
      controls.onResign(callback);

      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        resignButton.click();
        expect(callback).not.toHaveBeenCalled();
      }
    });
  });

  describe('Theme Toggle Button', () => {
    test('should exist', () => {
      const elements = controls.getElements();
      expect(elements.themeToggleButton).toBeTruthy();
    });

    test('should toggle theme when clicked', () => {
      const initialTheme = themeManager.getCurrentTheme();

      const elements = controls.getElements();
      const themeToggleButton = elements.themeToggleButton;

      if (themeToggleButton) {
        themeToggleButton.click();

        const newTheme = themeManager.getCurrentTheme();
        expect(newTheme).not.toBe(initialTheme);
      }
    });

    test('should update icon when theme changes', () => {
      const elements = controls.getElements();
      const themeToggleButton = elements.themeToggleButton;

      if (themeToggleButton) {
        const initialIcon = themeToggleButton.textContent;

        themeToggleButton.click();

        const newIcon = themeToggleButton.textContent;
        expect(newIcon).not.toBe(initialIcon);
      }
    });

    test('should show moon icon for light theme', () => {
      themeManager.setTheme('light');

      const elements = controls.getElements();
      const themeToggleButton = elements.themeToggleButton;

      if (themeToggleButton) {
        expect(themeToggleButton.textContent).toBe('🌙');
      }
    });

    test('should show sun icon for dark theme', () => {
      themeManager.setTheme('dark');

      const elements = controls.getElements();
      const themeToggleButton = elements.themeToggleButton;

      if (themeToggleButton) {
        expect(themeToggleButton.textContent).toBe('☀️');
      }
    });
  });

  describe('Game State Management', () => {
    test('should track game in progress state', () => {
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      
      if (elements.resignButton) {
        expect(elements.resignButton.disabled).toBe(false);
      }
      
      if (elements.difficultySelect) {
        expect(elements.difficultySelect.disabled).toBe(true);
      }
    });

    test('should update multiple controls when state changes', () => {
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      
      if (elements.resignButton && elements.difficultySelect) {
        expect(elements.resignButton.disabled).toBe(false);
        expect(elements.difficultySelect.disabled).toBe(true);
      }

      controls.setGameInProgress(false);

      if (elements.resignButton && elements.difficultySelect) {
        expect(elements.resignButton.disabled).toBe(true);
        expect(elements.difficultySelect.disabled).toBe(false);
      }
    });
  });
});
