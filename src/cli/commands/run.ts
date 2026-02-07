import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../../core/config-loader.js';
import { runTestsSequential } from '../../core/test-runner.js';
import { runTestsParallel } from '../../agents/orchestrator.js';
import { cliConfig } from '../index.js';
import { isAutomatedEnvironment, shouldAutoYes } from '../../utils/environment.js';

interface RunOptions {
  parallel?: boolean;
  agents?: string;
  component?: string;
  watch?: boolean;
  headless?: boolean;
  nonInteractive?: boolean;
}

export async function runCommand(type: string = 'all', options: RunOptions) {
  // Auto-enable headless mode in CI/agent environments
  if (shouldAutoYes() && !options.headless && !options.nonInteractive) {
    console.log(chalk.gray('Auto-detected CI/agent environment, enabling headless mode\n'));
    options.nonInteractive = true;
  }

  const isHeadless = options.headless || options.nonInteractive || cliConfig.headless || isAutomatedEnvironment();

  if (isHeadless) {
    console.log(chalk.gray('[HEADLESS MODE]'));
  }

  console.log(chalk.blue.bold('\n🧪 Running tests\n'));

  const spinner = ora('Loading configuration...').start();

  try {
    const config = await loadConfig(process.cwd());
    spinner.succeed('Configuration loaded');

    // Run in parallel or sequential
    if (options.parallel) {
      const agentCount = parseInt(options.agents || '4');
      console.log(chalk.gray(`Using ${agentCount} parallel agents\n`));

      spinner.start('Spawning agents...');
      const results = await runTestsParallel({
        config,
        type,
        agentCount,
        component: options.component,
        watch: options.watch
      });
      spinner.stop();

      // Display results
      console.log(chalk.green.bold('\n✅ Test results:\n'));
      console.log(chalk.gray(`Total: ${results.total}`));
      console.log(chalk.green(`Passed: ${results.passed}`));
      if (results.failed > 0) {
        console.log(chalk.red(`Failed: ${results.failed}`));
      }
      console.log(chalk.gray(`Duration: ${results.duration}ms\n`));

      if (results.failed > 0) {
        process.exit(1);
      }
    } else {
      spinner.start('Running tests...');
      const results = await runTestsSequential({
        config,
        type,
        component: options.component,
        watch: options.watch
      });
      spinner.stop();

      // Display results
      console.log(chalk.green.bold('\n✅ Test results:\n'));
      console.log(chalk.gray(`Total: ${results.total}`));
      console.log(chalk.green(`Passed: ${results.passed}`));
      if (results.failed > 0) {
        console.log(chalk.red(`Failed: ${results.failed}`));
      }
      console.log(chalk.gray(`Duration: ${results.duration}ms\n`));

      if (results.failed > 0) {
        process.exit(1);
      }
    }

  } catch (error) {
    spinner.fail('Test run failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}
