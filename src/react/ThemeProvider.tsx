import type { ReactNode } from 'react';
import { ThemeProvider as DwcThemeProvider } from '@mister-guiiug/dev-pwa-config/react/theme-provider';
import {
  migrateLegacySettings,
  THEME_STORAGE_KEY,
} from '../settings/legacyMigration';
import { LOCALES } from '../i18n/messages';

/** Couleur de la barre système, par thème effectif. */
const THEME_COLOR = { light: '#f4f5fb', dark: '#0f1220' } as const;

// Le hook du socle lit `localStorage` à son montage : le pont depuis le blob
// de réglages doit être posé avant.
migrateLegacySettings(LOCALES);

/**
 * Le thème de l'app, bâti sur `react/theme-provider` du socle.
 *
 * CE QUI DISPARAÎT. `hooks/useTheme.ts` tenait à la main l'abonnement à
 * `matchMedia` (`useSyncExternalStore`), la résolution `auto → dark|light`, la
 * pose de `data-theme` et celle de `<meta name="theme-color">`. Les quatre
 * sont dans le paquet. Le hook y ajoute `style.colorScheme` sur `<html>`, que
 * la copie locale ne posait pas : formulaires, barres de défilement et
 * sélecteurs natifs suivent désormais le thème.
 *
 * POURQUOI LE FOURNISSEUR, ET PAS `useTheme` SEUL. `useTheme` porte son état
 * dans un `useState` LOCAL : deux appels, c'est deux états indépendants qui
 * écrivent tous deux `data-theme` sur `<html>`. Or il faut ici deux points
 * d'accès — `App` pour l'appliquer, `SettingsDrawer` pour en changer — et
 * l'ancien code s'en tirait parce que `settingsStore` était global. Monté ici,
 * le fournisseur rend cet état partagé : **un seul écrivain de `data-theme`
 * côté React**, l'IIFE anti-FOUC d'`index.html` étant l'autre, avant tout
 * rendu.
 *
 * NI `appId` NI `palette` : miss-dice a son propre jeu de tokens
 * (`styles/tokens.css`) et n'importe pas `components.css`. Sans palette, le
 * fournisseur ne peint aucune variable `--dwc-*` et ne charge pas le catalogue
 * des dix-sept thèmes — il ne sert qu'à unifier l'état et la barre système.
 *
 * ON RESTE SUR `defaultTheme: 'system'` (le défaut, donc non passé) — mais
 * pas pour la raison qui était écrite ici.
 *
 * Ce commentaire affirmait que `theme-boot` du socle ignore `defaultTheme`
 * quand rien n'est stocké, et que le correctif « n'est PAS dans la 3.26.0 ».
 * **C'est faux** : il y est depuis cette version (`resolveEmpty`, PR #98 du
 * socle), et il a été recopié ici depuis un brief erroné. Vérifiable en une
 * ligne — `themeBootSource({ defaultTheme: 'light' })` n'émet aucun
 * `prefers-color-scheme` dans le tarball 3.26.0.
 *
 * La vraie raison de rester sur `'system'` est plus simple : c'est ce que
 * miss-dice a toujours fait, et le script anti-FOUC comme React le résolvent
 * désormais de la même façon. Rien à changer, donc rien à risquer.
 *
 * `legacyKeys` N'EST PAS PASSÉ, et ce n'est pas un oubli : l'option relit
 * d'anciennes clés portant chacune une chaîne nue, alors que l'ancien thème de
 * miss-dice est un CHAMP dans le blob JSON `miss-dice:settings`. Elle serait
 * inopérante. C'est `migrateLegacySettings` qui fait le pont.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <DwcThemeProvider
      storageKey={THEME_STORAGE_KEY}
      themeColor={THEME_COLOR}
      // Sans palette il n'y a rien à peindre ; explicite, pour que l'absence
      // se lise comme un choix.
      paint={false}
    >
      {children}
    </DwcThemeProvider>
  );
}
