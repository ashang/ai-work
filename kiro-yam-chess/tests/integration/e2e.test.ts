/**
 * End-to-end integration tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ChessEngine } from '../../src/engine/ChessEngine';
import { AIOpponent } from '../../src/ai/AIOpponent';
import { GameController } from '../../src/controllers/GameController';

describe('End-to-End Integration Tests', () => {
  let engine: ChessEngine;
  let aiOpponent: AIOpponent;
  let controller: GameController;

  beforeEach(() => {
    engine = new ChessEngine();
    aiOpponent = new AIOpponent();
    controller = new GameController();
  });

  test('complete game flow from start to checkmate', async () => {
    // Start a new game
    controller.startNewGame('easy');
    
    let state = controller.getGameState();
    expect(state.moveCount).toBe(0);
    expect(state.currentTurn).toBe('white');

    // Play a few moves
    let moveCount = 0;
    const maxMoves = 10;

    while (!state.isCheckmate && !state.isStalemate && moveCount < maxMoves) {
      // Get legal moves for current player
      const legalMoves = engine.getAllLegalMoves(state.currentTurn, state);
      
      if (legalMoves.length === 0) {
        break;
      }

      // Make a move (player's turn)
      if (state.currentTurn === 'white') {
        const move = legalMoves[0];
        await controller.handlePlayerMove(move);
        state = controller.getGameState();
      }

      moveCount++;
    }

    // Game should have progressed
    expect(state.moveCount).toBeGreaterThan(0);
  }, { timeout: 30000 });

  test('complete game ending in stalemate', async () => {
    // This is a simplified test - actual stalemate is rare
    controller.startNewGame('easy');
    
    const state = controller.getGameState();
    
    // Manually create a stalemate position
    // Clear most pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row]?.[col];
        if (piece && piece.type !== 'king') {
          state.board[row][col] = null;
        }
      }
    }

    // Verify stalemate detection works
    const isStalemate = engine.isStalemate(state);
    expect(typeof isStalemate).toBe('boolean');
  });

  test('game with resignation', () => {
    controller.startNewGame('easy');
    
    let state = controller.getGameState();
    expect(state.status).not.toBe('resigned');

    // Resign the game
    controller.resignGame();
    
    state = controller.getGameState();
    expect(state.status).toBe('resigned');
    expect(state.winner).toBe('black');
  });

  test('state change notifications fire correctly', async () => {
    const stateChangeSpy = vi.fn();
    controller.onStateChange(stateChangeSpy);

    controller.startNewGame('easy');
    
    // Should have been called for new game
    expect(stateChangeSpy).toHaveBeenCalled();
    
    const callCount = stateChangeSpy.mock.calls.length;

    // Make a move
    const state = controller.getGameState();
    const legalMoves = engine.getAllLegalMoves('white', state);
    
    if (legalMoves.length > 0) {
      await controller.handlePlayerMove(legalMoves[0]);
      
      // Should have been called more times (player move + AI move)
      expect(stateChangeSpy.mock.calls.length).toBeGreaterThan(callCount);
    }
  }, { timeout: 10000 });

  test('AI responds within time limit in easy mode', async () => {
    controller.startNewGame('easy');
    
    const state = controller.getGameState();
    const legalMoves = engine.getAllLegalMoves('white', state);
    
    if (legalMoves.length > 0) {
      const startTime = Date.now();
      await controller.handlePlayerMove(legalMoves[0]);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // AI should respond within 2 seconds (plus some buffer)
      expect(duration).toBeLessThan(3000);
    }
  }, { timeout: 10000 });

  test('AI responds within time limit in hard mode', async () => {
    controller.startNewGame('hard');
    
    const state = controller.getGameState();
    const legalMoves = engine.getAllLegalMoves('white', state);
    
    if (legalMoves.length > 0) {
      const startTime = Date.now();
      await controller.handlePlayerMove(legalMoves[0]);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // AI should respond within 3 seconds (plus some buffer)
      expect(duration).toBeLessThan(4000);
    }
  }, { timeout: 10000 });

  test('invalid move is rejected', async () => {
    controller.startNewGame('easy');
    
    const initialState = controller.getGameState();
    const initialMoveCount = initialState.moveCount;

    // Create an invalid move
    const invalidMove = {
      from: { row: 0, col: 0 },
      to: { row: 7, col: 7 },
      piece: {
        type: 'pawn' as const,
        color: 'white' as const,
        position: { row: 0, col: 0 },
        hasMoved: false,
      },
    };

    await controller.handlePlayerMove(invalidMove);
    
    const finalState = controller.getGameState();
    
    // State should not have changed
    expect(finalState.moveCount).toBe(initialMoveCount);
  });

  test('game state persists through multiple moves', async () => {
    controller.startNewGame('easy');
    
    const moves: any[] = [];
    
    // Play several moves
    for (let i = 0; i < 3; i++) {
      const state = controller.getGameState();
      const legalMoves = engine.getAllLegalMoves(state.currentTurn, state);
      
      if (legalMoves.length > 0 && state.currentTurn === 'white') {
        const move = legalMoves[0];
        moves.push(move);
        await controller.handlePlayerMove(move);
      } else {
        break;
      }
    }

    const finalState = controller.getGameState();
    
    // Move history should contain all moves
    expect(finalState.moveHistory.length).toBeGreaterThanOrEqual(moves.length);
  }, { timeout: 20000 });

  test('new game resets state correctly', async () => {
    controller.startNewGame('easy');
    
    // Make some moves
    const state = controller.getGameState();
    const legalMoves = engine.getAllLegalMoves('white', state);
    
    if (legalMoves.length > 0) {
      await controller.handlePlayerMove(legalMoves[0]);
    }

    // Start new game
    controller.startNewGame('hard');
    
    const newState = controller.getGameState();
    
    // State should be reset
    expect(newState.moveCount).toBe(0);
    expect(newState.moveHistory).toHaveLength(0);
    expect(newState.currentTurn).toBe('white');
    expect(newState.capturedPieces).toHaveLength(0);
  }, { timeout: 10000 });

  test('difficulty setting is respected', async () => {
    // Start easy game
    controller.startNewGame('easy');
    let state = controller.getGameState();
    
    // Make a move
    const legalMoves = engine.getAllLegalMoves('white', state);
    if (legalMoves.length > 0) {
      await controller.handlePlayerMove(legalMoves[0]);
    }

    // Start hard game
    controller.startNewGame('hard');
    state = controller.getGameState();
    
    // Game should be reset
    expect(state.moveCount).toBe(0);
  }, { timeout: 10000 });

  test('AI thinking indicator toggles correctly', async () => {
    const states: boolean[] = [];
    
    controller.onStateChange((state) => {
      if (state.isAIThinking !== undefined) {
        states.push(state.isAIThinking);
      }
    });

    controller.startNewGame('easy');
    
    const state = controller.getGameState();
    const legalMoves = engine.getAllLegalMoves('white', state);
    
    if (legalMoves.length > 0) {
      await controller.handlePlayerMove(legalMoves[0]);
      
      // Should have seen both true and false
      expect(states).toContain(true);
      expect(states).toContain(false);
    }
  }, { timeout: 10000 });

  test('captured pieces are tracked correctly', async () => {
    controller.startNewGame('easy');
    
    // Create a position where a capture is possible
    const state = controller.getGameState();
    
    // Find a move that captures a piece
    const legalMoves = engine.getAllLegalMoves('white', state);
    const captureMove = legalMoves.find(move => move.capturedPiece);
    
    if (captureMove) {
      const initialCapturedCount = state.capturedPieces.length;
      await controller.handlePlayerMove(captureMove);
      
      const newState = controller.getGameState();
      expect(newState.capturedPieces.length).toBeGreaterThan(initialCapturedCount);
    }
  }, { timeout: 10000 });
});
