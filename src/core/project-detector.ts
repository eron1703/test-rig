import fs from 'fs-extra';
import path from 'path';

export interface ProjectType {
  name: string;
  tech: 'node' | 'python' | 'mixed';
  type: 'monolith' | 'microservices';
  parallelAgents?: number;
  containers?: string[];
}

export async function detectProjectType(projectPath: string): Promise<ProjectType> {
  const hasPackageJson = await fs.pathExists(path.join(projectPath, 'package.json'));
  const hasRequirementsTxt = await fs.pathExists(path.join(projectPath, 'requirements.txt'));
  const hasPyprojectToml = await fs.pathExists(path.join(projectPath, 'pyproject.toml'));
  const hasDockerCompose = await fs.pathExists(path.join(projectPath, 'docker-compose.yml'));

  let tech: 'node' | 'python' | 'mixed';
  if (hasPackageJson && (hasRequirementsTxt || hasPyprojectToml)) {
    tech = 'mixed';
  } else if (hasPackageJson) {
    tech = 'node';
  } else if (hasRequirementsTxt || hasPyprojectToml) {
    tech = 'python';
  } else {
    throw new Error('Unable to detect project type');
  }

  // Determine if monolith or microservices
  let type: 'monolith' | 'microservices' = 'monolith';
  if (hasDockerCompose) {
    const composeContent = await fs.readFile(
      path.join(projectPath, 'docker-compose.yml'),
      'utf-8'
    );
    // Simple heuristic: if compose has multiple services, likely microservices
    const serviceCount = (composeContent.match(/^\s{2}\w+:/gm) || []).length;
    if (serviceCount > 3) {
      type = 'microservices';
    }
  }

  return {
    name: path.basename(projectPath),
    tech,
    type
  };
}
