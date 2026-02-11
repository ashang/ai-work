/**
 * Game Controls
 * Handles game control UI elements (new game, resign, difficulty, theme toggle)
 */

import type { DifficultyMode } from '../ai/AIOpponent';
import type { ThemeManager } from './ThemeManager';

/**
 * GameControls class that manages game control UI
 */
export class GameControls {
  private difficultySelect: HTMLSelectElement | null = null;
  private newGameButton: HTMLButtonElement | null = null;
  private resignButton: HTMLButtonElement | null = null;
  private themeToggleButton: HTMLButtonElement | null = null;
  private selectedDifficulty: DifficultyMode = 'easy';
  private gameInProgress: boolean = false;
  private themeManager: ThemeManager | null = null;

  private onNewGameCallback: ((difficulty: DifficultyMode) => void) | null = null;
  private onResignCallback: (() => void) | null = null;

  constructor(themeManager?: ThemeManager) {
    this.themeManager = themeManager || null;
    this.initializeElements();
    this.setupEventListeners();
    
    if (this.themeManager) {
      this.updateThemeToggleIcon();
      this.themeManager.onThemeChange(() => this.updateThemeToggleIcon());
    }
  }

  /**
   * Initialize or find UI elements
   */
  private initializeElements(): void {
    this.difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
    this.newGameButton = document.getElementById('new-game-btn') as HTMLButtonElement;
    this.resignButton = document.getElementById('resign-btn') as HTMLButtonElement;
    this.themeToggleButton = document.getElementById('theme-toggle-btn') as HTMLButtonElement;

    // Create elements if they don't exist
    if (!this.difficultySelect) {
      this.createDifficultySelect();
    }
    
    if (!this.newGameButton) {
      this.createNewGameButton();
    }
    
    if (!this.resignButton) {
      this.createResignButton();
    }
    
    if (!this.themeToggleButton) {
      this.createThemeToggleButton();
    }

    // Set initial state
    if (this.resignButton) {
      this.resignButton.disabled = true;
    }
  }

  /**
   * Create difficulty selection dropdown
   */
  private createDifficultySelect(): void {
    const select = document.createElement('select');
    select.id = 'difficulty-select';
    select.className = 'difficulty-select';
    
    const easyOption = document.createElement('option');
    easyOption.value = 'easy';
    easyOption.textContent = 'Easy';
    select.appendChild(easyOption);
    
    const hardOption = document.createElement('option');
    hardOption.value = 'hard';
    hardOption.textContent = 'Hard';
    select.appendChild(hardOption);
    
    // Style the select
    select.style.padding = '0.5rem';
    select.style.fontSize = '1rem';
    select.style.borderRadius = '4px';
    select.style.border = '1px solid var(--border, #ccc)';
    select.style.backgroundColor = 'var(--background, #fff)';
    select.style.color = 'var(--text, #000)';
    select.style.cursor = 'pointer';
    
    this.difficultySelect = select;
  }

  /**
   * Create new game button
   */
  private createNewGameButton(): void {
    const button = document.createElement('button');
    button.id = 'new-game-btn';
    button.className = 'new-game-btn';
    button.textContent = 'New Game';
    
    // Style the button
    button.style.padding = '0.75rem 1.5rem';
    button.style.fontSize = '1rem';
    button.style.borderRadius = '4px';
    button.style.border = 'none';
    button.style.backgroundColor = 'var(--button-primary, #3b82f6)';
    button.style.color = '#fff';
    button.style.cursor = 'pointer';
    button.style.fontWeight = '600';
    
    this.newGameButton = button;
  }

  /**
   * Create resign button
   */
  private createResignButton(): void {
    const button = document.createElement('button');
    button.id = 'resign-btn';
    button.className = 'resign-btn';
    button.textContent = 'Resign';
    
    // Style the button
    button.style.padding = '0.75rem 1.5rem';
    button.style.fontSize = '1rem';
    button.style.borderRadius = '4px';
    button.style.border = '1px solid var(--border, #ccc)';
    button.style.backgroundColor = 'var(--background, #fff)';
    button.style.color = 'var(--text, #000)';
    button.style.cursor = 'pointer';
    
    this.resignButton = button;
  }

  /**
   * Create theme toggle button
   */
  private createThemeToggleButton(): void {
    const button = document.createElement('button');
    button.id = 'theme-toggle-btn';
    button.className = 'theme-toggle-btn';
    button.setAttribute('aria-label', 'Toggle theme');
    button.textContent = '🌙';
    
    // Style the button
    button.style.padding = '0.5rem';
    button.style.fontSize = '1.5rem';
    button.style.borderRadius = '4px';
    button.style.border = '1px solid var(--border, #ccc)';
    button.style.backgroundColor = 'var(--background, #fff)';
    button.style.cursor = 'pointer';
    button.style.lineHeight = '1';
    
    this.themeToggleButton = button;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Difficulty selection
    if (this.difficultySelect) {
      this.difficultySelect.addEventListener('change', () => {
        if (this.difficultySelect) {
          this.selectedDifficulty = this.difficultySelect.value as DifficultyMode;
        }
      });
    }

    // New game button
    if (this.newGameButton) {
      this.newGameButton.addEventListener('click', () => this.handleNewGame());
    }

    // Resign button
    if (this.resignButton) {
      this.resignButton.addEventListener('click', () => this.handleResign());
    }

    // Theme toggle button
    if (this.themeToggleButton) {
      this.themeToggleButton.addEventListener('click', () => this.handleThemeToggle());
    }
  }

  /**
   * Handle new game button click
   */
  private handleNewGame(): void {
    // Show confirmation if game is in progress
    if (this.gameInProgress) {
      const confirmed = confirm('Start new game? Current game will be lost.');
      if (!confirmed) {
        return;
      }
    }

    // Get selected difficulty
    if (this.difficultySelect) {
      this.selectedDifficulty = this.difficultySelect.value as DifficultyMode;
    }

    // Call callback
    if (this.onNewGameCallback) {
      this.onNewGameCallback(this.selectedDifficulty);
    }

    // Update state
    this.setGameInProgress(true);
  }

  /**
   * Handle resign button click
   */
  private handleResign(): void {
    const confirmed = confirm('Are you sure you want to resign?');
    if (!confirmed) {
      return;
    }

    // Call callback
    if (this.onResignCallback) {
      this.onResignCallback();
    }

    // Update state
    this.setGameInProgress(false);
  }

  /**
   * Handle theme toggle button click
   */
  private handleThemeToggle(): void {
    if (this.themeManager) {
      this.themeManager.toggleTheme();
    }
  }

  /**
   * Update theme toggle button icon
   */
  private updateThemeToggleIcon(): void {
    if (!this.themeToggleButton || !this.themeManager) return;

    const currentTheme = this.themeManager.getCurrentTheme();
    // Show moon for light mode (click to go dark), sun for dark mode (click to go light)
    this.themeToggleButton.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  }

  /**
   * Set game in progress state
   */
  setGameInProgress(inProgress: boolean): void {
    this.gameInProgress = inProgress;

    // Enable/disable controls
    if (this.difficultySelect) {
      this.difficultySelect.disabled = inProgress;
    }

    if (this.resignButton) {
      this.resignButton.disabled = !inProgress;
    }
  }

  /**
   * Get selected difficulty
   */
  getSelectedDifficulty(): DifficultyMode {
    return this.selectedDifficulty;
  }

  /**
   * Register callback for new game
   */
  onNewGame(callback: (difficulty: DifficultyMode) => void): void {
    this.onNewGameCallback = callback;
  }

  /**
   * Register callback for resign
   */
  onResign(callback: () => void): void {
    this.onResignCallback = callback;
  }

  /**
   * Get control elements (for adding to DOM)
   */
  getElements(): {
    difficultySelect: HTMLSelectElement | null;
    newGameButton: HTMLButtonElement | null;
    resignButton: HTMLButtonElement | null;
    themeToggleButton: HTMLButtonElement | null;
  } {
    return {
      difficultySelect: this.difficultySelect,
      newGameButton: this.newGameButton,
      resignButton: this.resignButton,
      themeToggleButton: this.themeToggleButton,
    };
  }
}
