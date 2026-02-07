import chalk from 'chalk';
import ora from 'ora';
import { generateCoverageReport } from '../../core/coverage-generator.js';

interface CoverageOptions {
  open?: boolean;
}

export async function coverageCommand(options: CoverageOptions) {
  console.log(chalk.blue.bold('\n📊 Generating coverage report\n'));

  const spinner = ora('Running tests with coverage...').start();

  try {
    const report = await generateCoverageReport(process.cwd());
    spinner.succeed('Coverage report generated');

    console.log(chalk.green.bold('\n✅ Coverage Summary:\n'));
    console.log(chalk.gray(`Lines: ${report.lines.pct}%`));
    console.log(chalk.gray(`Branches: ${report.branches.pct}%`));
    console.log(chalk.gray(`Functions: ${report.functions.pct}%`));
    console.log(chalk.gray(`Statements: ${report.statements.pct}%\n`));

    console.log(chalk.gray(`Report: ${report.htmlPath}\n`));

    if (options.open) {
      console.log(chalk.gray('To open: open ' + report.htmlPath + '\n'));
    }

  } catch (error) {
    spinner.fail('Coverage generation failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}
