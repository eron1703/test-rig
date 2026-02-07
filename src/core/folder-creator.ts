import fs from 'fs-extra';
import path from 'path';

export async function createFolderStructure(projectPath: string): Promise<void> {
  const folders = [
    'tests/specs',
    'tests/unit',
    'tests/integration',
    'tests/e2e',
    'tests/factories',
    'tests/fixtures',
    'tests/mocks',
    'tests/utils',
    'tests/seeds'
  ];

  for (const folder of folders) {
    await fs.ensureDir(path.join(projectPath, folder));
  }
}
