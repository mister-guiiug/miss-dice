/**
 * La PALETTE : le second axe du thème.
 *
 * POURQUOI UN SECOND AXE, ET PAS UNE LISTE DE THÈMES. La tentation est
 * d'aligner « clair / sombre / feutrine / braise » dans un seul sélecteur -
 * jusqu'à ce qu'on se demande ce que devient `auto`. Une palette n'est pas un
 * schéma : « feutrine » existe en clair comme en sombre, et l'utilisateur qui
 * suit son système veut que feutrine suive aussi. Les deux réglages sont donc
 * orthogonaux, et chaque palette porte SES deux variantes
 * (`../styles/tokens.css`).
 *
 * POURQUOI UNE CLÉ À ELLE, HORS DU BLOB DE RÉGLAGES. Même raison que le thème
 * et la langue, qui en sont sortis : le script de pré-peinture d'`index.html`
 * doit la lire AVANT le premier rendu, sans parser un JSON de dix champs. Une
 * clé nue se lit en une ligne, et une valeur inconnue retombe sur le défaut.
 *
 * CE N'EST PAS LE CATALOGUE DU SOCLE. `react/theme-provider` sait peindre
 * dix-sept palettes de famille sur les `--dwc-*` ; miss-dice a ses propres
 * jetons et monte le fournisseur avec `paint={false}` (cf.
 * `../react/ThemeProvider.tsx`). Adopter le catalogue voudrait dire remapper
 * `tokens.css` en entier - une refonte, pas deux palettes de plus.
 */
import { createStore, useStore } from '../store/createStore';

/** Les palettes servies. `violet` est celle d'origine, donc le défaut. */
export const PALETTES = ['violet', 'feutrine', 'braise'] as const;

export type Palette = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: Palette = 'violet';

/** Clé nue, lue par le script de pré-peinture (cf. en-tête). */
export const PALETTE_STORAGE_KEY = 'miss-dice_palette';

/** Attribut posé sur `<html>`, sur lequel `tokens.css` branche ses blocs. */
export const PALETTE_ATTRIBUTE = 'data-palette';

/**
 * Le fond de chaque palette, par schéma - c'est-à-dire la couleur de la barre
 * système (`<meta name="theme-color">`).
 *
 * Ces six valeurs DOUBLENT `--bg` de `tokens.css`, et il n'y a pas moyen de
 * faire autrement : la balise se pose avant qu'une feuille de style existe,
 * et `getComputedStyle` au démarrage coûterait un reflow pour lire ce que le
 * build connaît déjà. Le test `palette.test.ts` les compare au fichier CSS
 * pour que la copie ne dérive pas de l'original.
 */
export const PALETTE_THEME_COLOR: Record<
  Palette,
  { light: string; dark: string }
> = {
  violet: { light: '#f4f5fb', dark: '#0f1220' },
  feutrine: { light: '#f1f7f3', dark: '#0d1a14' },
  braise: { light: '#fdf5f0', dark: '#1a110d' },
};

/** Une valeur venue du stockage n'est une palette que si on la sert. */
export function estUnePalette(value: unknown): value is Palette {
  return (PALETTES as readonly unknown[]).includes(value);
}

function lirePalette(): Palette {
  try {
    const brut = globalThis.localStorage?.getItem(PALETTE_STORAGE_KEY);
    return estUnePalette(brut) ? brut : DEFAULT_PALETTE;
  } catch {
    // Navigation privée, stockage bloqué : la palette d'origine fait l'affaire.
    return DEFAULT_PALETTE;
  }
}

export const paletteStore = createStore<Palette>(lirePalette(), palette => {
  try {
    globalThis.localStorage?.setItem(PALETTE_STORAGE_KEY, palette);
  } catch {
    /* stockage refusé : le choix vaut pour la session, et c'est déjà ça */
  }
});

/** Pose l'attribut sur `<html>`. Le script de pré-peinture fait de même. */
export function appliquerPalette(palette: Palette): void {
  globalThis.document?.documentElement.setAttribute(PALETTE_ATTRIBUTE, palette);
}

export function setPalette(palette: Palette): void {
  paletteStore.set(palette);
}

/** Accès réactif à la palette choisie. */
export function usePalette(): Palette {
  return useStore(paletteStore);
}
