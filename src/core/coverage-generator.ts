import fs from 'fs-extra';
import path from 'path';

export interface CoverageMetrics {
  pct: number;
  covered: number;
  total: number;
}

export interface FileCoverage {
  path: string;
  lines: CoverageMetrics;
  statements: CoverageMetrics;
  functions: CoverageMetrics;
  branches: CoverageMetrics;
}

export interface CoverageReport {
  lines: CoverageMetrics;
  branches: CoverageMetrics;
  functions: CoverageMetrics;
  statements: CoverageMetrics;
  htmlPath?: string;
  files?: FileCoverage[];
}

export async function parseVitestCoverage(coveragePath: string): Promise<CoverageReport> {
  const coverageData = await fs.readFile(coveragePath, 'utf-8');
  const data = JSON.parse(coverageData);

  const report: CoverageReport = {
    lines: data.total.lines,
    branches: data.total.branches,
    functions: data.total.functions,
    statements: data.total.statements,
    files: []
  };

  // Parse file-level coverage
  for (const [filePath, fileCoverage] of Object.entries(data)) {
    if (filePath === 'total') continue;

    const coverage = fileCoverage as any;
    report.files!.push({
      path: filePath,
      lines: coverage.lines,
      statements: coverage.statements,
      functions: coverage.functions,
      branches: coverage.branches
    });
  }

  return report;
}

export async function parsePytestCoverage(coveragePath: string): Promise<CoverageReport> {
  const coverageData = await fs.readFile(coveragePath, 'utf-8');
  const data = JSON.parse(coverageData);

  // Map Python coverage format to standard format
  const totals = data.totals;

  const report: CoverageReport = {
    lines: {
      pct: totals.percent_covered,
      covered: totals.covered_lines,
      total: totals.num_statements
    },
    statements: {
      pct: totals.percent_covered,
      covered: totals.covered_lines,
      total: totals.num_statements
    },
    functions: {
      pct: totals.percent_covered, // Python doesn't track functions separately
      covered: totals.covered_lines,
      total: totals.num_statements
    },
    branches: {
      pct: (totals.covered_branches / totals.num_branches) * 100,
      covered: totals.covered_branches,
      total: totals.num_branches
    },
    files: []
  };

  // Parse file-level coverage
  for (const [filePath, fileCoverage] of Object.entries(data.files || {})) {
    const coverage = fileCoverage as any;
    const summary = coverage.summary;

    report.files!.push({
      path: filePath,
      lines: {
        pct: summary.percent_covered,
        covered: summary.covered_lines,
        total: summary.num_statements
      },
      statements: {
        pct: summary.percent_covered,
        covered: summary.covered_lines,
        total: summary.num_statements
      },
      functions: {
        pct: summary.percent_covered,
        covered: summary.covered_lines,
        total: summary.num_statements
      },
      branches: {
        pct: summary.percent_covered,
        covered: summary.covered_lines,
        total: summary.num_statements
      }
    });
  }

  return report;
}

export async function generateCoverageReport(projectPath: string): Promise<CoverageReport> {
  // Try to detect framework and coverage file
  const vitestCoveragePath = path.join(projectPath, 'coverage/coverage-summary.json');
  const pytestCoveragePath = path.join(projectPath, 'coverage.json');

  if (await fs.pathExists(vitestCoveragePath)) {
    return parseVitestCoverage(vitestCoveragePath);
  } else if (await fs.pathExists(pytestCoveragePath)) {
    return parsePytestCoverage(pytestCoveragePath);
  }

  // No coverage file found, return empty report
  return {
    lines: { pct: 0, covered: 0, total: 0 },
    branches: { pct: 0, covered: 0, total: 0 },
    functions: { pct: 0, covered: 0, total: 0 },
    statements: { pct: 0, covered: 0, total: 0 },
    htmlPath: ''
  };
}
