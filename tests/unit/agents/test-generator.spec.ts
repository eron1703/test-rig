import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTests } from '../../../src/agents/test-generator.js';
import type { ComponentAnalysis } from '../../../src/agents/test-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../temp-test-output');

describe('generateTests', () => {
  beforeEach(async () => {
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should generate unit test files from template', async () => {
    const analysis: ComponentAnalysis = {
      component: 'user-service',
      files: ['src/services/user-service.ts'],
      subcomponents: [
        {
          name: 'UserService',
          file: 'src/services/user-service.ts',
          type: 'service'
        }
      ]
    };

    const generatedFiles = await generateTests(analysis, tempDir);

    expect(generatedFiles).toContain(path.join(tempDir, 'tests/unit/user-service/UserService.spec.ts'));

    const unitTestPath = path.join(tempDir, 'tests/unit/user-service/UserService.spec.ts');
    expect(await fs.pathExists(unitTestPath)).toBe(true);

    const content = await fs.readFile(unitTestPath, 'utf-8');
    expect(content).toContain('describe(\'UserService\'');
    expect(content).toContain('import { UserService }');
  });

  it('should generate factory files', async () => {
    const analysis: ComponentAnalysis = {
      component: 'user-service',
      files: ['src/models/user.ts'],
      subcomponents: [
        {
          name: 'User',
          file: 'src/models/user.ts',
          type: 'model'
        }
      ]
    };

    const generatedFiles = await generateTests(analysis, tempDir);

    const factoryPath = path.join(tempDir, 'tests/factories/user-service-User.factory.ts');
    expect(generatedFiles).toContain(factoryPath);
    expect(await fs.pathExists(factoryPath)).toBe(true);

    const content = await fs.readFile(factoryPath, 'utf-8');
    expect(content).toContain('export function createUser');
    expect(content).toContain('faker');
  });

  it('should generate integration tests', async () => {
    const analysis: ComponentAnalysis = {
      component: 'payment-service',
      files: ['src/services/payment-service.ts'],
      subcomponents: [
        {
          name: 'PaymentService',
          file: 'src/services/payment-service.ts',
          type: 'service'
        }
      ]
    };

    const generatedFiles = await generateTests(analysis, tempDir);

    const integrationPath = path.join(tempDir, 'tests/integration/payment-service/PaymentService.integration.ts');
    expect(generatedFiles).toContain(integrationPath);
    expect(await fs.pathExists(integrationPath)).toBe(true);

    const content = await fs.readFile(integrationPath, 'utf-8');
    expect(content).toContain('describe(\'PaymentService Integration');
  });

  it('should replace placeholders correctly', async () => {
    const analysis: ComponentAnalysis = {
      component: 'auth-service',
      files: ['src/services/auth-service.ts'],
      subcomponents: [
        {
          name: 'AuthService',
          file: 'src/services/auth-service.ts',
          type: 'service'
        }
      ]
    };

    const generatedFiles = await generateTests(analysis, tempDir);

    const unitTestPath = path.join(tempDir, 'tests/unit/auth-service/AuthService.spec.ts');
    const content = await fs.readFile(unitTestPath, 'utf-8');

    // Should NOT contain template placeholders
    expect(content).not.toContain('UserService');
    expect(content).not.toContain('@/services/user-service');

    // Should contain actual component names
    expect(content).toContain('AuthService');
    expect(content).toContain('auth-service');
  });

  it('should create output directories if missing', async () => {
    const analysis: ComponentAnalysis = {
      component: 'new-component',
      files: ['src/new/component.ts'],
      subcomponents: [
        {
          name: 'NewComponent',
          file: 'src/new/component.ts',
          type: 'service'
        }
      ]
    };

    // Ensure directory doesn't exist
    const unitDir = path.join(tempDir, 'tests/unit/new-component');
    expect(await fs.pathExists(unitDir)).toBe(false);

    await generateTests(analysis, tempDir);

    // Directory should now exist
    expect(await fs.pathExists(unitDir)).toBe(true);
  });

  it('should handle multiple subcomponents', async () => {
    const analysis: ComponentAnalysis = {
      component: 'user-service',
      files: ['src/services/user-service.ts'],
      subcomponents: [
        {
          name: 'UserService',
          file: 'src/services/user-service.ts',
          type: 'service'
        },
        {
          name: 'UserRepository',
          file: 'src/repositories/user-repository.ts',
          type: 'repository'
        },
        {
          name: 'UserValidator',
          file: 'src/validators/user-validator.ts',
          type: 'validator'
        }
      ]
    };

    const generatedFiles = await generateTests(analysis, tempDir);

    // Should generate files for all subcomponents
    expect(generatedFiles.length).toBeGreaterThanOrEqual(9); // 3 subcomponents × 3 files each
    expect(generatedFiles.some(f => f.includes('UserService.spec.ts'))).toBe(true);
    expect(generatedFiles.some(f => f.includes('UserRepository.spec.ts'))).toBe(true);
    expect(generatedFiles.some(f => f.includes('UserValidator.spec.ts'))).toBe(true);
  });
});
