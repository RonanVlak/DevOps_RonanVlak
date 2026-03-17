import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    // Dit helpt om ESM/CJS mismatches te voorkomen
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: ['@angular/core', '@angular/common', 'zone.js']
        }
      }
    }
  },
});