/**
 * Game Controller
 * Orchestrates game flow between player and AI
 */

import type { GameState, Move } from '../types/chess';
import type { DifficultyMode } from '../ai/AIOpponent';
import { ChessEngine } from '../engine/ChessEngine';
import { AIOpponent } from '../ai/AIOpponent';

/**
 * Game Controller class that manages game state and coordinates
 * between the chess engine, AI opponent, and UI
 */
export class GameController {
  private gameState: GameState;
  private difficulty: DifficultyMode;
  private chessEngine: ChessEngine;
  private aiOpponent: AIOpponent;
  private stateChangeCallbacks: Array<(state: GameState) => void>;

  constructor() {
    this.chessEngine = new ChessEngine();
    this.aiOpponent = new AIOpponent();
    this.stateChangeCallbacks = [];
    
    // Initialize with default values
    this.gameState = this.chessEngine.initializeGame();
    this.difficulty = 'easy';
  }

  /**
   * Get the current game state
   * @returns Current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Register a callback to be notified of game state changes
   * @param callback - Function to call when state changes
   */
  onStateChange(callback: (state: GameState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Notify all registered callbacks of a state change
   */
  private notifyStateChange(): void {
    for (const callback of this.stateChangeCallbacks) {
      callback(this.gameState);
    }
  }

  /**
   * Start a new game
   * @param difficulty - Difficulty mode for the AI opponent
   */
  startNewGame(difficulty: DifficultyMode): void {
    // Initialize a fresh game state
    this.gameState = this.chessEngine.initializeGame();
    
    // Store the difficulty setting
    this.difficulty = difficulty;
    
    // Notify all subscribers of the new game state
    this.notifyStateChange();
  }

  /**
   * Handle a player move attempt
   * @param move - The move the player wants to make
   */
  async handlePlayerMove(move: Move): Promise<void> {
    // Validate the move
    if (!this.chessEngine.isValidMove(move, this.gameState)) {
      // Invalid move - don't change state
      return;
    }

    // Execute the move
    this.gameState = this.chessEngine.executeMove(move, this.gameState);
    
    // Notify subscribers of the state change
    this.notifyStateChange();

    // Check if the game is over
    if (this.gameState.isCheckmate || this.gameState.isStalemate) {
      // Game is over, don't request AI move
      return;
    }

    // If game is still active, request AI to move
    await this.requestAIMove();
  }

  /**
   * Request the AI to make a move
   */
  async requestAIMove(): Promise<void> {
    // Set AI thinking flag
    this.gameState.isAIThinking = true;
    this.notifyStateChange();

    try {
      // Create AI config based on difficulty
      const maxThinkingTime = this.difficulty === 'easy' ? 2000 : 3000;
      const config = {
        difficulty: this.difficulty,
        maxThinkingTime,
      };

      // Generate AI move
      const aiMove = await this.aiOpponent.generateMove(this.gameState, config);

      // Execute the AI move
      this.gameState = this.chessEngine.executeMove(aiMove, this.gameState);

      // Clear AI thinking flag
      this.gameState.isAIThinking = false;

      // Notify subscribers of the state change
      this.notifyStateChange();
    } catch (error) {
      // Clear AI thinking flag on error
      this.gameState.isAIThinking = false;
      this.notifyStateChange();
      throw error;
    }
  }

  /**
   * Resign the current game
   */
  resignGame(): void {
    // Set game status to resigned
    this.gameState.status = 'resigned';
    
    // Set winner to AI (black)
    this.gameState.winner = 'black';
    
    // Notify subscribers of the state change
    this.notifyStateChange();
  }
}
