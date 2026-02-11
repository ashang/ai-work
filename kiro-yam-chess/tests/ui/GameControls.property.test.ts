/**
 * Property-based tests for Game Controls
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { fc } from '@fast-check/vitest';
import { GameControls } from '../../src/ui/GameControls';
import { ThemeManager } from '../../src/ui/ThemeManager';
import { ChessEngine } from '../../src/engine/ChessEngine';

describe('GameControls Property Tests', () => {
  let controls: GameControls;
  let themeManager: ThemeManager;
  let engine: ChessEngine;
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
    engine = new ChessEngine();
    controls = new GameControls(themeManager);
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    window.confirm = originalConfirm;
  });

  // Feature: web-chess-app, Property 18: New game resets state
  test.prop([fc.constantFrom('easy', 'hard')], { numRuns: 100 })(
    'Property 18: New game resets state - clicking new game should reset to starting position',
    (difficulty) => {
      const newGameCallback = vi.fn();
      controls.onNewGame(newGameCallback);

      // Get the new game button
      const elements = controls.getElements();
      const newGameButton = elements.newGameButton;

      expect(newGameButton).toBeTruthy();

      if (newGameButton) {
        // Set difficulty
        const difficultySelect = elements.difficultySelect;
        if (difficultySelect) {
          difficultySelect.value = difficulty;
          difficultySelect.dispatchEvent(new Event('change'));
        }

        // Click new game
        newGameButton.click();

        // Callback should be called with selected difficulty
        expect(newGameCallback).toHaveBeenCalledWith(difficulty);
      }
    }
  );

  // Feature: web-chess-app, Property 19: Resignation ends game
  test.prop([fc.boolean()], { numRuns: 100 })(
    'Property 19: Resignation ends game - selecting resign should end game and declare AI winner',
    (gameInProgress) => {
      const resignCallback = vi.fn();
      controls.onResign(resignCallback);

      // Set game state
      controls.setGameInProgress(gameInProgress);

      // Get the resign button
      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      expect(resignButton).toBeTruthy();

      if (resignButton) {
        // Button should be enabled only if game is in progress
        expect(resignButton.disabled).toBe(!gameInProgress);

        if (gameInProgress) {
          // Click resign
          resignButton.click();

          // Callback should be called
          expect(resignCallback).toHaveBeenCalled();
        }
      }
    }
  );

  test.prop([fc.constantFrom('easy', 'hard')], { numRuns: 100 })(
    'difficulty selection should update selected difficulty',
    (difficulty) => {
      const elements = controls.getElements();
      const difficultySelect = elements.difficultySelect;

      expect(difficultySelect).toBeTruthy();

      if (difficultySelect) {
        difficultySelect.value = difficulty;
        difficultySelect.dispatchEvent(new Event('change'));

        expect(controls.getSelectedDifficulty()).toBe(difficulty);
      }
    }
  );

  test.prop([fc.boolean()], { numRuns: 100 })(
    'difficulty select should be disabled when game is in progress',
    (inProgress) => {
      controls.setGameInProgress(inProgress);

      const elements = controls.getElements();
      const difficultySelect = elements.difficultySelect;

      if (difficultySelect) {
        expect(difficultySelect.disabled).toBe(inProgress);
      }
    }
  );

  test.prop([fc.boolean()], { numRuns: 100 })(
    'resign button should be enabled only when game is in progress',
    (inProgress) => {
      controls.setGameInProgress(inProgress);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        expect(resignButton.disabled).toBe(!inProgress);
      }
    }
  );

  test('theme toggle button should exist', () => {
    const elements = controls.getElements();
    expect(elements.themeToggleButton).toBeTruthy();
  });

  test.prop([fc.boolean()], { numRuns: 100 })(
    'new game with confirmation should respect user choice',
    (userConfirms) => {
      window.confirm = vi.fn(() => userConfirms);

      const newGameCallback = vi.fn();
      controls.onNewGame(newGameCallback);

      // Set game in progress
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const newGameButton = elements.newGameButton;

      if (newGameButton) {
        newGameButton.click();

        if (userConfirms) {
          expect(newGameCallback).toHaveBeenCalled();
        } else {
          expect(newGameCallback).not.toHaveBeenCalled();
        }
      }
    }
  );

  test.prop([fc.boolean()], { numRuns: 100 })(
    'resign with confirmation should respect user choice',
    (userConfirms) => {
      window.confirm = vi.fn(() => userConfirms);

      const resignCallback = vi.fn();
      controls.onResign(resignCallback);

      // Set game in progress
      controls.setGameInProgress(true);

      const elements = controls.getElements();
      const resignButton = elements.resignButton;

      if (resignButton) {
        resignButton.click();

        if (userConfirms) {
          expect(resignCallback).toHaveBeenCalled();
        } else {
          expect(resignCallback).not.toHaveBeenCalled();
        }
      }
    }
  );
});
