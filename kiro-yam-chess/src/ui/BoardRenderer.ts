/**
 * Board Renderer
 * Handles rendering the chess board and pieces
 */

import type { GameState, Position, Piece, Move } from '../types/chess';
import type { ChessEngine } from '../engine/ChessEngine';

/**
 * BoardRenderer class that manages the visual chess board
 */
export class BoardRenderer {
  private boardElement: HTMLElement;
  private squares: HTMLElement[][] = [];
  private selectedPosition: Position | null = null;
  private validMoves: Position[] = [];
  private onMoveCallback: ((move: Move) => void) | null = null;
  private chessEngine: ChessEngine;
  private currentState: GameState | null = null;

  constructor(containerId: string, chessEngine: ChessEngine) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    this.chessEngine = chessEngine;
    this.boardElement = this.createBoardElement();
    container.appendChild(this.boardElement);
    this.initializeSquares();
  }

  /**
   * Create the board element with CSS Grid layout
   */
  private createBoardElement(): HTMLElement {
    const board = document.createElement('div');
    board.id = 'chess-board';
    board.className = 'board';
    
    // Apply CSS Grid layout
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(8, 1fr)';
    board.style.maxWidth = 'min(90vw, 600px)';
    board.style.width = '100%';
    board.style.aspectRatio = '1/1';
    board.style.margin = '0 auto';
    board.style.border = '2px solid var(--border, #333)';
    
    return board;
  }

  /**
   * Initialize all 64 squares
   */
  private initializeSquares(): void {
    for (let row = 0; row < 8; row++) {
      this.squares[row] = [];
      for (let col = 0; col < 8; col++) {
        const square = this.createSquare(row, col);
        this.squares[row][col] = square;
        this.boardElement.appendChild(square);
      }
    }
  }

  /**
   * Create a single square element
   */
  private createSquare(row: number, col: number): HTMLElement {
    const square = document.createElement('div');
    square.className = 'square';
    square.dataset.row = row.toString();
    square.dataset.col = col.toString();
    
    // Alternating light and dark squares
    const isLight = (row + col) % 2 === 0;
    square.classList.add(isLight ? 'light-square' : 'dark-square');
    
    // Apply colors using CSS variables
    square.style.backgroundColor = isLight 
      ? 'var(--light-square, #f0d9b5)' 
      : 'var(--dark-square, #b58863)';
    square.style.display = 'flex';
    square.style.alignItems = 'center';
    square.style.justifyContent = 'center';
    square.style.cursor = 'pointer';
    square.style.position = 'relative';
    
    // Add click handler
    square.addEventListener('click', () => this.handleSquareClick(row, col));
    
    // Add touch event handlers
    square.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent default touch behavior (scrolling)
      this.handleSquareClick(row, col);
    }, { passive: false });
    
    return square;
  }

  /**
   * Render pieces on the board
   */
  renderPieces(state: GameState): void {
    this.currentState = state;
    
    // Clear all pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.squares[row][col];
        if (square) {
          // Remove existing piece elements
          const existingPiece = square.querySelector('.piece');
          if (existingPiece) {
            existingPiece.remove();
          }
        }
      }
    }
    
    // Render pieces from state
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row]?.[col];
        if (piece) {
          this.renderPiece(piece, row, col);
        }
      }
    }
  }

  /**
   * Render a single piece
   */
  private renderPiece(piece: Piece, row: number, col: number): void {
    const square = this.squares[row]?.[col];
    if (!square) return;
    
    const pieceElement = document.createElement('div');
    pieceElement.className = `piece piece-${piece.color} piece-${piece.type}`;
    pieceElement.textContent = this.getPieceSymbol(piece);
    pieceElement.style.fontSize = 'clamp(2rem, 8vw, 4rem)';
    pieceElement.style.userSelect = 'none';
    pieceElement.style.pointerEvents = 'none';
    
    square.appendChild(pieceElement);
  }

  /**
   * Get Unicode symbol for a piece
   */
  private getPieceSymbol(piece: Piece): string {
    const symbols: Record<string, Record<string, string>> = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
      },
    };
    
    return symbols[piece.color]?.[piece.type] || '';
  }

  /**
   * Handle square click
   */
  private handleSquareClick(row: number, col: number): void {
    if (!this.currentState) return;
    
    const clickedPosition: Position = { row, col };
    const clickedPiece = this.currentState.board[row]?.[col];
    
    // If a piece is already selected
    if (this.selectedPosition) {
      // Check if clicked square is a valid move
      const isValidMove = this.validMoves.some(
        pos => pos.row === row && pos.col === col
      );
      
      if (isValidMove) {
        // Execute the move
        this.executeMove(this.selectedPosition, clickedPosition);
      } else if (clickedPiece && clickedPiece.color === this.currentState.currentTurn) {
        // Select a different piece of the same color
        this.selectPiece(clickedPosition);
      } else {
        // Clear selection
        this.clearSelection();
      }
    } else {
      // No piece selected - try to select clicked piece
      if (clickedPiece && clickedPiece.color === this.currentState.currentTurn) {
        this.selectPiece(clickedPosition);
      }
    }
  }

  /**
   * Select a piece and highlight valid moves
   */
  private selectPiece(position: Position): void {
    if (!this.currentState) return;
    
    this.clearSelection();
    this.selectedPosition = position;
    
    // Get valid moves for this piece
    this.validMoves = this.chessEngine.getValidMoves(position, this.currentState);
    
    // Highlight selected square
    const square = this.squares[position.row]?.[position.col];
    if (square) {
      square.classList.add('selected');
      square.style.backgroundColor = 'var(--highlight, #fbbf24)';
    }
    
    // Highlight valid move squares
    for (const move of this.validMoves) {
      const moveSquare = this.squares[move.row]?.[move.col];
      if (moveSquare) {
        moveSquare.classList.add('valid-move');
        
        // Add visual indicator for valid moves
        const indicator = document.createElement('div');
        indicator.className = 'move-indicator';
        indicator.style.width = '30%';
        indicator.style.height = '30%';
        indicator.style.borderRadius = '50%';
        indicator.style.backgroundColor = 'var(--valid-move, #10b981)';
        indicator.style.opacity = '0.6';
        indicator.style.pointerEvents = 'none';
        moveSquare.appendChild(indicator);
      }
    }
  }

  /**
   * Clear selection and highlights
   */
  private clearSelection(): void {
    // Clear selected square highlight
    if (this.selectedPosition) {
      const square = this.squares[this.selectedPosition.row]?.[this.selectedPosition.col];
      if (square) {
        square.classList.remove('selected');
        // Restore original color
        const isLight = (this.selectedPosition.row + this.selectedPosition.col) % 2 === 0;
        square.style.backgroundColor = isLight 
          ? 'var(--light-square, #f0d9b5)' 
          : 'var(--dark-square, #b58863)';
      }
    }
    
    // Clear valid move indicators
    for (const move of this.validMoves) {
      const moveSquare = this.squares[move.row]?.[move.col];
      if (moveSquare) {
        moveSquare.classList.remove('valid-move');
        const indicator = moveSquare.querySelector('.move-indicator');
        if (indicator) {
          indicator.remove();
        }
      }
    }
    
    this.selectedPosition = null;
    this.validMoves = [];
  }

  /**
   * Execute a move
   */
  private executeMove(from: Position, to: Position): void {
    if (!this.currentState) return;
    
    const piece = this.currentState.board[from.row]?.[from.col];
    if (!piece) return;
    
    const capturedPiece = this.currentState.board[to.row]?.[to.col] || undefined;
    
    const move: Move = {
      from,
      to,
      piece,
      capturedPiece,
    };
    
    // Clear selection
    this.clearSelection();
    
    // Call the move callback
    if (this.onMoveCallback) {
      this.onMoveCallback(move);
    }
  }

  /**
   * Register callback for when a move is made
   */
  onMove(callback: (move: Move) => void): void {
    this.onMoveCallback = callback;
  }

  /**
   * Update board state and re-render
   */
  updateState(state: GameState): void {
    this.renderPieces(state);
  }
}
