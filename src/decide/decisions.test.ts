import { describe, expect, it } from 'vitest';
import { flipCoin, parseOptions, pickOne, shuffle, yesNo } from './decisions';
import type { Rng } from '../dice/random';

const seqRng = (values: number[]): Rng => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe('decisions', () => {
  it('pièce et oui/non suivent le rng', () => {
    expect(flipCoin(seqRng([0.2]))).toBe('heads');
    expect(flipCoin(seqRng([0.8]))).toBe('tails');
    expect(yesNo(seqRng([0.1]))).toBe(true);
    expect(yesNo(seqRng([0.9]))).toBe(false);
  });

  it('pickOne choisit par index et gère la liste vide / borne haute', () => {
    expect(pickOne(['a', 'b', 'c'], seqRng([0.5]))).toBe('b');
    expect(pickOne(['a', 'b'], seqRng([0.999999]))).toBe('b'); // borné
    expect(pickOne([], seqRng([0.5]))).toBeNull();
  });

  it('shuffle ne mute pas et reste une permutation', () => {
    const input = [1, 2, 3, 4];
    const out = shuffle(input, seqRng([0.99, 0.5, 0.1, 0.7]));
    expect(input).toEqual([1, 2, 3, 4]); // intact
    expect([...out].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it('parseOptions nettoie les lignes vides et les espaces', () => {
    expect(parseOptions(' a \n\n b\nc \n')).toEqual(['a', 'b', 'c']);
    expect(parseOptions('   \n  ')).toEqual([]);
  });
});
