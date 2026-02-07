import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

// Container port mappings
const CONTAINER_PORTS: Record<string, number> = {
  postgres: 5432,
  redis: 6379,
  arangodb: 8529,
  mongodb: 27017,
  mysql: 3306
};

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
}
