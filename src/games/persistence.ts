/** Sauvegarde/restauration d'une partie en cours (reprise après refresh). */
export type GameKey = 'yahtzee' | 'dice421' | 'pig';

/**
 * Version du schéma des parties sauvegardées. À incrémenter dès que la
 * forme de l'état d'un moteur change : une sauvegarde d'une version
 * antérieure est alors ignorée (plutôt que reprise corrompue).
 *
 * 2 → 3 (22/09/2026) : le 421 gagne `decideur` et `rollsAllowed`. Une partie
 * d'avant ne les porte pas - reprise telle quelle, `rollsLeft` vaudrait
 * `undefined` au tour suivant et le bouton « Relancer » resterait actif sans
 * fin. Mieux vaut perdre une partie en cours que la rendre injouable.
 */
const GAME_SCHEMA_VERSION = 3;

const keyFor = (mode: GameKey): string => `miss-dice:game:${mode}`;

interface Envelope<T> {
  v: number;
  state: T;
}

export function loadGame<T>(mode: GameKey): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(keyFor(mode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Envelope<T>>;
    if (parsed?.v !== GAME_SCHEMA_VERSION || parsed.state === undefined) {
      return null; // schéma périmé → on n'essaie pas de reprendre
    }
    return parsed.state;
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

export function hasSavedGame(mode: GameKey): boolean {
  try {
    return globalThis.localStorage?.getItem(keyFor(mode)) != null;
  } catch {
    return false;
  }
}
