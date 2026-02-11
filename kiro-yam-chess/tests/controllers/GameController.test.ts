/**
 * Integration tests for Game Controller
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GameController } from '../../src/controllers/GameController';
import { ChessEngine } from '../../src/engine/ChessEngine';
import type { GameState } from '../../src/types/chess';

describe('GameController Integration Tests', () => {
  let controller: GameController;
  let engine: ChessEngine;

  beforeEach(() => {
    controller = new GameController();
    engine = new ChessEngine();
  });

  describe('Game Initialization', () => {
    test('should start a new game with easy difficulty', () => {
      const stateChangeSpy = vi.fn();
      controller.onStateChange(stateChangeSpy);

      controller.startNewGame('easy');

      const state = controller.getGameState();
      expect(state.moveCount).toBe(0);
      expect(state.currentTurn).toBe('white');
      expect(state.moveHistory).toHaveLength(0);
      expect(stateChangeSpy).toHaveBeenCalledTimes(1);
    });

    test('should start a new game with hard difficulty', () => {
      controller.startNewGame('hard');

      const state = controller.getGameState();
      expect(state.moveCount).toBe(0);
      expect(state.currentTurn).toBe('white');
    });

    test('should reset game state when starting new game', async () => {
      // Start first game
      controller.startNewGame('easy');
      
      // Make a move
      const state = controller.getGameState();
      const legalMoves = engine.getAllLegalMoves('white', state);
      const firstMove = legalMoves[0];
      if (firstMove) {
        await controller.handlePlayerMove(firstMove);
      }

      // Start new game
      controller.startNewGame('easy');
      const newState = controller.getGameState();

      expect(newState.moveCount).toBe(0);
      expect(newState.moveHistory).toHaveLength(0);
      expect(newState.currentTurn).toBe('white');
    }, { timeout: 10000 });
  });

  describe('Player Move Handling', () => {
    test('should execute valid player move', async () => {
      controller.startNewGame('easy');
      const state = controller.getGameState();

      const legalMoves = engine.getAllLegalMoves('white', state);
      const validMove = legalMoves[0];

      if (validMove) {
        await controller.handlePlayerMove(validMove);
        const newState = controller.getGameState();

        // Move count should increase (player move + AI move)
        expect(newState.moveCount).toBeGreaterThan(0);
      }
    }, { timeout: 10000 });

    test('should reject invalid move and maintain state', async () => {
      controller.startNewGame('easy');
      const initialState = controller.getGameState();

      // Create an invalid move
      const invalidMove = {
        from: { row: 0, col: 0 },
        to: { row: 5, col: 5 },
        piece: {
          type: 'pawn' as const,
          color: 'white' as const,
          position: { row: 0, col: 0 },
          hasMoved: false,
        },
      };

      await controller.handlePlayerMove(invalidMove);
      const newState = controller.getGameState();

      // State should remain unchanged
      expect(newState.moveCount).toBe(initialState.moveCount);
      expect(newState.moveHistory).toHaveLength(initialState.moveHistory.length);
    });

    test('should trigger AI move after player move', async () => {
      controller.startNewGame('easy');
      const stateChangeSpy = vi.fn();
      controller.onStateChange(stateChangeSpy);

      const state = controller.getGameState();
      const legalMoves = engine.getAllLegalMoves('white', state);
      const validMove = legalMoves[0];

      if (validMove) {
        await controller.handlePlayerMove(validMove);

        // Should have multiple state changes: player move, AI thinking, AI move
        expect(stateChangeSpy).toHaveBeenCalled();
        
        const finalState = controller.getGameState();
        // After player move and AI move, it should be white's turn again
        expect(finalState.currentTurn).toBe('white');
      }
    }, { timeout: 10000 });
  });

  describe('State Change Notifications', () => {
    test('should notify subscribers on state change', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      controller.onStateChange(callback1);
      controller.onStateChange(callback2);

      controller.startNewGame('easy');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should pass current state to callbacks', () => {
      let capturedState: GameState | null = null;
      controller.onStateChange((state) => {
        capturedState = state;
      });

      controller.startNewGame('easy');

      expect(capturedState).not.toBeNull();
      expect(capturedState?.moveCount).toBe(0);
    });
  });

  describe('AI Thinking Indicator', () => {
    test('should set isAIThinking flag during AI move', async () => {
      controller.startNewGame('easy');
      
      let aiThinkingStates: boolean[] = [];
      controller.onStateChange((state) => {
        if (state.isAIThinking !== undefined) {
          aiThinkingStates.push(state.isAIThinking);
        }
      });

      const state = controller.getGameState();
      const legalMoves = engine.getAllLegalMoves('white', state);
      const validMove = legalMoves[0];

      if (validMove) {
        await controller.handlePlayerMove(validMove);

        // Should have seen both true and false for isAIThinking
        expect(aiThinkingStates).toContain(true);
        expect(aiThinkingStates).toContain(false);
      }
    }, { timeout: 10000 });
  });

  describe('Resignation', () => {
    test('should end game when player resigns', () => {
      controller.startNewGame('easy');
      
      controller.resignGame();
      const state = controller.getGameState();

      expect(state.status).toBe('resigned');
      expect(state.winner).toBe('black');
    });

    test('should notify subscribers when player resigns', () => {
      controller.startNewGame('easy');
      
      const stateChangeSpy = vi.fn();
      controller.onStateChange(stateChangeSpy);

      controller.resignGame();

      expect(stateChangeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Game End Conditions', () => {
    test('should not request AI move if game is over', async () => {
      controller.startNewGame('easy');
      
      // Manually set game to checkmate state
      const state = controller.getGameState();
      state.isCheckmate = true;

      const legalMoves = engine.getAllLegalMoves('white', state);
      const validMove = legalMoves[0];

      if (validMove) {
        const initialMoveCount = state.moveCount;
        await controller.handlePlayerMove(validMove);
        
        // AI should not have moved since game is over
        const finalState = controller.getGameState();
        expect(finalState.moveCount).toBe(initialMoveCount + 1);
      }
    }, { timeout: 10000 });
  });
});
