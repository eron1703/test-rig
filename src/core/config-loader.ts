import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export async function loadConfig(projectPath: string): Promise<any> {
  const configPath = path.join(projectPath, 'test-rig.config.yaml');

  if (!await fs.pathExists(configPath)) {
    throw new Error('test-rig.config.yaml not found. Run "test-rig setup" first.');
  }

  const content = await fs.readFile(configPath, 'utf-8');
  return yaml.load(content);
}
