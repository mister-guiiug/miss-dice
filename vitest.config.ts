import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import {
  baseTestOptions,
  coveragePreset,
} from '@mister-guiiug/dev-pwa-config/vitest-base';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // vite-plugin-pwa n'injecte ce module virtuel qu'au dev/build : vitest
      // ne lance jamais le plugin, et tout module qui l'importe échouerait à
      // la RÉSOLUTION. Il faut donc un vrai fichier, désigné ici.
      //
      // C'était un stub MAISON et MUET (`src/test/stub-pwa-register.ts`, l'un
      // des douze du parc). Le socle en publie un PILOTABLE : `swStub` rejoue
      // ce qu'un vrai worker fait quand une version attend, et LÈVE si
      // personne n'a injecté `registerSW` — un bandeau incapable de
      // s'afficher fait donc rougir le test au lieu de passer inaperçu.
      'virtual:pwa-register': fileURLToPath(
        import.meta
          .resolve('@mister-guiiug/dev-pwa-config/testing/pwa-register')
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
