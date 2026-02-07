import fs from 'fs-extra';
import path from 'path';
import { globby } from 'globby';

export async function analyzeComponent(component: string, projectPath: string): Promise<any> {
  // Find component files
  const patterns = [
    `src/**/${component}/**/*.{ts,js,py}`,
    `src/${component}.{ts,js,py}`,
    `src/**/${component}.{ts,js,py}`
  ];

  const files = await globby(patterns, { cwd: projectPath });

  if (files.length === 0) {
    throw new Error(`Component "${component}" not found`);
  }

  // Simple analysis (TODO: enhance with AST parsing)
  const subcomponents: any[] = [];

  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    subcomponents.push({
      name: basename,
      file: path.join(projectPath, file),
      type: inferType(basename)
    });
  }

  return {
    component,
    files,
    subcomponents
  };
}

function inferType(name: string): string {
  if (name.includes('repository') || name.includes('repo')) return 'data-access';
  if (name.includes('service')) return 'business-logic';
  if (name.includes('controller')) return 'api';
  if (name.includes('validator')) return 'validation';
  return 'other';
}
