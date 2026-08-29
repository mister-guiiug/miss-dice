import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import {
  baseTestOptions,
  coveragePreset,
} from '@mister-guiiug/dev-wpa-config/vitest-base';

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
  test: {
    ...baseTestOptions,
    coverage: {
      ...coveragePreset,
      // Le .d.ts du preset élargit `provider` à `string` ; on le re-fixe au
      // littéral attendu par Vitest (contextuellement contraint à 'v8').
      provider: 'v8',
      // The pure domains (dice draw/layout/colours/schedule + the Yahtzee
      // and 421 game engines) are where a regression is most dangerous and
      // most cheaply tested. UI surface is intentionally excluded so the
      // gate stays meaningful rather than diluted.
      include: [
        'src/dice/**',
        'src/games/**',
        'src/decide/**',
        'src/log/**',
        'src/a11y/**',
        'src/store/createStore.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
