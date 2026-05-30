import { createStore, useStore } from '../store/createStore';

/**
 * Journal des derniers lancers libres (persisté localement). Sert à
 * relire l'historique récent et à l'exporter en CSV. Rien n'est transmis :
 * tout reste sur l'appareil, et le journal est borné pour rester léger.
 */
export interface RollLogEntry {
  /** Horodatage (ms epoch) du lancer. */
  at: number;
  /** Nombre de faces du dé utilisé. */
  sides: number;
  /** Faces obtenues, dans l'ordre d'affichage. */
  values: number[];
  /** Somme des faces. */
  total: number;
}

/** Nombre maximum d'entrées conservées (les plus récentes d'abord). */
export const MAX_LOG_ENTRIES = 100;

const STORAGE_KEY = 'miss-dice:log';

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

/** Valide/normalise une entrée brute issue du stockage. */
function normalizeEntry(raw: unknown): RollLogEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<RollLogEntry>;
  if (
    typeof obj.at !== 'number' ||
    typeof obj.sides !== 'number' ||
    !Array.isArray(obj.values) ||
    !obj.values.every(v => typeof v === 'number')
  ) {
    return null;
  }
  const values = obj.values as number[];
  return { at: obj.at, sides: obj.sides, values, total: sum(values) };
}

/** Lecture tolérante (mode privé / données corrompues → journal vide). */
export function readLog(): RollLogEntry[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeEntry)
      .filter((e): e is RollLogEntry => e !== null)
      .slice(0, MAX_LOG_ENTRIES);
  } catch {
    return [];
  }
}

function write(entries: RollLogEntry[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* quota plein / mode privé : on continue en mémoire */
  }
}

/** Échappe un champ CSV (RFC 4180 : guillemets doublés si nécessaire). */
function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Sérialise le journal en CSV (en-tête + une ligne par lancer). Pur et
 * testable : la date est rendue en ISO via le `at` de chaque entrée.
 */
export function toCsv(entries: RollLogEntry[]): string {
  const header = ['date', 'sides', 'values', 'total'];
  const rows = entries.map(e =>
    [new Date(e.at).toISOString(), e.sides, e.values.join(' '), e.total]
      .map(csvField)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

const store = createStore<RollLogEntry[]>(readLog(), write);

export const rollLogStore = {
  get: store.get,
  subscribe: store.subscribe,
  /**
   * Ajoute un lancer en tête de journal (le plus récent d'abord), borné à
   * MAX_LOG_ENTRIES. `at` est injectable pour les tests déterministes.
   */
  record(sides: number, values: number[], at: number = Date.now()): void {
    const entry: RollLogEntry = { at, sides, values, total: sum(values) };
    store.set([entry, ...store.get()].slice(0, MAX_LOG_ENTRIES));
  },
  clear(): void {
    store.set([]);
  },
};

export function useRollLog(): RollLogEntry[] {
  return useStore(store);
}
