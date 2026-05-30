import { describe, expect, it } from 'vitest';
import { PIP_LAYOUT, isPipFilled } from './pips';
import { DIE_VALUES, type DieValue } from '../types';

describe('PIP_LAYOUT', () => {
  it('place exactement N points pour la face N', () => {
    for (const value of DIE_VALUES) {
      expect(PIP_LAYOUT[value]).toHaveLength(value);
    }
  });

  it('ne référence que des cellules valides (0..8) et sans doublon', () => {
    for (const value of DIE_VALUES) {
      const cells = PIP_LAYOUT[value];
      expect(new Set(cells).size).toBe(cells.length);
      for (const cell of cells) {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThanOrEqual(8);
      }
    }
  });

  it('est symétrique par rotation 180° (comme un vrai dé)', () => {
    // La cellule i et son opposée 8-i sont toujours allumées ensemble.
    for (const value of DIE_VALUES) {
      for (let i = 0; i < 9; i++) {
        expect(isPipFilled(value, i)).toBe(isPipFilled(value, 8 - i));
      }
    }
  });

  it('place les faces impaires au centre, les paires jamais au centre', () => {
    const odd: DieValue[] = [1, 3, 5];
    const even: DieValue[] = [2, 4, 6];
    for (const v of odd) expect(isPipFilled(v, 4)).toBe(true);
    for (const v of even) expect(isPipFilled(v, 4)).toBe(false);
  });
});
