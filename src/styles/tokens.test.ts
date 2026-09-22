import { describe, expect, it } from 'vitest';
import tokensCss from './tokens.css?raw';
import stylesCss from './styles.css?raw';
import indexHtml from '../../index.html?raw';
import {
  PALETTES,
  PALETTE_THEME_COLOR,
  type Palette,
} from '../settings/palette';

/**
 * LES CONTRASTES SONT RECALCULÉS DEPUIS LA FEUILLE, PAS RELUS DANS UN COMMENTAIRE.
 *
 * `tokens.css` documente en clair les rapports que chaque thème tient - « 5,15
 * sous du blanc », « 3,06 sur bg-elevated ». Un commentaire ne garde rien : la
 * teinte qu'on éclaircit d'un cran « pour voir » laisse le chiffre d'hier à
 * côté d'une couleur d'aujourd'hui, et personne ne le remarque avant qu'un
 * libellé devienne illisible sur un vrai téléphone.
 *
 * Ce test lit le FICHIER (`?raw`, résolu à la compilation par Vite) et refait
 * l'arithmétique WCAG. Il couvre les six blocs - les deux d'origine compris :
 * une palette ajoutée ne doit pas être tenue à une barre que la palette
 * historique ne tiendrait pas elle-même.
 *
 * LES SEUILS, ET D'OÙ ILS VIENNENT :
 *  - texte sur fond >= 7 : c'est ce que les deux thèmes d'origine tiennent
 *    déjà (17,08 et 15,76), donc la barre est là ;
 *  - `--muted` >= 4,5 sur le fond (WCAG AA, texte de 16 px) et >= 3 sur la
 *    surface, où il sert aussi de `--dwc-border-strong` ;
 *  - `--accent-strong` >= 4,5 sous `--accent-contrast` : c'est l'accent QUI
 *    PORTE DU TEXTE, et 4,5 est le minimum d'un libellé ;
 *  - `--accent-strong` >= 3 sur `--bg-elevated` : WCAG 1.4.11, un contrôle
 *    doit se distinguer de son fond. `--bg-elevated` et non `--surface` :
 *    c'est le fond du bandeau où le bouton se pose ;
 *  - `--accent` >= 3 sur le fond : il sert de repère visuel, pas de texte.
 */

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const canal = (i: number) => {
    const c = Number.parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

function contraste(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  const [haut, bas] = x > y ? [x, y] : [y, x];
  return (haut + 0.05) / (bas + 0.05);
}

/**
 * Les blocs de thème de la feuille : sélecteur → jetons déclarés.
 *
 * LES COMMENTAIRES SAUTENT D'ABORD, et ce n'est pas cosmétique : le sélecteur
 * se capture comme « ce qui précède l'accolade », donc sans ce nettoyage il
 * emporte le commentaire qui introduit le bloc - et aucune clé ne ressemble
 * plus à un sélecteur CSS.
 */
function blocsDeTheme(): Map<string, Map<string, string>> {
  const blocs = new Map<string, Map<string, string>>();
  const feuille = tokensCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const motif = /([^{}]*data-theme[^{}]*)\{([^}]*)\}/g;
  for (const [, selecteur, corps] of feuille.matchAll(motif)) {
    const jetons = new Map<string, string>();
    for (const [, nom, valeur] of corps!.matchAll(
      /(--[a-z-]+)\s*:\s*([^;]+);/g
    )) {
      jetons.set(nom!, valeur!.trim());
    }
    blocs.set(selecteur!.trim().replace(/\s+/g, ' '), jetons);
  }
  return blocs;
}

/** `var(--accent)` renvoie à un jeton du même bloc : on le remplace. */
function resolu(jetons: Map<string, string>, nom: string): string {
  const brut = jetons.get(nom) ?? '';
  const renvoi = /^var\((--[a-z-]+)\)$/.exec(brut);
  return renvoi ? (jetons.get(renvoi[1]!) ?? '') : brut;
}

const BLOCS = blocsDeTheme();

describe('tokens.css - contrastes', () => {
  it('déclare les six blocs de thème attendus', () => {
    // Deux blocs d'origine (le sombre porte aussi `:root` comme repli), plus
    // deux par palette ajoutée.
    expect(BLOCS.size).toBe(2 + 2 * (PALETTES.length - 1));
  });

  it.each([...BLOCS.keys()])('%s tient les six rapports WCAG', selecteur => {
    const j = BLOCS.get(selecteur)!;
    const bg = resolu(j, '--bg');
    const bgEleve = resolu(j, '--bg-elevated');
    const surface = resolu(j, '--surface');
    const accentStrong = resolu(j, '--accent-strong');

    expect(contraste(resolu(j, '--text'), bg)).toBeGreaterThanOrEqual(7);
    expect(contraste(resolu(j, '--muted'), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(resolu(j, '--muted'), surface)).toBeGreaterThanOrEqual(3);
    expect(
      contraste(accentStrong, resolu(j, '--accent-contrast'))
    ).toBeGreaterThanOrEqual(4.5);
    expect(contraste(accentStrong, bgEleve)).toBeGreaterThanOrEqual(3);
    expect(contraste(resolu(j, '--accent'), bg)).toBeGreaterThanOrEqual(3);
  });
});

/**
 * DEUX ACCENTS, ET UN SEUL PORTE DU TEXTE.
 *
 * `--accent` est le repère visuel : il lui suffit de 3:1 sur le fond. Dès
 * qu'on écrit DESSUS, c'est `--accent-strong` qu'il faut - il existe pour ça,
 * et `tokens.css` explique pourquoi (le violet d'origine ne donnait que 4,45:1
 * sous du blanc, sous le 4,5 de WCAG AA).
 *
 * La distinction n'avait été appliquée qu'à deux règles sur huit : six
 * boutons, pastilles et segments actifs peignaient encore du blanc sur
 * `--accent`. Invisible tant que la palette restait violette et que l'écart
 * tenait dans l'arrondi ; mesuré à 2,67:1 en braise, où l'accent est un orange
 * clair. La règle est donc vérifiée ici plutôt que confiée à la relecture.
 */
describe('styles.css - qui porte du texte porte accent-strong', () => {
  it('aucune règle ne pose --accent-contrast sur --accent', () => {
    const fautives: string[] = [];
    for (const [, selecteur, corps] of stylesCss
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      if (
        corps!.includes('color: var(--accent-contrast)') &&
        /background:\s*var\(--accent\)\s*;/.test(corps!)
      ) {
        fautives.push(selecteur!.trim().replace(/\s+/g, ' '));
      }
    }
    expect(fautives).toEqual([]);
  });
});

/**
 * LA TABLE DES FONDS EST UNE COPIE, ET UNE COPIE DÉRIVE.
 *
 * `PALETTE_THEME_COLOR` et la table `FONDS` du script de pré-peinture
 * (`index.html`) redisent `--bg` de chaque bloc, parce que la balise
 * `theme-color` se remplit avant qu'une feuille de style existe. Rien
 * n'empêche de retoucher le CSS en oubliant les deux autres - la barre système
 * garderait alors la couleur d'avant, sur un fond qui a changé.
 */
describe('tokens.css - la barre système suit les fonds', () => {
  it.each(PALETTES)('%s : les deux fonds correspondent au CSS', palette => {
    for (const schema of ['dark', 'light'] as const) {
      const selecteur =
        palette === 'violet'
          ? schema === 'dark'
            ? ":root, html[data-theme='dark']"
            : "html[data-theme='light']"
          : `html[data-palette='${palette}'][data-theme='${schema}']`;
      const jetons = BLOCS.get(selecteur);
      expect(jetons, `bloc absent : ${selecteur}`).toBeDefined();
      expect(resolu(jetons!, '--bg')).toBe(
        PALETTE_THEME_COLOR[palette as Palette][schema]
      );
    }
  });

  /*
   * LA TROISIÈME COPIE, celle qui dérivera en premier : le script de
   * pré-peinture est en JavaScript nu dans `index.html`, hors de portée de
   * `tsc` comme d'ESLint. Rien ne relierait sa table `FONDS` aux deux autres
   * sans cette lecture du fichier.
   */
  it.each(PALETTES)(
    '%s : le script de pré-peinture porte les mêmes fonds',
    palette => {
      const { light, dark } = PALETTE_THEME_COLOR[palette as Palette];
      const motif = new RegExp(
        `${palette}:\\s*\\{\\s*light:\\s*'${light}',\\s*dark:\\s*'${dark}'\\s*\\}`
      );
      expect(
        motif.test(indexHtml),
        `index.html : ${palette} devrait valoir { light: '${light}', dark: '${dark}' }`
      ).toBe(true);
    }
  );
});
