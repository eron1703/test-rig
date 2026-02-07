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
  template = template.replace(/UserService/g, subcomponentName);
  template = template.replace(/user-service/g, componentName);
  template = template.replace(/@\/services\/user-service/g, `@/${getComponentPath(subcomponentFile)}`);
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
  template = template.replace(/User/g, subcomponentName);
  template = template.replace(/user/g, subcomponentName.toLowerCase());

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
  template = template.replace(/UserService/g, subcomponentName);
  template = template.replace(/user-service/g, componentName);
  template = template.replace(/@\/services\/user-service/g, `@/${getComponentPath(subcomponentFile)}`);
  template = template.replace(/user\.factory/g, `${componentName}-${subcomponentName}.factory`);

  const outputPath = path.join(outputDir, `tests/integration/${componentName}/${subcomponentName}.integration.ts`);
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
  }

  return generatedFiles;
}
