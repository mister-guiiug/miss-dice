import { describe, expect, it } from 'vitest';
import {
  bankAction,
  canBank,
  canRoll,
  createPig,
  PIG_TARGET,
  rollDiceAction,
  type PigState,
} from './engine';
import type { Rng } from '../../dice/random';

/** Rng produisant toujours la face `face` (rollDie = floor(rng*6)+1). */
function fixedFace(face: number): Rng {
  return () => (face - 1) / 6 + 0.001;
}

describe('Pig engine — bases', () => {
  it('démarre à 0 pour tous, en phase playing', () => {
    const state = createPig(['A', 'B']);
    expect(state.target).toBe(PIG_TARGET);
    expect(state.phase).toBe('playing');
    expect(state.current).toBe(0);
    expect(state.players.every(p => p.score === 0)).toBe(true);
    expect(state.busted).toBe(false);
  });

  it('accumule les faces 2–6 dans le cumul du tour', () => {
    let state = createPig(['A']);
    state = rollDiceAction(state, fixedFace(4));
    expect(state.turnTotal).toBe(4);
    expect(state.rolledThisTurn).toBe(true);
    state = rollDiceAction(state, fixedFace(5));
    expect(state.turnTotal).toBe(9);
    expect(state.lastRoll).toBe(5);
  });

  it('un 1 fait perdre le cumul et passe la main', () => {
    let state = createPig(['A', 'B']);
    state = rollDiceAction(state, fixedFace(6)); // cumul 6
    expect(state.turnTotal).toBe(6);
    state = rollDiceAction(state, fixedFace(1)); // bust
    expect(state.busted).toBe(true);
    expect(state.turnTotal).toBe(0);
    expect(state.current).toBe(1); // main passée
    expect(state.lastRoll).toBe(1); // conservé pour l'animation
  });
});

describe('Pig engine — banque', () => {
  it('ne peut banquer qu’après un lancer fructueux', () => {
    const fresh = createPig(['A']);
    expect(canBank(fresh)).toBe(false);
    expect(bankAction(fresh)).toBe(fresh); // no-op
    const rolled = rollDiceAction(fresh, fixedFace(3));
    expect(canBank(rolled)).toBe(true);
  });

  it('banque le cumul, remet à zéro et passe la main', () => {
    let state = createPig(['A', 'B']);
    state = rollDiceAction(state, fixedFace(5)); // cumul 5
    state = rollDiceAction(state, fixedFace(4)); // cumul 9
    state = bankAction(state);
    expect(state.players[0]!.score).toBe(9);
    expect(state.turnTotal).toBe(0);
    expect(state.current).toBe(1);
    expect(state.busted).toBe(false);
  });

  it('gagne en atteignant la cible', () => {
    let state = createPig(['A', 'B'], 10);
    state = rollDiceAction(state, fixedFace(6));
    state = rollDiceAction(state, fixedFace(6)); // cumul 12 ≥ 10
    state = bankAction(state);
    expect(state.phase).toBe('over');
    expect(state.winner).toBe(0);
    expect(state.players[0]!.score).toBe(12);
  });
});

describe('Pig engine — garde-fous', () => {
  it('ne lance plus une partie terminée', () => {
    let state = createPig(['A'], 5);
    state = rollDiceAction(state, fixedFace(6));
    state = bankAction(state); // gagne (6 ≥ 5)
    expect(state.phase).toBe('over');
    expect(canRoll(state)).toBe(false);
    const after = rollDiceAction(state, fixedFace(6));
    expect(after).toBe(state);
  });

  it('mode solo : la main « passe » au même joueur', () => {
    let state: PigState = createPig(['Moi']);
    state = rollDiceAction(state, fixedFace(3));
    state = bankAction(state);
    expect(state.current).toBe(0);
    expect(state.players[0]!.score).toBe(3);
    expect(state.phase).toBe('playing');
  });

  it('crée au moins un joueur si la liste est vide', () => {
    const state = createPig([]);
    expect(state.players).toHaveLength(1);
  });
});
