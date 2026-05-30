/**
 * 421 — machine d'état pure (pass-and-play, 1 à N joueurs), jeu à jetons.
 *
 * Déroulé (version classique simplifiée) :
 *  1. « Charge » : un pot de jetons (21 par défaut). Chaque manche, le
 *     joueur à la plus petite main prend des jetons du pot (= valeur de la
 *     meilleure main).
 *  2. Quand le pot est vide → « Décharge » : le perdant de la manche prend
 *     désormais ses jetons au gagnant de la manche.
 *  3. Le premier joueur à n'avoir plus aucun jeton (en décharge) gagne.
 *
 * À 1 joueur, pas de jetons : mode entraînement, on affiche la valeur de
 * la main à chaque manche.
 */
import { defaultRng, type Rng } from '../../dice/random';
import { freshDice, freshHeld, reroll, toggleAt } from '../diceTurn';
import { classify, type HandValue } from './scoring';

export const STARTING_POT = 21;
export const POT_OPTIONS: readonly number[] = [11, 21, 31];
export const DICE_PER_TURN = 3;
export const ROLLS_PER_TURN = 3;

export interface Dice421Player {
  name: string;
  tokens: number;
}

export interface RoundSummary {
  winner: number;
  loser: number;
  tokens: number;
  fromPot: boolean;
}

export interface Dice421State {
  players: Dice421Player[];
  pot: number;
  phase: 'charge' | 'decharge' | 'over';
  current: number;
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  rolledThisTurn: boolean;
  rollNonce: number;
  roundHands: (HandValue | null)[];
  lastRound: RoundSummary | null;
  winner: number | null;
}

function freshTurn(): Pick<
  Dice421State,
  'dice' | 'held' | 'rollsLeft' | 'rolledThisTurn'
> {
  return {
    dice: freshDice(DICE_PER_TURN),
    held: freshHeld(DICE_PER_TURN),
    rollsLeft: ROLLS_PER_TURN,
    rolledThisTurn: false,
  };
}

export function createDice421(
  names: string[],
  pot: number = STARTING_POT
): Dice421State {
  const players = (names.length > 0 ? names : ['Joueur 1']).map(name => ({
    name,
    tokens: 0,
  }));
  return {
    players,
    pot: Math.max(1, Math.floor(pot)),
    phase: 'charge',
    current: 0,
    ...freshTurn(),
    rollNonce: 0,
    roundHands: players.map(() => null),
    lastRound: null,
    winner: null,
  };
}

export function canRoll(state: Dice421State): boolean {
  return state.phase !== 'over' && state.rollsLeft > 0;
}

export function canValidate(state: Dice421State): boolean {
  return state.phase !== 'over' && state.rolledThisTurn;
}

/** Main courante (aperçu de la valeur affichée pour le joueur actif). */
export function currentHand(state: Dice421State): HandValue {
  return classify(state.dice);
}

export function rollDiceAction(
  state: Dice421State,
  rng: Rng = defaultRng
): Dice421State {
  if (!canRoll(state)) return state;
  return {
    ...state,
    dice: reroll(state.dice, state.held, state.rolledThisTurn, 6, rng),
    rollsLeft: state.rollsLeft - 1,
    rolledThisTurn: true,
    rollNonce: state.rollNonce + 1,
  };
}

export function toggleHold(state: Dice421State, index: number): Dice421State {
  if (!state.rolledThisTurn || state.phase === 'over') return state;
  const held = toggleAt(state.held, index);
  return held ? { ...state, held } : state;
}

/** Index de la meilleure / pire main parmi celles enregistrées (égalité → 1er). */
function bestAndWorst(hands: (HandValue | null)[]): {
  best: number;
  worst: number;
} {
  let best = 0;
  let worst = 0;
  hands.forEach((hand, i) => {
    if (!hand) return;
    if (hand.rank > hands[best]!.rank) best = i;
    if (hand.rank < hands[worst]!.rank) worst = i;
  });
  return { best, worst };
}

function resolveRound(
  state: Dice421State,
  hands: (HandValue | null)[]
): Dice421State {
  const players = state.players.map(p => ({ ...p }));

  // Solo : pas de transfert, simple entraînement.
  if (players.length < 2) {
    const hand = hands[0]!;
    return {
      ...state,
      players,
      roundHands: players.map(() => null),
      lastRound: {
        winner: 0,
        loser: 0,
        tokens: hand.tokens,
        fromPot: state.phase === 'charge',
      },
      current: 0,
      ...freshTurn(),
    };
  }

  const { best, worst } = bestAndWorst(hands);
  const amount = hands[best]!.tokens;

  let pot = state.pot;
  let phase = state.phase;
  let winner: number | null = null;
  const fromPot = phase === 'charge';

  if (phase === 'charge') {
    const give = Math.min(amount, pot);
    pot -= give;
    players[worst]!.tokens += give;
    if (pot <= 0) phase = 'decharge';
  } else {
    const give = Math.min(amount, players[best]!.tokens);
    players[best]!.tokens -= give;
    players[worst]!.tokens += give;
    if (players[best]!.tokens === 0) {
      phase = 'over';
      winner = best;
    }
  }

  return {
    ...state,
    players,
    pot,
    phase,
    winner,
    roundHands: players.map(() => null),
    lastRound: { winner: best, loser: worst, tokens: amount, fromPot },
    current: worst, // le perdant entame la manche suivante
    ...freshTurn(),
  };
}

/** Valide la main du joueur courant ; résout la manche si tous ont joué. */
export function validateTurn(state: Dice421State): Dice421State {
  if (!canValidate(state)) return state;
  const hands = state.roundHands.slice();
  hands[state.current] = classify(state.dice);

  if (hands.filter(Boolean).length === state.players.length) {
    return resolveRound(state, hands);
  }

  return {
    ...state,
    roundHands: hands,
    current: (state.current + 1) % state.players.length,
    lastRound: null,
    ...freshTurn(),
  };
}
