/**
 * Chess Engine - Core chess logic implementation
 * Handles move generation, validation, and game state management
 */

import {
  Position,
  Piece,
  PieceType,
  PieceColor,
  GameState,
  Board,
  Move,
  positionsEqual,
} from '../types/chess';

/**
 * ChessEngine class - Implements all chess rules and move validation
 */
export class ChessEngine {
  /**
   * Initialize a new game with all pieces in their starting positions
   * Returns the initial game state
   */
  initializeGame(): GameState {
    const board = this.createInitialBoard();
    
    return {
      board,
      currentTurn: 'white',
      moveHistory: [],
      capturedPieces: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      moveCount: 0,
    };
  }

  /**
   * Create the initial 8x8 board with all pieces in standard starting positions
   * Board layout:
   * [0][0] = a8 (top-left, black's back rank)
   * [7][7] = h1 (bottom-right, white's back rank)
   */
  private createInitialBoard(): Board {
    // Create empty 8x8 board
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place black pieces (rows 0-1)
    const blackBackRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let col = 0; col < 8; col++) {
      // Back rank (row 0)
      board[0]![col] = {
        type: blackBackRank[col]!,
        color: 'black',
        position: { row: 0, col },
        hasMoved: false,
      };
      
      // Pawns (row 1)
      board[1]![col] = {
        type: 'pawn',
        color: 'black',
        position: { row: 1, col },
        hasMoved: false,
      };
    }

    // Place white pieces (rows 6-7)
    const whiteBackRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let col = 0; col < 8; col++) {
      // Pawns (row 6)
      board[6]![col] = {
        type: 'pawn',
        color: 'white',
        position: { row: 6, col },
        hasMoved: false,
      };
      
      // Back rank (row 7)
      board[7]![col] = {
        type: whiteBackRank[col]!,
        color: 'white',
        position: { row: 7, col },
        hasMoved: false,
      };
    }

    return board;
  }

  /**
   * Get all valid moves for a piece at a given position
   * Filters out moves that would leave the king in check
   */
  getValidMoves(position: Position, state: GameState): Position[] {
    const piece = state.board[position.row]?.[position.col];
    
    if (!piece) {
      return [];
    }

    // Only allow moves for the current player's pieces
    if (piece.color !== state.currentTurn) {
      return [];
    }

    // Get pseudo-legal moves (moves that follow piece movement rules)
    const pseudoLegalMoves = this.getPseudoLegalMoves(piece, state);

    // Filter out moves that would leave the king in check
    const legalMoves = pseudoLegalMoves.filter(toPos => {
      return !this.wouldLeaveKingInCheck(position, toPos, state);
    });

    return legalMoves;
  }

  /**
   * Get pseudo-legal moves for a piece (moves that follow piece movement rules)
   * Does not check if moves would leave king in check
   */
  private getPseudoLegalMoves(piece: Piece, state: GameState): Position[] {
    switch (piece.type) {
      case 'pawn':
        return this.getPawnMoves(piece, state);
      case 'knight':
        return this.getKnightMoves(piece, state);
      case 'bishop':
        return this.getBishopMoves(piece, state);
      case 'rook':
        return this.getRookMoves(piece, state);
      case 'queen':
        return this.getQueenMoves(piece, state);
      case 'king':
        return this.getKingMoves(piece, state);
      default:
        return [];
    }
  }

  /**
   * Get valid moves for a pawn
   * Includes single/double forward moves, diagonal captures, and en passant
   */
  private getPawnMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;
    const direction = piece.color === 'white' ? -1 : 1; // White moves up (negative), black moves down (positive)

    // Single square forward
    const forwardOne = { row: row + direction, col };
    if (this.isPositionOnBoard(forwardOne) && !state.board[forwardOne.row]?.[forwardOne.col]) {
      moves.push(forwardOne);

      // Double square forward (only if pawn hasn't moved)
      if (!piece.hasMoved) {
        const forwardTwo = { row: row + direction * 2, col };
        if (this.isPositionOnBoard(forwardTwo) && !state.board[forwardTwo.row]?.[forwardTwo.col]) {
          moves.push(forwardTwo);
        }
      }
    }

    // Diagonal captures
    const captureLeft = { row: row + direction, col: col - 1 };
    const captureRight = { row: row + direction, col: col + 1 };

    for (const capturePos of [captureLeft, captureRight]) {
      if (this.isPositionOnBoard(capturePos)) {
        const targetPiece = state.board[capturePos.row]?.[capturePos.col];
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push(capturePos);
        }
      }
    }

    // En passant
    const enPassantMoves = this.getEnPassantMoves(piece, state);
    moves.push(...enPassantMoves);

    return moves;
  }

  /**
   * Get valid en passant moves for a pawn
   * En passant is allowed if:
   * 1. The pawn is on the correct rank (5th rank for white, 4th rank for black)
   * 2. The last move was an opponent pawn moving two squares
   * 3. That pawn is now adjacent to this pawn
   */
  private getEnPassantMoves(pawn: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    
    // Check if pawn is on the correct rank for en passant
    const correctRank = pawn.color === 'white' ? 3 : 4;
    if (pawn.position.row !== correctRank) {
      return moves;
    }

    // Check if there was a last move
    if (!state.lastMove) {
      return moves;
    }

    const lastMove = state.lastMove;
    
    // Check if last move was an opponent pawn moving two squares
    if (lastMove.piece.type !== 'pawn' || lastMove.piece.color === pawn.color) {
      return moves;
    }

    const rowDiff = Math.abs(lastMove.to.row - lastMove.from.row);
    if (rowDiff !== 2) {
      return moves;
    }

    // Check if the opponent pawn is adjacent to this pawn
    const opponentPawnCol = lastMove.to.col;
    const colDiff = Math.abs(opponentPawnCol - pawn.position.col);
    
    if (colDiff === 1 && lastMove.to.row === pawn.position.row) {
      // En passant is possible
      const direction = pawn.color === 'white' ? -1 : 1;
      const enPassantPos = { row: pawn.position.row + direction, col: opponentPawnCol };
      moves.push(enPassantPos);
    }

    return moves;
  }

  /**
   * Get valid moves for a knight
   * L-shaped movement: 2 squares in one direction, 1 square perpendicular
   */
  private getKnightMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;

    // All possible knight move offsets
    const offsets = [
      { row: -2, col: -1 }, { row: -2, col: 1 },
      { row: -1, col: -2 }, { row: -1, col: 2 },
      { row: 1, col: -2 }, { row: 1, col: 2 },
      { row: 2, col: -1 }, { row: 2, col: 1 },
    ];

    for (const offset of offsets) {
      const newPos = { row: row + offset.row, col: col + offset.col };
      
      if (this.isPositionOnBoard(newPos)) {
        const targetPiece = state.board[newPos.row]?.[newPos.col];
        // Can move to empty square or capture opponent's piece
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    }

    return moves;
  }

  /**
   * Get valid moves for a bishop
   * Diagonal sliding movement
   */
  private getBishopMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const directions = [
      { row: -1, col: -1 }, // Up-left
      { row: -1, col: 1 },  // Up-right
      { row: 1, col: -1 },  // Down-left
      { row: 1, col: 1 },   // Down-right
    ];

    for (const direction of directions) {
      moves.push(...this.getSlidingMoves(piece, direction, state));
    }

    return moves;
  }

  /**
   * Get valid moves for a rook
   * Horizontal and vertical sliding movement
   */
  private getRookMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 },  // Right
    ];

    for (const direction of directions) {
      moves.push(...this.getSlidingMoves(piece, direction, state));
    }

    return moves;
  }

  /**
   * Get valid moves for a queen
   * Combination of bishop and rook movement
   */
  private getQueenMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const directions = [
      { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
      { row: 0, col: -1 },                        { row: 0, col: 1 },
      { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
    ];

    for (const direction of directions) {
      moves.push(...this.getSlidingMoves(piece, direction, state));
    }

    return moves;
  }

  /**
   * Get valid moves for a king
   * Single square movement in any direction, plus castling
   */
  private getKingMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;

    // All possible king move offsets (one square in any direction)
    const offsets = [
      { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
      { row: 0, col: -1 },                        { row: 0, col: 1 },
      { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
    ];

    for (const offset of offsets) {
      const newPos = { row: row + offset.row, col: col + offset.col };
      
      if (this.isPositionOnBoard(newPos)) {
        const targetPiece = state.board[newPos.row]?.[newPos.col];
        // Can move to empty square or capture opponent's piece
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    }

    // Add castling moves
    const castlingMoves = this.getCastlingMoves(piece, state);
    moves.push(...castlingMoves);

    return moves;
  }

  /**
   * Get valid castling moves for a king
   * Castling is allowed if:
   * 1. King hasn't moved
   * 2. Rook hasn't moved
   * 3. No pieces between king and rook
   * 4. King is not in check
   * 5. King doesn't pass through check
   * 6. King doesn't end in check (handled by wouldLeaveKingInCheck filter)
   */
  private getCastlingMoves(king: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    
    // Can't castle if king has moved
    if (king.hasMoved) {
      return moves;
    }

    // Can't castle if king is in check
    if (this.isPositionUnderAttack(king.position, king.color, state)) {
      return moves;
    }

    const { row, col } = king.position;
    const backRank = king.color === 'white' ? 7 : 0;

    // Verify king is on the back rank in the correct position
    if (row !== backRank || col !== 4) {
      return moves;
    }

    // Check kingside castling (O-O)
    const kingsideRook = state.board[backRank]?.[7];
    if (kingsideRook && 
        kingsideRook.type === 'rook' && 
        kingsideRook.color === king.color && 
        !kingsideRook.hasMoved) {
      
      // Check if squares between king and rook are empty
      const f1 = state.board[backRank]?.[5];
      const g1 = state.board[backRank]?.[6];
      
      if (!f1 && !g1) {
        // Check if king passes through check (f1 square)
        const f1Pos = { row: backRank, col: 5 };
        if (!this.isPositionUnderAttack(f1Pos, king.color, state)) {
          // The final square (g1) check is handled by wouldLeaveKingInCheck
          moves.push({ row: backRank, col: 6 });
        }
      }
    }

    // Check queenside castling (O-O-O)
    const queensideRook = state.board[backRank]?.[0];
    if (queensideRook && 
        queensideRook.type === 'rook' && 
        queensideRook.color === king.color && 
        !queensideRook.hasMoved) {
      
      // Check if squares between king and rook are empty
      const b1 = state.board[backRank]?.[1];
      const c1 = state.board[backRank]?.[2];
      const d1 = state.board[backRank]?.[3];
      
      if (!b1 && !c1 && !d1) {
        // Check if king passes through check (d1 square)
        const d1Pos = { row: backRank, col: 3 };
        if (!this.isPositionUnderAttack(d1Pos, king.color, state)) {
          // The final square (c1) check is handled by wouldLeaveKingInCheck
          moves.push({ row: backRank, col: 2 });
        }
      }
    }

    return moves;
  }

  /**
   * Helper function to get sliding moves in a given direction
   * Used by bishop, rook, and queen
   */
  private getSlidingMoves(piece: Piece, direction: { row: number; col: number }, state: GameState): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;
    let currentRow = row + direction.row;
    let currentCol = col + direction.col;

    while (this.isPositionOnBoard({ row: currentRow, col: currentCol })) {
      const targetPiece = state.board[currentRow]?.[currentCol];
      
      if (!targetPiece) {
        // Empty square - can move here and continue
        moves.push({ row: currentRow, col: currentCol });
      } else if (targetPiece.color !== piece.color) {
        // Opponent's piece - can capture but can't continue
        moves.push({ row: currentRow, col: currentCol });
        break;
      } else {
        // Own piece - blocked, can't move here
        break;
      }

      currentRow += direction.row;
      currentCol += direction.col;
    }

    return moves;
  }

  /**
   * Check if a position is on the board (within bounds)
   */
  private isPositionOnBoard(pos: Position): boolean {
    return pos.row >= 0 && pos.row <= 7 && pos.col >= 0 && pos.col <= 7;
  }

  /**
   * Check if a move would leave the king in check
   * Used to filter out illegal moves
   */
  private wouldLeaveKingInCheck(from: Position, to: Position, state: GameState): boolean {
    // Create a temporary board state with the move applied
    const tempState = this.applyMoveToState(from, to, state);
    
    // Find the king of the current player
    const kingPos = this.findKing(state.currentTurn, tempState);
    
    if (!kingPos) {
      // King not found - this shouldn't happen in a valid game
      return true;
    }

    // Check if the king is under attack in the new state
    return this.isPositionUnderAttack(kingPos, state.currentTurn, tempState);
  }

  /**
   * Apply a move to a game state and return the new state
   * Does not modify the original state
   */
  private applyMoveToState(from: Position, to: Position, state: GameState): GameState {
    // Create a deep copy of the board
    const newBoard: Board = state.board.map(row => 
      row.map(piece => piece ? { ...piece, position: { ...piece.position } } : null)
    );

    // Get the piece being moved
    const piece = newBoard[from.row]?.[from.col];
    if (!piece) {
      return state;
    }

    // Move the piece
    newBoard[to.row]![to.col] = piece;
    newBoard[from.row]![from.col] = null;
    piece.position = { ...to };

    return {
      ...state,
      board: newBoard,
    };
  }

  /**
   * Find the position of a king of a given color
   */
  private findKing(color: PieceColor, state: GameState): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row]?.[col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  /**
   * Check if a position is under attack by a given color
   * byColor parameter represents the color being attacked (not the attacker)
   */
  isPositionUnderAttack(position: Position, byColor: PieceColor, state: GameState): boolean {
    // Check all opponent's pieces to see if any can attack this position
    const opponentColor: PieceColor = byColor === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row]?.[col];
        if (piece && piece.color === opponentColor) {
          // Get pseudo-legal moves for this piece (without castling to avoid circular dependency)
          const moves = this.getPseudoLegalMovesForAttack(piece, state);
          
          // Check if any of these moves target the position we're checking
          if (moves.some(move => positionsEqual(move, position))) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get pseudo-legal moves for attack detection (excludes castling to avoid circular dependency)
   */
  private getPseudoLegalMovesForAttack(piece: Piece, state: GameState): Position[] {
    switch (piece.type) {
      case 'pawn':
        return this.getPawnMoves(piece, state);
      case 'knight':
        return this.getKnightMoves(piece, state);
      case 'bishop':
        return this.getBishopMoves(piece, state);
      case 'rook':
        return this.getRookMoves(piece, state);
      case 'queen':
        return this.getQueenMoves(piece, state);
      case 'king':
        // For attack detection, only include basic king moves (no castling)
        return this.getBasicKingMoves(piece, state);
      default:
        return [];
    }
  }

  /**
   * Get basic king moves without castling (used for attack detection)
   */
  private getBasicKingMoves(piece: Piece, state: GameState): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;

    // All possible king move offsets (one square in any direction)
    const offsets = [
      { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
      { row: 0, col: -1 },                        { row: 0, col: 1 },
      { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 },
    ];

    for (const offset of offsets) {
      const newPos = { row: row + offset.row, col: col + offset.col };
      
      if (this.isPositionOnBoard(newPos)) {
        const targetPiece = state.board[newPos.row]?.[newPos.col];
        // Can move to empty square or capture opponent's piece
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push(newPos);
        }
      }
    }

    return moves;
  }

  /**
   * Check if a pawn move would result in promotion
   * A pawn promotes when it reaches the opposite end of the board
   */
  isPawnPromotion(from: Position, to: Position, state: GameState): boolean {
    const piece = state.board[from.row]?.[from.col];
    
    if (!piece || piece.type !== 'pawn') {
      return false;
    }

    // White pawns promote on row 0, black pawns promote on row 7
    const promotionRank = piece.color === 'white' ? 0 : 7;
    return to.row === promotionRank;
  }

  /**
   * Check if a king of a given color is in check
   * A king is in check if it is under attack by an opponent's piece
   */
  isInCheck(color: PieceColor, state: GameState): boolean {
    const kingPos = this.findKing(color, state);

    if (!kingPos) {
      // King not found - this shouldn't happen in a valid game
      return false;
    }

    return this.isPositionUnderAttack(kingPos, color, state);
  }

  /**
   * Check if a king of a given color is in checkmate
   * A king is in checkmate if:
   * 1. The king is in check
   * 2. There are no legal moves that can get the king out of check
   */
  isCheckmate(color: PieceColor, state: GameState): boolean {
    // First check if the king is in check
    if (!this.isInCheck(color, state)) {
      return false;
    }

    // Check if there are any legal moves for this color
    const hasLegalMoves = this.hasAnyLegalMoves(color, state);

    // Checkmate if in check and no legal moves
    return !hasLegalMoves;
  }

  /**
   * Check if the game is in stalemate
   * Stalemate occurs when:
   * 1. The current player is not in check
   * 2. The current player has no legal moves
   */
  isStalemate(state: GameState): boolean {
    const currentColor = state.currentTurn;

    // If the king is in check, it's not stalemate (could be checkmate)
    if (this.isInCheck(currentColor, state)) {
      return false;
    }

    // Check if there are any legal moves
    const hasLegalMoves = this.hasAnyLegalMoves(currentColor, state);

    // Stalemate if not in check and no legal moves
    return !hasLegalMoves;
  }

  /**
   * Get all legal moves for a given color
   * Returns an array of all possible moves
   */
  getAllLegalMoves(color: PieceColor, state: GameState): Move[] {
    const moves: Move[] = [];

    // Check all pieces of the given color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row]?.[col];
        if (piece && piece.color === color) {
          // Get valid moves for this piece
          const validMoves = this.getValidMoves({ row, col }, state);

          // Convert positions to Move objects
          for (const toPos of validMoves) {
            moves.push({
              from: { row, col },
              to: toPos,
              piece: piece,
            });
          }
        }
      }
    }

    return moves;
  }


  /**
   * Helper method to check if a color has any legal moves
   * Used for both checkmate and stalemate detection
   */
  private hasAnyLegalMoves(color: PieceColor, state: GameState): boolean {
    // Check all pieces of the given color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row]?.[col];
        if (piece && piece.color === color) {
          // Get valid moves for this piece
          const moves = this.getValidMoves({ row, col }, state);

          // If any piece has at least one legal move, return true
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }

    // No legal moves found
    return false;
  }

    /**
     * Execute a move and return the new game state
     * Updates board, captures pieces, switches turns, and checks game status
     *
     * Requirements: 1.2, 1.6
     */
    executeMove(move: Move, state: GameState): GameState {
      // Create a deep copy of the board
      const newBoard: Board = state.board.map(row =>
        row.map(piece => piece ? {
          ...piece,
          position: { ...piece.position }
        } : null)
      );

      // Get the piece being moved
      const piece = newBoard[move.from.row]?.[move.from.col];
      if (!piece) {
        throw new Error('No piece at source position');
      }

      // Handle captured piece
      let capturedPiece: Piece | undefined;
      const targetPiece = newBoard[move.to.row]?.[move.to.col];

      // Check for en passant capture
      if (move.isEnPassant) {
        // En passant: capture the pawn that's beside us, not at the destination
        const capturedPawnRow = move.from.row;
        const capturedPawnCol = move.to.col;
        capturedPiece = newBoard[capturedPawnRow]?.[capturedPawnCol] || undefined;
        if (capturedPiece) {
          newBoard[capturedPawnRow]![capturedPawnCol] = null;
        }
      } else if (targetPiece) {
        // Regular capture
        capturedPiece = targetPiece;
      }

      // Move the piece
      newBoard[move.to.row]![move.to.col] = piece;
      newBoard[move.from.row]![move.from.col] = null;
      piece.position = { ...move.to };
      piece.hasMoved = true;

      // Handle castling - move the rook
      if (move.isCastling) {
        const backRank = piece.color === 'white' ? 7 : 0;
        const isKingside = move.to.col === 6;

        if (isKingside) {
          // Kingside castling: move rook from h-file to f-file
          const rook = newBoard[backRank]![7];
          if (rook) {
            newBoard[backRank]![5] = rook;
            newBoard[backRank]![7] = null;
            rook.position = { row: backRank, col: 5 };
            rook.hasMoved = true;
          }
        } else {
          // Queenside castling: move rook from a-file to d-file
          const rook = newBoard[backRank]![0];
          if (rook) {
            newBoard[backRank]![3] = rook;
            newBoard[backRank]![0] = null;
            rook.position = { row: backRank, col: 3 };
            rook.hasMoved = true;
          }
        }
      }

      // Handle pawn promotion
      if (move.promotionType) {
        piece.type = move.promotionType;
      }

      // Update captured pieces array
      const newCapturedPieces = [...state.capturedPieces];
      if (capturedPiece) {
        newCapturedPieces.push(capturedPiece);
      }

      // Switch turn to opposite color
      const newTurn: PieceColor = state.currentTurn === 'white' ? 'black' : 'white';

      // Create the new move with captured piece info
      const executedMove: Move = {
        ...move,
        capturedPiece,
      };

      // Update move history
      const newMoveHistory = [...state.moveHistory, executedMove];

      // Create new state
      const newState: GameState = {
        board: newBoard,
        currentTurn: newTurn,
        moveHistory: newMoveHistory,
        capturedPieces: newCapturedPieces,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        moveCount: state.moveCount + 1,
        lastMove: executedMove,
      };

      // Update game status flags
      newState.isCheck = this.isInCheck(newTurn, newState);
      newState.isCheckmate = this.isCheckmate(newTurn, newState);
      newState.isStalemate = this.isStalemate(newState);

      return newState;
    }

    /**
     * Validate if a move is legal
     * Checks if the move is in the list of valid moves for the piece
     *
     * Requirements: 1.2
     */
    isValidMove(move: Move, state: GameState): boolean {
      // Validate source position has a piece
      const piece = state.board[move.from.row]?.[move.from.col];
      if (!piece) {
        return false;
      }

      // Validate it's the correct player's turn
      if (piece.color !== state.currentTurn) {
        return false;
      }

      // Validate the piece matches the move
      if (piece.type !== move.piece.type || piece.color !== move.piece.color) {
        return false;
      }

      // Get all valid moves for this piece
      const validMoves = this.getValidMoves(move.from, state);

      // Check if the destination is in the valid moves list
      const isDestinationValid = validMoves.some(validMove =>
        positionsEqual(validMove, move.to)
      );

      if (!isDestinationValid) {
        return false;
      }

      // Additional validation for special moves

      // Validate castling flag
      if (move.isCastling) {
        const isCastlingMove = piece.type === 'king' &&
          Math.abs(move.to.col - move.from.col) === 2;
        if (!isCastlingMove) {
          return false;
        }
      }

      // Validate en passant flag
      if (move.isEnPassant) {
        const isEnPassantMove = piece.type === 'pawn' &&
          move.to.col !== move.from.col &&
          !state.board[move.to.row]?.[move.to.col];
        if (!isEnPassantMove) {
          return false;
        }
      }

      // Validate promotion
      if (move.promotionType) {
        const isPromotionMove = this.isPawnPromotion(move.from, move.to, state);
        if (!isPromotionMove) {
          return false;
        }
      }

      return true;
    }


}
