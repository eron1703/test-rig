import { execa } from 'execa';

export interface TestFailure {
  name: string;
  message: string;
  stack?: string;
  file?: string;
}

export interface TestResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: TestFailure[];
}

export function parseVitestResults(jsonOutput: string): TestResult {
  const data = JSON.parse(jsonOutput);

  const failures: TestFailure[] = [];

  // Extract failures from test results
  if (data.testResults) {
    for (const testFile of data.testResults) {
      if (testFile.assertionResults) {
        for (const assertion of testFile.assertionResults) {
          if (assertion.status === 'failed') {
            const failureMessage = assertion.failureMessages?.join('\n') || 'Test failed';
            failures.push({
              name: assertion.fullName || assertion.title,
              message: failureMessage,
              stack: failureMessage.includes('\n') ? failureMessage : undefined,
              file: testFile.name
            });
          }
        }
      }
    }
  }

  // Calculate duration from timestamps or sum of test durations
  let duration = 0;
  if (data.testResults && data.testResults.length > 0) {
    const firstStart = data.testResults[0].startTime;
    const lastEnd = data.testResults[data.testResults.length - 1].endTime;
    if (firstStart && lastEnd) {
      duration = lastEnd - firstStart;
    }
  }

  return {
    total: data.numTotalTests || 0,
    passed: data.numPassedTests || 0,
    failed: data.numFailedTests || 0,
    skipped: data.numPendingTests || 0,
    duration,
    failures
  };
}

export function parsePytestResults(jsonOutput: string): TestResult {
  const data = JSON.parse(jsonOutput);

  const failures: TestFailure[] = [];

  // Extract failures from test results
  if (data.tests) {
    for (const test of data.tests) {
      if (test.outcome === 'failed') {
        const failureMessage = test.call?.longrepr || 'Test failed';
        failures.push({
          name: test.nodeid,
          message: failureMessage,
          stack: failureMessage.includes('\n') ? failureMessage : undefined,
          file: test.nodeid.split('::')[0]
        });
      }
    }
  }

  return {
    total: data.summary?.total || 0,
    passed: data.summary?.passed || 0,
    failed: data.summary?.failed || 0,
    skipped: data.summary?.skipped || 0,
    duration: data.duration || 0,
    failures
  };
}

export async function runTestsSequential(options: any): Promise<TestResult> {
  const framework = options.config.framework;

  try {
    if (framework === 'vitest') {
      const result = await execa('npx', ['vitest', 'run', '--reporter=json'], {
        cwd: process.cwd()
      });
      return parseVitestResults(result.stdout);
    } else if (framework === 'pytest') {
      const result = await execa('pytest', ['--json-report', '--json-report-file=/tmp/pytest-report.json'], {
        cwd: process.cwd()
      });

      // Read the JSON report file
      const fs = await import('fs-extra');
      const reportContent = await fs.readFile('/tmp/pytest-report.json', 'utf-8');
      return parsePytestResults(reportContent);
    }
  } catch (error: any) {
    // Tests may fail, but we still want to parse the results
    if (error.stdout && framework === 'vitest') {
      return parseVitestResults(error.stdout);
    }

    // For pytest, check if report file was generated
    if (framework === 'pytest') {
      try {
        const fs = await import('fs-extra');
        const reportContent = await fs.readFile('/tmp/pytest-report.json', 'utf-8');
        return parsePytestResults(reportContent);
      } catch {
        // Report file not found, re-throw original error
        throw error;
      }
    }

    throw error;
  }

  // Fallback for unknown framework
  return {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    failures: []
  };
}
