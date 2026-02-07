#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { isCI, isAutomatedEnvironment } from '../utils/environment.js';
import { setupCommand } from './commands/setup.js';
import { generateCommand } from './commands/generate.js';
import { runCommand } from './commands/run.js';
import { coverageCommand } from './commands/coverage.js';
import { analyzeCommand } from './commands/analyze.js';
import { doctorCommand } from './commands/doctor.js';
import { serveCommand } from './commands/serve.js';

// Store CI state globally for access by commands
export const cliConfig = {
  isCI: isCI(),
  headless: false
};

const program = new Command();

program
  .name('test-rig')
  .description('Multi-agent testing infrastructure for monoliths and microservices')
  .version('1.0.0')
  .option('--headless', 'Run in headless mode (no interactive prompts)', false)
  .option('--non-interactive', 'Alias for --headless', false);

// Hook to process global options before commands execute
program.hook('preAction', (thisCommand: any) => {
  const opts = thisCommand.opts();
  cliConfig.headless = opts.headless || opts.nonInteractive || isAutomatedEnvironment();
});

program
  .command('setup')
  .description('Initialize test infrastructure for current project')
  .option('-f, --framework <framework>', 'Test framework (vitest|pytest|auto)', 'auto')
  .option('-y, --yes', 'Skip prompts and use defaults', false)
  .option('--headless', 'Run in headless mode (no interactive prompts)', false)
  .option('--non-interactive', 'Alias for --headless', false)
  .action(setupCommand);

program
  .command('generate <component>')
  .description('Generate tests for a component')
  .option('-t, --type <type>', 'Test type (unit|integration|e2e|all)', 'all')
  .option('--spec-only', 'Generate spec file only', false)
  .option('--headless', 'Run in headless mode (no interactive prompts)', false)
  .option('--non-interactive', 'Alias for --headless', false)
  .action(generateCommand);

program
  .command('run [type]')
  .description('Run tests (unit|integration|e2e|all)')
  .option('-p, --parallel', 'Run tests in parallel (multi-agent)', false)
  .option('-a, --agents <count>', 'Number of parallel agents', '4')
  .option('-c, --component <name>', 'Run specific component tests')
  .option('-w, --watch', 'Watch mode', false)
  .option('--json', 'Output results as JSON (no spinners/colors)', false)
  .option('--headless', 'Run in headless mode (no interactive prompts)', false)
  .option('--non-interactive', 'Alias for --headless', false)
  .action(runCommand);

program
  .command('coverage')
  .description('Generate coverage report')
  .option('-o, --open', 'Open coverage report in browser', false)
  .action(coverageCommand);

program
  .command('analyze')
  .description('Analyze codebase for testability')
  .option('-v, --verbose', 'Verbose output', false)
  .action(analyzeCommand);

program
  .command('doctor')
  .description('Check test setup health')
  .option('-v, --verbose', 'Verbose output', false)
  .action(doctorCommand);

program
  .command('serve')
  .description('Start test-rig API server')
  .option('-p, --port <port>', 'Server port', '8080')
  .option('-h, --host <host>', 'Server host', '0.0.0.0')
  .action(serveCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
