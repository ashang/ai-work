/**
 * Main entry point for the web chess application
 */

import { ChessEngine } from './engine/ChessEngine';
import { AIOpponent } from './ai/AIOpponent';
import { GameController } from './controllers/GameController';
import { ThemeManager } from './ui/ThemeManager';
import { BoardRenderer } from './ui/BoardRenderer';
import { GameInfoDisplay } from './ui/GameInfoDisplay';
import { GameControls } from './ui/GameControls';
import { AnimationController } from './ui/AnimationController';
import { initializeTheme } from './ui/ThemeApplication';
import type { DifficultyMode } from './ai/AIOpponent';

/**
 * Main application class
 */
class ChessApp {
  private chessEngine: ChessEngine;
  private gameController: GameController;
  private themeManager: ThemeManager;
  private boardRenderer: BoardRenderer;
  private gameInfoDisplay: GameInfoDisplay;
  private gameControls: GameControls;
  private animationController: AnimationController;

  constructor() {
    // Initialize core components
    this.chessEngine = new ChessEngine();
    this.gameController = new GameController();
    this.themeManager = new ThemeManager();

    // Initialize UI
    this.createUIStructure();

    // Initialize UI components
    this.boardRenderer = new BoardRenderer('board-container', this.chessEngine);
    this.gameInfoDisplay = new GameInfoDisplay();
    this.gameControls = new GameControls(this.themeManager);
    this.animationController = new AnimationController('chess-board');

    // Wire everything together
    this.wireComponents();

    // Initialize theme
    initializeTheme(this.themeManager);
  }

  /**
   * Create the UI structure
   */
  private createUIStructure(): void {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Root element not found');
    }

    root.innerHTML = `
      <div class="game-container">
        <div class="board-section">
          <div id="game-status"></div>
          <div id="board-container"></div>
          <div class="controls-container" id="controls-container"></div>
        </div>
        <div class="info-section">
          <div id="difficulty-display"></div>
          <div class="captured-pieces-container">
            <div class="captured-pieces-section">
              <h3>Captured by You</h3>
              <div id="captured-black"></div>
            </div>
            <div class="captured-pieces-section">
              <h3>Captured by AI</h3>
              <div id="captured-white"></div>
            </div>
          </div>
          <div>
            <h3 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Move History</h3>
            <div id="move-history"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Wire all components together
   */
  private wireComponents(): void {
    // Add controls to DOM
    const controlsContainer = document.getElementById('controls-container');
    if (controlsContainer) {
      const elements = this.gameControls.getElements();
      if (elements.difficultySelect) {
        controlsContainer.appendChild(elements.difficultySelect);
      }
      if (elements.newGameButton) {
        controlsContainer.appendChild(elements.newGameButton);
      }
      if (elements.resignButton) {
        controlsContainer.appendChild(elements.resignButton);
      }
      if (elements.themeToggleButton) {
        controlsContainer.appendChild(elements.themeToggleButton);
      }
    }

    // Wire board renderer to game controller
    this.boardRenderer.onMove(async (move) => {
      try {
        // Animate the move
        await this.animationController.animateMove(move);
        
        // Handle the move through game controller
        await this.gameController.handlePlayerMove(move);
      } catch (error) {
        console.error('Error handling move:', error);
        this.animationController.showInvalidMoveFeedback(move.from);
      }
    });

    // Wire game controller state changes to UI updates
    this.gameController.onStateChange((state) => {
      this.boardRenderer.updateState(state);
      this.gameInfoDisplay.updateAll(state, this.gameControls.getSelectedDifficulty());
    });

    // Wire game controls
    this.gameControls.onNewGame((difficulty: DifficultyMode) => {
      this.startNewGame(difficulty);
    });

    this.gameControls.onResign(() => {
      this.gameController.resignGame();
    });

    // Start initial game
    this.startNewGame('easy');
  }

  /**
   * Start a new game
   */
  private startNewGame(difficulty: DifficultyMode): void {
    try {
      // Hide any open modals
      this.gameInfoDisplay.hideGameResult();

      // Start new game through controller
      this.gameController.startNewGame(difficulty);

      // Update controls state
      this.gameControls.setGameInProgress(true);

      // Update difficulty display
      this.gameInfoDisplay.updateDifficultyDisplay(difficulty);
    } catch (error) {
      console.error('Error starting new game:', error);
      alert('Failed to start new game. Please try again.');
    }
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      new ChessApp();
    } catch (error) {
      console.error('Failed to initialize chess application:', error);
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem; text-align: center; color: #dc2626;">
            <h1>Error</h1>
            <p>Failed to initialize the chess application.</p>
            <p style="font-size: 0.875rem; color: #666;">Please refresh the page to try again.</p>
          </div>
        `;
      }
    }
  });
} else {
  try {
    new ChessApp();
  } catch (error) {
    console.error('Failed to initialize chess application:', error);
  }
}

