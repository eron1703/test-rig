import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export async function generateConfig(projectPath: string, options: any): Promise<void> {
  const config = {
    framework: options.framework,
    parallel_agents: options.parallelAgents,
    containers: options.containers,
    coverage_threshold: {
      unit: 80,
      integration: 60
    }
  };

  const configPath = path.join(projectPath, 'test-rig.config.yaml');
  await fs.writeFile(configPath, yaml.dump(config));
}
