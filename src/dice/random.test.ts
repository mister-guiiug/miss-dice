import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultRng, rollDie, type Rng } from './random';
import { DIE_VALUES } from '../types';

/** Rng déterministe rejouant une liste de valeurs [0,1). */
function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length]!;
}

describe('rollDie', () => {
  it('mappe chaque tranche de 1/6 sur la bonne face', () => {
    // Centre de chaque sixième -> 1..6 dans l'ordre.
    const centers = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92];
    const rng = seqRng(centers);
    expect(centers.map(() => rollDie(rng))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('renvoie toujours une valeur dans 1..6, bornes incluses', () => {
    expect(rollDie(seqRng([0]))).toBe(1);
    // Un rng pathologique renvoyant ~1.0 ne doit jamais produire 7.
    expect(rollDie(seqRng([0.9999999]))).toBe(6);
    expect(rollDie(seqRng([1]))).toBe(6);
  });

  it('couvre les six faces sur un grand échantillon (uniformité)', () => {
    const counts = new Map<number, number>();
    const n = 6000;
    for (let i = 0; i < n; i++) {
      const v = rollDie(); // defaultRng réel
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    for (const face of DIE_VALUES) {
      const c = counts.get(face) ?? 0;
      // Tolérance large : on vérifie l'absence de face morte, pas la stat fine.
      expect(c).toBeGreaterThan(n / 6 / 2);
    }
  });
});

describe('defaultRng', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('replie sur Math.random quand crypto est indisponible', () => {
    vi.stubGlobal('crypto', undefined);
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
    expect(defaultRng()).toBe(0.42);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('utilise crypto.getRandomValues et reste dans [0, 1)', () => {
    const value = defaultRng();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});
