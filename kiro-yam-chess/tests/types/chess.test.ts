/**
 * Unit tests for chess data models and type guards
 * Tests validation functions and edge cases for position bounds
 */

import { describe, it, expect } from 'vitest';
import {
  Position,
  Piece,
  Move,
  GameState,
  PieceType,
  PieceColor,
  PromotionType,
  Board,
  isValidPosition,
  isValidPieceType,
  isValidPieceColor,
  isValidPiece,
  isValidPromotionType,
  isValidMove,
  isValidBoard,
  isValidGameState,
  positionsEqual,
  copyPosition,
  copyPiece,
  positionToAlgebraic,
  algebraicToPosition,
} from '../../src/types/chess';

describe('Position Type Guard', () => {
  it('should validate valid positions', () => {
    expect(isValidPosition({ row: 0, col: 0 })).toBe(true);
    expect(isValidPosition({ row: 7, col: 7 })).toBe(true);
    expect(isValidPosition({ row: 3, col: 4 })).toBe(true);
  });

  it('should reject positions with out-of-bounds row', () => {
    expect(isValidPosition({ row: -1, col: 0 })).toBe(false);
    expect(isValidPosition({ row: 8, col: 0 })).toBe(false);
    expect(isValidPosition({ row: 100, col: 0 })).toBe(false);
  });

  it('should reject positions with out-of-bounds col', () => {
    expect(isValidPosition({ row: 0, col: -1 })).toBe(false);
    expect(isValidPosition({ row: 0, col: 8 })).toBe(false);
    expect(isValidPosition({ row: 0, col: 100 })).toBe(false);
  });

  it('should reject positions with non-numeric values', () => {
    expect(isValidPosition({ row: '0', col: 0 })).toBe(false);
    expect(isValidPosition({ row: 0, col: '0' })).toBe(false);
    expect(isValidPosition({ row: null, col: 0 })).toBe(false);
    expect(isValidPosition({ row: 0, col: undefined })).toBe(false);
  });

  it('should reject non-object values', () => {
    expect(isValidPosition(null)).toBe(false);
    expect(isValidPosition(undefined)).toBe(false);
    expect(isValidPosition('position')).toBe(false);
    expect(isValidPosition(42)).toBe(false);
    expect(isValidPosition([])).toBe(false);
  });

  it('should reject objects missing required properties', () => {
    expect(isValidPosition({ row: 0 })).toBe(false);
    expect(isValidPosition({ col: 0 })).toBe(false);
    expect(isValidPosition({})).toBe(false);
  });
});

describe('PieceType Type Guard', () => {
  it('should validate all valid piece types', () => {
    expect(isValidPieceType('pawn')).toBe(true);
    expect(isValidPieceType('knight')).toBe(true);
    expect(isValidPieceType('bishop')).toBe(true);
    expect(isValidPieceType('rook')).toBe(true);
    expect(isValidPieceType('queen')).toBe(true);
    expect(isValidPieceType('king')).toBe(true);
  });

  it('should reject invalid piece types', () => {
    expect(isValidPieceType('invalid')).toBe(false);
    expect(isValidPieceType('PAWN')).toBe(false);
    expect(isValidPieceType('')).toBe(false);
    expect(isValidPieceType(null)).toBe(false);
    expect(isValidPieceType(undefined)).toBe(false);
    expect(isValidPieceType(42)).toBe(false);
  });
});

describe('PieceColor Type Guard', () => {
  it('should validate valid piece colors', () => {
    expect(isValidPieceColor('white')).toBe(true);
    expect(isValidPieceColor('black')).toBe(true);
  });

  it('should reject invalid piece colors', () => {
    expect(isValidPieceColor('red')).toBe(false);
    expect(isValidPieceColor('WHITE')).toBe(false);
    expect(isValidPieceColor('')).toBe(false);
    expect(isValidPieceColor(null)).toBe(false);
    expect(isValidPieceColor(undefined)).toBe(false);
    expect(isValidPieceColor(42)).toBe(false);
  });
});

describe('Piece Type Guard', () => {
  const validPiece: Piece = {
    type: 'pawn',
    color: 'white',
    position: { row: 6, col: 4 },
    hasMoved: false,
  };

  it('should validate a valid piece', () => {
    expect(isValidPiece(validPiece)).toBe(true);
  });

  it('should validate pieces with different types', () => {
    expect(isValidPiece({ ...validPiece, type: 'knight' })).toBe(true);
    expect(isValidPiece({ ...validPiece, type: 'bishop' })).toBe(true);
    expect(isValidPiece({ ...validPiece, type: 'rook' })).toBe(true);
    expect(isValidPiece({ ...validPiece, type: 'queen' })).toBe(true);
    expect(isValidPiece({ ...validPiece, type: 'king' })).toBe(true);
  });

  it('should validate pieces with different colors', () => {
    expect(isValidPiece({ ...validPiece, color: 'black' })).toBe(true);
  });

  it('should validate pieces with hasMoved true', () => {
    expect(isValidPiece({ ...validPiece, hasMoved: true })).toBe(true);
  });

  it('should reject pieces with invalid type', () => {
    expect(isValidPiece({ ...validPiece, type: 'invalid' })).toBe(false);
  });

  it('should reject pieces with invalid color', () => {
    expect(isValidPiece({ ...validPiece, color: 'red' })).toBe(false);
  });

  it('should reject pieces with invalid position', () => {
    expect(isValidPiece({ ...validPiece, position: { row: -1, col: 0 } })).toBe(false);
    expect(isValidPiece({ ...validPiece, position: { row: 0, col: 8 } })).toBe(false);
  });

  it('should reject pieces with non-boolean hasMoved', () => {
    expect(isValidPiece({ ...validPiece, hasMoved: 'false' })).toBe(false);
    expect(isValidPiece({ ...validPiece, hasMoved: 0 })).toBe(false);
  });

  it('should reject non-object values', () => {
    expect(isValidPiece(null)).toBe(false);
    expect(isValidPiece(undefined)).toBe(false);
    expect(isValidPiece('piece')).toBe(false);
  });
});

describe('PromotionType Type Guard', () => {
  it('should validate all valid promotion types', () => {
    expect(isValidPromotionType('queen')).toBe(true);
    expect(isValidPromotionType('rook')).toBe(true);
    expect(isValidPromotionType('bishop')).toBe(true);
    expect(isValidPromotionType('knight')).toBe(true);
  });

  it('should reject invalid promotion types', () => {
    expect(isValidPromotionType('pawn')).toBe(false);
    expect(isValidPromotionType('king')).toBe(false);
    expect(isValidPromotionType('invalid')).toBe(false);
    expect(isValidPromotionType(null)).toBe(false);
  });
});

describe('Move Type Guard', () => {
  const validPiece: Piece = {
    type: 'pawn',
    color: 'white',
    position: { row: 6, col: 4 },
    hasMoved: false,
  };

  const validMove: Move = {
    from: { row: 6, col: 4 },
    to: { row: 4, col: 4 },
    piece: validPiece,
  };

  it('should validate a valid basic move', () => {
    expect(isValidMove(validMove)).toBe(true);
  });

  it('should validate a move with captured piece', () => {
    const capturedPiece: Piece = {
      type: 'pawn',
      color: 'black',
      position: { row: 4, col: 4 },
      hasMoved: true,
    };
    expect(isValidMove({ ...validMove, capturedPiece })).toBe(true);
  });

  it('should validate a move with en passant flag', () => {
    expect(isValidMove({ ...validMove, isEnPassant: true })).toBe(true);
    expect(isValidMove({ ...validMove, isEnPassant: false })).toBe(true);
  });

  it('should validate a move with castling flag', () => {
    expect(isValidMove({ ...validMove, isCastling: true })).toBe(true);
    expect(isValidMove({ ...validMove, isCastling: false })).toBe(true);
  });

  it('should validate a move with promotion type', () => {
    expect(isValidMove({ ...validMove, promotionType: 'queen' })).toBe(true);
    expect(isValidMove({ ...validMove, promotionType: 'rook' })).toBe(true);
  });

  it('should reject moves with invalid from position', () => {
    expect(isValidMove({ ...validMove, from: { row: -1, col: 0 } })).toBe(false);
  });

  it('should reject moves with invalid to position', () => {
    expect(isValidMove({ ...validMove, to: { row: 8, col: 0 } })).toBe(false);
  });

  it('should reject moves with invalid piece', () => {
    expect(isValidMove({ ...validMove, piece: null })).toBe(false);
    expect(isValidMove({ ...validMove, piece: { ...validPiece, type: 'invalid' } })).toBe(false);
  });

  it('should reject moves with invalid captured piece', () => {
    expect(isValidMove({ ...validMove, capturedPiece: { ...validPiece, type: 'invalid' } })).toBe(false);
  });

  it('should reject moves with invalid promotion type', () => {
    expect(isValidMove({ ...validMove, promotionType: 'pawn' })).toBe(false);
  });

  it('should reject non-object values', () => {
    expect(isValidMove(null)).toBe(false);
    expect(isValidMove(undefined)).toBe(false);
    expect(isValidMove('move')).toBe(false);
  });
});

describe('Board Type Guard', () => {
  const createEmptyBoard = (): Board => {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  };

  it('should validate an empty 8x8 board', () => {
    const board = createEmptyBoard();
    expect(isValidBoard(board)).toBe(true);
  });

  it('should validate a board with pieces', () => {
    const board = createEmptyBoard();
    board[0][0] = {
      type: 'rook',
      color: 'black',
      position: { row: 0, col: 0 },
      hasMoved: false,
    };
    board[7][7] = {
      type: 'rook',
      color: 'white',
      position: { row: 7, col: 7 },
      hasMoved: false,
    };
    expect(isValidBoard(board)).toBe(true);
  });

  it('should reject boards with wrong number of rows', () => {
    expect(isValidBoard(Array(7).fill(null).map(() => Array(8).fill(null)))).toBe(false);
    expect(isValidBoard(Array(9).fill(null).map(() => Array(8).fill(null)))).toBe(false);
  });

  it('should reject boards with wrong number of columns', () => {
    const board = Array(8).fill(null).map(() => Array(7).fill(null));
    expect(isValidBoard(board)).toBe(false);
  });

  it('should reject boards with invalid pieces', () => {
    const board = createEmptyBoard();
    board[0][0] = { type: 'invalid', color: 'white', position: { row: 0, col: 0 }, hasMoved: false } as any;
    expect(isValidBoard(board)).toBe(false);
  });

  it('should reject non-array values', () => {
    expect(isValidBoard(null)).toBe(false);
    expect(isValidBoard(undefined)).toBe(false);
    expect(isValidBoard('board')).toBe(false);
    expect(isValidBoard({})).toBe(false);
  });
});

describe('GameState Type Guard', () => {
  const createEmptyBoard = (): Board => {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  };

  const validGameState: GameState = {
    board: createEmptyBoard(),
    currentTurn: 'white',
    moveHistory: [],
    capturedPieces: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    moveCount: 0,
  };

  it('should validate a valid game state', () => {
    expect(isValidGameState(validGameState)).toBe(true);
  });

  it('should validate game state with black turn', () => {
    expect(isValidGameState({ ...validGameState, currentTurn: 'black' })).toBe(true);
  });

  it('should validate game state with moves', () => {
    const move: Move = {
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
      piece: {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 4 },
        hasMoved: false,
      },
    };
    expect(isValidGameState({ ...validGameState, moveHistory: [move], moveCount: 1 })).toBe(true);
  });

  it('should validate game state with captured pieces', () => {
    const capturedPiece: Piece = {
      type: 'pawn',
      color: 'black',
      position: { row: 4, col: 4 },
      hasMoved: true,
    };
    expect(isValidGameState({ ...validGameState, capturedPieces: [capturedPiece] })).toBe(true);
  });

  it('should validate game state with check', () => {
    expect(isValidGameState({ ...validGameState, isCheck: true })).toBe(true);
  });

  it('should validate game state with checkmate', () => {
    expect(isValidGameState({ ...validGameState, isCheckmate: true })).toBe(true);
  });

  it('should validate game state with stalemate', () => {
    expect(isValidGameState({ ...validGameState, isStalemate: true })).toBe(true);
  });

  it('should reject game state with invalid board', () => {
    expect(isValidGameState({ ...validGameState, board: null })).toBe(false);
    expect(isValidGameState({ ...validGameState, board: [] })).toBe(false);
  });

  it('should reject game state with invalid current turn', () => {
    expect(isValidGameState({ ...validGameState, currentTurn: 'red' })).toBe(false);
  });

  it('should reject game state with invalid move history', () => {
    expect(isValidGameState({ ...validGameState, moveHistory: null })).toBe(false);
    expect(isValidGameState({ ...validGameState, moveHistory: [null] })).toBe(false);
  });

  it('should reject game state with negative move count', () => {
    expect(isValidGameState({ ...validGameState, moveCount: -1 })).toBe(false);
  });

  it('should reject non-object values', () => {
    expect(isValidGameState(null)).toBe(false);
    expect(isValidGameState(undefined)).toBe(false);
    expect(isValidGameState('state')).toBe(false);
  });
});

describe('Position Helper Functions', () => {
  describe('positionsEqual', () => {
    it('should return true for equal positions', () => {
      expect(positionsEqual({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(true);
      expect(positionsEqual({ row: 7, col: 7 }, { row: 7, col: 7 })).toBe(true);
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 4 })).toBe(true);
    });

    it('should return false for different positions', () => {
      expect(positionsEqual({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false);
      expect(positionsEqual({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(false);
      expect(positionsEqual({ row: 3, col: 4 }, { row: 4, col: 3 })).toBe(false);
    });
  });

  describe('copyPosition', () => {
    it('should create a deep copy of a position', () => {
      const original = { row: 3, col: 4 };
      const copy = copyPosition(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      
      // Modify copy and ensure original is unchanged
      copy.row = 5;
      expect(original.row).toBe(3);
    });
  });

  describe('copyPiece', () => {
    it('should create a deep copy of a piece', () => {
      const original: Piece = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col: 4 },
        hasMoved: false,
      };
      const copy = copyPiece(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy.position).not.toBe(original.position);
      
      // Modify copy and ensure original is unchanged
      copy.position.row = 5;
      copy.hasMoved = true;
      expect(original.position.row).toBe(6);
      expect(original.hasMoved).toBe(false);
    });
  });
});

describe('Algebraic Notation Conversion', () => {
  describe('positionToAlgebraic', () => {
    it('should convert corner positions correctly', () => {
      expect(positionToAlgebraic({ row: 0, col: 0 })).toBe('a8');
      expect(positionToAlgebraic({ row: 0, col: 7 })).toBe('h8');
      expect(positionToAlgebraic({ row: 7, col: 0 })).toBe('a1');
      expect(positionToAlgebraic({ row: 7, col: 7 })).toBe('h1');
    });

    it('should convert middle positions correctly', () => {
      expect(positionToAlgebraic({ row: 4, col: 4 })).toBe('e4');
      expect(positionToAlgebraic({ row: 3, col: 3 })).toBe('d5');
      expect(positionToAlgebraic({ row: 6, col: 4 })).toBe('e2');
    });

    it('should convert all files correctly', () => {
      expect(positionToAlgebraic({ row: 0, col: 0 })).toBe('a8');
      expect(positionToAlgebraic({ row: 0, col: 1 })).toBe('b8');
      expect(positionToAlgebraic({ row: 0, col: 2 })).toBe('c8');
      expect(positionToAlgebraic({ row: 0, col: 3 })).toBe('d8');
      expect(positionToAlgebraic({ row: 0, col: 4 })).toBe('e8');
      expect(positionToAlgebraic({ row: 0, col: 5 })).toBe('f8');
      expect(positionToAlgebraic({ row: 0, col: 6 })).toBe('g8');
      expect(positionToAlgebraic({ row: 0, col: 7 })).toBe('h8');
    });

    it('should convert all ranks correctly', () => {
      expect(positionToAlgebraic({ row: 0, col: 0 })).toBe('a8');
      expect(positionToAlgebraic({ row: 1, col: 0 })).toBe('a7');
      expect(positionToAlgebraic({ row: 2, col: 0 })).toBe('a6');
      expect(positionToAlgebraic({ row: 3, col: 0 })).toBe('a5');
      expect(positionToAlgebraic({ row: 4, col: 0 })).toBe('a4');
      expect(positionToAlgebraic({ row: 5, col: 0 })).toBe('a3');
      expect(positionToAlgebraic({ row: 6, col: 0 })).toBe('a2');
      expect(positionToAlgebraic({ row: 7, col: 0 })).toBe('a1');
    });
  });

  describe('algebraicToPosition', () => {
    it('should convert corner squares correctly', () => {
      expect(algebraicToPosition('a8')).toEqual({ row: 0, col: 0 });
      expect(algebraicToPosition('h8')).toEqual({ row: 0, col: 7 });
      expect(algebraicToPosition('a1')).toEqual({ row: 7, col: 0 });
      expect(algebraicToPosition('h1')).toEqual({ row: 7, col: 7 });
    });

    it('should convert middle squares correctly', () => {
      expect(algebraicToPosition('e4')).toEqual({ row: 4, col: 4 });
      expect(algebraicToPosition('d5')).toEqual({ row: 3, col: 3 });
      expect(algebraicToPosition('e2')).toEqual({ row: 6, col: 4 });
    });

    it('should return null for invalid notation', () => {
      expect(algebraicToPosition('i1')).toBeNull();  // Invalid file
      expect(algebraicToPosition('a9')).toBeNull();  // Invalid rank
      expect(algebraicToPosition('a0')).toBeNull();  // Invalid rank
      expect(algebraicToPosition('aa')).toBeNull();  // Invalid format
      expect(algebraicToPosition('11')).toBeNull();  // Invalid format
      expect(algebraicToPosition('e')).toBeNull();   // Too short
      expect(algebraicToPosition('e44')).toBeNull(); // Too long
      expect(algebraicToPosition('')).toBeNull();    // Empty string
    });

    it('should be case-sensitive', () => {
      expect(algebraicToPosition('E4')).toBeNull();
      expect(algebraicToPosition('e4')).toEqual({ row: 4, col: 4 });
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert position to algebraic and back', () => {
      const positions = [
        { row: 0, col: 0 },
        { row: 0, col: 7 },
        { row: 7, col: 0 },
        { row: 7, col: 7 },
        { row: 4, col: 4 },
        { row: 3, col: 3 },
      ];

      for (const pos of positions) {
        const algebraic = positionToAlgebraic(pos);
        const converted = algebraicToPosition(algebraic);
        expect(converted).toEqual(pos);
      }
    });
  });
});
