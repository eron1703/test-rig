import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export async function generateComponentSpec(component: string, analysis: any): Promise<string> {
  const spec = {
    component: {
      name: component,
      type: 'service',
      location: `src/${component}`
    },
    subcomponents: analysis.subcomponents.map((sub: any) => ({
      name: sub.name,
      type: sub.type,
      file: sub.file,
      dependencies: [],
      test_file: `tests/unit/${component}/${sub.name}.spec.ts`
    }))
  };

  const specPath = path.join(process.cwd(), `tests/specs/${component}.spec.yaml`);
  await fs.ensureDir(path.dirname(specPath));
  await fs.writeFile(specPath, yaml.dump(spec));

  return specPath;
}
