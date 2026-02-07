import chalk from 'chalk';
import ora from 'ora';
import { checkHealth } from '../../core/health-checker.js';

interface DoctorOptions {
  verbose?: boolean;
}

export async function doctorCommand(options: DoctorOptions) {
  console.log(chalk.blue.bold('\n🏥 Running health checks\n'));

  const spinner = ora('Checking test setup...').start();

  try {
    const health = await checkHealth(process.cwd(), options.verbose || false);
    spinner.succeed('Health check complete');

    console.log(chalk.green.bold('\n✅ Health Status:\n'));

    health.checks.forEach((check: any) => {
      const icon = check.passed ? '✓' : '✗';
      const color = check.passed ? chalk.green : chalk.red;
      console.log(color(`${icon} ${check.name}`));
      if (!check.passed && check.message) {
        console.log(chalk.gray(`  ${check.message}`));
      }
    });

    console.log();

    if (!health.healthy) {
      process.exit(1);
    }

  } catch (error) {
    spinner.fail('Health check failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}
