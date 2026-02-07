import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTests, type ComponentAnalysis } from '../../src/agents/test-generator.js';
import { parseVitestResults } from '../../src/core/test-runner.js';
import { parseVitestCoverage } from '../../src/core/coverage-generator.js';
import { loadComponentSpecs, topologicalSort } from '../../src/agents/orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../temp-integration');

describe('test-rig full workflow', () => {
  beforeAll(async () => {
    await fs.ensureDir(tempDir);
  });

  afterAll(async () => {
    await fs.remove(tempDir);
  });

  it('should complete full workflow: generate → parse results → parse coverage', async () => {
    // Step 1: Generate test files
    const analysis: ComponentAnalysis = {
      component: 'sample-service',
      files: ['src/services/sample-service.ts'],
      subcomponents: [
        {
          name: 'SampleService',
          file: 'src/services/sample-service.ts',
          type: 'service'
        }
      ]
    };

    const generatedFiles = await generateTests(analysis, tempDir);

    // Verify files were generated
    expect(generatedFiles.length).toBeGreaterThan(0);
    expect(generatedFiles.some(f => f.endsWith('.spec.ts'))).toBe(true);
    expect(generatedFiles.some(f => f.endsWith('.factory.ts'))).toBe(true);
    expect(generatedFiles.some(f => f.endsWith('.integration.ts'))).toBe(true);

    // Step 2: Parse test results (using fixture)
    const fixturesDir = path.join(__dirname, '../fixtures');
    const vitestOutput = await fs.readFile(
      path.join(fixturesDir, 'vitest-output-success.json'),
      'utf-8'
    );

    const testResult = parseVitestResults(vitestOutput);
    expect(testResult.total).toBe(5);
    expect(testResult.passed).toBe(5);
    expect(testResult.failed).toBe(0);

    // Step 3: Parse coverage (using fixture)
    const coveragePath = path.join(fixturesDir, 'coverage-vitest.json');
    const coverage = await parseVitestCoverage(coveragePath);

    expect(coverage.lines.pct).toBeGreaterThan(80);
    expect(coverage.files).toBeDefined();
  });

  it('should handle component dependencies with topological sort', async () => {
    // Create test specs directory
    const specsDir = path.join(tempDir, 'specs');
    await fs.ensureDir(specsDir);

    // Create spec files with dependencies
    await fs.writeFile(
      path.join(specsDir, 'auth.spec.yaml'),
      `component: auth
dependencies:
  - database
  - user
files: []
`
    );

    await fs.writeFile(
      path.join(specsDir, 'user.spec.yaml'),
      `component: user
dependencies:
  - database
files: []
`
    );

    await fs.writeFile(
      path.join(specsDir, 'database.spec.yaml'),
      `component: database
dependencies: []
files: []
`
    );

    // Load and sort specs
    const specs = await loadComponentSpecs(specsDir);
    expect(specs).toHaveLength(3);

    const sorted = topologicalSort(specs);

    // Database should be first (no dependencies)
    expect(sorted[0].component).toBe('database');

    // User should come before auth
    const userIndex = sorted.findIndex(s => s.component === 'user');
    const authIndex = sorted.findIndex(s => s.component === 'auth');
    expect(userIndex).toBeLessThan(authIndex);
  });

  it('should parse failing test results correctly', async () => {
    const fixturesDir = path.join(__dirname, '../fixtures');
    const vitestOutput = await fs.readFile(
      path.join(fixturesDir, 'vitest-output-failure.json'),
      'utf-8'
    );

    const testResult = parseVitestResults(vitestOutput);

    expect(testResult.total).toBe(3);
    expect(testResult.passed).toBe(1);
    expect(testResult.failed).toBe(2);
    expect(testResult.failures).toHaveLength(2);

    // Verify failure details
    expect(testResult.failures[0].name).toBeDefined();
    expect(testResult.failures[0].message).toBeDefined();
  });
});
