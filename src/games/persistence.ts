/** Sauvegarde/restauration d'une partie en cours (reprise après refresh). */
export const GAME_KEYS = ['yahtzee', 'dice421', 'pig'] as const;

export type GameKey = (typeof GAME_KEYS)[number];

/**
 * Version du schéma des parties sauvegardées. À incrémenter dès que la
 * forme de l'état d'un moteur change - ET à accompagner d'une étape dans
 * `ETAPES`, ci-dessous, qui amène l'ancienne forme à la nouvelle.
 */
export const GAME_SCHEMA_VERSION = 3;

type EtatBrut = Record<string, unknown>;

/**
 * Les MIGRATIONS : `ETAPES[n]` prend l'état d'une sauvegarde de version `n` et
 * rend celui de la version `n + 1`.
 *
 * POURQUOI MIGRER PLUTÔT QUE JETER. La montée 2 → 3 jetait toute sauvegarde
 * d'avant : « mieux vaut perdre une partie en cours que la rendre injouable ».
 * Le principe était juste, le coût mal réparti. Le numéro de version est
 * COMMUN aux trois jeux, donc changer le 421 jetait aussi les parties de
 * Yahtzee et de Cochon, dont la forme n'avait pas bougé. Et le menu annonçait
 * encore « Reprendre » sur ces sauvegardes - `hasSavedGame` ne regardait que la
 * présence de la clé - pour repartir de zéro au toucher.
 *
 * UNE ÉTAPE DÉCRIT L'HISTOIRE, ELLE NE SUIT PAS LE CODE VIVANT. Les valeurs
 * posées ici sont celles que la version d'avant impliquait, écrites en dur : si
 * `ROLLS_PER_TURN` change un jour, une partie de 2026 en version 2 n'en aura
 * pas moins été jouée à trois lancers. L'importer aurait en prime tiré le
 * moteur du 421 dans le morceau préchargé, que ce module rejoint par le menu.
 */
const ETAPES: Readonly<
  Record<number, (mode: GameKey, state: EtatBrut) => EtatBrut>
> = {
  // 2 → 3 (22/09/2026, #100) : le 421 gagne la règle du décideur. Une partie
  // d'avant ne la jouait pas, et offrait toujours trois lancers.
  //
  // LA MONTÉE D'ORIGINE REDOUTAIT UN DÉFAUT QUI N'ARRIVE PAS. Elle annonçait
  // qu'une partie reprise sans ces champs aurait `rollsLeft: undefined` au
  // tour suivant. Mesuré en écrivant cette étape : non - `freshTurn` a une
  // valeur par défaut qui rend 3 pour `undefined`, et `decideur` absent vaut
  // faux partout où il est lu. Les parties jetées étaient donc jouables.
  // L'étape sert à ce que l'état repris soit celui que son type déclare : un
  // `number` là où le code lit un `number`, pour que la prochaine lecture du
  // champ n'ait pas à compter sur un défaut de paramètre.
  //
  // Les deux autres jeux n'ont pas changé de forme : ils passent tels quels.
  2: (mode, state) =>
    mode === 'dice421' ? { decideur: false, rollsAllowed: 3, ...state } : state,
};

/**
 * Amène un état sauvegardé en version `v` jusqu'à la version courante.
 *
 * Rend `null` pour tout ce qu'aucune étape ne sait lire : une version plus
 * ANCIENNE que la première étape connue, et surtout une version PLUS RÉCENTE
 * que celle de l'app - une sauvegarde ou un lien venus d'une version plus
 * neuve n'ont pas une forme que ce code connaît, et les reprendre tels quels
 * serait précisément la reprise corrompue que le versionnement empêche.
 *
 * Exportée pour `transfer.ts` : un lien de reprise est une sauvegarde qui a
 * voyagé, il vieillit de la même façon.
 */
export function migrerPartie(
  mode: GameKey,
  v: unknown,
  state: unknown
): unknown {
  if (typeof v !== 'number' || !Number.isInteger(v)) return null;
  if (v > GAME_SCHEMA_VERSION) return null;
  if (typeof state !== 'object' || state === null) return null;
  let courant = state as EtatBrut;
  for (let n = v; n < GAME_SCHEMA_VERSION; n += 1) {
    const etape = ETAPES[n];
    if (!etape) return null;
    courant = etape(mode, courant);
  }
  return courant;
}

const keyFor = (mode: GameKey): string => `miss-dice:game:${mode}`;

interface Envelope<T> {
  v: number;
  state: T;
}

export function loadGame<T>(mode: GameKey): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(keyFor(mode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Envelope<unknown>>;
    if (parsed?.state === undefined) return null;
    return migrerPartie(mode, parsed.v, parsed.state) as T | null;
  } catch {
    return null;
  }
}

export function saveGame<T>(mode: GameKey, state: T): void {
  try {
    const envelope: Envelope<T> = { v: GAME_SCHEMA_VERSION, state };
    globalThis.localStorage?.setItem(keyFor(mode), JSON.stringify(envelope));
  } catch {
    /* quota plein / mode privé : on continue en mémoire */
  }
}

export function clearGame(mode: GameKey): void {
  try {
    globalThis.localStorage?.removeItem(keyFor(mode));
  } catch {
    /* ignore */
  }
}

/**
 * Y a-t-il une partie À REPRENDRE - pas seulement une clé.
 *
 * Répondait à la présence de la clé. Le menu affichait donc « Reprendre » sur
 * une sauvegarde que `loadGame` refusait ensuite, et le toucher démarrait une
 * partie neuve. La réponse est maintenant celle de `loadGame` : ce qui est
 * annoncé est ce qui sera repris.
 */
export function hasSavedGame(mode: GameKey): boolean {
  return loadGame(mode) !== null;
}
