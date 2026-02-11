/**
 * Basic setup test to verify testing infrastructure
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Development Environment Setup', () => {
  it('should run basic unit tests', () => {
    expect(true).toBe(true);
  });

  it('should run property-based tests with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      })
    );
  });

  it('should support TypeScript strict mode', () => {
    const value: string = 'test';
    expect(typeof value).toBe('string');
  });
});
