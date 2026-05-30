import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

// Inlined from @mister-guiiug/dev-wpa-config/vitest-base — the published
// package's subpath exports weren't reliably resolvable on CI, so the
// family keeps the base options local to avoid that build-blocking dep.
const baseTestOptions = {
  environment: 'jsdom' as const,
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
  include: ['src/**/*.{test,spec}.{ts,tsx}'],
  passWithNoTests: true,
  coverage: {
    provider: 'v8' as const,
    // The pure dice domain (random draw, pip layout, colour mapping,
    // roll schedule) is where a regression is most dangerous and most
    // cheaply tested. UI surface is intentionally excluded so the gate
    // stays meaningful rather than diluted.
    include: ['src/dice/**'],
    reporter: ['text', 'html'],
    thresholds: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // vite-plugin-pwa injects this virtual module at dev/build time.
      // vitest never runs the plugin, so anything importing register-sw.ts
      // would fail to resolve it. Point it at a tiny stub.
      'virtual:pwa-register': resolve(
        __dirname,
        'src/test/stub-pwa-register.ts'
      ),
    },
  },
  test: baseTestOptions,
});
