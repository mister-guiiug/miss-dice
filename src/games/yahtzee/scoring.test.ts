import { describe, expect, it } from 'vitest';
import { CATEGORIES, scoreCategory } from './scoring';

describe('yahtzee scoreCategory', () => {
  it('catégories hautes : somme des dés de la valeur', () => {
    expect(scoreCategory('ones', [1, 1, 3, 1, 5])).toBe(3);
    expect(scoreCategory('fours', [4, 4, 4, 2, 6])).toBe(12);
    expect(scoreCategory('sixes', [1, 2, 3, 4, 5])).toBe(0);
  });

  it('brelan et carré : somme de tous les dés si présents, sinon 0', () => {
    expect(scoreCategory('threeKind', [5, 5, 5, 2, 1])).toBe(18);
    expect(scoreCategory('threeKind', [5, 5, 2, 3, 1])).toBe(0);
    expect(scoreCategory('fourKind', [6, 6, 6, 6, 1])).toBe(25);
    expect(scoreCategory('fourKind', [6, 6, 6, 2, 1])).toBe(0);
  });

  it('full : strictement 3+2 → 25 (cinq identiques ne comptent pas)', () => {
    expect(scoreCategory('fullHouse', [3, 3, 3, 5, 5])).toBe(25);
    expect(scoreCategory('fullHouse', [3, 3, 5, 5, 1])).toBe(0);
    expect(scoreCategory('fullHouse', [4, 4, 4, 4, 4])).toBe(0);
  });

  it('petite et grande suite', () => {
    expect(scoreCategory('smallStraight', [1, 2, 3, 4, 4])).toBe(30);
    expect(scoreCategory('smallStraight', [2, 3, 4, 5, 1])).toBe(30);
    expect(scoreCategory('smallStraight', [1, 2, 3, 5, 6])).toBe(0);
    expect(scoreCategory('largeStraight', [2, 3, 4, 5, 6])).toBe(40);
    expect(scoreCategory('largeStraight', [1, 2, 3, 4, 6])).toBe(0);
  });

  it('yahtzee et chance', () => {
    expect(scoreCategory('yahtzee', [4, 4, 4, 4, 4])).toBe(50);
    expect(scoreCategory('yahtzee', [4, 4, 4, 4, 2])).toBe(0);
    expect(scoreCategory('chance', [1, 2, 3, 4, 5])).toBe(15);
  });

  it('définit exactement 13 catégories', () => {
    expect(CATEGORIES).toHaveLength(13);
    expect(new Set(CATEGORIES).size).toBe(13);
  });
});
