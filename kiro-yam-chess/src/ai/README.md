# AI Opponent

This directory contains the AI opponent implementation with configurable difficulty levels.

## Key Components

- **AIOpponent**: Main AI class for move generation
- **Position Evaluation**: Board position scoring and evaluation
- **Move Selection**: Minimax algorithm with alpha-beta pruning
- **Difficulty Modes**:
  - **Easy Mode**: Avoids checkmate, provides challenge without winning
  - **Hard Mode**: Strategic play with checkmate restriction for first 10 moves

## Features

- Material and positional evaluation
- Move scoring and selection
- Time-constrained move generation
- Difficulty-specific behavior
