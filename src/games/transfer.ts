/**
 * Reprendre une partie SUR UN AUTRE APPAREIL, par lien ou par QR.
 *
 * CE QUE CE N'EST PAS : une synchronisation. Il n'y a pas de serveur, pas de
 * session partagée, pas de va-et-vient. On transmet un INSTANTANÉ, une fois,
 * et l'appareil qui le reçoit continue - l'autre garde le sien, figé à
 * l'instant de l'envoi. C'est ce qui couvre le cas réel (« on finit sur ta
 * tablette ») sans rien ajouter d'infrastructure.
 *
 * L'ÉTAT VOYAGE DANS L'URL, faute de quoi il faudrait quelque chose pour le
 * garder. Trois précautions en découlent :
 *
 *  1. LA VERSION DE SCHÉMA PART AVEC. C'est celle des sauvegardes locales
 *     (`./persistence.ts`) : un lien fabriqué par une version antérieure est
 *     refusé, exactement comme une sauvegarde périmée. Sans ça, l'appareil
 *     d'en face reprendrait une partie dont il ne comprend pas la forme.
 *  2. ON COMPRESSE QUAND ON PEUT. Une partie de Yahtzee à quatre joueurs pèse
 *     1 056 octets de JSON, soit 1 410 caractères en base64url : un QR dense,
 *     qui demande une main sûre. `deflate-raw` le ramène à 354 - mesuré, pas
 *     estimé. `CompressionStream` manque encore chez quelques-uns : on retombe
 *     alors sur le texte brut, avec un marqueur d'un caractère en tête pour
 *     que le lecteur sache lequel des deux il tient.
 *  3. CE QUI ARRIVE PAR UNE URL EST DU TEXTE ÉTRANGER. `decoderPartie` refuse
 *     tout ce qui ne ressemble pas à une partie avant de le rendre - la
 *     sauvegarde locale, elle, vient de nous ; un lien vient de n'importe où.
 */
import {
  GAME_KEYS,
  GAME_SCHEMA_VERSION,
  migrerPartie,
  type GameKey,
} from './persistence';
import { appUrl } from '../links';

/** Paramètre d'URL qui porte la partie. */
export const RESUME_PARAM = 'reprise';

/** Premier caractère du colis : dit si la suite est compressée. */
const BRUT = '0';
const COMPRESSE = '1';

interface Colis {
  /** Version du schéma des états de partie. */
  v: number;
  /** Le jeu. */
  m: GameKey;
  /** L'état, tel que le moteur le porte. */
  s: unknown;
}

export interface PartieRecue {
  mode: GameKey;
  state: unknown;
}

function versBase64Url(octets: Uint8Array): string {
  let binaire = '';
  for (const octet of octets) binaire += String.fromCharCode(octet);
  return btoa(binaire)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function depuisBase64Url(texte: string): Uint8Array | null {
  try {
    const binaire = atob(texte.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binaire, caractere => caractere.charCodeAt(0));
  } catch {
    return null;
  }
}

type FabriqueFlux = new (format: string) => GenericTransformStream;

/** `deflate-raw` quand le navigateur sait le faire, `null` sinon. */
async function compresser(octets: Uint8Array): Promise<Uint8Array | null> {
  const Compression = (
    globalThis as unknown as { CompressionStream?: FabriqueFlux }
  ).CompressionStream;
  if (!Compression) return null;
  try {
    const flux = new Blob([octets as BlobPart])
      .stream()
      .pipeThrough(new Compression('deflate-raw'));
    return new Uint8Array(await new Response(flux).arrayBuffer());
  } catch {
    return null;
  }
}

async function decompresser(octets: Uint8Array): Promise<Uint8Array | null> {
  const Decompression = (
    globalThis as unknown as { DecompressionStream?: FabriqueFlux }
  ).DecompressionStream;
  if (!Decompression) return null;
  try {
    const flux = new Blob([octets as BlobPart])
      .stream()
      .pipeThrough(new Decompression('deflate-raw'));
    return new Uint8Array(await new Response(flux).arrayBuffer());
  } catch {
    // Colis tronqué par un copier-coller incomplet, ou QR mal lu.
    return null;
  }
}

/** Le colis prêt à voyager : marqueur + charge encodée. */
export async function encoderPartie(
  mode: GameKey,
  state: unknown
): Promise<string> {
  const colis: Colis = { v: GAME_SCHEMA_VERSION, m: mode, s: state };
  const octets = new TextEncoder().encode(JSON.stringify(colis));
  const compresse = await compresser(octets);
  return compresse
    ? COMPRESSE + versBase64Url(compresse)
    : BRUT + versBase64Url(octets);
}

/**
 * Une partie n'est pas qu'un objet : les moteurs indexent `players[current]`
 * sans filet. Un colis dont `current` sort du tableau ferait planter l'écran
 * au premier rendu - et sur un lien, l'absurde n'est pas qu'un accident, il
 * peut être écrit exprès. On vérifie donc le peu que les trois moteurs
 * partagent, sans refaire leur validation : une liste de joueurs nommés, et un
 * index qui pointe dedans.
 */
function partiePlausible(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) return false;
  const { players, current } = state as {
    players?: unknown;
    current?: unknown;
  };
  if (!Array.isArray(players) || players.length === 0) return false;
  const nommes = players.every(
    joueur =>
      typeof joueur === 'object' &&
      joueur !== null &&
      typeof (joueur as { name?: unknown }).name === 'string'
  );
  if (!nommes) return false;
  return (
    Number.isInteger(current) &&
    (current as number) >= 0 &&
    (current as number) < players.length
  );
}

/** Le colis relu, ou `null` s'il n'est pas une partie que cette version sert. */
export async function decoderPartie(
  colis: string
): Promise<PartieRecue | null> {
  const marqueur = colis.slice(0, 1);
  if (marqueur !== BRUT && marqueur !== COMPRESSE) return null;

  const brut = depuisBase64Url(colis.slice(1));
  if (!brut) return null;

  const octets = marqueur === COMPRESSE ? await decompresser(brut) : brut;
  if (!octets) return null;

  let lu: unknown;
  try {
    lu = JSON.parse(new TextDecoder().decode(octets));
  } catch {
    return null;
  }

  if (typeof lu !== 'object' || lu === null) return null;
  const { v, m, s } = lu as Partial<Colis>;
  if (!GAME_KEYS.includes(m as GameKey)) return null;
  // UN LIEN VIEILLIT COMME UNE SAUVEGARDE. Exiger la version exacte faisait
  // mourir tout lien ou QR partagé la veille d'une mise à jour qui monte le
  // schéma : celui qui le reçoit a déjà la nouvelle version, l'autre non. La
  // même migration que la reprise locale s'applique donc ici - et elle refuse
  // de même une version plus récente que l'app.
  const etat = migrerPartie(m as GameKey, v, s);
  if (!partiePlausible(etat)) return null;
  return { mode: m as GameKey, state: etat };
}

/** L'URL à partager ou à mettre en QR. */
export async function urlDeReprise(
  mode: GameKey,
  state: unknown
): Promise<string> {
  const url = new URL(appUrl());
  url.searchParams.set(RESUME_PARAM, await encoderPartie(mode, state));
  return url.href;
}

/**
 * Le colis présent dans l'URL, RETIRÉ au passage.
 *
 * Lu une fois, à l'import du module, donc avant le premier rendu - et la barre
 * d'adresse est nettoyée dans la foulée. Deux raisons de ne pas le laisser
 * traîner : rechargeant la page, on rejouerait la reprise par-dessus une
 * partie déjà avancée ; et l'URL d'une partie en cours n'a rien à faire dans
 * un historique de navigation ni dans un signet.
 */
function lireEtNettoyer(): string | null {
  try {
    const url = new URL(globalThis.location.href);
    const colis = url.searchParams.get(RESUME_PARAM);
    if (!colis) return null;
    url.searchParams.delete(RESUME_PARAM);
    globalThis.history?.replaceState(null, '', url.href);
    return colis;
  } catch {
    return null;
  }
}

const COLIS_INITIAL = lireEtNettoyer();

/** Le colis reçu au chargement, s'il y en avait un. Lecture pure. */
export function colisRecu(): string | null {
  return COLIS_INITIAL;
}

let enAttente = COLIS_INITIAL;

/**
 * Le colis, UNE FOIS. Les appels suivants rendent `null`.
 *
 * LA REPRISE NE DOIT PAS SE REJOUER, et un composant React n'est pas le bon
 * endroit pour s'en assurer : `StrictMode` monte, démonte et remonte, un
 * `useRef` de garde repart donc à zéro au remontage. Mesuré en développement
 * le 22/09/2026 - la partie était reprise au premier passage, puis le second
 * trouvait la sauvegarde fraîchement écrite et demandait « une partie est déjà
 * en cours, la remplacer ? », par-dessus l'écran qu'il venait lui-même
 * d'ouvrir. Le compteur appartient au MODULE, qui ne se monte qu'une fois.
 */
export function prendreColis(): string | null {
  const colis = enAttente;
  enAttente = null;
  return colis;
}
