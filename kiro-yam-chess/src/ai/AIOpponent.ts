/**
 * AI Opponent for chess game
 * Implements move generation with configurable difficulty levels
 */

import type { GameState, Move, PieceColor, PieceType } from '../types/chess';
import { ChessEngine } from '../engine/ChessEngine';

export type DifficultyMode = 'easy' | 'hard';

export interface AIConfig {
  difficulty: DifficultyMode;
  maxThinkingTime: number;  // milliseconds
}

/**
 * AI Opponent class that generates chess moves based on position evaluation
 * and minimax algorithm with difficulty-specific behavior
 */
export class AIOpponent {
  private engine: ChessEngine;

  constructor() {
    this.engine = new ChessEngine();
  }

  /**
   * Evaluate a board position from the AI's perspective
   * Positive scores favor the AI (black), negative scores favor the player (white)
   * 
   * @param state - Current game state
   * @returns Numeric evaluation score
   */
  evaluatePosition(state: GameState): number {
    let score = 0;

    // Standard piece values
    const pieceValues: Record<PieceType, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,  // King has no material value
    };

    // Positional bonus tables for center control
    // Higher values for center squares
    const centerBonus = [
      [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      [0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0],
      [0.0, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.0],
      [0.0, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.0],
      [0.0, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.0],
      [0.0, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.0],
      [0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0],
      [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    ];

    // Calculate material and positional score
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (!piece) continue;

        const materialValue = pieceValues[piece.type];
        const positionalValue = centerBonus[row][col];
        
        // Add development bonus for pieces that have moved (except pawns and king)
        const developmentBonus = 
          piece.hasMoved && piece.type !== 'pawn' && piece.type !== 'king' ? 0.1 : 0;

        const totalValue = materialValue + positionalValue + developmentBonus;

        // Add to score based on color (positive for black/AI, negative for white/player)
        if (piece.color === 'black') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }

    return score;
  }

  /**
   * Generate the best move for the current position
   * Uses minimax algorithm with alpha-beta pruning
   * 
   * @param state - Current game state
   * @param config - AI configuration including difficulty and time limits
   * @returns Promise resolving to the selected move
   */
  async generateMove(state: GameState, config: AIConfig): Promise<Move> {
    // Set search depth based on difficulty
    const depth = config.difficulty === 'easy' ? 3 : 4;

    // Get all legal moves for the AI (black)
    const legalMoves = this.engine.getAllLegalMoves('black', state);

    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Wrap minimax in a timeout
    const timeoutPromise = new Promise<Move>((resolve) => {
      setTimeout(() => {
        // If timeout occurs, return a random valid move
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        console.warn(`AI timeout after ${config.maxThinkingTime}ms, selecting random move`);
        resolve(randomMove);
      }, config.maxThinkingTime);
    });

    const minimaxPromise = new Promise<Move>((resolve) => {
      // Evaluate each move using minimax
      const movesWithScores: Array<{ move: Move; score: number }> = [];

      for (const move of legalMoves) {
        const newState = this.engine.executeMove(move, state);
        let score = this.minimax(newState, depth - 1, -Infinity, Infinity, false);

        // Add slight randomization in easy mode to avoid predictability
        if (config.difficulty === 'easy') {
          score += (Math.random() - 0.5) * 0.4;  // ±0.2 randomization
        }

        movesWithScores.push({ move, score });
      }

      // Sort moves by score (descending)
      movesWithScores.sort((a, b) => b.score - a.score);

      // Apply difficulty-specific filtering
      let candidateMoves = movesWithScores;

      if (config.difficulty === 'easy') {
        // Easy mode: Filter out checkmate moves
        const nonCheckmateMovesWithScores = movesWithScores.filter(
          ({ move }) => !this.wouldResultInCheckmate(move, state)
        );

        // If all moves result in checkmate, use all moves (fallback)
        if (nonCheckmateMovesWithScores.length > 0) {
          candidateMoves = nonCheckmateMovesWithScores;
        }
      } else if (config.difficulty === 'hard') {
        // Hard mode: Filter out checkmate moves if fewer than 10 moves played
        if (state.moveCount < 10) {
          const nonCheckmateMovesWithScores = movesWithScores.filter(
            ({ move }) => !this.wouldResultInCheckmate(move, state)
          );

          // If all moves result in checkmate, use all moves (fallback)
          if (nonCheckmateMovesWithScores.length > 0) {
            candidateMoves = nonCheckmateMovesWithScores;
          }
        }
        // After move 10, allow all moves including checkmate
      }

      // Select the best move from candidate moves
      // If no candidates remain (shouldn't happen), use random move
      if (candidateMoves.length === 0) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        resolve(randomMove);
      } else {
        resolve(candidateMoves[0].move);
      }
    });

    // Race between minimax and timeout
    return Promise.race([minimaxPromise, timeoutPromise]);
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   * 
   * @param state - Current game state
   * @param depth - Remaining search depth
   * @param alpha - Alpha value for pruning
   * @param beta - Beta value for pruning
   * @param maximizingPlayer - True if maximizing (AI's turn), false if minimizing (player's turn)
   * @returns Evaluation score for this position
   */
  private minimax(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): number {
    // Base case: reached depth limit or game over
    if (depth === 0 || state.isCheckmate || state.isStalemate) {
      // Bonus for checkmate
      if (state.isCheckmate) {
        return maximizingPlayer ? -10000 : 10000;
      }
      // Stalemate is neutral
      if (state.isStalemate) {
        return 0;
      }
      return this.evaluatePosition(state);
    }

    const color: PieceColor = maximizingPlayer ? 'black' : 'white';
    const legalMoves = this.engine.getAllLegalMoves(color, state);

    if (legalMoves.length === 0) {
      // No legal moves - either checkmate or stalemate
      if (this.engine.isInCheck(color, state)) {
        return maximizingPlayer ? -10000 : 10000;
      }
      return 0;  // Stalemate
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of legalMoves) {
        const newState = this.engine.executeMove(move, state);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {
          break;  // Beta cutoff
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of legalMoves) {
        const newState = this.engine.executeMove(move, state);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) {
          break;  // Alpha cutoff
        }
      }
      return minEval;
    }
  }

  /**
   * Check if a move would result in checkmate
   * 
   * @param move - The move to evaluate
   * @param state - Current game state
   * @returns True if the move results in checkmate, false otherwise
   */
  wouldResultInCheckmate(move: Move, state: GameState): boolean {
    // Execute the move on a copy of the state
    const newState = this.engine.executeMove(move, state);

    // Determine the opponent's color
    const opponentColor: PieceColor = move.piece.color === 'white' ? 'black' : 'white';

    // Check if the resulting state is checkmate for the opponent
    return this.engine.isCheckmate(opponentColor, newState);
  }
}
