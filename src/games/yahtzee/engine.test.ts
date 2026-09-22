import { describe, expect, it } from 'vitest';
import {
  categoriesAutorisees,
  createYahtzee,
  jokerActif,
  previewScore,
  rollDiceAction,
  toggleHold,
  scoreCategoryAction,
  canScore,
  totalScore,
  upperBonus,
  leaders,
  isCategoryFilled,
  yahtzeeBonusPoints,
  ROLLS_PER_TURN,
  type YahtzeeState,
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

describe('yahtzee engine - tour', () => {
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

describe('yahtzee engine - score et tours', () => {
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

  it('accorde +100 par Yahtzee supplémentaire (premier Yahtzee déjà à 50)', () => {
    let state = createYahtzee(['A']);
    // 1er Yahtzee → inscrit 50, aucun bonus.
    state = rollDiceAction(state, fixedFace(5)); // [5,5,5,5,5]
    state = scoreCategoryAction(state, 'yahtzee');
    expect(state.players[0]!.scores.yahtzee).toBe(50);
    expect(yahtzeeBonusPoints(state.players[0]!)).toBe(0);
    // 2e Yahtzee → bonus de 100, inscrit ailleurs.
    state = rollDiceAction(state, fixedFace(5));
    state = scoreCategoryAction(state, 'fives');
    expect(state.players[0]!.bonusYahtzees).toBe(1);
    expect(yahtzeeBonusPoints(state.players[0]!)).toBe(100);
    expect(totalScore(state.players[0]!)).toBe(50 + 25 + 100);
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

/**
 * LE JOKER, C'EST LA MOITIÉ DE LA RÈGLE QUI MANQUAIT.
 *
 * Le bonus des +100 était là ; le PLACEMENT ne l'était pas. Or c'est lui qui
 * fait le jeu : après un Yahtzee supplémentaire, on ne choisit pas librement,
 * on suit un ordre - la case haute de la figure, sinon une combinaison payée
 * plein, sinon un zéro en haut. Sans cet ordre, la main la plus rare du jeu
 * servait à bourrer la case la plus commode.
 */
describe('yahtzee engine - joker', () => {
  /*
   * LE PIÈGE D'ABORD, parce qu'il ne se voit pas. `freshDice` remplit le tour
   * de cinq 1 : l'état d'un tour NEUF porte donc un Yahtzee de 1 qui n'a
   * jamais été lancé. Sans la garde `rolledThisTurn`, un joueur ayant déjà sa
   * case Yahtzee verrait sa grille se réduire à « Les 1 » en arrivant sur son
   * tour, avant d'avoir touché un dé.
   */
  it('aucun joker avant le premier lancer, malgré les cinq 1 de l’état neuf', () => {
    const state = createYahtzee(['A']);
    expect(state.dice).toEqual([1, 1, 1, 1, 1]);
    expect(jokerActif(state)).toBe(false);
    expect(categoriesAutorisees(state)).toHaveLength(13);
  });

  it('case Yahtzee libre : un Yahtzee ne contraint rien', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(4));
    expect(jokerActif(state)).toBe(false);
    expect(categoriesAutorisees(state)).toHaveLength(13);
    // Et le barème reste ordinaire : cinq 4 ne sont pas un full.
    expect(previewScore(state, 'fullHouse')).toBe(0);
  });

  it('case Yahtzee remplie : la case haute de la figure est IMPOSÉE', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(5));
    state = scoreCategoryAction(state, 'yahtzee');
    state = rollDiceAction(state, fixedFace(4));

    expect(jokerActif(state)).toBe(true);
    expect(categoriesAutorisees(state)).toEqual(['fours']);
    // Le moteur fait foi, pas le bouton : une autre case libre est refusée.
    expect(scoreCategoryAction(state, 'chance')).toBe(state);
  });

  it('case haute prise : les combinaisons s’ouvrent, payées plein', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, fixedFace(5));
    state = scoreCategoryAction(state, 'yahtzee');
    state = rollDiceAction(state, fixedFace(4));
    state = scoreCategoryAction(state, 'fours');
    state = rollDiceAction(state, fixedFace(4));

    expect(categoriesAutorisees(state)).toEqual([
      'threeKind',
      'fourKind',
      'fullHouse',
      'smallStraight',
      'largeStraight',
      'chance',
    ]);
    expect(previewScore(state, 'fullHouse')).toBe(25);
    expect(previewScore(state, 'largeStraight')).toBe(40);

    state = scoreCategoryAction(state, 'fullHouse');
    expect(state.players[0]!.scores.fullHouse).toBe(25);
  });

  /*
   * UN ZÉRO COMPTE AUTANT QU'UN 50. La règle officielle attache le placement à
   * une case Yahtzee REMPLIE, pas à un Yahtzee réussi : le joueur qui a sacrifié
   * sa case suit le même ordre, sans toucher les +100. C'est la partie que les
   * implémentations sautent le plus souvent.
   */
  it('un zéro dans la case Yahtzee impose le même ordre, sans les +100', () => {
    let state = createYahtzee(['A']);
    state = rollDiceAction(state, seqRng([0.0, 0.2, 0.4, 0.6, 0.8]));
    expect(state.dice).toEqual([1, 2, 3, 4, 5]);
    state = scoreCategoryAction(state, 'yahtzee');
    expect(state.players[0]!.scores.yahtzee).toBe(0);

    state = rollDiceAction(state, fixedFace(3));
    expect(jokerActif(state)).toBe(true);
    expect(categoriesAutorisees(state)).toEqual(['threes']);

    state = scoreCategoryAction(state, 'threes');
    expect(state.players[0]!.bonusYahtzees).toBe(0);
    expect(yahtzeeBonusPoints(state.players[0]!)).toBe(0);
  });

  /*
   * LE DERNIER CRAN. Case haute prise ET plus une combinaison libre : il ne
   * reste qu'à sacrifier une case haute. L'état est posé à la main - le
   * rejouer coûterait douze tours pour vérifier une branche de trois lignes.
   */
  it('plus aucune combinaison libre : une case haute passe à zéro', () => {
    const state: YahtzeeState = {
      ...createYahtzee(['A']),
      rolledThisTurn: true,
      dice: [6, 6, 6, 6, 6],
      players: [
        {
          name: 'A',
          bonusYahtzees: 0,
          scores: {
            sixes: 30,
            yahtzee: 50,
            threeKind: 0,
            fourKind: 0,
            fullHouse: 0,
            smallStraight: 0,
            largeStraight: 0,
            chance: 0,
          },
        },
      ],
    };

    expect(jokerActif(state)).toBe(true);
    expect(categoriesAutorisees(state)).toEqual([
      'ones',
      'twos',
      'threes',
      'fours',
      'fives',
    ]);
    // Une case haute qui ne contient aucun 6 : le sacrifice coûte bien zéro.
    expect(previewScore(state, 'ones')).toBe(0);
  });
});
