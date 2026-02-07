import chalk from 'chalk';
import ora from 'ora';
import { analyzeComponent } from '../../core/component-analyzer.js';
import { generateComponentSpec } from '../../core/spec-generator.js';
import { generateTests } from '../../agents/test-generator.js';
import { cliConfig } from '../index.js';
import { isAutomatedEnvironment, shouldAutoYes } from '../../utils/environment.js';

interface GenerateOptions {
  type?: string;
  specOnly?: boolean;
  headless?: boolean;
  nonInteractive?: boolean;
}

export async function generateCommand(component: string, options: GenerateOptions) {
  // Auto-enable headless mode in CI/agent environments
  if (shouldAutoYes() && !options.headless && !options.nonInteractive) {
    console.log(chalk.gray('Auto-detected CI/agent environment, enabling headless mode\n'));
    options.nonInteractive = true;
  }

  const isNonInteractive = options.headless || options.nonInteractive || cliConfig.headless || isAutomatedEnvironment();

  if (isNonInteractive) {
    console.log(chalk.gray('[HEADLESS MODE]'));
  }

  console.log(chalk.blue.bold(`\n🧪 Generating tests for ${component}\n`));

  const spinner = ora('Analyzing component...').start();

  try {
    // Analyze component code
    const analysis = await analyzeComponent(component, process.cwd());
    spinner.succeed(`Analyzed: ${analysis.subcomponents.length} sub-components found`);

    // Generate component spec
    spinner.start('Generating component spec...');
    const specPath = await generateComponentSpec(component, analysis);
    spinner.succeed(`Spec created: ${specPath}`);

    // Generate test files (unless spec-only)
    if (!options.specOnly) {
      spinner.start('Generating test files...');
      const testFiles = await generateTests(analysis);
      spinner.succeed(`Generated ${testFiles.length} test files`);

      console.log(chalk.green.bold('\n✅ Test generation complete!\n'));
      console.log(chalk.gray('Generated files:'));
      testFiles.forEach(file => {
        console.log(chalk.gray(`  - ${file}`));
      });
    } else {
      console.log(chalk.green.bold('\n✅ Spec generation complete!\n'));
    }

    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  1. Review generated tests'));
    console.log(chalk.gray('  2. Run tests: test-rig run'));
    console.log(chalk.gray(`  3. Run specific: test-rig run -c ${component}\n`));

  } catch (error) {
    spinner.fail('Generation failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}
