import { describe, expect, it } from 'vitest';
import {
  createDice421,
  rollDiceAction,
  toggleHold,
  validateTurn,
  canValidate,
  currentHand,
  STARTING_POT,
  type Dice421State,
} from './engine';
import type { Rng } from '../../dice/random';

/** Rng qui produit toujours la face `face` → un brelan [face,face,face]. */
function fixedFace(face: number): Rng {
  return () => (face - 1) / 6 + 0.001;
}

/** Joue un tour complet : lance (brelan de `face`) puis valide. */
function playTurn(state: Dice421State, face: number): Dice421State {
  return validateTurn(rollDiceAction(state, fixedFace(face)));
}

describe('421 engine — bases', () => {
  it('démarre en charge avec le pot plein et des joueurs sans jeton', () => {
    const state = createDice421(['A', 'B']);
    expect(state.pot).toBe(STARTING_POT);
    expect(state.phase).toBe('charge');
    expect(state.players.every(p => p.tokens === 0)).toBe(true);
  });

  it('lance, garde un dé et expose la main courante', () => {
    let state = createDice421(['A']);
    state = rollDiceAction(state, fixedFace(4)); // [4,4,4]
    expect(state.rolledThisTurn).toBe(true);
    expect(currentHand(state).kind).toBe('trips');
    state = toggleHold(state, 0);
    expect(state.held[0]).toBe(true);
  });

  it('ne valide pas un tour sans lancer', () => {
    const state = createDice421(['A']);
    expect(canValidate(state)).toBe(false);
    expect(validateTurn(state)).toBe(state);
  });
});

describe('421 engine — résolution de manche (charge)', () => {
  it('le perdant prend au pot des jetons = valeur de la meilleure main', () => {
    let state = createDice421(['A', 'B']);
    state = playTurn(state, 6); // P0 : 6-6-6 (rang fort, 6 jetons)
    state = playTurn(state, 2); // P1 : 2-2-2 (rang faible)
    expect(state.lastRound).toEqual({
      winner: 0,
      loser: 1,
      tokens: 6,
      fromPot: true,
    });
    expect(state.players[1]!.tokens).toBe(6);
    expect(state.players[0]!.tokens).toBe(0);
    expect(state.pot).toBe(STARTING_POT - 6);
    expect(state.current).toBe(1); // le perdant entame la manche suivante
  });

  it('bascule en décharge quand le pot se vide', () => {
    let state = createDice421(['A', 'B']);
    state.pot = 4; // sur le point de se vider
    state = playTurn(state, 6); // gagnant 6-6-6 → 6 jetons
    state = playTurn(state, 2); // perdant
    expect(state.players[1]!.tokens).toBe(4); // min(6, pot)
    expect(state.pot).toBe(0);
    expect(state.phase).toBe('decharge');
  });
});

describe('421 engine — décharge et victoire', () => {
  it('le gagnant se débarrasse de ses jetons ; à 0 il gagne', () => {
    let state = createDice421(['A', 'B']);
    state.phase = 'decharge';
    state.pot = 0;
    state.players[0]!.tokens = 6;
    state = playTurn(state, 6); // P0 meilleure main → donne ses jetons
    state = playTurn(state, 2); // P1 perd → les reçoit
    expect(state.players[0]!.tokens).toBe(0);
    expect(state.players[1]!.tokens).toBe(6);
    expect(state.phase).toBe('over');
    expect(state.winner).toBe(0);
  });
});

describe('421 engine — gardes et décharge partielle', () => {
  it('ignore garder un dé avant le lancer ou hors limites', () => {
    const state = createDice421(['A']);
    expect(toggleHold(state, 0)).toBe(state); // pas encore lancé
    const rolled = rollDiceAction(state, fixedFace(3));
    expect(toggleHold(rolled, 9)).toBe(rolled); // index invalide
  });

  it('ne relance pas une partie terminée', () => {
    const state = createDice421(['A', 'B']);
    state.phase = 'over';
    expect(rollDiceAction(state, fixedFace(6))).toBe(state);
  });

  it('en décharge, un gagnant qui garde des jetons ne termine pas la partie', () => {
    let state = createDice421(['A', 'B']);
    state.phase = 'decharge';
    state.pot = 0;
    state.players[0]!.tokens = 10; // plus que la valeur de la main (6)
    state = playTurn(state, 6); // gagnant
    state = playTurn(state, 2); // perdant
    expect(state.players[0]!.tokens).toBe(4); // 10 - 6
    expect(state.players[1]!.tokens).toBe(6);
    expect(state.phase).toBe('decharge');
    expect(state.winner).toBeNull();
  });
});

describe('421 engine — solo (entraînement)', () => {
  it('enregistre la main sans transfert de jetons et ne se termine pas', () => {
    let state = createDice421(['Moi']);
    state = playTurn(state, 4); // 4-4-4
    expect(state.players[0]!.tokens).toBe(0);
    expect(state.pot).toBe(STARTING_POT);
    expect(state.phase).toBe('charge');
    expect(state.lastRound?.tokens).toBe(4);
  });
});
