/**
 * Property-based tests for Responsive Design
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { BoardRenderer } from '../../src/ui/BoardRenderer';
import { ChessEngine } from '../../src/engine/ChessEngine';
import type { GameState } from '../../src/types/chess';

describe('ResponsiveDesign Property Tests', () => {
  let container: HTMLElement;
  let renderer: BoardRenderer;
  let engine: ChessEngine;
  let originalInnerWidth: number;

  beforeEach(() => {
    // Save original window width
    originalInnerWidth = window.innerWidth;

    // Create container element
    container = document.createElement('div');
    container.id = 'test-responsive-container';
    document.body.appendChild(container);
    
    // Create engine and renderer
    engine = new ChessEngine();
    renderer = new BoardRenderer('test-responsive-container', engine);
  });

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });

    // Clean up
    document.body.removeChild(container);
  });

  // Feature: web-chess-app, Property 25: Responsive scaling
  test.prop([fc.integer({ min: 320, max: 2560 })], { numRuns: 100 })(
    'Property 25: Responsive scaling - board should scale appropriately for any screen width',
    (screenWidth) => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: screenWidth,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Get board element
      const boardElement = document.getElementById('chess-board');
      expect(boardElement).toBeTruthy();

      if (boardElement) {
        const computedStyle = window.getComputedStyle(boardElement);
        const maxWidth = computedStyle.maxWidth;

        // Board should have a max-width set
        expect(maxWidth).toBeTruthy();
        expect(maxWidth).not.toBe('none');

        // Board should be visible (not zero size)
        const rect = boardElement.getBoundingClientRect();
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
      }
    }
  );

  // Feature: web-chess-app, Property 26: Resize preserves state
  test.prop([
    fc.integer({ min: 320, max: 2560 }),
    fc.integer({ min: 320, max: 2560 })
  ], { numRuns: 100 })(
    'Property 26: Resize preserves state - game state should be preserved after resize',
    (width1, width2) => {
      // Initialize game state
      const initialState = engine.initializeGame();
      renderer.renderPieces(initialState);

      // Get initial piece count
      const initialPieces = document.querySelectorAll('.piece');
      const initialPieceCount = initialPieces.length;

      // Resize window
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width1,
      });
      window.dispatchEvent(new Event('resize'));

      // Resize again
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width2,
      });
      window.dispatchEvent(new Event('resize'));

      // Check that pieces are still rendered
      const finalPieces = document.querySelectorAll('.piece');
      expect(finalPieces.length).toBe(initialPieceCount);

      // Verify game state is intact
      const currentState = renderer['currentState'];
      if (currentState) {
        expect(currentState.moveCount).toBe(initialState.moveCount);
        expect(currentState.currentTurn).toBe(initialState.currentTurn);
      }
    }
  );

  // Feature: web-chess-app, Property 27: Input method equivalence
  test.prop([
    fc.integer({ min: 0, max: 7 }),
    fc.integer({ min: 0, max: 7 })
  ], { numRuns: 100 })(
    'Property 27: Input method equivalence - touch and click should produce same result',
    (row, col) => {
      const state = engine.initializeGame();
      renderer.renderPieces(state);

      const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      expect(square).toBeTruthy();

      if (square instanceof HTMLElement) {
        const piece = state.board[row]?.[col];

        if (piece && piece.color === state.currentTurn) {
          // Test click event
          square.click();
          const hasHighlightAfterClick = square.classList.contains('selected');

          // Clear selection
          renderer['clearSelection']();

          // Test touch event
          const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [
              {
                clientX: 0,
                clientY: 0,
                target: square,
              } as Touch,
            ],
          });
          square.dispatchEvent(touchEvent);
          const hasHighlightAfterTouch = square.classList.contains('selected');

          // Both should produce the same result
          expect(hasHighlightAfterClick).toBe(hasHighlightAfterTouch);
        }
      }
    }
  );

  test.prop([fc.integer({ min: 320, max: 2560 })], { numRuns: 100 })(
    'board should maintain aspect ratio at any screen width',
    (screenWidth) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: screenWidth,
      });

      window.dispatchEvent(new Event('resize'));

      const boardElement = document.getElementById('chess-board');
      if (boardElement) {
        const rect = boardElement.getBoundingClientRect();
        
        // Allow small tolerance for rounding
        const aspectRatio = rect.width / rect.height;
        expect(Math.abs(aspectRatio - 1)).toBeLessThan(0.1);
      }
    }
  );

  test.prop([fc.integer({ min: 0, max: 7 }), fc.integer({ min: 0, max: 7 })], { numRuns: 100 })(
    'touch events should not cause scrolling on board',
    (row, col) => {
      const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      
      if (square instanceof HTMLElement) {
        let defaultPrevented = false;

        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [
            {
              clientX: 0,
              clientY: 0,
              target: square,
            } as Touch,
          ],
        });

        // Check if preventDefault was called
        const originalPreventDefault = touchEvent.preventDefault;
        touchEvent.preventDefault = function() {
          defaultPrevented = true;
          originalPreventDefault.call(this);
        };

        square.dispatchEvent(touchEvent);

        // Touch events on board should prevent default (no scrolling)
        expect(defaultPrevented).toBe(true);
      }
    }
  );

  test('board should be playable at minimum supported width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    window.dispatchEvent(new Event('resize'));

    const state = engine.initializeGame();
    renderer.renderPieces(state);

    const boardElement = document.getElementById('chess-board');
    expect(boardElement).toBeTruthy();

    if (boardElement) {
      const rect = boardElement.getBoundingClientRect();
      
      // Board should be visible and have reasonable size
      expect(rect.width).toBeGreaterThan(200);
      expect(rect.height).toBeGreaterThan(200);

      // All squares should be present
      const squares = boardElement.querySelectorAll('.square');
      expect(squares.length).toBe(64);
    }
  });

  test('board should be playable at maximum supported width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2560,
    });

    window.dispatchEvent(new Event('resize'));

    const state = engine.initializeGame();
    renderer.renderPieces(state);

    const boardElement = document.getElementById('chess-board');
    expect(boardElement).toBeTruthy();

    if (boardElement) {
      // All squares should be present
      const squares = boardElement.querySelectorAll('.square');
      expect(squares.length).toBe(64);

      // Board should not exceed reasonable maximum
      const rect = boardElement.getBoundingClientRect();
      expect(rect.width).toBeLessThanOrEqual(800);
    }
  });
});
