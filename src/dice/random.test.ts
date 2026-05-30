import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultRng, rollDice, rollDie, type Rng } from './random';

/** Rng déterministe rejouant une liste de valeurs [0,1). */
function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length]!;
}

describe('rollDie', () => {
  it('mappe chaque tranche de 1/6 sur la bonne face (D6 par défaut)', () => {
    const centers = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92];
    const rng = seqRng(centers);
    expect(centers.map(() => rollDie(6, rng))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('respecte le nombre de faces demandé', () => {
    expect(rollDie(20, seqRng([0]))).toBe(1);
    expect(rollDie(20, seqRng([0.9999999]))).toBe(20);
    expect(rollDie(4, seqRng([0.5]))).toBe(3);
  });

  it('reste borné dans 1..sides même avec un rng pathologique', () => {
    expect(rollDie(8, seqRng([1]))).toBe(8);
    expect(rollDie(8, seqRng([-0.5]))).toBe(1);
  });

  it('couvre toutes les faces d’un D20 sur un grand échantillon', () => {
    const counts = new Map<number, number>();
    for (let i = 0; i < 8000; i++) {
      const v = rollDie(20);
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    for (let face = 1; face <= 20; face++) {
      expect(counts.get(face) ?? 0).toBeGreaterThan(0);
    }
  });
});

describe('rollDice', () => {
  it('renvoie `count` faces, chacune dans 1..sides', () => {
    const result = rollDice(5, 6, seqRng([0.1, 0.3, 0.5, 0.7, 0.9]));
    expect(result).toHaveLength(5);
    for (const v of result) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it('garantit au moins un dé même pour un count invalide', () => {
    expect(rollDice(0, 6)).toHaveLength(1);
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
