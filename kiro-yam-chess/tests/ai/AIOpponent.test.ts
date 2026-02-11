/**
 * Unit tests for AI Opponent
 * Tests edge cases and specific scenarios
 */

import { describe, test, expect } from 'vitest';
import { AIOpponent } from '../../src/ai/AIOpponent';
import { ChessEngine } from '../../src/engine/ChessEngine';
import type { Piece } from '../../src/types/chess';

describe('AIOpponent Unit Tests', () => {
  const ai = new AIOpponent();
  const engine = new ChessEngine();

  describe('Position Evaluation', () => {
    test('should evaluate starting position as roughly equal', () => {
      const state = engine.initializeGame();
      const score = ai.evaluatePosition(state);
      
      // Starting position should be close to 0 (equal material)
      expect(Math.abs(score)).toBeLessThan(1);
    });

    test('should favor black when black has material advantage', () => {
      const state = engine.initializeGame();
      
      // Remove white queen
      const row = state.board[7];
      if (row) row[3] = null;
      
      const score = ai.evaluatePosition(state);
      
      // Black should have positive score (material advantage)
      expect(score).toBeGreaterThan(5);
    });

    test('should favor white when white has material advantage', () => {
      const state = engine.initializeGame();
      
      // Remove black queen
      const row = state.board[0];
      if (row) row[3] = null;
      
      const score = ai.evaluatePosition(state);
      
      // White should have negative score (black disadvantage)
      expect(score).toBeLessThan(-5);
    });

    test('should give bonus for center control', () => {
      const state = engine.initializeGame();
      
      // Clear center squares
      const row3 = state.board[3];
      const row4 = state.board[4];
      if (row3) {
        row3[3] = null;
        row3[4] = null;
      }
      if (row4) {
        row4[3] = null;
        row4[4] = null;
      }
      
      // Place black knight in center
      const centerKnight: Piece = {
        type: 'knight',
        color: 'black',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      if (row4) row4[4] = centerKnight;
      
      const scoreWithCenter = ai.evaluatePosition(state);
      
      // Move knight to edge
      if (row4) row4[4] = null;
      const edgeKnight: Piece = {
        type: 'knight',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: true,
      };
      const row0 = state.board[0];
      if (row0) row0[0] = edgeKnight;
      
      const scoreWithEdge = ai.evaluatePosition(state);
      
      // Center position should score higher
      expect(scoreWithCenter).toBeGreaterThan(scoreWithEdge);
    });
  });

  describe('Move Generation', () => {
    test('should generate a valid move in easy mode', async () => {
      const state = engine.initializeGame();
      const config = { difficulty: 'easy' as const, maxThinkingTime: 2000 };
      
      const move = await ai.generateMove(state, config);
      
      expect(engine.isValidMove(move, state)).toBe(true);
    });

    test('should generate a valid move in hard mode', async () => {
      const state = engine.initializeGame();
      const config = { difficulty: 'hard' as const, maxThinkingTime: 3000 };
      
      const move = await ai.generateMove(state, config);
      
      expect(engine.isValidMove(move, state)).toBe(true);
    });

    test('should handle timeout by returning a random valid move', async () => {
      const state = engine.initializeGame();
      // Set very short timeout to force timeout
      const config = { difficulty: 'easy' as const, maxThinkingTime: 1 };
      
      const move = await ai.generateMove(state, config);
      
      // Should still return a valid move
      expect(engine.isValidMove(move, state)).toBe(true);
    }, { timeout: 5000 });
  });

  describe('Checkmate Detection', () => {
    test('should detect checkmate move correctly', () => {
      // Create a position where black can checkmate
      const state = engine.initializeGame();
      
      // Clear most pieces
      for (let row = 0; row < 8; row++) {
        const boardRow = state.board[row];
        if (boardRow) {
          for (let col = 0; col < 8; col++) {
            boardRow[col] = null;
          }
        }
      }
      
      // Set up a simple checkmate position
      // White king on h1
      const whiteKing: Piece = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 7 },
        hasMoved: true,
      };
      const row7 = state.board[7];
      if (row7) row7[7] = whiteKing;
      
      // Black queen on g2 (can checkmate on h2)
      const blackQueen: Piece = {
        type: 'queen',
        color: 'black',
        position: { row: 6, col: 6 },
        hasMoved: true,
      };
      const row6 = state.board[6];
      if (row6) row6[6] = blackQueen;
      
      // Black king somewhere safe
      const blackKing: Piece = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: true,
      };
      const row0 = state.board[0];
      if (row0) row0[0] = blackKing;
      
      state.currentTurn = 'black';
      
      // Create a move that would be checkmate
      const checkmateMove = {
        from: { row: 6, col: 6 },
        to: { row: 7, col: 6 },
        piece: blackQueen,
      };
      
      const isCheckmate = ai.wouldResultInCheckmate(checkmateMove, state);
      expect(isCheckmate).toBe(true);
    });

    test('should return false for non-checkmate move', () => {
      const state = engine.initializeGame();
      
      // Get a normal opening move
      const legalMoves = engine.getAllLegalMoves('black', state);
      const normalMove = legalMoves[0];
      
      if (normalMove) {
        const isCheckmate = ai.wouldResultInCheckmate(normalMove, state);
        expect(isCheckmate).toBe(false);
      }
    });
  });

  describe('Difficulty-Specific Behavior', () => {
    test('easy mode should avoid checkmate when possible', async () => {
      // Create a position where black can checkmate
      const state = engine.initializeGame();
      
      // Clear most pieces
      for (let row = 0; row < 8; row++) {
        const boardRow = state.board[row];
        if (boardRow) {
          for (let col = 0; col < 8; col++) {
            boardRow[col] = null;
          }
        }
      }
      
      // Set up a position where checkmate is available
      const whiteKing: Piece = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 7 },
        hasMoved: true,
      };
      const row7 = state.board[7];
      if (row7) row7[7] = whiteKing;
      
      const blackQueen: Piece = {
        type: 'queen',
        color: 'black',
        position: { row: 6, col: 6 },
        hasMoved: true,
      };
      const row6 = state.board[6];
      if (row6) row6[6] = blackQueen;
      
      const blackKing: Piece = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: true,
      };
      const row0 = state.board[0];
      if (row0) row0[0] = blackKing;
      
      // Add another black piece to give alternative moves
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 1, col: 1 },
        hasMoved: false,
      };
      const row1 = state.board[1];
      if (row1) row1[1] = blackPawn;
      
      state.currentTurn = 'black';
      state.moveCount = 5;
      
      const config = { difficulty: 'easy' as const, maxThinkingTime: 2000 };
      const move = await ai.generateMove(state, config);
      
      // Should not be a checkmate move
      expect(ai.wouldResultInCheckmate(move, state)).toBe(false);
    });

    test('hard mode should avoid checkmate before move 10', async () => {
      // Create a position where black can checkmate
      const state = engine.initializeGame();
      
      // Clear most pieces
      for (let row = 0; row < 8; row++) {
        const boardRow = state.board[row];
        if (boardRow) {
          for (let col = 0; col < 8; col++) {
            boardRow[col] = null;
          }
        }
      }
      
      const whiteKing: Piece = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 7 },
        hasMoved: true,
      };
      const row7 = state.board[7];
      if (row7) row7[7] = whiteKing;
      
      const blackQueen: Piece = {
        type: 'queen',
        color: 'black',
        position: { row: 6, col: 6 },
        hasMoved: true,
      };
      const row6 = state.board[6];
      if (row6) row6[6] = blackQueen;
      
      const blackKing: Piece = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: true,
      };
      const row0 = state.board[0];
      if (row0) row0[0] = blackKing;
      
      // Add another black piece
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 1, col: 1 },
        hasMoved: false,
      };
      const row1 = state.board[1];
      if (row1) row1[1] = blackPawn;
      
      state.currentTurn = 'black';
      state.moveCount = 5;  // Before move 10
      
      const config = { difficulty: 'hard' as const, maxThinkingTime: 3000 };
      const move = await ai.generateMove(state, config);
      
      // Should not be a checkmate move before move 10
      expect(ai.wouldResultInCheckmate(move, state)).toBe(false);
    });
  });
});
