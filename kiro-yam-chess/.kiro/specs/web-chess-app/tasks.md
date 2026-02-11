# Implementation Plan: Web Chess Application

## Overview

This implementation plan breaks down the web chess application into discrete, actionable coding tasks. The application is built using TypeScript for type safety, with a focus on clean architecture separating the chess engine, AI logic, game controller, and UI components. Each task builds incrementally on previous work, with property-based tests integrated throughout to validate correctness properties from the design document.

**Implementation Language:** TypeScript
**Testing Framework:** Vitest with fast-check for property-based testing
**Build Tool:** Vite

## Tasks

- [x] 1. Set up project structure and development environment
  - Create project directory structure (src/engine, src/ai, src/ui, src/controllers, src/types, tests/)
  - Initialize TypeScript configuration with strict mode
  - Set up Vite for bundling and development server
  - Install and configure Vitest for unit testing
  - Install and configure fast-check for property-based testing
  - Create base HTML file with root element for mounting
  - Create package.json with necessary scripts (dev, build, test, test:coverage)
  - _Requirements: All (foundation for entire application)_

- [x] 2. Implement core data models and types
  - [x] 2.1 Create TypeScript interfaces for chess data structures
    - Create src/types/chess.ts file
    - Define Position interface with row and col properties (0-7)
    - Define Piece interface with type, color, position, and hasMoved properties
    - Define Move interface with from, to, piece, capturedPiece, and special move flags
    - Define GameState interface with board, currentTurn, moveHistory, capturedPieces, and game status flags
    - Define type unions for piece types ('pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king')
    - Define type unions for colors ('white' | 'black')
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Write unit tests for data model validation
    - Create tests/types/chess.test.ts file
    - Test type guards and validation functions
    - Test edge cases for position bounds (0-7 range)
    - Test piece type validation
    - _Requirements: 1.1, 1.2_

- [x] 3. Implement Chess Engine - Move Generation
  - [x] 3.1 Create ChessEngine class with board initialization
    - Create src/engine/ChessEngine.ts file
    - Implement initializeGame() method to set up starting position
    - Create 8x8 board array with all pieces in standard chess starting positions
    - Initialize game state with white to move, empty move history, no captured pieces
    - Return initial GameState object
    - _Requirements: 1.1, 4.2_

  - [x] 3.2 Implement move generation for each piece type
    - Write getPawnMoves() with single/double forward moves and diagonal captures
    - Write getKnightMoves() with L-shaped movement pattern
    - Write getBishopMoves() with diagonal sliding movement
    - Write getRookMoves() with horizontal/vertical sliding movement
    - Write getQueenMoves() combining bishop and rook movement patterns
    - Write getKingMoves() with single-square movement in all directions
    - Handle board boundaries for all piece types
    - Handle piece blocking for sliding pieces (bishop, rook, queen)
    - _Requirements: 1.1, 1.7_

  - [x] 3.3 Write unit tests for basic piece movement
    - Create tests/engine/ChessEngine.test.ts file
    - Test each piece type's movement patterns with specific examples
    - Test boundary conditions (pieces at edge of board)
    - Test blocked paths for sliding pieces
    - Test pawn special cases (first move, captures)
    - _Requirements: 1.1, 1.7_

  - [x] 3.4 Implement getValidMoves() filtering for legal moves
    - Implement getValidMoves(position: Position, state: GameState): Position[] method
    - Get all pseudo-legal moves for the piece at the given position
    - Filter out moves that would leave the player's own king in check
    - Filter out moves blocked by friendly pieces
    - Filter out moves that go off the board
    - Return array of valid destination positions
    - _Requirements: 1.1, 1.2_

  - [x]* 3.5 Write property test for valid move highlighting
    - Create tests/engine/ChessEngine.property.test.ts file
    - **Property 1: Valid move highlighting**
    - **Validates: Requirements 1.1**
    - For any board state and any piece, all highlighted positions should be valid legal moves
    - Generate random board states using fast-check
    - Run with minimum 100 iterations
    - Tag test: "Feature: web-chess-app, Property 1: Valid move highlighting"

- [x] 4. Implement Chess Engine - Special Moves
  - [x] 4.1 Implement castling logic
    - Add castling detection to getKingMoves()
    - Check castling preconditions: king and rook haven't moved, no pieces between them
    - Verify king is not in check and doesn't pass through check
    - Implement both kingside (O-O) and queenside (O-O-O) castling
    - Mark castling moves with isCastling flag in Move object
    - Update hasMoved flags for both king and rook when castling is executed
    - _Requirements: 1.7_

  - [x] 4.2 Implement en passant logic
    - Add en passant detection to getPawnMoves()
    - Track last move in game state to determine en passant eligibility
    - Check if opponent pawn just moved two squares and is adjacent
    - Mark en passant moves with isEnPassant flag in Move object
    - Handle en passant capture (remove captured pawn from different square than destination)
    - _Requirements: 1.7_

  - [x] 4.3 Implement pawn promotion logic
    - Detect when pawn reaches opposite end of board (row 0 for white, row 7 for black)
    - Add promotionType field to Move interface
    - Handle promotion piece selection (queen, rook, bishop, knight)
    - Replace pawn with promoted piece in executeMove()
    - _Requirements: 1.7_

  - [x]* 4.4 Write property tests for special moves
    - **Property 28: Castling validation**
    - **Validates: Requirements 1.7**
    - For any board state where castling conditions are met, castling should be allowed; otherwise rejected
    - **Property 29: En passant validation**
    - **Validates: Requirements 1.7**
    - For any board state where en passant conditions are met, en passant should be allowed; otherwise rejected
    - **Property 30: Pawn promotion**
    - **Validates: Requirements 1.7**
    - For any pawn reaching the opposite end, promotion should be required and piece should be replaced
    - Run each property with minimum 100 iterations
    - Tag tests with corresponding property numbers

- [x] 5. Implement Chess Engine - Game State Detection
  - [x] 5.1 Implement check detection
    - Implement isPositionUnderAttack(position: Position, byColor: 'white' | 'black', state: GameState): boolean
    - Check if any opponent piece can move to the given position
    - Implement isInCheck(color: 'white' | 'black', state: GameState): boolean
    - Find the king of the specified color
    - Check if king's position is under attack by opponent
    - _Requirements: 1.3_

  - [x] 5.2 Implement checkmate detection
    - Implement isCheckmate(color: 'white' | 'black', state: GameState): boolean
    - First verify the king is in check
    - Get all legal moves for all pieces of the specified color
    - For each legal move, simulate it and check if king is still in check
    - If no move removes check, it's checkmate
    - Return true if checkmate, false otherwise
    - _Requirements: 1.4_

  - [x] 5.3 Implement stalemate detection
    - Implement isStalemate(state: GameState): boolean
    - Verify the current player is NOT in check
    - Get all legal moves for all pieces of the current player
    - If no legal moves exist and not in check, it's stalemate
    - Optionally check for insufficient material (e.g., king vs king)
    - Return true if stalemate, false otherwise
    - _Requirements: 1.5_

  - [x]* 5.4 Write property tests for game state detection
    - **Property 2: Invalid move rejection preserves state**
    - **Validates: Requirements 1.2**
    - For any game state and any invalid move, state should remain unchanged
    - **Property 3: Check detection accuracy**
    - **Validates: Requirements 1.3**
    - For any board state where a king is under attack, check should be detected
    - **Property 4: Checkmate detection accuracy**
    - **Validates: Requirements 1.4**
    - For any board state where king is in check with no escape, checkmate should be detected
    - **Property 5: Stalemate detection accuracy**
    - **Validates: Requirements 1.5**
    - For any board state with no legal moves but not in check, stalemate should be detected
    - Run each property with minimum 100 iterations

- [x] 6. Implement Chess Engine - Move Execution and Validation
  - [x] 6.1 Implement executeMove() function
    - Implement executeMove(move: Move, state: GameState): GameState method
    - Create a deep copy of the current game state
    - Update board array with new piece positions
    - Handle piece captures: add captured piece to capturedPieces array
    - Update hasMoved flags for moved pieces
    - Handle special moves: castling (move rook), en passant (remove captured pawn), promotion (replace piece)
    - Increment move counter
    - Switch currentTurn to opposite color
    - Add move to moveHistory array
    - Update isCheck, isCheckmate, isStalemate flags for new state
    - Return new GameState object (immutable state updates)
    - _Requirements: 1.2, 1.6, 7.2_

  - [x] 6.2 Implement move validation
    - Implement isValidMove(move: Move, state: GameState): boolean method
    - Validate source and destination positions are within board bounds
    - Verify there is a piece at the source position
    - Verify the piece belongs to the current player
    - Check if destination is in the list of valid moves from getValidMoves()
    - Return true if valid, false otherwise
    - _Requirements: 1.2_

  - [x] 6.3 Implement getAllLegalMoves() helper
    - Implement getAllLegalMoves(color: 'white' | 'black', state: GameState): Move[] method
    - Iterate through all pieces of the specified color
    - For each piece, get all valid moves using getValidMoves()
    - Convert positions to Move objects
    - Return array of all legal moves for the color
    - This is used by AI and checkmate/stalemate detection
    - _Requirements: 1.4, 1.5, 2.1, 3.1_

  - [x]* 6.4 Write property test for turn alternation
    - **Property 6: Turn alternation**
    - **Validates: Requirements 1.6**
    - For any game state and any valid move, executing the move should switch the turn to opposite color
    - Generate random valid moves using fast-check
    - Run with minimum 100 iterations

- [x] 7. Checkpoint - Chess Engine Complete
  - Verify all chess engine functionality is working correctly
  - Run all chess engine tests: npm test tests/engine/
  - Verify all unit tests pass (ChessEngine.test.ts)
  - Verify all property tests pass (ChessEngine.property.test.ts)
  - Confirm Properties 1-6 and 28-30 run with 100+ iterations
  - Manually test known chess scenarios: Scholar's Mate, Fool's Mate, castling, en passant, promotion, stalemate
  - Document any issues found
  - Ensure all tests pass before proceeding to AI implementation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 8. Implement AI Opponent - Position Evaluation and Move Generation
  - [x] 8.1 Create AIOpponent class with position evaluation
    - Create src/ai/AIOpponent.ts file
    - Implement evaluatePosition(state: GameState): number method
    - Assign standard piece values: pawn=1, knight=3, bishop=3, rook=5, queen=9, king=0
    - Calculate material score: sum(AI pieces) - sum(player pieces)
    - Add positional bonuses: center control (+0.3 per piece), piece development (+0.1)
    - Return numeric score (positive favors AI, negative favors player)
    - _Requirements: 2.4, 3.5_

  - [x] 8.2 Implement minimax algorithm for move generation
    - Implement generateMove(state: GameState, config: AIConfig): Promise<Move> method
    - Set search depth: 3 ply for easy mode, 4 ply for hard mode
    - Implement minimax with alpha-beta pruning for performance
    - Use ChessEngine.getAllLegalMoves() to get candidate moves
    - Recursively evaluate positions using evaluatePosition()
    - Return move with best evaluation score
    - _Requirements: 2.1, 3.1_

  - [x] 8.3 Implement checkmate detection helper
    - Implement wouldResultInCheckmate(move: Move, state: GameState): boolean method
    - Create a copy of game state
    - Execute the move on the copy using ChessEngine.executeMove()
    - Check if resulting state is checkmate using ChessEngine.isCheckmate()
    - Return boolean indicating whether move results in checkmate
    - _Requirements: 2.2, 2.3, 3.2, 3.3_

  - [x] 8.4 Implement difficulty-specific move filtering
    - In generateMove(), get all candidate moves from minimax
    - Easy mode: Filter out moves where wouldResultInCheckmate() returns true
    - Easy mode: Select best move from remaining non-checkmate moves
    - Easy mode: Add slight randomization (±0.2 to evaluation) to avoid predictability
    - Hard mode with moveCount < 10: Filter out checkmate moves
    - Hard mode with moveCount >= 10: Allow all moves including checkmate
    - If no moves remain after filtering, select random valid move as fallback
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 8.5 Implement response time management
    - Wrap move generation in Promise.race() with timeout
    - Set timeout: 2000ms for easy mode, 3000ms for hard mode
    - If timeout occurs, immediately return a random valid move
    - Log timeout events to console for debugging
    - Ensure async function properly handles timeout
    - _Requirements: 2.5, 3.4_

  - [x]* 8.6 Write property tests for AI move generation
    - Create tests/ai/AIOpponent.property.test.ts file
    - **Property 7: Easy mode generates valid moves** (Requirements 2.1)
    - **Property 8: Easy mode avoids checkmate** (Requirements 2.2)
    - **Property 9: Easy mode response time** (Requirements 2.5)
    - **Property 10: Hard mode pre-move-10 checkmate restriction** (Requirements 3.2)
    - **Property 11: Hard mode post-move-10 checkmate execution** (Requirements 3.3)
    - **Property 12: Hard mode response time** (Requirements 3.4)
    - Run each property test with minimum 100 iterations

  - [x]* 8.7 Write unit tests for AI edge cases
    - Create tests/ai/AIOpponent.test.ts file
    - Test AI behavior when only checkmate moves available (easy mode should pick random)
    - Test position evaluation with various material imbalances
    - Test AI move selection consistency
    - Test timeout fallback behavior
    - Test minimax depth limits
    - _Requirements: 2.1, 2.2, 2.5, 3.4_

- [x] 9. Checkpoint - AI Opponent Complete
  - Verify all AI opponent functionality is working correctly
  - Run all AI tests: npm test tests/ai/
  - Verify all unit tests pass (AIOpponent.test.ts)
  - Verify all property tests pass (AIOpponent.property.test.ts)
  - Confirm Properties 7-12 run with 100+ iterations
  - Manually test AI behavior: easy mode doesn't checkmate, hard mode respects move-10 rule
  - Measure response times: easy mode <2s, hard mode <3s
  - Play several test games in both difficulty modes
  - Document any performance issues or unexpected behavior
  - _Requirements: 2.1, 2.2, 2.5, 3.1, 3.2, 3.3, 3.4_

- [x] 10. Implement Game Controller
  - [x] 10.1 Create GameController class with state management
    - Create src/controllers/GameController.ts file
    - Define private gameState: GameState property
    - Define private difficulty: DifficultyMode property
    - Define private chessEngine: ChessEngine instance
    - Define private aiOpponent: AIOpponent instance
    - Define private stateChangeCallbacks: Array<(state: GameState) => void>
    - Implement getGameState(): GameState to return current state
    - Implement onStateChange(callback: (state: GameState) => void): void to register callbacks
    - Add private notifyStateChange() method to call all callbacks
    - _Requirements: 6.1, 6.3_

  - [x] 10.2 Implement game initialization
    - Implement startNewGame(difficulty: DifficultyMode): void method
    - Call ChessEngine.initializeGame() to get initial state
    - Store difficulty setting in private property
    - Reset move history and captured pieces arrays
    - Set game status to 'active'
    - Call notifyStateChange() to update subscribers
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 10.3 Implement player move handling
    - Implement handlePlayerMove(move: Move): Promise<void> async method
    - Validate move using ChessEngine.isValidMove(move, gameState)
    - If invalid, throw error or return without changing state
    - If valid, execute move using ChessEngine.executeMove(move, gameState)
    - Update internal gameState with result
    - Call notifyStateChange() to update UI
    - Check for game end: if isCheckmate or isStalemate, return early
    - If game not over, automatically call requestAIMove()
    - _Requirements: 1.1, 1.2, 1.6_

  - [x] 10.4 Implement AI move handling
    - Implement requestAIMove(): Promise<void> async method
    - Add isAIThinking: boolean field to game state
    - Set isAIThinking = true and call notifyStateChange()
    - Create AIConfig with current difficulty and time limits
    - Call AIOpponent.generateMove(gameState, config) and await result
    - Execute returned move using ChessEngine.executeMove()
    - Update internal gameState with result
    - Set isAIThinking = false
    - Call notifyStateChange() to update UI
    - Check for game end conditions (checkmate, stalemate)
    - _Requirements: 1.6, 2.1, 3.1, 7.4_

  - [x] 10.5 Implement game control functions
    - Implement resignGame(): void method
    - Set game status to 'resigned'
    - Set winner to AI color
    - Call notifyStateChange() to update UI
    - Prevent further moves after resignation
    - _Requirements: 6.4, 6.5_

  - [x]* 10.6 Write integration tests for game controller
    - Create tests/controllers/GameController.test.ts file
    - Test complete game flow from start to checkmate
    - Test player move followed by automatic AI move
    - Test invalid move rejection (state unchanged)
    - Test resignation functionality
    - Test new game reset
    - Test state change notifications fire correctly
    - Test AI thinking indicator toggles correctly
    - _Requirements: 6.1, 6.2, 6.5, 7.4_

- [x] 11. Implement Theme Manager
  - [x] 11.1 Create ThemeManager class
    - Create src/ui/ThemeManager.ts file
    - Define Theme type: 'light' | 'dark'
    - Define ThemeConfig interface with color properties
    - Define private currentTheme: Theme property
    - Define private themeChangeCallbacks: Array<(theme: Theme) => void>
    - Implement getCurrentTheme(): Theme method
    - Implement setTheme(theme: Theme): void method
    - Implement toggleTheme(): void to switch between light and dark
    - Implement getThemeConfig(theme: Theme): ThemeConfig to return color values
    - Implement onThemeChange(callback: (theme: Theme) => void): void for subscriptions
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 11.2 Implement theme persistence
    - In setTheme(), save theme to localStorage: localStorage.setItem('chess-theme', theme)
    - Create loadTheme(): Theme method to read from localStorage
    - In constructor, call loadTheme() and apply saved theme
    - If no saved theme, default to 'light'
    - Handle localStorage errors gracefully (return default theme)
    - _Requirements: 5.4, 5.5_

  - [x] 11.3 Define Hugging Face-inspired color schemes
    - Create light theme config with board colors (lightSquare: #f0d9b5, darkSquare: #b58863)
    - Create light theme UI colors (background: #ffffff, foreground: #f9fafb, text: #1f2937)
    - Create light theme accents (highlight: #fbbf24, validMove: #10b981)
    - Create dark theme config with board colors (lightSquare: #779556, darkSquare: #4a5f3a)
    - Create dark theme UI colors (background: #0f172a, foreground: #1e293b, text: #f1f5f9)
    - Create dark theme accents (highlight: #f59e0b, validMove: #059669)
    - Ensure WCAG AA contrast ratios for accessibility
    - _Requirements: 5.6_

  - [x]* 11.4 Write property test for theme persistence
    - Create tests/ui/ThemeManager.property.test.ts file
    - **Property 17: Theme persistence round-trip** (Requirements 5.4)
    - For any theme selection, after setting and reloading, theme should remain the same
    - Mock localStorage for testing
    - Run with minimum 100 iterations

  - [x]* 11.5 Write unit tests for theme manager
    - Create tests/ui/ThemeManager.test.ts file
    - Test theme initialization with default
    - Test theme switching (light to dark, dark to light)
    - Test theme toggle
    - Test localStorage persistence
    - Test localStorage error handling
    - Test theme change callbacks fire correctly
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Implement UI - Board Rendering
  - [x] 12.1 Create board component structure
    - Create src/ui/BoardRenderer.ts file
    - Create HTML structure in index.html: <div id="chess-board" class="board"></div>
    - In BoardRenderer, generate 64 square divs (8 rows × 8 columns)
    - Apply CSS Grid layout: display: grid; grid-template-columns: repeat(8, 1fr);
    - Add alternating classes: 'light-square' and 'dark-square'
    - Add data attributes: data-row and data-col (0-7) to each square
    - Make board responsive: max-width: min(90vw, 600px); aspect-ratio: 1/1;
    - _Requirements: 4.1, 8.1_

  - [x] 12.2 Implement piece rendering
    - Use Unicode chess symbols: ♔♕♖♗♘♙ (white) ♚♛♜♝♞♟ (black) or SVG/PNG assets
    - Implement renderPieces(state: GameState): void method
    - Clear all existing pieces from board
    - Iterate through state.board array
    - For each non-null piece, create piece element and append to square
    - Add CSS classes: 'piece', 'piece-{color}', 'piece-{type}'
    - Ensure pieces scale with board size using relative units
    - _Requirements: 4.2_

  - [x] 12.3 Implement piece selection and move highlighting
    - Add click event listeners to all squares
    - Track selected piece in private selectedPiece: Piece | null property
    - Track selected position in private selectedPosition: Position | null property
    - On square click: if square has player's piece, select it and get valid moves
    - On square click: if square is valid destination, execute move via GameController
    - On square click: if square is invalid, clear selection
    - Apply CSS class 'selected' to selected piece square
    - Apply CSS class 'valid-move' to all valid destination squares
    - Call ChessEngine.getValidMoves() to get valid destinations
    - _Requirements: 4.3, 4.4_

  - [x]* 12.4 Write property tests for UI interactions
    - Create tests/ui/BoardRenderer.property.test.ts file
    - **Property 13: Piece highlight on selection** (Requirements 4.3)
    - For any piece on board, when clicked, UI should apply visual highlight
    - **Property 16: Turn indicator accuracy** (Requirements 4.7)
    - For any game state, displayed turn indicator should match current turn
    - Mock DOM elements for testing
    - Run with minimum 100 iterations

- [x] 13. Implement UI - Move Animation and Feedback
  - [x] 13.1 Implement move animation
    - Create src/ui/AnimationController.ts file
    - Implement animateMove(move: Move, duration: number): Promise<void> method
    - Calculate pixel coordinates for source and destination squares
    - Apply CSS transform to move piece smoothly: transform: translate(x, y)
    - Use CSS transition: transition: transform 0.3s ease-in-out
    - For captures: fade out captured piece simultaneously using opacity transition
    - For castling: animate both king and rook moves in parallel
    - Return Promise that resolves when animation completes
    - Update board state only after animation finishes
    - _Requirements: 4.5_

  - [x] 13.2 Implement invalid move feedback
    - Implement showInvalidMoveFeedback(position: Position): void method
    - On invalid move attempt: add 'shake' CSS class to piece
    - Define shake animation in CSS using @keyframes (small horizontal movement)
    - Play shake animation for 500ms
    - Remove 'shake' class after animation completes
    - Optionally show brief error message or red highlight on square
    - Return piece to original position
    - _Requirements: 1.2_

  - [x] 13.3 Implement special move animations
    - For en passant: animate capturing pawn, then fade out captured pawn
    - For pawn promotion: show modal/dialog for piece selection, then replace pawn
    - Create promotion dialog with buttons for queen, rook, bishop, knight
    - Wait for user selection before completing promotion
    - Ensure all animations are smooth and don't block user interaction
    - _Requirements: 1.7, 4.5_

  - [x]* 13.4 Write property test for move animation
    - Create tests/ui/AnimationController.property.test.ts file
    - **Property 14: Move animation** (Requirements 4.5)
    - For any valid move executed, UI should animate the piece movement
    - Verify animation completes before state update
    - Mock DOM and CSS transitions for testing
    - Run with minimum 100 iterations

- [x] 14. Implement UI - Game Information Display
  - [x] 14.1 Create captured pieces display
    - Create src/ui/GameInfoDisplay.ts file
    - Add HTML containers: <div id="captured-white"></div> and <div id="captured-black"></div>
    - Position containers beside or below the board
    - Implement renderCapturedPieces(state: GameState): void method
    - Subscribe to GameController state changes
    - On state change: clear containers and render all captured pieces
    - Display piece icons/symbols in capture order
    - Group by color (white captured pieces, black captured pieces)
    - _Requirements: 4.6, 7.5_

  - [x] 14.2 Create turn and status indicator
    - Add HTML element: <div id="game-status"></div>
    - Implement updateStatusIndicator(state: GameState): void method
    - Display "Your Turn" when currentTurn === 'white' (assuming player is white)
    - Display "AI Thinking..." when isAIThinking === true
    - Show spinner or loading animation during AI turn
    - Update indicator on every state change
    - Add CSS styling for clear visibility
    - _Requirements: 4.7, 7.4_

  - [x] 14.3 Create move history display
    - Add HTML element: <div id="move-history" class="scrollable"></div>
    - Implement renderMoveHistory(state: GameState): void method
    - Display move counter (increments every 2 moves = 1 full turn)
    - Convert each move to algebraic notation using helper function
    - Format as "1. e4 e5" (white move, then black move per line)
    - Make container scrollable with overflow-y: auto
    - Auto-scroll to bottom when new move added: scrollTop = scrollHeight
    - _Requirements: 7.1, 7.2_

  - [x] 14.4 Create game result display
    - Add HTML modal: <div id="game-result-modal" class="modal hidden"></div>
    - Implement showGameResult(state: GameState): void method
    - Show modal when isCheckmate, isStalemate, or status is 'resigned'
    - Display appropriate message: "Checkmate! {Winner} wins", "Stalemate - Draw", "You resigned - AI wins"
    - Include "New Game" button in modal
    - Add backdrop overlay to prevent interaction
    - _Requirements: 7.3_

  - [x] 14.5 Create difficulty display
    - Add HTML element: <div id="difficulty-display"></div>
    - Implement updateDifficultyDisplay(difficulty: DifficultyMode): void method
    - Display "Easy Mode" or "Hard Mode" based on current difficulty
    - Position near game controls or in header
    - Update when new game starts with different difficulty
    - Style with badge or label appearance
    - _Requirements: 6.6_

  - [x]* 14.6 Write property tests for game information display
    - Create tests/ui/GameInfoDisplay.property.test.ts file
    - **Property 15: Captured pieces display** (Requirements 4.6)
    - **Property 20: Difficulty display accuracy** (Requirements 6.6)
    - **Property 21: Move number display accuracy** (Requirements 7.1)
    - **Property 22: Move history accuracy** (Requirements 7.2)
    - **Property 23: Game result display** (Requirements 7.3)
    - **Property 24: AI thinking indicator** (Requirements 7.4)
    - Mock DOM elements for testing
    - Run with minimum 100 iterations for each property

- [x] 15. Implement UI - Game Controls
  - [x] 15.1 Create difficulty selection controls
    - Create src/ui/GameControls.ts file
    - Add HTML: radio buttons or dropdown for difficulty selection (easy/hard)
    - Position in game setup area or settings panel
    - Store selected difficulty in private property
    - Disable difficulty controls when game is in progress
    - Re-enable when game ends or is reset
    - _Requirements: 6.3, 6.6_

  - [x] 15.2 Create new game button
    - Add HTML: <button id="new-game-btn">New Game</button>
    - Implement click handler
    - If game is in progress: show confirmation dialog "Start new game? Current game will be lost"
    - On confirm: get selected difficulty from controls
    - Call GameController.startNewGame(selectedDifficulty)
    - Reset UI state (clear selections, highlights, animations)
    - Close any open modals
    - _Requirements: 6.1, 6.2_

  - [x] 15.3 Create resign button
    - Add HTML: <button id="resign-btn">Resign</button>
    - Only enable when game is in progress (status === 'active')
    - Disable when game is over
    - On click: show confirmation dialog "Are you sure you want to resign?"
    - On confirm: call GameController.resignGame()
    - Display game result modal showing AI victory
    - _Requirements: 6.4, 6.5_

  - [x] 15.4 Create theme toggle button
    - Add HTML: <button id="theme-toggle-btn" aria-label="Toggle theme">
    - Position in header or corner of UI
    - Implement click handler to call ThemeManager.toggleTheme()
    - Subscribe to theme changes to update button icon
    - Update icon: 🌙 (moon) for light mode, ☀️ (sun) for dark mode
    - Or use SVG icons for better styling
    - _Requirements: 5.1_

  - [x]* 15.5 Write property tests for game controls
    - Create tests/ui/GameControls.property.test.ts file
    - **Property 18: New game resets state** (Requirements 6.2)
    - For any game state, clicking new game should reset to standard starting position
    - **Property 19: Resignation ends game** (Requirements 6.5)
    - For any in-progress game, selecting resign should end game and declare AI winner
    - Mock GameController and DOM elements
    - Run with minimum 100 iterations

  - [x]* 15.6 Write unit tests for game controls
    - Create tests/ui/GameControls.test.ts file
    - Test difficulty selection changes
    - Test new game button with confirmation
    - Test resign button with confirmation
    - Test theme toggle button updates icon
    - Test button enable/disable states
    - _Requirements: 5.1, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 16. Implement Theme Application
  - [x] 16.1 Define CSS custom properties for theming
    - Create src/styles/themes.css file
    - Define CSS variables in :root for light theme (board colors, UI colors, accents)
    - Define CSS variables in .dark-theme class for dark theme
    - Use CSS custom properties: --light-square, --dark-square, --highlight, --valid-move
    - Use CSS custom properties: --bg-primary, --bg-secondary, --text-primary, --text-secondary
    - Use CSS custom properties: --button-primary, --button-secondary, --border
    - _Requirements: 5.2, 5.3, 5.6_

  - [x] 16.2 Wire theme manager to UI
    - In main application initialization, subscribe to ThemeManager.onThemeChange()
    - On theme change callback: add/remove 'dark-theme' class to document.body
    - Ensure all UI components reference CSS variables (not hardcoded colors)
    - Apply theme on initial load
    - _Requirements: 5.2, 5.3_

  - [x] 16.3 Implement smooth theme transitions
    - Add CSS transition to themed elements: transition: background-color 0.2s ease, color 0.2s ease
    - Ensure transitions don't affect game animations (use specific selectors)
    - Test theme switching during active game
    - Verify no visual glitches during transition
    - _Requirements: 5.1, 5.2, 5.3_

  - [x]* 16.4 Write unit tests for theme application
    - Create tests/ui/ThemeApplication.test.ts file
    - Test theme switching updates CSS classes correctly
    - Test theme persistence to localStorage
    - Test theme loading on application start
    - Test all UI elements respond to theme changes
    - Mock DOM and localStorage for testing
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 17. Implement Responsive Design
  - [x] 17.1 Add responsive CSS for board scaling
    - Create src/styles/responsive.css file
    - Set board container: max-width: min(90vw, 600px); width: 100%; aspect-ratio: 1/1;
    - Scale piece font-size or image size proportionally
    - Test at viewport widths: 320px, 768px, 1024px, 2560px
    - Ensure board remains fully visible and playable at all sizes
    - _Requirements: 8.1_

  - [x] 17.2 Implement mobile layout adjustments
    - Add media query: @media (max-width: 768px)
    - Stack game info and controls vertically on mobile using flexbox
    - Reduce font sizes and padding for compact layout
    - Ensure touch targets are at least 44x44px (WCAG guideline)
    - Test captured pieces display on small screens
    - _Requirements: 8.2_

  - [x] 17.3 Implement touch event handling
    - In BoardRenderer, add touch event listeners to squares
    - Map touch events to click events: touchstart/touchend → click
    - Prevent default touch behavior to avoid scrolling: event.preventDefault()
    - Ensure touch and mouse produce identical game state changes
    - Test on mobile devices or browser dev tools device emulation
    - _Requirements: 8.2, 8.4_

  - [x] 17.4 Test viewport resize handling
    - Add window resize event listener: window.addEventListener('resize', handleResize)
    - Implement handleResize() to recalculate board dimensions
    - Ensure game state persists through resize (no data loss)
    - Test orientation changes on mobile devices (portrait ↔ landscape)
    - Verify layout adjusts smoothly without breaking
    - _Requirements: 8.3_

  - [x]* 17.5 Write property tests for responsive behavior
    - Create tests/ui/ResponsiveDesign.property.test.ts file
    - **Property 25: Responsive scaling** (Requirements 8.1)
    - For any screen width 320px-2560px, board should scale appropriately and remain playable
    - **Property 26: Resize preserves state** (Requirements 8.3)
    - For any game state, resizing viewport should preserve complete game state
    - **Property 27: Input method equivalence** (Requirements 8.4)
    - For any piece selection or move, touch events should produce same result as mouse clicks
    - Mock window resize and touch events
    - Run with minimum 100 iterations for each property

- [x] 18. Checkpoint - UI Complete
  - Verify all UI components are working correctly
  - Run all UI tests: npm test tests/ui/
  - Verify all unit tests pass
  - Verify all property tests pass (Properties 13-27)
  - Confirm all properties run with 100+ iterations
  - Manually test all UI components in both themes (light and dark)
  - Test theme switching works smoothly
  - Test responsive behavior at multiple screen sizes (320px, 768px, 1024px, 1920px, 2560px)
  - Test touch interactions on mobile devices or browser dev tools
  - Test all game controls (new game, resign, difficulty selection, theme toggle)
  - Document any UI issues or inconsistencies
  - _Requirements: 4.1-4.7, 5.1-5.6, 7.1-7.5, 8.1-8.4_

- [x] 19. Integration and Final Wiring
  - [x] 19.1 Create main application entry point
    - Update src/main.ts as the main entry point
    - Instantiate all components: ChessEngine, AIOpponent, GameController, ThemeManager, BoardRenderer, GameInfoDisplay, GameControls, AnimationController
    - Initialize UI components and event listeners
    - Subscribe GameController state changes to UI update functions
    - Load and apply saved theme preference on startup
    - _Requirements: All_

  - [x] 19.2 Wire all components together
    - Connect board UI to GameController.handlePlayerMove()
    - Connect new game button to GameController.startNewGame()
    - Connect resign button to GameController.resignGame()
    - Connect theme toggle to ThemeManager.toggleTheme()
    - Connect difficulty selector to game initialization
    - Subscribe to GameController.onStateChange() for UI updates (board, game info, status, move history, game end)
    - Subscribe to ThemeManager.onThemeChange() for theme updates
    - Ensure all state changes propagate correctly to UI
    - _Requirements: All_

  - [x] 19.3 Implement comprehensive error handling
    - Wrap async operations in try-catch blocks (handlePlayerMove, requestAIMove, generateMove)
    - Handle localStorage errors (quota exceeded, unavailable in private browsing)
    - Handle AI timeout scenarios (select random valid move, display message)
    - Display user-friendly error messages in UI (toast or modal)
    - Log all errors to console for debugging
    - Prevent errors from breaking game state or UI
    - _Requirements: All_

  - [x] 19.4 Add loading states and polish
    - Show loading indicator during AI thinking (spinner or animation)
    - Add smooth transitions between game states (fade in/out)
    - Prevent rapid clicking/double-moves with debouncing (disable board during move processing)
    - Add visual feedback for all user interactions (button hover, active, focus states)
    - Ensure keyboard accessibility (tab navigation, enter to activate, escape to close modals)
    - Add ARIA labels for screen readers
    - _Requirements: 7.4, accessibility best practices_

  - [x]* 19.5 Write end-to-end integration tests
    - Create tests/integration/e2e.test.ts file
    - Test complete game from start to checkmate
    - Test complete game ending in stalemate
    - Test game with resignation
    - Test theme switching during active game
    - Test responsive behavior during game
    - Test error recovery scenarios (invalid move, AI timeout, localStorage unavailable)
    - _Requirements: All_

- [x] 20. Final Checkpoint - Complete Application
  - [x] 20.1 Run complete test suite
    - Execute: npm test
    - Verify all unit tests pass (engine, AI, controllers, UI)
    - Verify all property tests pass (Properties 1-30)
    - Confirm all properties run with 100+ iterations
    - Check test coverage: npm run test:coverage
    - Aim for >80% code coverage
    - _Requirements: All_

  - [x] 20.2 Cross-browser testing
    - Test in Chrome (latest version)
    - Test in Firefox (latest version)
    - Test in Safari (latest version)
    - Test in Edge (latest version)
    - Verify consistent behavior across browsers
    - Document any browser-specific issues
    - _Requirements: All_

  - [x] 20.3 Mobile device testing
    - Test on iOS devices (iPhone) or simulator
    - Test on Android devices or emulator
    - Test touch interactions work correctly
    - Test responsive layout on various screen sizes
    - Test orientation changes (portrait ↔ landscape)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 20.4 Comprehensive manual testing
    - Play complete games in easy mode (verify AI doesn't checkmate)
    - Play complete games in hard mode (verify AI doesn't checkmate before move 10, does checkmate after)
    - Test stalemate detection with known positions
    - Test resignation functionality
    - Test all special moves: castling (kingside and queenside), en passant, pawn promotion (all piece types)
    - Test theme switching during active games
    - Test responsive behavior at various screen sizes
    - Test all game controls
    - Verify localStorage persistence (theme, game state if implemented)
    - _Requirements: All_

  - [x] 20.5 Performance and quality checks
    - Check browser console for errors or warnings
    - Verify no TypeScript compilation errors: npm run type-check
    - Verify AI responds within time limits (easy <2s, hard <3s)
    - Test with browser dev tools performance profiler
    - Ensure smooth animations (60fps)
    - Check memory usage (no memory leaks)
    - _Requirements: 2.5, 3.4_

  - [x] 20.6 Accessibility verification
    - Test keyboard navigation (tab through all controls)
    - Test screen reader compatibility (NVDA, JAWS, VoiceOver)
    - Verify ARIA labels are present and correct
    - Check color contrast ratios (WCAG AA compliance)
    - Test with browser accessibility tools
    - _Requirements: Accessibility best practices_

  - [x] 20.7 Final review and documentation
    - Review all 8 requirements are fully implemented
    - Review all 30 correctness properties are tested
    - Update README.md with: how to run, how to test, how to build, feature list, known issues
    - Document any deployment considerations
    - Ask the user if questions arise, if any issues found, or if ready to deploy
    - _Requirements: All_


## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP delivery
- Each task includes specific implementation details and references exact requirements
- Property tests validate universal correctness properties with 100+ iterations each
- Unit tests validate specific examples, edge cases, and error conditions
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation uses TypeScript with strict mode for type safety
- Fast-check library is used for property-based testing with Vitest as the test runner
- All 30 correctness properties from the design document are covered by property tests
- Tasks are ordered to enable incremental development: engine → AI → controller → UI
- Each sub-task is actionable and can be completed independently
- Integration happens progressively throughout development, with final wiring in Task 19

## Property Test Reference

All property-based tests should be tagged with comments referencing their design document property:

```typescript
// Feature: web-chess-app, Property 1: Valid move highlighting
test.prop([fc.record({ /* board state generator */ })])('valid move highlighting', (boardState) => {
  // Test implementation
});
```

### Properties by Component

**Chess Engine (Properties 1-6, 28-30)**
- Property 1: Valid move highlighting (Req 1.1)
- Property 2: Invalid move rejection preserves state (Req 1.2)
- Property 3: Check detection accuracy (Req 1.3)
- Property 4: Checkmate detection accuracy (Req 1.4)
- Property 5: Stalemate detection accuracy (Req 1.5)
- Property 6: Turn alternation (Req 1.6)
- Property 28: Castling validation (Req 1.7)
- Property 29: En passant validation (Req 1.7)
- Property 30: Pawn promotion (Req 1.7)

**AI Opponent (Properties 7-12)**
- Property 7: Easy mode generates valid moves (Req 2.1)
- Property 8: Easy mode avoids checkmate (Req 2.2)
- Property 9: Easy mode response time (Req 2.5)
- Property 10: Hard mode pre-move-10 checkmate restriction (Req 3.2)
- Property 11: Hard mode post-move-10 checkmate execution (Req 3.3)
- Property 12: Hard mode response time (Req 3.4)

**UI Components (Properties 13-27)**
- Property 13: Piece highlight on selection (Req 4.3)
- Property 14: Move animation (Req 4.5)
- Property 15: Captured pieces display (Req 4.6)
- Property 16: Turn indicator accuracy (Req 4.7)
- Property 17: Theme persistence round-trip (Req 5.4)
- Property 18: New game resets state (Req 6.2)
- Property 19: Resignation ends game (Req 6.5)
- Property 20: Difficulty display accuracy (Req 6.6)
- Property 21: Move number display accuracy (Req 7.1)
- Property 22: Move history accuracy (Req 7.2)
- Property 23: Game result display (Req 7.3)
- Property 24: AI thinking indicator (Req 7.4)
- Property 25: Responsive scaling (Req 8.1)
- Property 26: Resize preserves state (Req 8.3)
- Property 27: Input method equivalence (Req 8.4)
