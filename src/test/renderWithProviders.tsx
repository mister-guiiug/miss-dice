import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { I18nProvider } from '../i18n/useI18n';
import type { Locale } from '../i18n/messages';
import { ThemeProvider } from '../react/ThemeProvider';
import { LOCALE_STORAGE_KEY } from '../settings/legacyMigration';

/**
 * Monte un composant sous la pile de fournisseurs de l'app, dans la langue
 * demandée — le même empilement que `main.tsx`, dans le même ordre.
 *
 * POURQUOI PASSER PAR `localStorage` POUR LA LANGUE. `createI18n` du socle
 * fixe la sienne à l'INITIALISATION de son état
 * (`useState(detectInitialLocale)`) : il n'existe pas de prop `locale` pour la
 * piloter de l'extérieur. Écrire la clé avant le montage est donc le seul
 * moyen d'ouvrir un arbre dans une langue donnée — et c'est fidèle à ce que
 * vit l'utilisateur, dont la langue est relue au démarrage.
 *
 * La clé est réécrite à chaque appel, donc jamais héritée d'un test précédent.
 */
export function renderWithProviders(
  ui: ReactElement,
  locale: Locale = 'fr'
): RenderResult {
  globalThis.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  return render(
    <ThemeProvider>
      <I18nProvider>{ui}</I18nProvider>
    </ThemeProvider>
  );
}
