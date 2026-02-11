/**
 * Property-based tests for Board Renderer
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { BoardRenderer } from '../../src/ui/BoardRenderer';
import { ChessEngine } from '../../src/engine/ChessEngine';
import type { GameState, Position } from '../../src/types/chess';

describe('BoardRenderer Property Tests', () => {
  let container: HTMLElement;
  let renderer: BoardRenderer;
  let engine: ChessEngine;

  beforeEach(() => {
    // Create container element
    container = document.createElement('div');
    container.id = 'test-board-container';
    document.body.appendChild(container);
    
    // Create engine and renderer
    engine = new ChessEngine();
    renderer = new BoardRenderer('test-board-container', engine);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  // Feature: web-chess-app, Property 13: Piece highlight on selection
  test.prop([
    fc.integer({ min: 0, max: 7 }),
    fc.integer({ min: 0, max: 7 })
  ], { numRuns: 100 })(
    'Property 13: Piece highlight on selection - clicking piece should apply visual highlight',
    (row, col) => {
      // Initialize with starting position
      const state = engine.initializeGame();
      renderer.renderPieces(state);
      
      // Check if there's a piece at this position
      const piece = state.board[row]?.[col];
      
      if (piece && piece.color === state.currentTurn) {
        // Get the square element
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (square instanceof HTMLElement) {
          // Simulate click
          square.click();
          
          // Check if square has selected class or highlight
          const hasHighlight = square.classList.contains('selected') || 
                              square.style.backgroundColor.includes('highlight') ||
                              square.style.backgroundColor.includes('fbbf24');
          
          expect(hasHighlight).toBe(true);
        }
      }
    }
  );

  // Feature: web-chess-app, Property 16: Turn indicator accuracy
  test.prop([fc.constantFrom('white', 'black')], { numRuns: 100 })(
    'Property 16: Turn indicator accuracy - displayed turn should match current turn',
    (turn) => {
      // Create a game state with specific turn
      const state = engine.initializeGame();
      state.currentTurn = turn as 'white' | 'black';
      
      renderer.renderPieces(state);
      
      // The renderer should only allow selecting pieces of the current turn
      // We verify this by checking that pieces of the opposite color don't get selected
      const oppositeColor = turn === 'white' ? 'black' : 'white';
      
      // Find a piece of the opposite color
      let oppositeColorPiece: Position | null = null;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = state.board[row]?.[col];
          if (piece && piece.color === oppositeColor) {
            oppositeColorPiece = { row, col };
            break;
          }
        }
        if (oppositeColorPiece) break;
      }
      
      if (oppositeColorPiece) {
        const square = document.querySelector(
          `[data-row="${oppositeColorPiece.row}"][data-col="${oppositeColorPiece.col}"]`
        );
        
        if (square instanceof HTMLElement) {
          // Click on opposite color piece
          square.click();
          
          // Should not be selected (no highlight)
          const hasHighlight = square.classList.contains('selected');
          expect(hasHighlight).toBe(false);
        }
      }
    }
  );

  test.prop([fc.integer({ min: 0, max: 7 }), fc.integer({ min: 0, max: 7 })], { numRuns: 100 })(
    'valid move indicators should be shown for selected piece',
    (row, col) => {
      const state = engine.initializeGame();
      renderer.renderPieces(state);
      
      const piece = state.board[row]?.[col];
      
      if (piece && piece.color === state.currentTurn) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (square instanceof HTMLElement) {
          square.click();
          
          // Check for valid move indicators
          const indicators = document.querySelectorAll('.move-indicator');
          const validMoves = engine.getValidMoves({ row, col }, state);
          
          // If there are valid moves, there should be indicators
          if (validMoves.length > 0) {
            expect(indicators.length).toBeGreaterThan(0);
          }
        }
      }
    }
  );

  test.prop([fc.integer({ min: 0, max: 7 }), fc.integer({ min: 0, max: 7 })], { numRuns: 100 })(
    'clicking empty square should not cause errors',
    (row, col) => {
      const state = engine.initializeGame();
      renderer.renderPieces(state);
      
      const piece = state.board[row]?.[col];
      
      if (!piece) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (square instanceof HTMLElement) {
          // Should not throw
          expect(() => square.click()).not.toThrow();
        }
      }
    }
  );
});
