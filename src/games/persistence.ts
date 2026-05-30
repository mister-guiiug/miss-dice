/** Sauvegarde/restauration d'une partie en cours (reprise après refresh). */
export type GameKey = 'yahtzee' | 'dice421';

const keyFor = (mode: GameKey): string => `miss-dice:game:${mode}`;

export function loadGame<T>(mode: GameKey): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(keyFor(mode));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveGame<T>(mode: GameKey, state: T): void {
  try {
    globalThis.localStorage?.setItem(keyFor(mode), JSON.stringify(state));
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
