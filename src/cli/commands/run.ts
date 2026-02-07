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
  json?: boolean;
}

export async function runCommand(type: string = 'all', options: RunOptions) {
  // Auto-enable headless mode in CI/agent environments
  if (shouldAutoYes() && !options.headless && !options.nonInteractive) {
    if (!options.json) {
      console.log(chalk.gray('Auto-detected CI/agent environment, enabling headless mode\n'));
    }
    options.nonInteractive = true;
  }

  const isHeadless = options.headless || options.nonInteractive || cliConfig.headless || isAutomatedEnvironment();

  if (isHeadless && !options.json) {
    console.log(chalk.gray('[HEADLESS MODE]'));
  }

  if (!options.json) {
    console.log(chalk.blue.bold('\n🧪 Running tests\n'));
  }

  let spinner: any = null;
  if (!options.json) {
    spinner = ora('Loading configuration...').start();
  }

  try {
    const config = await loadConfig(process.cwd());
    if (spinner) {
      spinner.succeed('Configuration loaded');
    }

    const startTime = Date.now();

    // Run in parallel or sequential
    if (options.parallel) {
      const agentCount = parseInt(options.agents || '4');
      if (!options.json) {
        console.log(chalk.gray(`Using ${agentCount} parallel agents\n`));
        spinner.start('Spawning agents...');
      }

      const results = await runTestsParallel({
        config,
        type,
        agentCount,
        component: options.component,
        watch: options.watch
      });

      if (spinner) {
        spinner.stop();
      }

      const duration = Date.now() - startTime;

      // Output results
      if (options.json) {
        const output = {
          success: results.failed === 0,
          data: results,
          duration
        };
        console.log(JSON.stringify(output, null, 0));
      } else {
        // Display results
        console.log(chalk.green.bold('\n✅ Test results:\n'));
        console.log(chalk.gray(`Total: ${results.total}`));
        console.log(chalk.green(`Passed: ${results.passed}`));
        if (results.failed > 0) {
          console.log(chalk.red(`Failed: ${results.failed}`));
        }
        console.log(chalk.gray(`Duration: ${duration}ms\n`));
      }

      if (results.failed > 0) {
        process.exit(1);
      }
    } else {
      if (spinner) {
        spinner.start('Running tests...');
      }

      const results = await runTestsSequential({
        config,
        type,
        component: options.component,
        watch: options.watch
      });

      if (spinner) {
        spinner.stop();
      }

      const duration = Date.now() - startTime;

      // Output results
      if (options.json) {
        const output = {
          success: results.failed === 0,
          data: results,
          duration
        };
        console.log(JSON.stringify(output, null, 0));
      } else {
        // Display results
        console.log(chalk.green.bold('\n✅ Test results:\n'));
        console.log(chalk.gray(`Total: ${results.total}`));
        console.log(chalk.green(`Passed: ${results.passed}`));
        if (results.failed > 0) {
          console.log(chalk.red(`Failed: ${results.failed}`));
        }
        console.log(chalk.gray(`Duration: ${duration}ms\n`));
      }

      if (results.failed > 0) {
        process.exit(1);
      }
    }

  } catch (error) {
    if (spinner) {
      spinner.fail('Test run failed');
    }
    if (options.json) {
      const output = {
        success: false,
        data: null,
        duration: Date.now() - (performance.now() - Date.now()),
        error: (error as Error).message
      };
      console.log(JSON.stringify(output, null, 0));
    } else {
      console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    }
    process.exit(1);
  }
}
