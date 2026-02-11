/**
 * Game Info Display
 * Displays game information like captured pieces, turn indicator, move history, etc.
 */

import type { GameState, Move, Piece } from '../types/chess';
import type { DifficultyMode } from '../ai/AIOpponent';
import { positionToAlgebraic } from '../types/chess';

/**
 * GameInfoDisplay class that manages game information UI
 */
export class GameInfoDisplay {
  private capturedWhiteElement: HTMLElement | null = null;
  private capturedBlackElement: HTMLElement | null = null;
  private gameStatusElement: HTMLElement | null = null;
  private moveHistoryElement: HTMLElement | null = null;
  private gameResultModal: HTMLElement | null = null;
  private difficultyDisplayElement: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
  }

  /**
   * Initialize or find UI elements
   */
  private initializeElements(): void {
    this.capturedWhiteElement = document.getElementById('captured-white');
    this.capturedBlackElement = document.getElementById('captured-black');
    this.gameStatusElement = document.getElementById('game-status');
    this.moveHistoryElement = document.getElementById('move-history');
    this.gameResultModal = document.getElementById('game-result-modal');
    this.difficultyDisplayElement = document.getElementById('difficulty-display');
  }

  /**
   * Render captured pieces
   */
  renderCapturedPieces(state: GameState): void {
    const whiteCaptured: Piece[] = [];
    const blackCaptured: Piece[] = [];

    // Separate captured pieces by color
    for (const piece of state.capturedPieces) {
      if (piece.color === 'white') {
        whiteCaptured.push(piece);
      } else {
        blackCaptured.push(piece);
      }
    }

    // Render white captured pieces
    if (this.capturedWhiteElement) {
      this.capturedWhiteElement.innerHTML = '';
      for (const piece of whiteCaptured) {
        const pieceElement = this.createCapturedPieceElement(piece);
        this.capturedWhiteElement.appendChild(pieceElement);
      }
    }

    // Render black captured pieces
    if (this.capturedBlackElement) {
      this.capturedBlackElement.innerHTML = '';
      for (const piece of blackCaptured) {
        const pieceElement = this.createCapturedPieceElement(piece);
        this.capturedBlackElement.appendChild(pieceElement);
      }
    }
  }

  /**
   * Create a captured piece element
   */
  private createCapturedPieceElement(piece: Piece): HTMLElement {
    const element = document.createElement('span');
    element.className = `captured-piece captured-${piece.color}`;
    element.textContent = this.getPieceSymbol(piece);
    element.style.fontSize = '1.5rem';
    element.style.margin = '0.25rem';
    return element;
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
   * Update status indicator
   */
  updateStatusIndicator(state: GameState): void {
    if (!this.gameStatusElement) return;

    let statusText = '';
    let statusClass = '';

    if (state.isAIThinking) {
      statusText = 'AI Thinking...';
      statusClass = 'ai-thinking';
      
      // Add spinner if not already present
      if (!this.gameStatusElement.querySelector('.spinner')) {
        const spinner = document.createElement('span');
        spinner.className = 'spinner';
        spinner.textContent = '⟳';
        spinner.style.display = 'inline-block';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.marginLeft = '0.5rem';
        this.gameStatusElement.appendChild(spinner);
        
        // Ensure spin animation exists
        this.ensureSpinAnimation();
      }
    } else {
      // Remove spinner if present
      const spinner = this.gameStatusElement.querySelector('.spinner');
      if (spinner) {
        spinner.remove();
      }

      if (state.isCheckmate) {
        const winner = state.currentTurn === 'white' ? 'Black' : 'White';
        statusText = `Checkmate! ${winner} wins!`;
        statusClass = 'checkmate';
      } else if (state.isStalemate) {
        statusText = 'Stalemate - Draw';
        statusClass = 'stalemate';
      } else if (state.status === 'resigned') {
        statusText = 'You resigned - AI wins';
        statusClass = 'resigned';
      } else if (state.isCheck) {
        statusText = `Check! ${state.currentTurn === 'white' ? 'White' : 'Black'} to move`;
        statusClass = 'check';
      } else {
        statusText = state.currentTurn === 'white' ? 'Your Turn' : "AI's Turn";
        statusClass = state.currentTurn === 'white' ? 'player-turn' : 'ai-turn';
      }
    }

    this.gameStatusElement.textContent = statusText;
    this.gameStatusElement.className = `game-status ${statusClass}`;
  }

  /**
   * Ensure spin animation exists
   */
  private ensureSpinAnimation(): void {
    const styleId = 'spin-animation-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Render move history
   */
  renderMoveHistory(state: GameState): void {
    if (!this.moveHistoryElement) return;

    this.moveHistoryElement.innerHTML = '';

    // Group moves by pairs (white and black)
    for (let i = 0; i < state.moveHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = state.moveHistory[i];
      const blackMove = state.moveHistory[i + 1];

      const moveRow = document.createElement('div');
      moveRow.className = 'move-row';
      moveRow.style.marginBottom = '0.25rem';

      const moveNumberSpan = document.createElement('span');
      moveNumberSpan.className = 'move-number';
      moveNumberSpan.textContent = `${moveNumber}. `;
      moveNumberSpan.style.fontWeight = 'bold';
      moveNumberSpan.style.marginRight = '0.5rem';
      moveRow.appendChild(moveNumberSpan);

      if (whiteMove) {
        const whiteMoveSpan = document.createElement('span');
        whiteMoveSpan.className = 'white-move';
        whiteMoveSpan.textContent = this.moveToAlgebraic(whiteMove);
        whiteMoveSpan.style.marginRight = '0.5rem';
        moveRow.appendChild(whiteMoveSpan);
      }

      if (blackMove) {
        const blackMoveSpan = document.createElement('span');
        blackMoveSpan.className = 'black-move';
        blackMoveSpan.textContent = this.moveToAlgebraic(blackMove);
        moveRow.appendChild(blackMoveSpan);
      }

      this.moveHistoryElement.appendChild(moveRow);
    }

    // Auto-scroll to bottom
    this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
  }

  /**
   * Convert move to algebraic notation
   */
  private moveToAlgebraic(move: Move): string {
    // Handle castling
    if (move.isCastling) {
      const isKingside = move.to.col > move.from.col;
      return isKingside ? 'O-O' : 'O-O-O';
    }

    let notation = '';

    // Add piece letter (except for pawns)
    if (move.piece.type !== 'pawn') {
      notation += move.piece.type[0].toUpperCase();
    }

    // Add capture indicator
    if (move.capturedPiece || move.isEnPassant) {
      if (move.piece.type === 'pawn') {
        // For pawn captures, include the file
        notation += positionToAlgebraic(move.from)[0];
      }
      notation += 'x';
    }

    // Add destination square
    notation += positionToAlgebraic(move.to);

    // Add promotion
    if (move.promotionType) {
      notation += '=' + move.promotionType[0].toUpperCase();
    }

    // Add en passant indicator
    if (move.isEnPassant) {
      notation += ' e.p.';
    }

    return notation;
  }

  /**
   * Show game result modal
   */
  showGameResult(state: GameState): void {
    if (!this.gameResultModal) {
      this.createGameResultModal();
    }

    if (!this.gameResultModal) return;

    let message = '';
    
    if (state.isCheckmate) {
      const winner = state.currentTurn === 'white' ? 'Black' : 'White';
      message = `Checkmate! ${winner} wins!`;
    } else if (state.isStalemate) {
      message = 'Stalemate - Draw';
    } else if (state.status === 'resigned') {
      message = 'You resigned - AI wins';
    }

    // Update modal content
    const messageElement = this.gameResultModal.querySelector('.result-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // Show modal
    this.gameResultModal.classList.remove('hidden');
    this.gameResultModal.style.display = 'flex';
  }

  /**
   * Create game result modal
   */
  private createGameResultModal(): void {
    const modal = document.createElement('div');
    modal.id = 'game-result-modal';
    modal.className = 'modal hidden';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'none';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.backgroundColor = 'var(--foreground, #fff)';
    content.style.padding = '2rem';
    content.style.borderRadius = '8px';
    content.style.textAlign = 'center';
    content.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    const message = document.createElement('h2');
    message.className = 'result-message';
    message.style.marginBottom = '1.5rem';
    message.style.color = 'var(--text, #000)';
    content.appendChild(message);

    const newGameButton = document.createElement('button');
    newGameButton.id = 'modal-new-game-btn';
    newGameButton.textContent = 'New Game';
    newGameButton.style.padding = '0.75rem 1.5rem';
    newGameButton.style.fontSize = '1rem';
    newGameButton.style.backgroundColor = 'var(--button-primary, #3b82f6)';
    newGameButton.style.color = '#fff';
    newGameButton.style.border = 'none';
    newGameButton.style.borderRadius = '4px';
    newGameButton.style.cursor = 'pointer';
    content.appendChild(newGameButton);

    modal.appendChild(content);
    document.body.appendChild(modal);

    this.gameResultModal = modal;
  }

  /**
   * Hide game result modal
   */
  hideGameResult(): void {
    if (this.gameResultModal) {
      this.gameResultModal.classList.add('hidden');
      this.gameResultModal.style.display = 'none';
    }
  }

  /**
   * Update difficulty display
   */
  updateDifficultyDisplay(difficulty: DifficultyMode): void {
    if (!this.difficultyDisplayElement) return;

    const displayText = difficulty === 'easy' ? 'Easy Mode' : 'Hard Mode';
    this.difficultyDisplayElement.textContent = displayText;
    this.difficultyDisplayElement.className = `difficulty-display difficulty-${difficulty}`;
  }

  /**
   * Update all displays based on game state
   */
  updateAll(state: GameState, difficulty?: DifficultyMode): void {
    this.renderCapturedPieces(state);
    this.updateStatusIndicator(state);
    this.renderMoveHistory(state);

    if (difficulty) {
      this.updateDifficultyDisplay(difficulty);
    }

    // Show game result if game is over
    if (state.isCheckmate || state.isStalemate || state.status === 'resigned') {
      this.showGameResult(state);
    }
  }
}
