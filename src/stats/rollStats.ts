import { createStore, useStore } from '../store/createStore';

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

const store = createStore<RollStats>(read(), write);

export const rollStatsStore = {
  get: store.get,
  subscribe: store.subscribe,
  /** Enregistre le résultat d'un lancer (une ou plusieurs faces). */
  record(values: number[]): void {
    const state = store.get();
    const counts = { ...state.counts };
    for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
    store.set({
      rolls: state.rolls + 1,
      dice: state.dice + values.length,
      counts,
    });
  },
  reset(): void {
    store.set({ rolls: 0, dice: 0, counts: {} });
  },
};

export function useRollStats(): RollStats {
  return useStore(store);
}
