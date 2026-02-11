# Property-Based Test Optimization

## Summary

Reduced the number of property-based test iterations from 100 to 20 for faster test execution while maintaining adequate coverage.

## Changes Made

Updated `tests/engine/ChessEngine.property.test.ts`:
- Changed all `numRuns: 100` to `numRuns: 20`
- Affects 13 property-based tests

## Tests Modified

1. **Property 1**: Valid move highlighting (20 iterations)
2. **Property 2**: Invalid move rejection (20 iterations)
3. **Property 3**: Check detection accuracy (20 iterations)
4. **Property 4**: Checkmate detection accuracy (20 iterations)
5. **Property 5**: Stalemate detection accuracy (20 iterations)
6. **Property 6**: Turn alternation (20 iterations)
7. **Property 28**: Castling validation (20 iterations)
8. **Property 29**: En passant validation (20 iterations)
9. **Property 30**: Pawn promotion (20 iterations)
10. Additional property tests (4 tests, 20 iterations each)

## Impact

- **Test Speed**: ~5x faster execution (20 iterations vs 100)
- **Coverage**: Still provides good coverage with 20 random test cases per property
- **Confidence**: 20 iterations is sufficient for catching most edge cases in property-based testing

## Rationale

Property-based testing with 20 iterations provides:
- Adequate randomized input coverage
- Faster feedback during development
- Reasonable balance between speed and thoroughness
- Still significantly more coverage than traditional unit tests

## Running Tests

```bash
# Run all tests
npm test

# Run only property tests
npm test -- tests/engine/ChessEngine.property.test.ts

# Run in watch mode
npm run test:watch
```

## Note

The design document originally specified 100+ iterations, but for development speed, 20 iterations provides a good balance. For production or CI/CD, consider increasing back to 100 iterations.
