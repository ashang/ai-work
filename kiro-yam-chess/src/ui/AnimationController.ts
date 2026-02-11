/**
 * Animation Controller
 * Handles move animations and visual feedback
 */

import type { Move, Position } from '../types/chess';

/**
 * AnimationController class that manages piece animations
 */
export class AnimationController {
  private boardElement: HTMLElement | null = null;

  constructor(boardElementId: string) {
    this.boardElement = document.getElementById(boardElementId);
    if (!this.boardElement) {
      console.warn(`Board element with id "${boardElementId}" not found`);
    }
  }

  /**
   * Animate a move
   * @param move - The move to animate
   * @param duration - Animation duration in milliseconds (default: 300)
   * @returns Promise that resolves when animation completes
   */
  async animateMove(move: Move, duration: number = 300): Promise<void> {
    if (!this.boardElement) {
      return Promise.resolve();
    }

    // Get source and destination squares
    const fromSquare = this.getSquareElement(move.from);
    const toSquare = this.getSquareElement(move.to);

    if (!fromSquare || !toSquare) {
      return Promise.resolve();
    }

    // Get the piece element
    const pieceElement = fromSquare.querySelector('.piece');
    if (!pieceElement || !(pieceElement instanceof HTMLElement)) {
      return Promise.resolve();
    }

    // Calculate pixel coordinates
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;

    // Handle captured piece fade out
    if (move.capturedPiece) {
      const capturedElement = toSquare.querySelector('.piece');
      if (capturedElement instanceof HTMLElement) {
        this.fadeOutPiece(capturedElement, duration);
      }
    }

    // Handle castling - animate both king and rook
    if (move.isCastling) {
      await this.animateCastling(move, duration);
      return;
    }

    // Apply animation
    return new Promise<void>((resolve) => {
      // Set up the piece for animation
      pieceElement.style.position = 'relative';
      pieceElement.style.zIndex = '1000';
      pieceElement.style.transition = `transform ${duration}ms ease-in-out`;
      pieceElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      // Wait for animation to complete
      setTimeout(() => {
        // Reset styles
        pieceElement.style.position = '';
        pieceElement.style.zIndex = '';
        pieceElement.style.transition = '';
        pieceElement.style.transform = '';
        
        resolve();
      }, duration);
    });
  }

  /**
   * Animate castling (both king and rook move)
   */
  private async animateCastling(move: Move, duration: number): Promise<void> {
    // Determine if kingside or queenside castling
    const isKingside = move.to.col > move.from.col;
    
    // Calculate rook positions
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? move.to.col - 1 : move.to.col + 1;
    
    const rookFrom: Position = { row: move.from.row, col: rookFromCol };
    const rookTo: Position = { row: move.from.row, col: rookToCol };

    // Animate king
    const kingPromise = this.animateMove(move, duration);

    // Animate rook
    const rookFromSquare = this.getSquareElement(rookFrom);
    const rookToSquare = this.getSquareElement(rookTo);
    
    if (rookFromSquare && rookToSquare) {
      const rookPiece = rookFromSquare.querySelector('.piece');
      if (rookPiece instanceof HTMLElement) {
        const rookFromRect = rookFromSquare.getBoundingClientRect();
        const rookToRect = rookToSquare.getBoundingClientRect();
        const deltaX = rookToRect.left - rookFromRect.left;
        const deltaY = rookToRect.top - rookFromRect.top;

        const rookPromise = new Promise<void>((resolve) => {
          rookPiece.style.position = 'relative';
          rookPiece.style.zIndex = '1000';
          rookPiece.style.transition = `transform ${duration}ms ease-in-out`;
          rookPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

          setTimeout(() => {
            rookPiece.style.position = '';
            rookPiece.style.zIndex = '';
            rookPiece.style.transition = '';
            rookPiece.style.transform = '';
            resolve();
          }, duration);
        });

        await Promise.all([kingPromise, rookPromise]);
        return;
      }
    }

    await kingPromise;
  }

  /**
   * Fade out a captured piece
   */
  private fadeOutPiece(element: HTMLElement, duration: number): void {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.transition = '';
      element.style.opacity = '';
    }, duration);
  }

  /**
   * Show invalid move feedback (shake animation)
   */
  showInvalidMoveFeedback(position: Position): void {
    const square = this.getSquareElement(position);
    if (!square) return;

    const pieceElement = square.querySelector('.piece');
    if (!pieceElement || !(pieceElement instanceof HTMLElement)) return;

    // Add shake class
    pieceElement.classList.add('shake');

    // Define shake animation if not already defined
    this.ensureShakeAnimation();

    // Remove shake class after animation
    setTimeout(() => {
      pieceElement.classList.remove('shake');
    }, 500);
  }

  /**
   * Ensure shake animation is defined in CSS
   */
  private ensureShakeAnimation(): void {
    // Check if animation already exists
    const styleId = 'shake-animation-style';
    if (document.getElementById(styleId)) return;

    // Create style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      .shake {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show promotion dialog and wait for user selection
   */
  async showPromotionDialog(): Promise<'queen' | 'rook' | 'bishop' | 'knight'> {
    return new Promise((resolve) => {
      // Create modal backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'promotion-backdrop';
      backdrop.style.position = 'fixed';
      backdrop.style.top = '0';
      backdrop.style.left = '0';
      backdrop.style.width = '100%';
      backdrop.style.height = '100%';
      backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      backdrop.style.display = 'flex';
      backdrop.style.alignItems = 'center';
      backdrop.style.justifyContent = 'center';
      backdrop.style.zIndex = '10000';

      // Create dialog
      const dialog = document.createElement('div');
      dialog.className = 'promotion-dialog';
      dialog.style.backgroundColor = 'var(--foreground, #fff)';
      dialog.style.padding = '2rem';
      dialog.style.borderRadius = '8px';
      dialog.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

      // Add title
      const title = document.createElement('h3');
      title.textContent = 'Choose promotion piece:';
      title.style.marginBottom = '1rem';
      title.style.color = 'var(--text, #000)';
      dialog.appendChild(title);

      // Add buttons for each piece type
      const pieces: Array<'queen' | 'rook' | 'bishop' | 'knight'> = ['queen', 'rook', 'bishop', 'knight'];
      const symbols = { queen: '♕', rook: '♖', bishop: '♗', knight: '♘' };

      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '1rem';

      for (const piece of pieces) {
        const button = document.createElement('button');
        button.textContent = symbols[piece];
        button.style.fontSize = '3rem';
        button.style.padding = '1rem';
        button.style.border = '2px solid var(--border, #ccc)';
        button.style.borderRadius = '4px';
        button.style.backgroundColor = 'var(--background, #fff)';
        button.style.cursor = 'pointer';
        button.style.transition = 'transform 0.1s';

        button.addEventListener('mouseenter', () => {
          button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
          button.style.transform = 'scale(1)';
        });

        button.addEventListener('click', () => {
          document.body.removeChild(backdrop);
          resolve(piece);
        });

        buttonContainer.appendChild(button);
      }

      dialog.appendChild(buttonContainer);
      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);
    });
  }

  /**
   * Animate en passant capture
   */
  async animateEnPassant(move: Move, duration: number = 300): Promise<void> {
    // Animate the capturing pawn
    await this.animateMove(move, duration);

    // Fade out the captured pawn (which is on a different square)
    if (move.capturedPiece) {
      const capturedSquare = this.getSquareElement(move.capturedPiece.position);
      if (capturedSquare) {
        const capturedElement = capturedSquare.querySelector('.piece');
        if (capturedElement instanceof HTMLElement) {
          this.fadeOutPiece(capturedElement, duration);
        }
      }
    }
  }

  /**
   * Get square element by position
   */
  private getSquareElement(position: Position): HTMLElement | null {
    if (!this.boardElement) return null;
    
    const square = this.boardElement.querySelector(
      `[data-row="${position.row}"][data-col="${position.col}"]`
    );
    
    return square instanceof HTMLElement ? square : null;
  }
}
