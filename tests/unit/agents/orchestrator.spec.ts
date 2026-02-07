import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadComponentSpecs, topologicalSort } from '../../../src/agents/orchestrator.js';
import type { ComponentSpec } from '../../../src/agents/orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../temp-orchestrator');

describe('loadComponentSpecs', () => {
  beforeEach(async () => {
    await fs.ensureDir(path.join(tempDir, 'tests/specs'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should load all component specs from directory', async () => {
    // Create test specs
    await fs.writeFile(
      path.join(tempDir, 'tests/specs/user-service.spec.yaml'),
      `component: user-service
dependencies: []
files:
  - src/services/user-service.ts
`
    );

    await fs.writeFile(
      path.join(tempDir, 'tests/specs/auth-service.spec.yaml'),
      `component: auth-service
dependencies:
  - user-service
files:
  - src/services/auth-service.ts
`
    );

    const specs = await loadComponentSpecs(path.join(tempDir, 'tests/specs'));

    expect(specs).toHaveLength(2);
    expect(specs.some(s => s.component === 'user-service')).toBe(true);
    expect(specs.some(s => s.component === 'auth-service')).toBe(true);
  });

  it('should extract test file paths from specs', async () => {
    await fs.writeFile(
      path.join(tempDir, 'tests/specs/payment.spec.yaml'),
      `component: payment-service
dependencies: []
files:
  - src/services/payment-service.ts
  - src/models/payment.ts
`
    );

    const specs = await loadComponentSpecs(path.join(tempDir, 'tests/specs'));

    const paymentSpec = specs.find(s => s.component === 'payment-service');
    expect(paymentSpec).toBeDefined();
    expect(paymentSpec!.files).toHaveLength(2);
  });
});

describe('topologicalSort', () => {
  it('should sort components by dependencies', () => {
    const specs: ComponentSpec[] = [
      {
        component: 'auth-service',
        dependencies: ['user-service', 'database'],
        files: []
      },
      {
        component: 'user-service',
        dependencies: ['database'],
        files: []
      },
      {
        component: 'database',
        dependencies: [],
        files: []
      }
    ];

    const sorted = topologicalSort(specs);

    // Database should come first (no dependencies)
    expect(sorted[0].component).toBe('database');

    // User-service should come before auth-service
    const userIndex = sorted.findIndex(s => s.component === 'user-service');
    const authIndex = sorted.findIndex(s => s.component === 'auth-service');
    expect(userIndex).toBeLessThan(authIndex);
  });

  it('should handle components with no dependencies', () => {
    const specs: ComponentSpec[] = [
      { component: 'service-a', dependencies: [], files: [] },
      { component: 'service-b', dependencies: [], files: [] },
      { component: 'service-c', dependencies: [], files: [] }
    ];

    const sorted = topologicalSort(specs);

    expect(sorted).toHaveLength(3);
    // Order doesn't matter for independent components, just that all are included
  });

  it('should detect circular dependencies', () => {
    const specs: ComponentSpec[] = [
      {
        component: 'service-a',
        dependencies: ['service-b'],
        files: []
      },
      {
        component: 'service-b',
        dependencies: ['service-a'],
        files: []
      }
    ];

    expect(() => topologicalSort(specs)).toThrow(/circular/i);
  });

  it('should handle complex dependency trees', () => {
    const specs: ComponentSpec[] = [
      {
        component: 'frontend',
        dependencies: ['api', 'auth'],
        files: []
      },
      {
        component: 'api',
        dependencies: ['database', 'cache'],
        files: []
      },
      {
        component: 'auth',
        dependencies: ['database'],
        files: []
      },
      {
        component: 'database',
        dependencies: [],
        files: []
      },
      {
        component: 'cache',
        dependencies: [],
        files: []
      }
    ];

    const sorted = topologicalSort(specs);

    // Database and cache should be first (no dependencies)
    const firstTwo = sorted.slice(0, 2).map(s => s.component);
    expect(firstTwo).toContain('database');
    expect(firstTwo).toContain('cache');

    // Frontend should be last (depends on everything)
    expect(sorted[sorted.length - 1].component).toBe('frontend');
  });
});
