import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vitest-angular';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    // Voeg dit toe om ESM problemen te voorkomen:
    server: {
      deps: {
        inline: ['@analogjs/vitest-angular']
      }
    }
  },
  plugins: [angular()],
});