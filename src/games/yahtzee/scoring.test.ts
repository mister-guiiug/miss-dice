import { describe, expect, it } from 'vitest';
import { CATEGORIES, scoreCategory, scoreCategoryAsJoker } from './scoring';

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

describe('yahtzee scoreCategoryAsJoker', () => {
  /*
   * LE JOKER PAIE LA FIGURE QU'ON N'A PAS. Cinq dés identiques ne forment ni
   * full ni suite - la règle officielle les y accepte quand même, à leur
   * valeur pleine. C'est ce qui empêche la main la plus rare du jeu de devenir
   * un zéro forcé parce que la case Yahtzee est déjà prise.
   */
  it('paie full, petite et grande suite à leur valeur pleine', () => {
    expect(scoreCategoryAsJoker('fullHouse', [4, 4, 4, 4, 4])).toBe(25);
    expect(scoreCategoryAsJoker('smallStraight', [4, 4, 4, 4, 4])).toBe(30);
    expect(scoreCategoryAsJoker('largeStraight', [4, 4, 4, 4, 4])).toBe(40);
  });

  it('ne change rien aux autres cases : elles comptaient déjà juste', () => {
    expect(scoreCategoryAsJoker('fours', [4, 4, 4, 4, 4])).toBe(20);
    expect(scoreCategoryAsJoker('threeKind', [4, 4, 4, 4, 4])).toBe(20);
    expect(scoreCategoryAsJoker('fourKind', [4, 4, 4, 4, 4])).toBe(20);
    expect(scoreCategoryAsJoker('chance', [4, 4, 4, 4, 4])).toBe(20);
  });

  // LE BARÈME ORDINAIRE NE BOUGE PAS. Une main de cinq dés identiques vaut
  // toujours 0 en full hors joker : c'est le moteur qui décide quand le joker
  // s'applique, pas la main elle-même.
  it('laisse le barème ordinaire intact', () => {
    expect(scoreCategory('fullHouse', [4, 4, 4, 4, 4])).toBe(0);
    expect(scoreCategory('smallStraight', [4, 4, 4, 4, 4])).toBe(0);
    expect(scoreCategory('largeStraight', [4, 4, 4, 4, 4])).toBe(0);
  });
});
