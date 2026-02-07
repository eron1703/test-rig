import fs from 'fs-extra';
import path from 'path';

export async function checkHealth(projectPath: string, verbose: boolean): Promise<any> {
  const checks = [];

  // Check if config exists
  const hasConfig = await fs.pathExists(path.join(projectPath, 'test-rig.config.yaml'));
  checks.push({
    name: 'Configuration file',
    passed: hasConfig,
    message: hasConfig ? '' : 'Run "test-rig setup" to create config'
  });

  // Check if tests folder exists
  const hasTests = await fs.pathExists(path.join(projectPath, 'tests'));
  checks.push({
    name: 'Tests folder',
    passed: hasTests,
    message: hasTests ? '' : 'Tests folder not found'
  });

  const healthy = checks.every(c => c.passed);

  return { healthy, checks };
}
