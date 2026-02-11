/**
 * Unit tests for ChessEngine
 * Tests basic piece movement, board initialization, and move validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChessEngine } from '../../src/engine/ChessEngine';
import { GameState, Position, Piece, Board } from '../../src/types/chess';

describe('ChessEngine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Board Initialization', () => {
    it('should initialize a game with an 8x8 board', () => {
      const state = engine.initializeGame();
      
      expect(state.board).toHaveLength(8);
      expect(state.board[0]).toHaveLength(8);
    });

    it('should place white pieces on rows 6 and 7', () => {
      const state = engine.initializeGame();
      
      // Check white pawns on row 6
      for (let col = 0; col < 8; col++) {
        const piece = state.board[6]?.[col];
        expect(piece).not.toBeNull();
        expect(piece?.type).toBe('pawn');
        expect(piece?.color).toBe('white');
        expect(piece?.hasMoved).toBe(false);
      }

      // Check white back rank on row 7
      const expectedBackRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      for (let col = 0; col < 8; col++) {
        const piece = state.board[7]?.[col];
        expect(piece).not.toBeNull();
        expect(piece?.type).toBe(expectedBackRank[col]);
        expect(piece?.color).toBe('white');
        expect(piece?.hasMoved).toBe(false);
      }
    });

    it('should place black pieces on rows 0 and 1', () => {
      const state = engine.initializeGame();
      
      // Check black back rank on row 0
      const expectedBackRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      for (let col = 0; col < 8; col++) {
        const piece = state.board[0]?.[col];
        expect(piece).not.toBeNull();
        expect(piece?.type).toBe(expectedBackRank[col]);
        expect(piece?.color).toBe('black');
        expect(piece?.hasMoved).toBe(false);
      }

      // Check black pawns on row 1
      for (let col = 0; col < 8; col++) {
        const piece = state.board[1]?.[col];
        expect(piece).not.toBeNull();
        expect(piece?.type).toBe('pawn');
        expect(piece?.color).toBe('black');
        expect(piece?.hasMoved).toBe(false);
      }
    });

    it('should have empty squares in the middle of the board', () => {
      const state = engine.initializeGame();
      
      for (let row = 2; row <= 5; row++) {
        for (let col = 0; col < 8; col++) {
          expect(state.board[row]?.[col]).toBeNull();
        }
      }
    });

    it('should initialize game state with white to move', () => {
      const state = engine.initializeGame();
      
      expect(state.currentTurn).toBe('white');
      expect(state.moveCount).toBe(0);
      expect(state.moveHistory).toEqual([]);
      expect(state.capturedPieces).toEqual([]);
      expect(state.isCheck).toBe(false);
      expect(state.isCheckmate).toBe(false);
      expect(state.isStalemate).toBe(false);
    });
  });

  describe('Pawn Movement', () => {
    it('should allow white pawn to move one square forward', () => {
      const state = engine.initializeGame();
      const pawnPos: Position = { row: 6, col: 4 }; // e2
      
      const moves = engine.getValidMoves(pawnPos, state);
      
      expect(moves).toContainEqual({ row: 5, col: 4 }); // e3
    });

    it('should allow white pawn to move two squares forward on first move', () => {
      const state = engine.initializeGame();
      const pawnPos: Position = { row: 6, col: 4 }; // e2
      
      const moves = engine.getValidMoves(pawnPos, state);
      
      expect(moves).toContainEqual({ row: 4, col: 4 }); // e4
      expect(moves).toHaveLength(2); // Only e3 and e4
    });

    it('should not allow pawn to move two squares if it has moved', () => {
      const state = engine.initializeGame();
      
      // Move pawn to e3
      const pawn = state.board[6]?.[4];
      if (pawn) {
        pawn.hasMoved = true;
        pawn.position = { row: 5, col: 4 };
        state.board[5]![4] = pawn;
        state.board[6]![4] = null;
      }
      
      const moves = engine.getValidMoves({ row: 5, col: 4 }, state);
      
      expect(moves).toContainEqual({ row: 4, col: 4 }); // e4
      expect(moves).not.toContainEqual({ row: 3, col: 4 }); // e5 (two squares)
      expect(moves).toHaveLength(1);
    });

    it('should not allow pawn to move forward if blocked', () => {
      const state = engine.initializeGame();
      
      // Place a piece in front of the pawn
      state.board[5]![4] = {
        type: 'knight',
        color: 'black',
        position: { row: 5, col: 4 },
        hasMoved: false,
      };
      
      const moves = engine.getValidMoves({ row: 6, col: 4 }, state);
      
      expect(moves).toHaveLength(0);
    });

    it('should allow pawn to capture diagonally', () => {
      const state = engine.initializeGame();
      
      // Place black pieces diagonally in front of white pawn
      state.board[5]![3] = {
        type: 'pawn',
        color: 'black',
        position: { row: 5, col: 3 },
        hasMoved: true,
      };
      state.board[5]![5] = {
        type: 'pawn',
        color: 'black',
        position: { row: 5, col: 5 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 6, col: 4 }, state);
      
      expect(moves).toContainEqual({ row: 5, col: 3 }); // Capture left
      expect(moves).toContainEqual({ row: 5, col: 5 }); // Capture right
      expect(moves).toContainEqual({ row: 5, col: 4 }); // Move forward
      expect(moves).toContainEqual({ row: 4, col: 4 }); // Move two forward
    });

    it('should not allow pawn to capture own pieces', () => {
      const state = engine.initializeGame();
      
      // Place white pieces diagonally in front of white pawn
      state.board[5]![3] = {
        type: 'knight',
        color: 'white',
        position: { row: 5, col: 3 },
        hasMoved: false,
      };
      
      const moves = engine.getValidMoves({ row: 6, col: 4 }, state);
      
      expect(moves).not.toContainEqual({ row: 5, col: 3 });
    });

    it('should allow black pawn to move in opposite direction', () => {
      const state = engine.initializeGame();
      state.currentTurn = 'black';
      const pawnPos: Position = { row: 1, col: 4 }; // e7
      
      const moves = engine.getValidMoves(pawnPos, state);
      
      expect(moves).toContainEqual({ row: 2, col: 4 }); // e6
      expect(moves).toContainEqual({ row: 3, col: 4 }); // e5
    });
  });

  describe('Knight Movement', () => {
    it('should allow knight to move in L-shape', () => {
      const state = engine.initializeGame();
      const knightPos: Position = { row: 7, col: 1 }; // b1
      
      const moves = engine.getValidMoves(knightPos, state);
      
      // Knight can jump over pawns
      expect(moves).toContainEqual({ row: 5, col: 0 }); // a3
      expect(moves).toContainEqual({ row: 5, col: 2 }); // c3
      expect(moves).toHaveLength(2);
    });

    it('should allow knight to move to all 8 positions when in center', () => {
      const state = engine.initializeGame();
      
      // Clear the board and place white knight in center
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      emptyBoard[4]![4] = {
        type: 'knight',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      // Add kings so the game state is valid
      emptyBoard[7]![4] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 4 },
        hasMoved: false,
      };
      emptyBoard[0]![4] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 4 },
        hasMoved: false,
      };
      state.board = emptyBoard;
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      expect(moves).toHaveLength(8);
      expect(moves).toContainEqual({ row: 2, col: 3 });
      expect(moves).toContainEqual({ row: 2, col: 5 });
      expect(moves).toContainEqual({ row: 3, col: 2 });
      expect(moves).toContainEqual({ row: 3, col: 6 });
      expect(moves).toContainEqual({ row: 5, col: 2 });
      expect(moves).toContainEqual({ row: 5, col: 6 });
      expect(moves).toContainEqual({ row: 6, col: 3 });
      expect(moves).toContainEqual({ row: 6, col: 5 });
    });

    it('should not allow knight to move off the board', () => {
      const state = engine.initializeGame();
      
      // Place knight in corner
      state.board[0]![0] = {
        type: 'knight',
        color: 'white',
        position: { row: 0, col: 0 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 0, col: 0 }, state);
      
      // Only 2 valid moves from corner
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({ row: 2, col: 1 });
      expect(moves).toContainEqual({ row: 1, col: 2 });
    });

    it('should allow knight to capture opponent pieces', () => {
      const state = engine.initializeGame();
      
      // Place white knight
      state.board[4]![4] = {
        type: 'knight',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      
      // Place black piece in knight's range
      state.board[2]![3] = {
        type: 'pawn',
        color: 'black',
        position: { row: 2, col: 3 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      expect(moves).toContainEqual({ row: 2, col: 3 });
    });
  });

  describe('Bishop Movement', () => {
    it('should allow bishop to move diagonally', () => {
      const state = engine.initializeGame();
      
      // Clear path for bishop
      state.board[6]![3] = null; // Remove d2 pawn
      
      const bishopPos: Position = { row: 7, col: 2 }; // c1
      const moves = engine.getValidMoves(bishopPos, state);
      
      expect(moves).toContainEqual({ row: 6, col: 3 }); // d2
      expect(moves).toContainEqual({ row: 5, col: 4 }); // e3
      expect(moves).toContainEqual({ row: 4, col: 5 }); // f4
      expect(moves).toContainEqual({ row: 3, col: 6 }); // g5
      expect(moves).toContainEqual({ row: 2, col: 7 }); // h6
    });

    it('should stop bishop at opponent piece', () => {
      const state = engine.initializeGame();
      
      // Place white bishop in center
      state.board[4]![4] = {
        type: 'bishop',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      
      // Place black piece in diagonal path
      state.board[2]![2] = {
        type: 'pawn',
        color: 'black',
        position: { row: 2, col: 2 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Should be able to capture at (2,2) but not go beyond
      expect(moves).toContainEqual({ row: 2, col: 2 });
      expect(moves).not.toContainEqual({ row: 1, col: 1 });
      expect(moves).not.toContainEqual({ row: 0, col: 0 });
    });

    it('should stop bishop at own piece', () => {
      const state = engine.initializeGame();
      
      // Place white bishop in center
      state.board[4]![4] = {
        type: 'bishop',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      
      // Place white piece in diagonal path
      state.board[2]![2] = {
        type: 'pawn',
        color: 'white',
        position: { row: 2, col: 2 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Should not be able to move to (2,2) or beyond
      expect(moves).not.toContainEqual({ row: 2, col: 2 });
      expect(moves).toContainEqual({ row: 3, col: 3 }); // Can move to square before
    });
  });

  describe('Rook Movement', () => {
    it('should allow rook to move horizontally and vertically', () => {
      const state = engine.initializeGame();
      
      // Place white rook in center
      state.board[4]![4] = {
        type: 'rook',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Should be able to move in 4 directions
      // Up
      expect(moves).toContainEqual({ row: 3, col: 4 });
      expect(moves).toContainEqual({ row: 2, col: 4 });
      // Down
      expect(moves).toContainEqual({ row: 5, col: 4 });
      // Left
      expect(moves).toContainEqual({ row: 4, col: 3 });
      expect(moves).toContainEqual({ row: 4, col: 2 });
      // Right
      expect(moves).toContainEqual({ row: 4, col: 5 });
      expect(moves).toContainEqual({ row: 4, col: 6 });
    });

    it('should stop rook at pieces', () => {
      const state = engine.initializeGame();
      
      // Rook at starting position is blocked by pawn
      const rookPos: Position = { row: 7, col: 0 }; // a1
      const moves = engine.getValidMoves(rookPos, state);
      
      expect(moves).toHaveLength(0); // Blocked by pawn
    });
  });

  describe('Queen Movement', () => {
    it('should allow queen to move like bishop and rook combined', () => {
      // Create empty board with queen in center
      const state = engine.initializeGame();
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      emptyBoard[4]![4] = {
        type: 'queen',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      // Add kings so the game state is valid (place them out of the way)
      emptyBoard[7]![7] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 7 },
        hasMoved: false,
      };
      emptyBoard[0]![0] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: false,
      };
      state.board = emptyBoard;
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Queen in center of empty board should have 26 moves
      // (27 total squares in all 8 directions, minus the white king square)
      expect(moves.length).toBe(26);
      
      // Check some diagonal moves
      expect(moves).toContainEqual({ row: 3, col: 3 });
      expect(moves).toContainEqual({ row: 5, col: 5 });
      
      // Check some straight moves
      expect(moves).toContainEqual({ row: 3, col: 4 });
      expect(moves).toContainEqual({ row: 4, col: 5 });
    });
  });

  describe('King Movement', () => {
    it('should allow king to move one square in any direction', () => {
      const state = engine.initializeGame();
      
      // Place white king in center
      state.board[4]![4] = {
        type: 'king',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Should have 8 possible moves
      expect(moves).toHaveLength(8);
      expect(moves).toContainEqual({ row: 3, col: 3 });
      expect(moves).toContainEqual({ row: 3, col: 4 });
      expect(moves).toContainEqual({ row: 3, col: 5 });
      expect(moves).toContainEqual({ row: 4, col: 3 });
      expect(moves).toContainEqual({ row: 4, col: 5 });
      expect(moves).toContainEqual({ row: 5, col: 3 });
      expect(moves).toContainEqual({ row: 5, col: 4 });
      expect(moves).toContainEqual({ row: 5, col: 5 });
    });

    it('should not allow king to move off board', () => {
      // Create empty board with king in corner
      const state = engine.initializeGame();
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      emptyBoard[0]![0] = {
        type: 'king',
        color: 'white',
        position: { row: 0, col: 0 },
        hasMoved: true,
      };
      state.board = emptyBoard;
      
      const moves = engine.getValidMoves({ row: 0, col: 0 }, state);
      
      // Only 3 valid moves from corner
      expect(moves).toHaveLength(3);
      expect(moves).toContainEqual({ row: 0, col: 1 });
      expect(moves).toContainEqual({ row: 1, col: 0 });
      expect(moves).toContainEqual({ row: 1, col: 1 });
    });
  });

  describe('Move Validation', () => {
    it('should return empty array for empty square', () => {
      const state = engine.initializeGame();
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      expect(moves).toEqual([]);
    });

    it('should not allow moving opponent pieces', () => {
      const state = engine.initializeGame();
      // Try to move black piece when it's white's turn
      const moves = engine.getValidMoves({ row: 1, col: 4 }, state);
      
      expect(moves).toEqual([]);
    });

    it('should filter out moves that would leave king in check', () => {
      // Create a scenario where moving a piece would expose the king
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      
      // Place white king at e4
      emptyBoard[4]![4] = {
        type: 'king',
        color: 'white',
        position: { row: 4, col: 4 },
        hasMoved: true,
      };
      
      // Place white rook at e3 (protecting king from black rook)
      emptyBoard[5]![4] = {
        type: 'rook',
        color: 'white',
        position: { row: 5, col: 4 },
        hasMoved: true,
      };
      
      // Place black rook at e1 (attacking up the file)
      emptyBoard[7]![4] = {
        type: 'rook',
        color: 'black',
        position: { row: 7, col: 4 },
        hasMoved: true,
      };
      
      const state: GameState = {
        board: emptyBoard,
        currentTurn: 'white',
        moveHistory: [],
        capturedPieces: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        moveCount: 0,
      };
      
      // The white rook at e3 is pinned - it can only move along the e-file
      const moves = engine.getValidMoves({ row: 5, col: 4 }, state);
      
      // Rook can only move up/down the file (capturing the black rook or moving toward the king)
      // It cannot move horizontally because that would expose the king
      const allMovesOnSameFile = moves.every(move => move.col === 4);
      expect(allMovesOnSameFile).toBe(true);
      
      // Should be able to move down the file and capture the black rook
      expect(moves).toContainEqual({ row: 6, col: 4 });
      expect(moves).toContainEqual({ row: 7, col: 4 }); // Capture black rook
    });
  });

  describe('Edge Cases', () => {
    it('should handle board boundaries correctly', () => {
      const state = engine.initializeGame();
      
      // Test piece at edge
      const moves = engine.getValidMoves({ row: 7, col: 0 }, state);
      
      // Rook at a1 is blocked by pawn, should have no moves
      expect(moves).toEqual([]);
    });

    it('should handle pieces with no valid moves', () => {
      const state = engine.initializeGame();
      
      // Bishop at starting position has no moves (blocked by pawns)
      const moves = engine.getValidMoves({ row: 7, col: 2 }, state);
      
      expect(moves).toEqual([]);
    });
  });

  describe('Pawn Promotion', () => {
    it('should detect when white pawn reaches row 0', () => {
      const state = engine.initializeGame();
      
      // Place white pawn on row 1 (one square from promotion)
      const whitePawn: Piece = {
        type: 'pawn',
        color: 'white',
        position: { row: 1, col: 4 },
        hasMoved: true,
      };
      state.board[1]![4] = whitePawn;
      
      // Check if moving to row 0 would be promotion
      const isPromotion = engine.isPawnPromotion({ row: 1, col: 4 }, { row: 0, col: 4 }, state);
      
      expect(isPromotion).toBe(true);
    });

    it('should detect when black pawn reaches row 7', () => {
      const state = engine.initializeGame();
      
      // Place black pawn on row 6 (one square from promotion)
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 6, col: 4 },
        hasMoved: true,
      };
      state.board[6]![4] = blackPawn;
      
      // Check if moving to row 7 would be promotion
      const isPromotion = engine.isPawnPromotion({ row: 6, col: 4 }, { row: 7, col: 4 }, state);
      
      expect(isPromotion).toBe(true);
    });

    it('should not detect promotion for non-promotion moves', () => {
      const state = engine.initializeGame();
      
      // Regular pawn move
      const isPromotion = engine.isPawnPromotion({ row: 6, col: 4 }, { row: 5, col: 4 }, state);
      
      expect(isPromotion).toBe(false);
    });

    it('should not detect promotion for non-pawn pieces', () => {
      const state = engine.initializeGame();
      
      // Knight move to row 0
      const isPromotion = engine.isPawnPromotion({ row: 2, col: 4 }, { row: 0, col: 4 }, state);
      
      expect(isPromotion).toBe(false);
    });

    it('should allow white pawn to move to promotion square', () => {
      const state = engine.initializeGame();
      
      // Place white pawn on row 1
      const whitePawn: Piece = {
        type: 'pawn',
        color: 'white',
        position: { row: 1, col: 4 },
        hasMoved: true,
      };
      state.board[1]![4] = whitePawn;
      
      // Clear the square in front of the pawn
      state.board[0]![4] = null;
      
      // Add kings for valid game state
      state.board[7]![4] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 4 },
        hasMoved: false,
      };
      state.board[0]![0] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: false,
      };
      
      const moves = engine.getValidMoves({ row: 1, col: 4 }, state);
      
      // Should be able to move to row 0 (promotion square)
      expect(moves).toContainEqual({ row: 0, col: 4 });
    });

    it('should allow black pawn to move to promotion square', () => {
      const state = engine.initializeGame();
      state.currentTurn = 'black';
      
      // Place black pawn on row 6
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 6, col: 4 },
        hasMoved: true,
      };
      state.board[6]![4] = blackPawn;
      
      // Clear the square in front of the pawn
      state.board[7]![4] = null;
      
      // Add kings for valid game state
      state.board[7]![7] = {
        type: 'king',
        color: 'black',
        position: { row: 7, col: 7 },
        hasMoved: false,
      };
      state.board[0]![0] = {
        type: 'king',
        color: 'white',
        position: { row: 0, col: 0 },
        hasMoved: false,
      };
      
      const moves = engine.getValidMoves({ row: 6, col: 4 }, state);
      
      // Should be able to move to row 7 (promotion square)
      expect(moves).toContainEqual({ row: 7, col: 4 });
    });

    it('should allow pawn to capture and promote', () => {
      const state = engine.initializeGame();
      
      // Place white pawn on row 1
      const whitePawn: Piece = {
        type: 'pawn',
        color: 'white',
        position: { row: 1, col: 4 },
        hasMoved: true,
      };
      state.board[1]![4] = whitePawn;
      
      // Place black piece on promotion square diagonally
      state.board[0]![5] = {
        type: 'knight',
        color: 'black',
        position: { row: 0, col: 5 },
        hasMoved: true,
      };
      
      // Add kings for valid game state
      state.board[7]![4] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 4 },
        hasMoved: false,
      };
      state.board[0]![0] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: false,
      };
      
      const moves = engine.getValidMoves({ row: 1, col: 4 }, state);
      
      // Should be able to capture and promote
      expect(moves).toContainEqual({ row: 0, col: 5 });
      
      // Verify it's a promotion move
      const isPromotion = engine.isPawnPromotion({ row: 1, col: 4 }, { row: 0, col: 5 }, state);
      expect(isPromotion).toBe(true);
    });
  });

  describe('En Passant', () => {
    it('should allow en passant capture when conditions are met', () => {
      const state = engine.initializeGame();
      
      // Move white pawn to 5th rank (row 3)
      const whitePawn = state.board[6]?.[4]; // e2
      if (whitePawn) {
        whitePawn.hasMoved = true;
        whitePawn.position = { row: 3, col: 4 };
        state.board[3]![4] = whitePawn;
        state.board[6]![4] = null;
      }
      
      // Place black pawn on adjacent file
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 1, col: 5 },
        hasMoved: false,
      };
      state.board[1]![5] = blackPawn;
      
      // Simulate black pawn moving two squares (f7 to f5)
      state.lastMove = {
        from: { row: 1, col: 5 },
        to: { row: 3, col: 5 },
        piece: blackPawn,
      };
      blackPawn.position = { row: 3, col: 5 };
      state.board[3]![5] = blackPawn;
      state.board[1]![5] = null;
      
      // White pawn should be able to capture en passant
      const moves = engine.getValidMoves({ row: 3, col: 4 }, state);
      
      expect(moves).toContainEqual({ row: 2, col: 5 }); // En passant capture
    });

    it('should not allow en passant if pawn is not on correct rank', () => {
      const state = engine.initializeGame();
      
      // White pawn on wrong rank (row 4 instead of row 3)
      const whitePawn = state.board[6]?.[4];
      if (whitePawn) {
        whitePawn.hasMoved = true;
        whitePawn.position = { row: 4, col: 4 };
        state.board[4]![4] = whitePawn;
        state.board[6]![4] = null;
      }
      
      // Black pawn moves two squares
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 4, col: 5 },
        hasMoved: true,
      };
      state.board[4]![5] = blackPawn;
      
      state.lastMove = {
        from: { row: 2, col: 5 },
        to: { row: 4, col: 5 },
        piece: blackPawn,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Should not include en passant
      expect(moves).not.toContainEqual({ row: 3, col: 5 });
    });

    it('should not allow en passant if last move was not a pawn', () => {
      const state = engine.initializeGame();
      
      // White pawn on correct rank
      const whitePawn = state.board[6]?.[4];
      if (whitePawn) {
        whitePawn.hasMoved = true;
        whitePawn.position = { row: 3, col: 4 };
        state.board[3]![4] = whitePawn;
        state.board[6]![4] = null;
      }
      
      // Last move was a knight, not a pawn
      const knight: Piece = {
        type: 'knight',
        color: 'black',
        position: { row: 3, col: 5 },
        hasMoved: true,
      };
      state.board[3]![5] = knight;
      
      state.lastMove = {
        from: { row: 1, col: 6 },
        to: { row: 3, col: 5 },
        piece: knight,
      };
      
      const moves = engine.getValidMoves({ row: 3, col: 4 }, state);
      
      // Should not include en passant
      expect(moves).not.toContainEqual({ row: 2, col: 5 });
    });

    it('should not allow en passant if last move was only one square', () => {
      const state = engine.initializeGame();
      
      // White pawn on correct rank
      const whitePawn = state.board[6]?.[4];
      if (whitePawn) {
        whitePawn.hasMoved = true;
        whitePawn.position = { row: 3, col: 4 };
        state.board[3]![4] = whitePawn;
        state.board[6]![4] = null;
      }
      
      // Black pawn moved only one square
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 3, col: 5 },
        hasMoved: true,
      };
      state.board[3]![5] = blackPawn;
      
      state.lastMove = {
        from: { row: 2, col: 5 },
        to: { row: 3, col: 5 },
        piece: blackPawn,
      };
      
      const moves = engine.getValidMoves({ row: 3, col: 4 }, state);
      
      // Should not include en passant
      expect(moves).not.toContainEqual({ row: 2, col: 5 });
    });

    it('should not allow en passant if pawns are not adjacent', () => {
      const state = engine.initializeGame();
      
      // White pawn on correct rank
      const whitePawn = state.board[6]?.[4];
      if (whitePawn) {
        whitePawn.hasMoved = true;
        whitePawn.position = { row: 3, col: 4 };
        state.board[3]![4] = whitePawn;
        state.board[6]![4] = null;
      }
      
      // Black pawn moved two squares but not adjacent
      const blackPawn: Piece = {
        type: 'pawn',
        color: 'black',
        position: { row: 3, col: 7 },
        hasMoved: true,
      };
      state.board[3]![7] = blackPawn;
      
      state.lastMove = {
        from: { row: 1, col: 7 },
        to: { row: 3, col: 7 },
        piece: blackPawn,
      };
      
      const moves = engine.getValidMoves({ row: 3, col: 4 }, state);
      
      // Should not include en passant
      expect(moves).not.toContainEqual({ row: 2, col: 7 });
    });

    it('should allow black to capture en passant', () => {
      const state = engine.initializeGame();
      state.currentTurn = 'black';
      
      // Black pawn on correct rank (row 4 for black)
      const blackPawn = state.board[1]?.[4];
      if (blackPawn) {
        blackPawn.hasMoved = true;
        blackPawn.position = { row: 4, col: 4 };
        state.board[4]![4] = blackPawn;
        state.board[1]![4] = null;
      }
      
      // White pawn moves two squares
      const whitePawn: Piece = {
        type: 'pawn',
        color: 'white',
        position: { row: 4, col: 5 },
        hasMoved: true,
      };
      state.board[4]![5] = whitePawn;
      
      state.lastMove = {
        from: { row: 6, col: 5 },
        to: { row: 4, col: 5 },
        piece: whitePawn,
      };
      
      const moves = engine.getValidMoves({ row: 4, col: 4 }, state);
      
      // Should include en passant capture
      expect(moves).toContainEqual({ row: 5, col: 5 });
    });
  });

  describe('Castling', () => {
    it('should allow kingside castling when conditions are met', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and kingside rook
      state.board[7]![5] = null; // f1
      state.board[7]![6] = null; // g1
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should include kingside castling move
      expect(moves).toContainEqual({ row: 7, col: 6 });
    });

    it('should allow queenside castling when conditions are met', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and queenside rook
      state.board[7]![1] = null; // b1
      state.board[7]![2] = null; // c1
      state.board[7]![3] = null; // d1
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should include queenside castling move
      expect(moves).toContainEqual({ row: 7, col: 2 });
    });

    it('should not allow castling if king has moved', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and rooks
      state.board[7]![5] = null;
      state.board[7]![6] = null;
      
      // Mark king as moved
      const king = state.board[7]?.[4];
      if (king) {
        king.hasMoved = true;
      }
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should not include castling moves
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
      expect(moves).not.toContainEqual({ row: 7, col: 2 });
    });

    it('should not allow castling if rook has moved', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and kingside rook
      state.board[7]![5] = null;
      state.board[7]![6] = null;
      
      // Mark rook as moved
      const rook = state.board[7]?.[7];
      if (rook) {
        rook.hasMoved = true;
      }
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should not include kingside castling
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    it('should not allow castling if pieces are between king and rook', () => {
      const state = engine.initializeGame();
      
      // Only clear one square (knight still blocks)
      state.board[7]![6] = null;
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should not include kingside castling
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    it('should not allow castling if king is in check', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and rook
      state.board[7]![5] = null;
      state.board[7]![6] = null;
      
      // Clear the pawn in front of the king
      state.board[6]![4] = null;
      
      // Place black rook attacking the king
      state.board[5]![4] = {
        type: 'rook',
        color: 'black',
        position: { row: 5, col: 4 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should not include castling moves
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    it('should not allow castling if king passes through check', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and kingside rook
      state.board[7]![5] = null;
      state.board[7]![6] = null;
      
      // Clear the pawn in front of f1
      state.board[6]![5] = null;
      
      // Place black rook attacking f1 (square king passes through)
      state.board[5]![5] = {
        type: 'rook',
        color: 'black',
        position: { row: 5, col: 5 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should not include kingside castling
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    it('should not allow castling if king ends in check', () => {
      const state = engine.initializeGame();
      
      // Clear pieces between king and kingside rook
      state.board[7]![5] = null;
      state.board[7]![6] = null;
      
      // Clear the pawn in front of g1
      state.board[6]![6] = null;
      
      // Place black rook attacking g1 (destination square)
      state.board[5]![6] = {
        type: 'rook',
        color: 'black',
        position: { row: 5, col: 6 },
        hasMoved: true,
      };
      
      const moves = engine.getValidMoves({ row: 7, col: 4 }, state);
      
      // Should not include kingside castling (filtered by wouldLeaveKingInCheck)
      expect(moves).not.toContainEqual({ row: 7, col: 6 });
    });

    it('should allow black to castle', () => {
      const state = engine.initializeGame();
      state.currentTurn = 'black';
      
      // Clear pieces between black king and kingside rook
      state.board[0]![5] = null; // f8
      state.board[0]![6] = null; // g8
      
      const moves = engine.getValidMoves({ row: 0, col: 4 }, state);
      
      // Should include kingside castling move
      expect(moves).toContainEqual({ row: 0, col: 6 });
    });
  });

  describe('Check Detection', () => {
    it('should detect when white king is in check', () => {
      const state = engine.initializeGame();
      
      // Clear the pawn in front of the king
      state.board[6]![4] = null;
      
      // Place black rook attacking white king
      state.board[5]![4] = {
        type: 'rook',
        color: 'black',
        position: { row: 5, col: 4 },
        hasMoved: true,
      };
      
      const isInCheck = engine.isInCheck('white', state);
      
      expect(isInCheck).toBe(true);
    });

    it('should detect when black king is in check', () => {
      const state = engine.initializeGame();
      
      // Clear the pawn in front of the king
      state.board[1]![4] = null;
      
      // Place white rook attacking black king
      state.board[2]![4] = {
        type: 'rook',
        color: 'white',
        position: { row: 2, col: 4 },
        hasMoved: true,
      };
      
      const isInCheck = engine.isInCheck('black', state);
      
      expect(isInCheck).toBe(true);
    });

    it('should return false when king is not in check', () => {
      const state = engine.initializeGame();
      
      const whiteInCheck = engine.isInCheck('white', state);
      const blackInCheck = engine.isInCheck('black', state);
      
      expect(whiteInCheck).toBe(false);
      expect(blackInCheck).toBe(false);
    });
  });

  describe('Checkmate Detection', () => {
    it('should detect checkmate - back rank mate', () => {
      // Create a back rank checkmate position
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      
      // White king trapped on back rank
      emptyBoard[7]![6] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 6 },
        hasMoved: true,
      };
      
      // White pawns blocking escape
      emptyBoard[6]![5] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 5 },
        hasMoved: true,
      };
      emptyBoard[6]![6] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 6 },
        hasMoved: true,
      };
      emptyBoard[6]![7] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 7 },
        hasMoved: true,
      };
      
      // Black rook delivering checkmate
      emptyBoard[7]![0] = {
        type: 'rook',
        color: 'black',
        position: { row: 7, col: 0 },
        hasMoved: true,
      };
      
      // Black king
      emptyBoard[0]![4] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 4 },
        hasMoved: false,
      };
      
      const state: GameState = {
        board: emptyBoard,
        currentTurn: 'white',
        moveHistory: [],
        capturedPieces: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        moveCount: 0,
      };
      
      const isCheckmate = engine.isCheckmate('white', state);
      
      expect(isCheckmate).toBe(true);
    });

    it('should not detect checkmate when king can escape', () => {
      const state = engine.initializeGame();
      
      // Place black rook attacking white king
      state.board[5]![4] = {
        type: 'rook',
        color: 'black',
        position: { row: 5, col: 4 },
        hasMoved: true,
      };
      
      // King is in check but can move
      const isCheckmate = engine.isCheckmate('white', state);
      
      expect(isCheckmate).toBe(false);
    });

    it('should not detect checkmate when not in check', () => {
      const state = engine.initializeGame();
      
      const isCheckmate = engine.isCheckmate('white', state);
      
      expect(isCheckmate).toBe(false);
    });
  });

  describe('Stalemate Detection', () => {
    it('should detect stalemate when king has no moves but is not in check', () => {
      // Create a stalemate position
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      
      // White king in corner
      emptyBoard[7]![7] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 7 },
        hasMoved: true,
      };
      
      // Black queen at (5,6) blocks all king moves without giving check
      emptyBoard[5]![6] = {
        type: 'queen',
        color: 'black',
        position: { row: 5, col: 6 },
        hasMoved: true,
      };
      
      // Black king
      emptyBoard[0]![0] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 0 },
        hasMoved: false,
      };
      
      const state: GameState = {
        board: emptyBoard,
        currentTurn: 'white',
        moveHistory: [],
        capturedPieces: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        moveCount: 0,
      };
      
      const isStalemate = engine.isStalemate(state);
      
      expect(isStalemate).toBe(true);
    });

    it('should not detect stalemate when king is in check', () => {
      const state = engine.initializeGame();
      
      // Place black rook attacking white king
      state.board[5]![4] = {
        type: 'rook',
        color: 'black',
        position: { row: 5, col: 4 },
        hasMoved: true,
      };
      
      const isStalemate = engine.isStalemate(state);
      
      expect(isStalemate).toBe(false);
    });

    it('should not detect stalemate when player has legal moves', () => {
      const state = engine.initializeGame();
      
      const isStalemate = engine.isStalemate(state);
      
      expect(isStalemate).toBe(false);
    });
  });

  describe('Get All Legal Moves', () => {
    it('should return all legal moves for white at start', () => {
      const state = engine.initializeGame();
      
      const moves = engine.getAllLegalMoves('white', state);
      
      // At start, white has 20 possible moves (16 pawn moves + 4 knight moves)
      expect(moves.length).toBe(20);
    });

    it('should return all legal moves for black at start', () => {
      const state = engine.initializeGame();
      state.currentTurn = 'black';
      
      const moves = engine.getAllLegalMoves('black', state);
      
      // At start, black has 20 possible moves (16 pawn moves + 4 knight moves)
      expect(moves.length).toBe(20);
    });

    it('should return empty array when in checkmate', () => {
      // Create a checkmate position
      const emptyBoard: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      
      // White king trapped
      emptyBoard[7]![6] = {
        type: 'king',
        color: 'white',
        position: { row: 7, col: 6 },
        hasMoved: true,
      };
      
      // Pawns blocking
      emptyBoard[6]![5] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 5 },
        hasMoved: true,
      };
      emptyBoard[6]![6] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 6 },
        hasMoved: true,
      };
      emptyBoard[6]![7] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 7 },
        hasMoved: true,
      };
      
      // Black rook delivering checkmate
      emptyBoard[7]![0] = {
        type: 'rook',
        color: 'black',
        position: { row: 7, col: 0 },
        hasMoved: true,
      };
      
      // Black king
      emptyBoard[0]![4] = {
        type: 'king',
        color: 'black',
        position: { row: 0, col: 4 },
        hasMoved: false,
      };
      
      const state: GameState = {
        board: emptyBoard,
        currentTurn: 'white',
        moveHistory: [],
        capturedPieces: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        moveCount: 0,
      };
      
      const moves = engine.getAllLegalMoves('white', state);
      
      expect(moves.length).toBe(0);
    });
  });

});
