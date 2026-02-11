# Web Chess Application - Project Setup

## Overview

This document describes the development environment setup for the web chess application.

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
├── index.html        # Base HTML file with root element
├── tsconfig.json     # TypeScript configuration (strict mode)
├── vite.config.ts    # Vite bundler configuration
├── vitest.config.ts  # Vitest testing configuration
└── package.json      # Dependencies and scripts

```

## Technology Stack

- **TypeScript 5.3+**: Type-safe development with strict mode enabled
- **Vite 5.0+**: Fast build tooling and development server
- **Vitest 1.0+**: Unit testing framework
- **fast-check 3.15+**: Property-based testing library
- **jsdom**: DOM environment for testing

## TypeScript Configuration

The project uses TypeScript in **strict mode** with the following key settings:

- `strict: true` - All strict type-checking options enabled
- `noImplicitAny: true` - Error on expressions with implied 'any' type
- `strictNullChecks: true` - Strict null checking
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters
- `noImplicitReturns: true` - Error when not all code paths return a value
- `noUncheckedIndexedAccess: true` - Add undefined to index signature results
- `exactOptionalPropertyTypes: true` - Interpret optional properties exactly

### Path Aliases

The following path aliases are configured for cleaner imports:

- `@/*` → `src/*`
- `@engine/*` → `src/engine/*`
- `@ai/*` → `src/ai/*`
- `@ui/*` → `src/ui/*`
- `@controllers/*` → `src/controllers/*`
- `@types/*` → `src/types/*`

## Build Tooling

### Vite Configuration

Vite is configured for:
- Development server on port 3000
- Automatic browser opening
- Source maps in production builds
- Path alias resolution matching TypeScript

### Available Scripts

```bash
# Start development server
npm run dev

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Type check without emitting files
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Setup

### Unit Testing (Vitest)

- Test files should be placed in the `tests/` directory
- Use `.test.ts` extension for test files
- Vitest provides Jest-compatible API
- jsdom environment for DOM testing

### Property-Based Testing (fast-check)

- fast-check is configured for property-based testing
- Each property test should run 100+ iterations
- Tests should reference design properties in comments
- Format: `// Feature: web-chess-app, Property X: Description`

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Component Name', () => {
  it('should handle specific case', () => {
    // Unit test
    expect(result).toBe(expected);
  });

  it('should satisfy property X', () => {
    // Feature: web-chess-app, Property X: Description
    fc.assert(
      fc.property(fc.integer(), (n) => {
        // Property test
        return condition;
      })
    );
  });
});
```

## Development Workflow

1. **Start Development Server**: `npm run dev`
2. **Run Tests in Watch Mode**: `npm run test:watch`
3. **Type Check**: `npm run type-check`
4. **Build**: `npm run build`

## Next Steps

With the development environment set up, the next tasks are:

1. Implement core data models and types (Task 2)
2. Implement chess engine move generation (Task 3)
3. Implement special moves (Task 4)
4. Implement game state detection (Task 5)
5. Continue with remaining tasks as outlined in tasks.md

## Verification

To verify the setup is working correctly:

1. Run `npm test` - Should execute the setup test successfully
2. Run `npm run type-check` - Should complete without errors
3. Run `npm run dev` - Should start the development server and open the browser

## Dependencies

### Production Dependencies
- `fast-check`: ^3.15.0

### Development Dependencies
- `@types/node`: ^20.10.0
- `@vitest/ui`: ^1.0.4
- `jsdom`: ^23.0.1
- `typescript`: ^5.3.3
- `vite`: ^5.0.7
- `vitest`: ^1.0.4

## Notes

- All TypeScript files must pass strict type checking
- All tests must pass before committing
- Property-based tests should run with at least 100 iterations
- Follow the design document for architecture and interfaces
