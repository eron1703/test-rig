import { execa } from 'execa';

export async function installFramework(framework: string, tech: string): Promise<void> {
  if (tech === 'node') {
    if (framework === 'vitest') {
      await execa('npm', ['install', '-D', 'vitest', '@vitest/ui', '@faker-js/faker', 'testcontainers']);
    } else if (framework === 'jest') {
      await execa('npm', ['install', '-D', 'jest', '@types/jest', '@faker-js/faker', 'testcontainers']);
    } else if (framework === 'mocha') {
      await execa('npm', ['install', '-D', 'mocha', '@types/mocha', 'chai', '@types/chai'], { cwd: process.cwd() });
    }
  } else if (tech === 'python') {
    if (framework === 'pytest') {
      await execa('pip', ['install', 'pytest', 'pytest-cov', 'pytest-asyncio', 'faker', 'testcontainers']);
    }
  }
}
