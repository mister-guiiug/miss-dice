import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_LOG_ENTRIES,
  readLog,
  rollLogStore,
  toCsv,
  type RollLogEntry,
} from './rollLog';

const KEY = 'miss-dice:log';

beforeEach(() => {
  localStorage.clear();
  rollLogStore.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('rollLogStore.record', () => {
  it('ajoute un lancer en tête avec total et horodatage', () => {
    rollLogStore.record(6, [3, 4], 1000);
    rollLogStore.record(20, [12], 2000);
    const log = rollLogStore.get();
    expect(log[0]).toEqual({ at: 2000, sides: 20, values: [12], total: 12 });
    expect(log[1]).toEqual({ at: 1000, sides: 6, values: [3, 4], total: 7 });
  });

  it('borne le journal à MAX_LOG_ENTRIES', () => {
    for (let i = 0; i < MAX_LOG_ENTRIES + 10; i++) {
      rollLogStore.record(6, [1], i);
    }
    expect(rollLogStore.get()).toHaveLength(MAX_LOG_ENTRIES);
    // La plus récente reste en tête.
    expect(rollLogStore.get()[0]!.at).toBe(MAX_LOG_ENTRIES + 9);
  });

  it('persiste dans localStorage et relit au démarrage', () => {
    rollLogStore.record(6, [2, 5], 1234);
    const reread = readLog();
    expect(reread).toEqual([{ at: 1234, sides: 6, values: [2, 5], total: 7 }]);
  });
});

describe('readLog — robustesse', () => {
  it('renvoie un journal vide sans données', () => {
    expect(readLog()).toEqual([]);
  });

  it('ignore un JSON non-tableau ou corrompu', () => {
    localStorage.setItem(KEY, '{"oops":true}');
    expect(readLog()).toEqual([]);
    localStorage.setItem(KEY, 'not json');
    expect(readLog()).toEqual([]);
  });

  it('filtre les entrées invalides et recalcule le total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([
        { at: 1, sides: 6, values: [2, 3] }, // total recalculé
        { at: 2, sides: 6, values: ['x'] }, // valeurs non numériques
        { sides: 6, values: [1] }, // at manquant
        null,
      ])
    );
    expect(readLog()).toEqual([{ at: 1, sides: 6, values: [2, 3], total: 5 }]);
  });
});

describe('toCsv', () => {
  it('produit un en-tête et une ligne par lancer', () => {
    const entries: RollLogEntry[] = [
      { at: 0, sides: 6, values: [1, 2], total: 3 },
    ];
    const csv = toCsv(entries);
    const [header, row] = csv.split('\n');
    expect(header).toBe('date,sides,values,total');
    expect(row).toBe('1970-01-01T00:00:00.000Z,6,1 2,3');
  });

  it('gère un journal vide (en-tête seul)', () => {
    expect(toCsv([])).toBe('date,sides,values,total');
  });
});
