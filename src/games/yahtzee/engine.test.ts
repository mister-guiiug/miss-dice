import { describe, expect, it } from 'vitest';
import {
  createYahtzee,
  rollDiceAction,
  toggleHold,
  scoreCategoryAction,
  canScore,
  totalScore,
  upperBonus,
  leaders,
  isCategoryFilled,
  ROLLS_PER_TURN,
} from './engine';
import { CATEGORIES } from './scoring';
import type { Rng } from '../../dice/random';

/** Rng déterministe : valeurs [0,1) rejouées en boucle. */
function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length]!;
}

/** Rng qui produit toujours la face `face` (1..6). */
function fixedFace(face: number): Rng {
  return () => (face - 1) / 6 + 0.001;
}

describe('yahtzee engine — tour', () => {
  it('crée une partie jouable même sans nom', () => {
    const state = createYahtzee([]);
    expect(state.players).toHaveLength(1);
    expect(state.rollsLeft).toBe(ROLLS_PER_TURN);
    expect(state.phase).toBe('play');
  });

  it('le lancer décrémente rollsLeft et incrémente le nonce', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(3));
    expect(state.dice).toEqual([3, 3, 3, 3, 3]);
    expect(state.rollsLeft).toBe(2);
    expect(state.rollNonce).toBe(1);
    expect(state.rolledThisTurn).toBe(true);
  });

  it('garde les dés tenus entre deux lancers', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(6)); // [6,6,6,6,6]
    state = toggleHold(state, 0);
    state = toggleHold(state, 1);
    state = rollDiceAction(state, fixedFace(1)); // garde 0,1 → 6 ; reste → 1
    expect(state.dice).toEqual([6, 6, 1, 1, 1]);
  });

  it('interdit un 4e lancer', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(2));
    state = rollDiceAction(state, fixedFace(2));
    state = rollDiceAction(state, fixedFace(2));
    expect(state.rollsLeft).toBe(0);
    const before = state.rollNonce;
    state = rollDiceAction(state, fixedFace(2));
    expect(state.rollNonce).toBe(before); // inchangé
  });

  it('refuse de scorer sans avoir lancé', () => {
    const state = createYahtzee(['A']);
    expect(canScore(state)).toBe(false);
    expect(scoreCategoryAction(state, 'chance')).toBe(state);
  });

  it('ignore garder un dé avant le lancer ou hors limites', () => {
    const state = createYahtzee(['A']);
    expect(toggleHold(state, 0)).toBe(state); // pas encore lancé
    const rolled = rollDiceAction(state, fixedFace(4));
    expect(toggleHold(rolled, 9)).toBe(rolled); // index invalide
  });
});

describe('yahtzee engine — score et tours', () => {
  it('inscrit la catégorie et passe au joueur suivant', () => {
    let state = createYahtzee(['A', 'B']);
    state = rollDiceAction(state, fixedFace(5)); // [5,5,5,5,5]
    state = scoreCategoryAction(state, 'fives');
    expect(state.players[0]!.scores.fives).toBe(25);
    expect(state.current).toBe(1);
    expect(state.rolledThisTurn).toBe(false);
    expect(state.rollsLeft).toBe(ROLLS_PER_TURN);
  });

  it('ne réécrit pas une catégorie déjà remplie', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(2));
    state = scoreCategoryAction(state, 'twos'); // tour suivant (même joueur)
    state = rollDiceAction(state, fixedFace(3));
    const blocked = scoreCategoryAction(state, 'twos');
    expect(blocked).toBe(state);
  });

  it('applique le bonus supérieur à partir de 63 et calcule le total', () => {
    const state = createYahtzee(['A']);
    const player = state.players[0]!;
    // Remplit toutes les hautes avec trois dés de chaque valeur (3×face).
    player.scores = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18, // somme = 63 → bonus 35
      chance: 10,
    };
    expect(upperBonus(player)).toBe(35);
    expect(totalScore(player)).toBe(63 + 10 + 35);
  });

  it('termine quand toutes les catégories sont remplies', () => {
    let state = createYahtzee(['A']);
    for (const category of CATEGORIES) {
      state = rollDiceAction(state, fixedFace(1));
      state = scoreCategoryAction(state, category);
    }
    expect(state.phase).toBe('over');
    expect(CATEGORIES.every(c => isCategoryFilled(state.players[0]!, c))).toBe(
      true
    );
  });

  it('désigne le ou les meneurs (gère les égalités)', () => {
    const state = createYahtzee(['A', 'B']);
    state.players[0]!.scores = { chance: 20 };
    state.players[1]!.scores = { chance: 20 };
    expect(leaders(state)).toEqual([0, 1]);
    state.players[1]!.scores = { chance: 30 };
    expect(leaders(state)).toEqual([1]);
  });

  it('mélange réel : un rng quelconque reste dans 1..6', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, seqRng([0.1, 0.9, 0.5, 0.0, 0.99]));
    for (const d of state.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });
});
