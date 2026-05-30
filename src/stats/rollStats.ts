import { useSyncExternalStore } from 'react';

/** Statistiques cumulées des lancers libres (persistées localement). */
export interface RollStats {
  /** Nombre de lancers (événements). */
  rolls: number;
  /** Nombre de dés tirés au total. */
  dice: number;
  /** Occurrences par valeur de face (1..20). */
  counts: Record<number, number>;
}

const STORAGE_KEY = 'miss-dice:stats';
const EMPTY: RollStats = { rolls: 0, dice: 0, counts: {} };

function read(): RollStats {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<RollStats>;
    return {
      rolls: typeof parsed.rolls === 'number' ? parsed.rolls : 0,
      dice: typeof parsed.dice === 'number' ? parsed.dice : 0,
      counts:
        parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
    };
  } catch {
    return EMPTY;
  }
}

function write(value: RollStats): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

let state: RollStats = read();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export const rollStatsStore = {
  get: (): RollStats => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Enregistre le résultat d'un lancer (une ou plusieurs faces). */
  record(values: number[]): void {
    const counts = { ...state.counts };
    for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
    state = {
      rolls: state.rolls + 1,
      dice: state.dice + values.length,
      counts,
    };
    write(state);
    emit();
  },
  reset(): void {
    state = { rolls: 0, dice: 0, counts: {} };
    write(state);
    emit();
  },
};

export function useRollStats(): RollStats {
  return useSyncExternalStore(
    rollStatsStore.subscribe,
    rollStatsStore.get,
    rollStatsStore.get
  );
}
