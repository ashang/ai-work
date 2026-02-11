/**
 * Configuration validation tests
 * Ensures all configuration files are properly set up
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Project Configuration', () => {
  it('should have valid tsconfig.json', () => {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json');
    expect(existsSync(tsconfigPath)).toBe(true);
    
    // Just verify the file exists and has the expected structure
    // (TypeScript itself will validate the actual config)
    const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
    expect(tsconfigContent).toContain('"strict": true');
    expect(tsconfigContent).toContain('"target": "ES2020"');
  });

  it('should have valid package.json with required dependencies', () => {
    const packagePath = join(process.cwd(), 'package.json');
    expect(existsSync(packagePath)).toBe(true);
    
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
    expect(pkg.dependencies['fast-check']).toBeDefined();
    expect(pkg.devDependencies['vitest']).toBeDefined();
    expect(pkg.devDependencies['typescript']).toBeDefined();
    expect(pkg.devDependencies['vite']).toBeDefined();
  });

  it('should have index.html with root element', () => {
    const indexPath = join(process.cwd(), 'index.html');
    expect(existsSync(indexPath)).toBe(true);
    
    const html = readFileSync(indexPath, 'utf-8');
    expect(html).toContain('id="root"');
    expect(html).toContain('src/main.ts');
  });

  it('should have all required source directories', () => {
    const requiredDirs = [
      'src/engine',
      'src/ai',
      'src/ui',
      'src/controllers',
      'src/types',
      'tests'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = join(process.cwd(), dir);
      expect(existsSync(dirPath)).toBe(true);
    });
  });

  it('should have vite configuration', () => {
    const vitePath = join(process.cwd(), 'vite.config.ts');
    expect(existsSync(vitePath)).toBe(true);
  });

  it('should have vitest configuration', () => {
    const vitestPath = join(process.cwd(), 'vitest.config.ts');
    expect(existsSync(vitestPath)).toBe(true);
  });
});
