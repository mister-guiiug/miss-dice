/** Sauvegarde/restauration d'une partie en cours (reprise après refresh). */
export type GameKey = 'yahtzee' | 'dice421' | 'pig';

/**
 * Version du schéma des parties sauvegardées. À incrémenter dès que la
 * forme de l'état d'un moteur change : une sauvegarde d'une version
 * antérieure est alors ignorée (plutôt que reprise corrompue).
 */
export const GAME_SCHEMA_VERSION = 2;

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
