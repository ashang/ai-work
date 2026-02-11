/**
 * Core data models and types for the chess application
 * Based on the design document specifications
 */

/**
 * Represents a position on the chess board
 * Row and column are 0-indexed (0-7)
 * [0][0] represents a8 (top-left, black's back rank)
 * [7][7] represents h1 (bottom-right, white's back rank)
 */
export interface Position {
  row: number;  // 0-7
  col: number;  // 0-7
}

/**
 * Type union for piece types
 */
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

/**
 * Type union for piece colors
 */
export type PieceColor = 'white' | 'black';

/**
 * Represents a chess piece
 */
export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;  // For castling and pawn double-move tracking
}

/**
 * Type union for promotion piece types
 */
export type PromotionType = 'queen' | 'rook' | 'bishop' | 'knight';

/**
 * Represents a chess move
 */
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionType?: PromotionType;
}

/**
 * Type union for game status
 */
export type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'resigned';

/**
 * Represents the complete game state
 */
export interface GameState {
  board: (Piece | null)[][];  // 8x8 grid
  currentTurn: PieceColor;
  moveHistory: Move[];
  capturedPieces: Piece[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  moveCount: number;
  lastMove?: Move;  // Track last move for en passant
  isAIThinking?: boolean;  // Track if AI is currently thinking
  status?: GameStatus;  // Track game status (active, resigned, etc.)
  winner?: PieceColor;  // Track winner if game is over
}

/**
 * Helper type for board representation
 * An 8x8 grid where each cell contains either a Piece or null
 */
export type Board = (Piece | null)[][];

/**
 * Type guard to check if a value is a valid Position
 */
export function isValidPosition(pos: any): pos is Position {
  return (
    typeof pos === 'object' &&
    pos !== null &&
    typeof pos.row === 'number' &&
    typeof pos.col === 'number' &&
    pos.row >= 0 &&
    pos.row <= 7 &&
    pos.col >= 0 &&
    pos.col <= 7
  );
}

/**
 * Type guard to check if a value is a valid PieceType
 */
export function isValidPieceType(type: any): type is PieceType {
  return ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'].includes(type);
}

/**
 * Type guard to check if a value is a valid PieceColor
 */
export function isValidPieceColor(color: any): color is PieceColor {
  return color === 'white' || color === 'black';
}

/**
 * Type guard to check if a value is a valid Piece
 */
export function isValidPiece(piece: any): piece is Piece {
  return (
    typeof piece === 'object' &&
    piece !== null &&
    isValidPieceType(piece.type) &&
    isValidPieceColor(piece.color) &&
    isValidPosition(piece.position) &&
    typeof piece.hasMoved === 'boolean'
  );
}

/**
 * Type guard to check if a value is a valid PromotionType
 */
export function isValidPromotionType(type: any): type is PromotionType {
  return ['queen', 'rook', 'bishop', 'knight'].includes(type);
}

/**
 * Type guard to check if a value is a valid Move
 */
export function isValidMove(move: any): move is Move {
  if (
    typeof move !== 'object' ||
    move === null ||
    !isValidPosition(move.from) ||
    !isValidPosition(move.to) ||
    !isValidPiece(move.piece)
  ) {
    return false;
  }

  // Optional fields validation
  if (move.capturedPiece !== undefined && !isValidPiece(move.capturedPiece)) {
    return false;
  }

  if (move.isEnPassant !== undefined && typeof move.isEnPassant !== 'boolean') {
    return false;
  }

  if (move.isCastling !== undefined && typeof move.isCastling !== 'boolean') {
    return false;
  }

  if (move.promotionType !== undefined && !isValidPromotionType(move.promotionType)) {
    return false;
  }

  return true;
}

/**
 * Type guard to check if a value is a valid Board
 */
export function isValidBoard(board: any): board is Board {
  if (!Array.isArray(board) || board.length !== 8) {
    return false;
  }

  for (const row of board) {
    if (!Array.isArray(row) || row.length !== 8) {
      return false;
    }

    for (const cell of row) {
      if (cell !== null && !isValidPiece(cell)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Type guard to check if a value is a valid GameState
 */
export function isValidGameState(state: any): state is GameState {
  return (
    typeof state === 'object' &&
    state !== null &&
    isValidBoard(state.board) &&
    isValidPieceColor(state.currentTurn) &&
    Array.isArray(state.moveHistory) &&
    state.moveHistory.every(isValidMove) &&
    Array.isArray(state.capturedPieces) &&
    state.capturedPieces.every(isValidPiece) &&
    typeof state.isCheck === 'boolean' &&
    typeof state.isCheckmate === 'boolean' &&
    typeof state.isStalemate === 'boolean' &&
    typeof state.moveCount === 'number' &&
    state.moveCount >= 0
  );
}

/**
 * Helper function to check if two positions are equal
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

/**
 * Helper function to create a deep copy of a position
 */
export function copyPosition(pos: Position): Position {
  return { row: pos.row, col: pos.col };
}

/**
 * Helper function to create a deep copy of a piece
 */
export function copyPiece(piece: Piece): Piece {
  return {
    type: piece.type,
    color: piece.color,
    position: copyPosition(piece.position),
    hasMoved: piece.hasMoved,
  };
}

/**
 * Helper function to convert position to algebraic notation (e.g., "e4")
 */
export function positionToAlgebraic(pos: Position): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rank = 8 - pos.row;  // Convert row index to rank (8 to 1)
  return `${files[pos.col]}${rank}`;
}

/**
 * Helper function to convert algebraic notation to position
 */
export function algebraicToPosition(algebraic: string): Position | null {
  if (algebraic.length !== 2) {
    return null;
  }

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const file = algebraic[0];
  const rank = algebraic[1];

  if (!file || !rank) {
    return null;
  }

  const col = files.indexOf(file);
  const row = 8 - parseInt(rank, 10);

  if (col === -1 || isNaN(row) || row < 0 || row > 7) {
    return null;
  }

  return { row, col };
}
