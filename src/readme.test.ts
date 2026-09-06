import { describe, expect, it } from 'vitest';
import README from '../README.md?raw';

/**
 * LE README NE CITE QUE DES FICHIERS QUI EXISTENT.
 *
 * Ce n'est pas une précaution théorique. Au 06/09/2026, le README renvoyait
 * DEUX fois à `src/share.ts` — au § 3 et dans la liste des tests du § 8 —
 * alors que le partage vient du module `share` du socle, et que ce fichier
 * n'existe pas. Deux autres renvois pourrissaient dans le même silence :
 * `register-sw.ts` (l'enregistrement vit dans `main.tsx`, via
 * `virtual:pwa-register`) et `test/stub-pwa-register.ts` (remplacé par le
 * double pilotable du socle, `testing/pwa-register`, cf. `vitest.config.ts`).
 *
 * Un chemin mort dans un README ne casse aucun build : il ne coûte qu'au
 * lecteur, qui cherche un fichier absent et finit par douter du reste du
 * document. Rien ne le rattrape — d'où ce test.
 *
 * SANS `node:fs`, ET C'EST LA CONTRAINTE QUI COMMANDE LA FORME. `src/` est
 * type-vérifié par `tsconfig.app.json`, dont les `types` se limitent à
 * `vite/client` : un `readFileSync` ici fait rougir `tsc` (« Cannot find name
 * 'node:fs' ») sans rien apprendre à personne. On passe donc par ce que Vite
 * offre nativement — `?raw` pour le document, `import.meta.glob` pour
 * l'inventaire — qui a l'avantage d'être résolu à la COMPILATION : la liste
 * des fichiers ne peut pas diverger de l'arbre réel.
 *
 * DEUX RÈGLES, parce que le README cite ses fichiers de deux façons :
 *
 *  1. en absolu (`src/…`), dans les tableaux et la prose — vérifié à
 *     l'identique ;
 *  2. en relatif, dans l'arborescence du § 2, où l'indentation seule dit le
 *     parent. Plutôt que de parser des caractères de dessin, on vérifie
 *     qu'UN fichier de `src/` se termine par ce chemin : assez strict pour
 *     attraper une suppression, insensible à un déplacement de branche.
 *
 * Les motifs (`src/dice/**`) et les répertoires sont hors sujet : ils ne
 * désignent pas un fichier.
 */

/**
 * L'inventaire réel de `src/`, en chemins relatifs à la racine du dépôt.
 *
 * `import.meta.glob` EXCLUT le module qui l'appelle — Vite refuse de se citer
 * lui-même dans la carte qu'il génère, sans quoi le module s'importerait en
 * boucle. Ce fichier serait donc porté manquant par son propre test dès que
 * le § 8 le mentionne. On le rajoute, déduit de `import.meta.url` plutôt
 * qu'écrit en dur : un renommage ne doit pas ressusciter le faux positif.
 */
const MOI = `src/${import.meta.url.split('/').pop() ?? ''}`;
const FICHIERS = [
  ...Object.keys(import.meta.glob('./**/*')).map(chemin =>
    chemin.replace(/^\.\//, 'src/')
  ),
  MOI,
];

/** `a/{b,c}.ts` → `a/b.ts`, `a/c.ts`. Le README abrège ainsi partout. */
function developperAccolades(chemin: string): string[] {
  const groupe = /^(.*?)\{([^{}]*)\}(.*)$/.exec(chemin);
  if (!groupe) return [chemin];
  const avant = groupe[1] ?? '';
  const apres = groupe[3] ?? '';
  return (groupe[2] ?? '')
    .split(',')
    .flatMap(part => developperAccolades(`${avant}${part.trim()}${apres}`));
}

/** Un chemin exploitable : ni motif, ni répertoire, et pourvu d'une extension. */
function estUnFichierCite(chemin: string): boolean {
  return !chemin.includes('*') && /\.[A-Za-z0-9]+$/.test(chemin);
}

describe('README — les fichiers cités existent', () => {
  it('cite des chemins `src/…` réels (tableaux, prose, liste des tests)', () => {
    const cites = [...README.matchAll(/\bsrc\/[\w./{},*-]+/g)]
      .map(occurrence => occurrence[0].replace(/[.,;:]+$/, ''))
      .flatMap(developperAccolades)
      .filter(estUnFichierCite);

    // Le README en cite plusieurs dizaines : zéro trahirait une regex morte,
    // et le test passerait alors sans plus rien vérifier.
    expect(cites.length).toBeGreaterThan(20);
    expect(cites.filter(chemin => !FICHIERS.includes(chemin))).toEqual([]);
  });

  it('dessine une arborescence § 2 dont les feuilles existent', () => {
    const debut = README.indexOf('└── src/');
    expect(debut).toBeGreaterThan(-1);
    const arbre = README.slice(debut, README.indexOf('```', debut));

    const feuilles = arbre
      .split('\n')
      .flatMap(ligne => (ligne.split('#')[0] ?? '').split(/[\s│├└─]+/))
      .filter(mot => mot.includes('/'))
      .flatMap(developperAccolades)
      .filter(estUnFichierCite);

    expect(feuilles.length).toBeGreaterThan(10);
    expect(
      feuilles.filter(
        feuille => !FICHIERS.some(fichier => fichier.endsWith(`/${feuille}`))
      )
    ).toEqual([]);
  });
});
