import { pagesUrl } from '@mister-guiiug/dev-wpa-config/apps-catalog';

/**
 * URL canonique de l'app à partager : racine du déploiement (gère le base
 * path GitHub Pages). Repli sur l'URL Pages connue hors navigateur.
 *
 * Reste local : le socle publie l'URL Pages *statique* (`pagesUrl`), pas
 * cette résolution à l'exécution depuis `import.meta.env.BASE_URL`, qui est
 * la seule à rendre la bonne URL en préversion ou sur un autre hébergement.
 * Les liens dépôt et sponsor, eux, viennent désormais du catalogue famille.
 */
export function appUrl(): string {
  try {
    const base = import.meta.env.BASE_URL || '/';
    return new URL(base, globalThis.location.origin).href;
  } catch {
    return pagesUrl('miss-dice');
  }
}
