import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { globby } from 'globby';
import { execa } from 'execa';
import { parseVitestResults, parsePytestResults, type TestResult } from '../core/test-runner.js';

export interface ComponentSpec {
  component: string;
  dependencies: string[];
  files: string[];
  description?: string;
  subcomponents?: Array<{
    name: string;
    file: string;
    type: string;
  }>;
}

interface WorkItem {
  component: string;
  specPath: string;
  testFiles: string[];
  dependencies: string[];
}

export async function loadComponentSpecs(specsDir: string): Promise<ComponentSpec[]> {
  const specFiles = await globby('*.spec.yaml', { cwd: specsDir, absolute: true });
  const specs: ComponentSpec[] = [];

  for (const specFile of specFiles) {
    const content = await fs.readFile(specFile, 'utf-8');
    const spec = yaml.load(content) as ComponentSpec;
    specs.push(spec);
  }

  return specs;
}

export function topologicalSort(specs: ComponentSpec[]): ComponentSpec[] {
  const sorted: ComponentSpec[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(spec: ComponentSpec) {
    if (visited.has(spec.component)) {
      return;
    }

    if (visiting.has(spec.component)) {
      throw new Error(`Circular dependency detected involving ${spec.component}`);
    }

    visiting.add(spec.component);

    // Visit dependencies first
    for (const dep of spec.dependencies || []) {
      const depSpec = specs.find(s => s.component === dep);
      if (depSpec) {
        visit(depSpec);
      }
    }

    visiting.delete(spec.component);
    visited.add(spec.component);
    sorted.push(spec);
  }

  for (const spec of specs) {
    visit(spec);
  }

  return sorted;
}

async function runAgentWorker(
  workQueue: WorkItem[],
  results: Map<string, TestResult>,
  framework: string
): Promise<void> {
  while (workQueue.length > 0) {
    const workItem = workQueue.shift();
    if (!workItem) break;

    try {
      if (framework === 'vitest') {
        const result = await execa('npx', ['vitest', 'run', '--reporter=json', ...workItem.testFiles], {
          cwd: process.cwd()
        });
        const testResult = parseVitestResults(result.stdout);
        results.set(workItem.component, testResult);
      } else if (framework === 'pytest') {
        const reportFile = `/tmp/pytest-${workItem.component}-report.json`;
        await execa('pytest', ['--json-report', `--json-report-file=${reportFile}`, ...workItem.testFiles], {
          cwd: process.cwd()
        });

        const reportContent = await fs.readFile(reportFile, 'utf-8');
        const testResult = parsePytestResults(reportContent);
        results.set(workItem.component, testResult);
      }
    } catch (error: any) {
      // Test failures still produce results
      if (error.stdout && framework === 'vitest') {
        const testResult = parseVitestResults(error.stdout);
        results.set(workItem.component, testResult);
      } else {
        // Store error as failed test
        results.set(workItem.component, {
          total: 0,
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: 0,
          failures: [{
            name: workItem.component,
            message: error.message || 'Test execution failed'
          }]
        });
      }
    }
  }
}

function aggregateResults(results: Map<string, TestResult>): TestResult {
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let maxDuration = 0;
  const allFailures: any[] = [];

  for (const result of results.values()) {
    total += result.total;
    passed += result.passed;
    failed += result.failed;
    skipped += result.skipped;
    maxDuration = Math.max(maxDuration, result.duration);
    allFailures.push(...result.failures);
  }

  return {
    total,
    passed,
    failed,
    skipped,
    duration: maxDuration,
    failures: allFailures
  };
}

export async function runTestsParallel(options: any): Promise<TestResult> {
  const { config, agents = 2 } = options;
  const specsDir = path.join(process.cwd(), 'tests/specs');

  // Load all component specs
  const specs = await loadComponentSpecs(specsDir);

  // Sort by dependencies
  const sortedSpecs = topologicalSort(specs);

  // Build work queue
  const workQueue: WorkItem[] = sortedSpecs.map(spec => ({
    component: spec.component,
    specPath: path.join(specsDir, `${spec.component}.spec.yaml`),
    testFiles: spec.files || [],
    dependencies: spec.dependencies || []
  }));

  // Create results map
  const results = new Map<string, TestResult>();

  // Spawn N agent workers
  const workers: Promise<void>[] = [];
  for (let i = 0; i < agents; i++) {
    workers.push(runAgentWorker(workQueue, results, config.framework));
  }

  // Wait for all agents to complete
  await Promise.all(workers);

  // Aggregate and return combined results
  return aggregateResults(results);
}
