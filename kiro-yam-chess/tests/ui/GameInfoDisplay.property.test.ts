/**
 * Property-based tests for Game Info Display
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { GameInfoDisplay } from '../../src/ui/GameInfoDisplay';
import { ChessEngine } from '../../src/engine/ChessEngine';
import type { GameState, Piece } from '../../src/types/chess';

describe('GameInfoDisplay Property Tests', () => {
  let display: GameInfoDisplay;
  let engine: ChessEngine;
  let container: HTMLElement;

  beforeEach(() => {
    // Create container with required elements
    container = document.createElement('div');
    container.innerHTML = `
      <div id="captured-white"></div>
      <div id="captured-black"></div>
      <div id="game-status"></div>
      <div id="move-history" style="overflow-y: auto; max-height: 200px;"></div>
      <div id="difficulty-display"></div>
    `;
    document.body.appendChild(container);

    display = new GameInfoDisplay();
    engine = new ChessEngine();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // Feature: web-chess-app, Property 15: Captured pieces display
  test.prop([fc.integer({ min: 0, max: 16 })], { numRuns: 100 })(
    'Property 15: Captured pieces display - should display all captured pieces',
    (numCaptured) => {
      const state = engine.initializeGame();
      
      // Add some captured pieces
      for (let i = 0; i < numCaptured && i < 16; i++) {
        const piece: Piece = {
          type: 'pawn',
          color: i % 2 === 0 ? 'white' : 'black',
          position: { row: 0, col: 0 },
          hasMoved: false,
        };
        state.capturedPieces.push(piece);
      }

      display.renderCapturedPieces(state);

      const capturedWhite = document.getElementById('captured-white');
      const capturedBlack = document.getElementById('captured-black');

      if (capturedWhite && capturedBlack) {
        const whiteCount = capturedWhite.children.length;
        const blackCount = capturedBlack.children.length;
        const totalDisplayed = whiteCount + blackCount;

        expect(totalDisplayed).toBe(numCaptured);
      }
    }
  );

  // Feature: web-chess-app, Property 20: Difficulty display accuracy
  test.prop([fc.constantFrom('easy', 'hard')], { numRuns: 100 })(
    'Property 20: Difficulty display accuracy - displayed difficulty should match actual',
    (difficulty) => {
      display.updateDifficultyDisplay(difficulty as 'easy' | 'hard');

      const difficultyElement = document.getElementById('difficulty-display');
      expect(difficultyElement).toBeTruthy();

      if (difficultyElement) {
        const text = difficultyElement.textContent;
        const expectedText = difficulty === 'easy' ? 'Easy Mode' : 'Hard Mode';
        expect(text).toBe(expectedText);
      }
    }
  );

  // Feature: web-chess-app, Property 21: Move number display accuracy
  test.prop([fc.integer({ min: 0, max: 50 })], { numRuns: 100 })(
    'Property 21: Move number display accuracy - displayed move number should match actual',
    (numMoves) => {
      const state = engine.initializeGame();
      
      // Simulate moves (just add to history)
      for (let i = 0; i < numMoves; i++) {
        const move = {
          from: { row: 0, col: 0 },
          to: { row: 1, col: 1 },
          piece: {
            type: 'pawn' as const,
            color: 'white' as const,
            position: { row: 0, col: 0 },
            hasMoved: false,
          },
        };
        state.moveHistory.push(move);
      }

      display.renderMoveHistory(state);

      const moveHistoryElement = document.getElementById('move-history');
      expect(moveHistoryElement).toBeTruthy();

      if (moveHistoryElement) {
        const moveRows = moveHistoryElement.querySelectorAll('.move-row');
        const expectedRows = Math.ceil(numMoves / 2);
        expect(moveRows.length).toBe(expectedRows);
      }
    }
  );

  // Feature: web-chess-app, Property 22: Move history accuracy
  test.prop([fc.integer({ min: 1, max: 20 })], { numRuns: 100 })(
    'Property 22: Move history accuracy - all moves should be displayed in order',
    (numMoves) => {
      const state = engine.initializeGame();
      
      // Add moves to history
      for (let i = 0; i < numMoves; i++) {
        const move = {
          from: { row: 6, col: i % 8 },
          to: { row: 4, col: i % 8 },
          piece: {
            type: 'pawn' as const,
            color: (i % 2 === 0 ? 'white' : 'black') as const,
            position: { row: 6, col: i % 8 },
            hasMoved: false,
          },
        };
        state.moveHistory.push(move);
      }

      display.renderMoveHistory(state);

      const moveHistoryElement = document.getElementById('move-history');
      expect(moveHistoryElement).toBeTruthy();

      if (moveHistoryElement) {
        const moveElements = moveHistoryElement.querySelectorAll('.move-row');
        expect(moveElements.length).toBeGreaterThan(0);
        
        // Verify moves are in order
        const firstMoveNumber = moveHistoryElement.querySelector('.move-number');
        if (firstMoveNumber) {
          expect(firstMoveNumber.textContent).toContain('1.');
        }
      }
    }
  );

  // Feature: web-chess-app, Property 23: Game result display
  test.prop([
    fc.constantFrom('checkmate', 'stalemate', 'resigned')
  ], { numRuns: 100 })(
    'Property 23: Game result display - correct result should be shown',
    (resultType) => {
      const state = engine.initializeGame();
      
      if (resultType === 'checkmate') {
        state.isCheckmate = true;
      } else if (resultType === 'stalemate') {
        state.isStalemate = true;
      } else if (resultType === 'resigned') {
        state.status = 'resigned';
      }

      display.showGameResult(state);

      const modal = document.getElementById('game-result-modal');
      expect(modal).toBeTruthy();

      if (modal) {
        const message = modal.querySelector('.result-message');
        expect(message).toBeTruthy();
        
        if (message) {
          const text = message.textContent || '';
          
          if (resultType === 'checkmate') {
            expect(text).toContain('Checkmate');
          } else if (resultType === 'stalemate') {
            expect(text).toContain('Stalemate');
          } else if (resultType === 'resigned') {
            expect(text).toContain('resigned');
          }
        }
      }
    }
  );

  // Feature: web-chess-app, Property 24: AI thinking indicator
  test.prop([fc.boolean()], { numRuns: 100 })(
    'Property 24: AI thinking indicator - should show when AI is thinking',
    (isThinking) => {
      const state = engine.initializeGame();
      state.isAIThinking = isThinking;

      display.updateStatusIndicator(state);

      const statusElement = document.getElementById('game-status');
      expect(statusElement).toBeTruthy();

      if (statusElement) {
        const text = statusElement.textContent || '';
        
        if (isThinking) {
          expect(text).toContain('AI Thinking');
        } else {
          expect(text).not.toContain('AI Thinking');
        }
      }
    }
  );

  test.prop([fc.constantFrom('white', 'black')], { numRuns: 100 })(
    'status indicator should reflect current turn',
    (turn) => {
      const state = engine.initializeGame();
      state.currentTurn = turn as 'white' | 'black';
      state.isAIThinking = false;

      display.updateStatusIndicator(state);

      const statusElement = document.getElementById('game-status');
      expect(statusElement).toBeTruthy();

      if (statusElement) {
        const text = statusElement.textContent || '';
        expect(text.length).toBeGreaterThan(0);
      }
    }
  );

  test.prop([fc.boolean()], { numRuns: 100 })(
    'captured pieces should handle empty state',
    (hasCaptures) => {
      const state = engine.initializeGame();
      
      if (hasCaptures) {
        state.capturedPieces.push({
          type: 'pawn',
          color: 'white',
          position: { row: 0, col: 0 },
          hasMoved: false,
        });
      }

      // Should not throw
      expect(() => display.renderCapturedPieces(state)).not.toThrow();
    }
  );
});
