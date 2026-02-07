import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { detectProjectType, ProjectType } from '../../core/project-detector.js';
import { installFramework } from '../../core/framework-installer.js';
import { createFolderStructure } from '../../core/folder-creator.js';
import { generateConfig } from '../../core/config-generator.js';

interface SetupOptions {
  framework?: string;
  yes?: boolean;
}

export async function setupCommand(options: SetupOptions) {
  console.log(chalk.blue.bold('\n🔧 Test-Rig Setup\n'));

  const spinner = ora('Detecting project type...').start();

  try {
    // Detect project
    const projectType = await detectProjectType(process.cwd());
    spinner.succeed(`Detected: ${projectType.name} (${projectType.tech})`);

    // Determine framework
    let framework = options.framework || 'auto';
    if (framework === 'auto') {
      framework = projectType.tech === 'python' ? 'pytest' : 'vitest';
    }

    // Confirm with user
    if (!options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'framework',
          message: 'Select test framework:',
          default: framework,
          choices: projectType.tech === 'python'
            ? ['pytest', 'unittest']
            : ['vitest', 'jest', 'mocha']
        },
        {
          type: 'number',
          name: 'agents',
          message: 'Number of parallel agents:',
          default: 4
        },
        {
          type: 'checkbox',
          name: 'containers',
          message: 'Select testcontainers:',
          choices: [
            { name: 'PostgreSQL', value: 'postgres', checked: true },
            { name: 'Redis', value: 'redis', checked: false },
            { name: 'ArangoDB', value: 'arangodb', checked: false },
            { name: 'MongoDB', value: 'mongodb', checked: false },
            { name: 'MySQL', value: 'mysql', checked: false }
          ]
        }
      ]);

      framework = answers.framework;
      projectType.parallelAgents = answers.agents;
      projectType.containers = answers.containers;
    }

    // Install framework
    spinner.start(`Installing ${framework}...`);
    await installFramework(framework, projectType.tech);
    spinner.succeed(`${framework} installed`);

    // Create folder structure
    spinner.start('Creating folder structure...');
    await createFolderStructure(process.cwd());
    spinner.succeed('Folder structure created');

    // Generate config
    spinner.start('Generating configuration...');
    await generateConfig(process.cwd(), {
      framework,
      projectType,
      parallelAgents: projectType.parallelAgents || 4,
      containers: projectType.containers || []
    });
    spinner.succeed('Configuration generated');

    console.log(chalk.green.bold('\n✅ Setup complete!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Generate tests: test-rig generate <component>'));
    console.log(chalk.gray('  2. Run tests: test-rig run'));
    console.log(chalk.gray('  3. Check coverage: test-rig coverage\n'));

  } catch (error) {
    spinner.fail('Setup failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}\n`));
    process.exit(1);
  }
}
