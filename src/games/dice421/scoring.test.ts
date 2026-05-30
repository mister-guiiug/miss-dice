import { describe, expect, it } from 'vitest';
import { classify, compareHands } from './scoring';

describe('421 classify', () => {
  it('reconnaît le 421 (meilleure main, 10 jetons)', () => {
    const h = classify([1, 4, 2]);
    expect(h.kind).toBe('421');
    expect(h.tokens).toBe(10);
    expect(h.dice).toEqual([4, 2, 1]);
  });

  it('reconnaît le brelan d’as 1-1-1 (7 jetons)', () => {
    const h = classify([1, 1, 1]);
    expect(h.kind).toBe('aces');
    expect(h.tokens).toBe(7);
  });

  it('reconnaît un brelan d-d-d (valeur du dé en jetons)', () => {
    expect(classify([6, 6, 6]).tokens).toBe(6);
    expect(classify([2, 2, 2]).tokens).toBe(2);
    expect(classify([2, 2, 2]).kind).toBe('trips');
  });

  it('classe une main quelconque à 1 jeton', () => {
    const h = classify([6, 5, 2]);
    expect(h.kind).toBe('plain');
    expect(h.tokens).toBe(1);
    expect(h.dice).toEqual([6, 5, 2]);
  });

  it('ordonne totalement : 421 > 111 > 666 > 222 > quelconques', () => {
    const order = [
      classify([4, 2, 1]),
      classify([1, 1, 1]),
      classify([6, 6, 6]),
      classify([2, 2, 2]),
      classify([6, 6, 5]),
      classify([6, 5, 2]),
    ];
    for (let i = 1; i < order.length; i++) {
      expect(compareHands(order[i - 1]!, order[i]!)).toBeGreaterThan(0);
    }
  });

  it('compareHands renvoie 0 pour deux mains équivalentes', () => {
    expect(compareHands(classify([6, 5, 2]), classify([2, 5, 6]))).toBe(0);
  });

  it('reconnaît une suite de 3 dés consécutifs (2 jetons)', () => {
    expect(classify([3, 2, 1]).kind).toBe('suite');
    expect(classify([4, 6, 5]).kind).toBe('suite');
    expect(classify([4, 6, 5]).tokens).toBe(2);
    // une suite bat une main quelconque mais pas un brelan
    expect(compareHands(classify([6, 5, 4]), classify([6, 6, 6]))).toBeLessThan(
      0
    );
    expect(
      compareHands(classify([6, 5, 4]), classify([6, 5, 1]))
    ).toBeGreaterThan(0);
  });

  it('reconnaît la nénette 2-2-1 (2 jetons, main basse)', () => {
    const n = classify([1, 2, 2]);
    expect(n.kind).toBe('nenette');
    expect(n.tokens).toBe(2);
    // la nénette est la plus basse : battue par une main quelconque
    expect(compareHands(classify([2, 1, 1]), n)).toBeGreaterThan(0);
  });
});
