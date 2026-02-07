import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ComponentAnalysis {
  component: string;
  files: string[];
  subcomponents: Array<{
    name: string;
    file: string;
    type: string;
  }>;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function getComponentPath(file: string): string {
  // Extract path from src/services/user-service.ts -> services/user-service
  const match = file.match(/src\/(.+)\.ts$/);
  return match ? match[1] : file;
}

async function renderUnitTestTemplate(
  componentName: string,
  subcomponentName: string,
  subcomponentFile: string,
  outputDir: string
): Promise<string> {
  const templatePath = path.join(__dirname, '../templates/test-template.spec.ts');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Replace placeholders
  const pascalComponentName = toPascalCase(componentName);
  const pascalSubcomponentName = toPascalCase(subcomponentName);

  // Replace class names (PascalCase)
  template = template.replace(/UserService/g, pascalSubcomponentName);

  // Replace import paths (must come before factory replacements)
  template = template.replace(/@\/services\/user-service/g, `@/${getComponentPath(subcomponentFile)}`);

  // Replace in describe() calls (not in paths)
  template = template.replace(/describe\('UserService'/g, `describe('${pascalSubcomponentName}'`);

  // Replace factory references
  template = template.replace(/user\.factory/g, `${componentName}-${subcomponentName}.factory`);

  const outputPath = path.join(outputDir, `tests/unit/${componentName}/${subcomponentName}.spec.ts`);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, template);

  return outputPath;
}

async function renderFactoryTemplate(
  componentName: string,
  subcomponentName: string,
  outputDir: string
): Promise<string> {
  const templatePath = path.join(__dirname, '../templates/factory-template.ts');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Replace placeholders - simplified factory
  const pascalSubcomponentName = toPascalCase(subcomponentName);
  const lowerSubcomponentName = subcomponentName.toLowerCase().replace(/-/g, '');

  template = template.replace(/User/g, pascalSubcomponentName);
  template = template.replace(/user/g, lowerSubcomponentName);

  const outputPath = path.join(outputDir, `tests/factories/${componentName}-${subcomponentName}.factory.ts`);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, template);

  return outputPath;
}

async function renderIntegrationTestTemplate(
  componentName: string,
  subcomponentName: string,
  subcomponentFile: string,
  outputDir: string
): Promise<string> {
  const templatePath = path.join(__dirname, '../templates/test-template.integration.ts');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Replace placeholders
  const pascalComponentName = toPascalCase(componentName);
  const pascalSubcomponentName = toPascalCase(subcomponentName);

  // Replace class names (PascalCase)
  template = template.replace(/UserService/g, pascalSubcomponentName);

  // Replace import paths (must come before factory replacements)
  template = template.replace(/@\/services\/user-service/g, `@/${getComponentPath(subcomponentFile)}`);

  // Replace in describe() calls (not in paths)
  template = template.replace(/describe\('UserService/g, `describe('${pascalSubcomponentName}`);

  // Replace factory references
  template = template.replace(/user\.factory/g, `${componentName}-${subcomponentName}.factory`);

  const outputPath = path.join(outputDir, `tests/integration/${componentName}/${subcomponentName}.integration.ts`);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, template);

  return outputPath;
}

async function renderE2ETestTemplate(
  component: string,
  subcomponent: { name: string; file: string; type: string },
  outputDir: string
): Promise<string> {
  const templatePath = path.join(__dirname, '../templates/test-template.e2e.ts');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Replace placeholders
  const pascalComponentName = toPascalCase(component);
  const pascalSubcomponentName = toPascalCase(subcomponent.name);

  // Replace class names (PascalCase)
  template = template.replace(/UserService/g, pascalSubcomponentName);

  // Replace import paths (must come before factory replacements)
  template = template.replace(/@\/services\/user-service/g, `@/${getComponentPath(subcomponent.file)}`);

  // Replace in describe() calls (not in paths)
  template = template.replace(/test\.describe\('UserService/g, `test.describe('${pascalSubcomponentName}`);

  // Replace factory references
  template = template.replace(/user\.factory/g, `${component}-${subcomponent.name}.factory`);

  const outputPath = path.join(outputDir, `tests/e2e/${component}/${subcomponent.name}.e2e.ts`);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, template);

  return outputPath;
}

export async function generateTests(
  analysis: ComponentAnalysis,
  outputDir: string = process.cwd()
): Promise<string[]> {
  const generatedFiles: string[] = [];

  for (const subcomponent of analysis.subcomponents) {
    // Generate factory
    const factoryPath = await renderFactoryTemplate(
      analysis.component,
      subcomponent.name,
      outputDir
    );
    generatedFiles.push(factoryPath);

    // Generate unit test
    const unitTestPath = await renderUnitTestTemplate(
      analysis.component,
      subcomponent.name,
      subcomponent.file,
      outputDir
    );
    generatedFiles.push(unitTestPath);

    // Generate integration test
    const integrationTestPath = await renderIntegrationTestTemplate(
      analysis.component,
      subcomponent.name,
      subcomponent.file,
      outputDir
    );
    generatedFiles.push(integrationTestPath);

    // Generate E2E test
    const e2eTestPath = await renderE2ETestTemplate(
      analysis.component,
      subcomponent,
      outputDir
    );
    generatedFiles.push(e2eTestPath);
  }

  return generatedFiles;
}
