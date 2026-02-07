import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseVitestCoverage, parsePytestCoverage } from '../../../src/core/coverage-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, '../../fixtures');

describe('parseVitestCoverage', () => {
  it('should parse vitest coverage summary', async () => {
    const coveragePath = path.join(fixturesDir, 'coverage-vitest.json');

    const result = await parseVitestCoverage(coveragePath);

    expect(result.lines.pct).toBeCloseTo(84.89, 1);
    expect(result.lines.covered).toBe(382);
    expect(result.lines.total).toBe(450);

    expect(result.statements.pct).toBeCloseTo(85.15, 1);
    expect(result.functions.pct).toBeCloseTo(83.33, 1);
    expect(result.branches.pct).toBeCloseTo(79.03, 1);
  });

  it('should include file-level coverage', async () => {
    const coveragePath = path.join(fixturesDir, 'coverage-vitest.json');

    const result = await parseVitestCoverage(coveragePath);

    expect(result.files).toBeDefined();
    expect(result.files!.length).toBeGreaterThan(0);

    const userServiceFile = result.files!.find(f => f.path.includes('user-service'));
    expect(userServiceFile).toBeDefined();
    expect(userServiceFile!.lines.pct).toBeCloseTo(91.76, 1);
  });

  it('should throw error for missing coverage file', async () => {
    const nonExistentPath = path.join(fixturesDir, 'non-existent.json');

    await expect(parseVitestCoverage(nonExistentPath)).rejects.toThrow();
  });
});

describe('parsePytestCoverage', () => {
  it('should parse pytest coverage JSON', async () => {
    const coveragePath = path.join(fixturesDir, 'coverage-pytest.json');

    const result = await parsePytestCoverage(coveragePath);

    expect(result.lines.pct).toBeCloseTo(82.21, 1);
    expect(result.lines.covered).toBe(245);
    expect(result.lines.total).toBe(298);
  });

  it('should map Python coverage to standard format', async () => {
    const coveragePath = path.join(fixturesDir, 'coverage-pytest.json');

    const result = await parsePytestCoverage(coveragePath);

    // Python coverage has different structure, should be normalized
    expect(result).toHaveProperty('lines');
    expect(result).toHaveProperty('statements');
    expect(result).toHaveProperty('functions');
    expect(result).toHaveProperty('branches');
  });

  it('should include file-level coverage for Python', async () => {
    const coveragePath = path.join(fixturesDir, 'coverage-pytest.json');

    const result = await parsePytestCoverage(coveragePath);

    expect(result.files).toBeDefined();
    expect(result.files!.length).toBeGreaterThan(0);

    const userFile = result.files!.find(f => f.path.includes('user.py'));
    expect(userFile).toBeDefined();
    expect(userFile!.lines.pct).toBeCloseTo(83.33, 1);
  });

  it('should handle branches correctly', async () => {
    const coveragePath = path.join(fixturesDir, 'coverage-pytest.json');

    const result = await parsePytestCoverage(coveragePath);

    expect(result.branches.total).toBe(64);
    expect(result.branches.covered).toBe(56);
    expect(result.branches.pct).toBeCloseTo(87.5, 1);
  });
});
