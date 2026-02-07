import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseVitestResults, parsePytestResults } from '../../../src/core/test-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, '../../fixtures');

describe('parseVitestResults', () => {
  it('should parse passing tests correctly', async () => {
    const jsonOutput = await fs.readFile(
      path.join(fixturesDir, 'vitest-output-success.json'),
      'utf-8'
    );

    const result = parseVitestResults(jsonOutput);

    expect(result.total).toBe(5);
    expect(result.passed).toBe(5);
    expect(result.failed).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.failures).toHaveLength(0);
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should parse failing tests with failure details', async () => {
    const jsonOutput = await fs.readFile(
      path.join(fixturesDir, 'vitest-output-failure.json'),
      'utf-8'
    );

    const result = parseVitestResults(jsonOutput);

    expect(result.total).toBe(3);
    expect(result.passed).toBe(1);
    expect(result.failed).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.failures).toHaveLength(2);

    expect(result.failures[0].name).toBe('PaymentService should refund payment');
    expect(result.failures[0].message).toContain('Expected refund amount');
    expect(result.failures[0].file).toBe('/path/to/payment-service.spec.ts');

    expect(result.failures[1].name).toBe('PaymentService should handle declined payment');
    expect(result.failures[1].message).toContain('Payment gateway timeout');
    expect(result.failures[1].stack).toBeDefined();
  });

  it('should handle empty test suite', () => {
    const emptyOutput = JSON.stringify({
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      testResults: [],
      success: true
    });

    const result = parseVitestResults(emptyOutput);

    expect(result.total).toBe(0);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.failures).toHaveLength(0);
  });

  it('should extract duration correctly', async () => {
    const jsonOutput = await fs.readFile(
      path.join(fixturesDir, 'vitest-output-success.json'),
      'utf-8'
    );

    const result = parseVitestResults(jsonOutput);

    // Duration should be sum of all test durations or calculated from timestamps
    expect(result.duration).toBeGreaterThan(0);
    expect(typeof result.duration).toBe('number');
  });
});

describe('parsePytestResults', () => {
  it('should parse pytest JSON report', async () => {
    const jsonOutput = await fs.readFile(
      path.join(fixturesDir, 'pytest-output.json'),
      'utf-8'
    );

    const result = parsePytestResults(jsonOutput);

    expect(result.total).toBe(8);
    expect(result.passed).toBe(5);
    expect(result.failed).toBe(2);
    expect(result.skipped).toBe(1);
  });

  it('should handle test failures with details', async () => {
    const jsonOutput = await fs.readFile(
      path.join(fixturesDir, 'pytest-output.json'),
      'utf-8'
    );

    const result = parsePytestResults(jsonOutput);

    expect(result.failures).toHaveLength(2);
    expect(result.failures[0].name).toBe('tests/test_auth.py::test_authenticate');
    expect(result.failures[0].message).toContain('Token validation failed');

    expect(result.failures[1].name).toBe('tests/test_payment.py::test_refund');
    expect(result.failures[1].message).toContain('Refund amount exceeds');
  });

  it('should extract duration from pytest report', async () => {
    const jsonOutput = await fs.readFile(
      path.join(fixturesDir, 'pytest-output.json'),
      'utf-8'
    );

    const result = parsePytestResults(jsonOutput);

    expect(result.duration).toBeCloseTo(2.45, 1);
  });
});
