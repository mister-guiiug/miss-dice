import { useEffect, type ReactNode } from 'react';
import { ThemeProvider as DwcThemeProvider } from '@mister-guiiug/dev-pwa-config/react/theme-provider';
import {
  migrateLegacySettings,
  THEME_STORAGE_KEY,
} from '../settings/legacyMigration';
import {
  appliquerPalette,
  PALETTE_THEME_COLOR,
  usePalette,
  type Palette,
} from '../settings/palette';
import { useAppTheme } from './hooks/useTheme';
import { LOCALES } from '../i18n/messages';

// Le hook du socle lit `localStorage` à son montage : le pont depuis le blob
// de réglages doit être posé avant.
migrateLegacySettings(LOCALES);

/**
 * La barre système, tenue sur les DEUX axes.
 *
 * LE FOURNISSEUR DU SOCLE NE REPEINT QU'AU CHANGEMENT DE THÈME. Il reçoit
 * bien `themeColor` à jour, mais son effet ne se rejoue pas quand SEULE la
 * palette change : mesuré dans le navigateur le 22/09/2026, passer de violet à
 * feutrine virait tous les jetons au vert en laissant `#0f1220` dans la
 * balise - le bandeau du navigateur restait violet sur une app verte.
 *
 * Ce composant vit SOUS le fournisseur, faute de quoi il ne pourrait pas lire
 * le thème résolu. Il n'entre pas en concurrence avec lui : les deux écrivent
 * la même valeur, tirée de la même table, et celui-ci couvre simplement le cas
 * que l'autre ne voit pas.
 */
function BarreSysteme({ palette }: { palette: Palette }) {
  const { resolved } = useAppTheme();
  useEffect(() => {
    const meta = globalThis.document?.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', PALETTE_THEME_COLOR[palette][resolved]);
  }, [palette, resolved]);
  return null;
}

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
 * d'accès - `App` pour l'appliquer, `SettingsDrawer` pour en changer - et
 * l'ancien code s'en tirait parce que `settingsStore` était global. Monté ici,
 * le fournisseur rend cet état partagé : **un seul écrivain de `data-theme`
 * côté React**, l'IIFE anti-FOUC d'`index.html` étant l'autre, avant tout
 * rendu.
 *
 * NI `appId` NI `palette` : miss-dice a son propre jeu de tokens
 * (`styles/tokens.css`) et n'importe pas `components.css`. Sans palette, le
 * fournisseur ne peint aucune variable `--dwc-*` et ne charge pas le catalogue
 * des dix-sept thèmes - il ne sert qu'à unifier l'état et la barre système.
 *
 * ⚠️ `palette` DÉSIGNE ICI LA PROP DU SOCLE, pas les palettes de l'app. Depuis
 * le 22/09/2026, miss-dice en a trois à lui (`../settings/palette.ts`), posées
 * en `data-palette` et servies par ses propres blocs de `tokens.css`. Ce sont
 * deux mécanismes distincts, et ne pas passer la prop reste le bon choix : le
 * catalogue du socle peint des `--dwc-*` que ce fichier branche déjà à la
 * main, dans les deux sens du thème.
 *
 * ON RESTE SUR `defaultTheme: 'system'` (le défaut, donc non passé) - mais
 * pas pour la raison qui était écrite ici.
 *
 * Ce commentaire affirmait que `theme-boot` du socle ignore `defaultTheme`
 * quand rien n'est stocké, et que le correctif « n'est PAS dans la 3.26.0 ».
 * **C'est faux** : il y est depuis cette version (`resolveEmpty`, PR #98 du
 * socle), et il a été recopié ici depuis un brief erroné. Vérifiable en une
 * ligne - `themeBootSource({ defaultTheme: 'light' })` n'émet aucun
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
  /*
   * LA PALETTE PASSE PAR ICI, alors que le fournisseur du socle n'en sait
   * rien. `data-palette` doit suivre le choix de l'utilisateur, et c'est le
   * seul composant monté une fois pour toute l'app. Le script de pré-peinture
   * a posé l'attribut avant le premier rendu ; cet effet le tient à jour
   * ensuite, sans jamais devenir un second écrivain concurrent.
   */
  const palette = usePalette();
  useEffect(() => {
    appliquerPalette(palette);
  }, [palette]);

  return (
    <DwcThemeProvider
      storageKey={THEME_STORAGE_KEY}
      themeColor={PALETTE_THEME_COLOR[palette]}
      // Sans palette il n'y a rien à peindre ; explicite, pour que l'absence
      // se lise comme un choix.
      paint={false}
    >
      <BarreSysteme palette={palette} />
      {children}
    </DwcThemeProvider>
  );
}
