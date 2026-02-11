# Web Chess Application

A modern web-based chess application with AI opponent and configurable difficulty levels. Built with TypeScript, featuring property-based testing and a responsive UI inspired by Hugging Face's design system.

## Features

- ♟️ **Complete Chess Implementation**: All standard chess rules including castling, en passant, and pawn promotion
- 🤖 **AI Opponent**: Two difficulty modes (Easy and Hard) with strategic move generation
- 🎨 **Modern UI**: Light and dark themes with smooth animations
- 📱 **Responsive Design**: Works on devices from 320px to 2560px
- ✅ **Property-Based Testing**: Comprehensive testing with fast-check
- 🔒 **Type-Safe**: Built with TypeScript in strict mode

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
web-chess-app/
├── src/
│   ├── engine/       # Chess engine (move validation, game state)
│   ├── ai/           # AI opponent logic
│   ├── ui/           # User interface components
│   ├── controllers/  # Game controller and orchestration
│   ├── types/        # TypeScript type definitions
│   └── main.ts       # Application entry point
├── tests/            # Test files (unit and property-based)
└── .kiro/specs/      # Feature specifications and design documents
```

## Technology Stack

- **TypeScript 5.3+**: Type-safe development with strict mode
- **Vite 5.0+**: Fast build tooling and development server
- **Vitest 1.0+**: Unit testing framework
- **fast-check 3.15+**: Property-based testing library

## Development

See [PROJECT_SETUP.md](./PROJECT_SETUP.md) for detailed setup instructions and development workflow.

## Testing

The project uses both unit tests and property-based tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Documentation

- [Requirements](/.kiro/specs/web-chess-app/requirements.md) - Feature requirements and acceptance criteria
- [Design](/.kiro/specs/web-chess-app/design.md) - Architecture and design decisions
- [Tasks](/.kiro/specs/web-chess-app/tasks.md) - Implementation plan and task breakdown
- [Project Setup](./PROJECT_SETUP.md) - Development environment setup

## License

MIT

## Create Spec: i want ...

Generate Tasks

Run all tasks: .kiro...





Checkpoint
Restore
Create Spec: i want to build  a web chess app to let me play against ai, in easy mode ai would not check mate, while in hard mode ai can do it after 10 moves, ui theme using https://huggingface.co style light and dark mode, 

Kiro
I'll help you create a spec for your web chess app with AI opponents and a HuggingFace-inspired theme. Let me start by gathering the requirements and creating a comprehensive spec.

I'll help you create a comprehensive spec for your web chess application following the requirements-first workflow. Let me start by creating the requirements document.

Accepted creation of

requirements.md


Now let me ask for your review of the requirements document:

Do the requirements look good? If so, we can move on to the design.

Great! Now I'll create the design document. Let me start by writing the initial sections, then I'll use the prework tool to analyze the acceptance criteria before writing the Correctness Properties section.

Accepted creation of

design.md


Now I need to use the prework tool to analyze the acceptance criteria before writing the Correctness Properties section:

Formalized requirements to correctness properties
Now let me perform property reflection to eliminate redundancy before writing the Correctness Properties section:

Property Reflection:

Looking at the prework analysis, I've identified the following redundancies:

Criteria 2.3 is redundant with 2.2 - Both test that easy mode AI doesn't checkmate
Criteria 4.4 is redundant with 1.1 - Both test valid move highlighting
Criteria 5.5 is redundant with 5.4 - Both test theme persistence
Criteria 7.5 is redundant with 4.6 - Both test captured piece display
After reflection, I'll write properties only for the non-redundant criteria. Now let me append the Correctness Properties section to the design document:

Accepted edits to

design.md


Perfect! Now let me ask for your review of the design document:

Does the design look good? If so, we can move on to the implementation plan.

Excellent! Now I need to create the implementation plan. First, I must determine the programming language since the design uses TypeScript pseudocode. Let me ask the user:

Let me use the correct approach - since the design already uses TypeScript, I'll proceed with TypeScript as the implementation language. Now let me create the tasks document:

Accepted creation of

tasks.md


Now I need to check if there are optional tasks and ask the user about them:

Make all tasks required (comprehensive from start)

Perfect! Let me update the tasks document to make all tasks required by removing the "*" markers:


33 edits to file

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Accepted edits to

tasks.md


Now let me also update the notes section to reflect that all tasks are required:

Accepted edits to

tasks.md


Perfect! Now let me provide the final summary to the user:

Read file(s)

requirements.md

design.md

tasks.md
Perfect! I've created a complete spec for your web chess application. The spec includes:

Requirements Document - 8 comprehensive requirements covering:

Full chess game mechanics with all rules
Easy mode AI (never checkmates)
Hard mode AI (no checkmate before move 10, then goes for the win)
HuggingFace-inspired UI with light/dark themes
Responsive design for all screen sizes
Design Document - Complete technical design with:

Architecture diagrams and component interfaces
30 correctness properties for property-based testing
TypeScript interfaces for all major components
Error handling and testing strategies
Implementation Plan - 21 major tasks with 80+ sub-tasks:

Bottom-up approach: Chess Engine → AI → UI
Comprehensive testing integrated throughout
All tasks required for full implementation
The spec is ready to execute. You can start with task 1 (project setup) whenever you're ready. Just let me know which task you'd like to work on!

Credits used: 0.24
Elapsed time: 7m 39s


## generated tasks

- 21 main tasks organized into logical phases (setup, chess engine, AI, UI, integration)
- All 30 correctness properties covered by property-based tests
- Clear requirement traceability for each task
- Optional tasks marked with * for faster MVP delivery
- Checkpoints for validation and user feedback


