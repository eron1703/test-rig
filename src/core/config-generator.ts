import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// Container port mappings
const CONTAINER_PORTS: Record<string, number> = {
  postgres: 5432,
  redis: 6379,
  arangodb: 8529,
  mongodb: 27017,
  mysql: 3306
};

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateConfig(projectPath: string, options: any): Promise<void> {
  // Transform containers array to include port information
  const containers = (options.containers || []).map((container: string) => {
    const port = CONTAINER_PORTS[container];
    return port ? `${container}:${port}` : container;
  });

  const config = {
    framework: options.framework,
    parallel_agents: options.parallelAgents,
    containers,
    coverage_threshold: {
      unit: 80,
      integration: 60
    }
  };

  const configPath = path.join(projectPath, 'test-rig.config.yaml');
  await fs.writeFile(configPath, yaml.dump(config));

  // Generate framework-specific configurations
  if (options.framework === 'playwright') {
    await generatePlaywrightConfig(projectPath, options);
  }
}

async function generatePlaywrightConfig(projectPath: string, options: any): Promise<void> {
  // Determine base URL - use provided option or environment variable or default
  const baseURL = options.baseURL || process.env.BASE_URL || 'http://localhost:3000';

  // Read the Playwright config template
  const templateDir = path.join(__dirname, '..', 'templates');
  const templatePath = path.join(templateDir, 'playwright.config.template.ts');
  
  let configContent = await fs.readFile(templatePath, 'utf-8');

  // Replace template placeholders for baseURL
  configContent = configContent.replace(
    /const baseURL = process\.env\.BASE_URL \|\| '[^']*'/,
    `const baseURL = '${baseURL}'`
  );

  // For CI/headless mode, ensure workers is set to 1
  if (process.env.CI || options.headless) {
    configContent = configContent.replace(
      /workers: isCI \? 1 : undefined,/,
      'workers: 1,'
    );
  }

  // Write the generated config to project root
  const configPath = path.join(projectPath, 'playwright.config.ts');
  await fs.writeFile(configPath, configContent);
}
