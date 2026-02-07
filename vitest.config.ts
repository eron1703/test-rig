import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/templates/**', // Exclude template files from test runs
      '**/.{idea,git,cache,output,temp}/**'
    ]
  }
});
