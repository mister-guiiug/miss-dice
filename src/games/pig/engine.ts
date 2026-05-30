/**
 * Cochon (« Pig ») — machine d'état pure (pass-and-play, 1 à N joueurs).
 *
 * Règle (jeu de stop-ou-encore au dé unique) :
 *  - À son tour, un joueur lance un dé 6 autant de fois qu'il le souhaite.
 *    Chaque face 2–6 s'ajoute au « cumul du tour ».
 *  - S'il obtient un 1 : le cumul du tour est perdu et la main passe.
 *  - S'il décide de « banquer » : le cumul est versé à son score et la
 *    main passe au joueur suivant.
 *  - Le premier à atteindre la cible (100 par défaut) gagne.
 *
 * À 1 joueur : mode score solo (atteindre la cible en un minimum de tours).
 */
import { defaultRng, rollDie, type Rng } from '../../dice/random';

export const PIG_TARGET = 100;
export const TARGET_OPTIONS: readonly number[] = [50, 100, 200];

export interface PigPlayer {
  name: string;
  score: number;
}

export interface PigState {
  players: PigPlayer[];
  target: number;
  current: number;
  /** Points accumulés sur le tour en cours (non encore banqués). */
  turnTotal: number;
  /** Dernière face obtenue, ou null avant le 1er lancer du tour. */
  lastRoll: number | null;
  /** Faux tant que le joueur courant n'a pas encore lancé ce tour. */
  rolledThisTurn: boolean;
  /** Vrai si le dernier lancer était un 1 (tour perdu). */
  busted: boolean;
  /** Incrémenté à chaque lancer : déclenche l'animation côté UI. */
  rollNonce: number;
  phase: 'playing' | 'over';
  winner: number | null;
}

export function createPig(
  names: string[],
  target: number = PIG_TARGET
): PigState {
  const players = (names.length > 0 ? names : ['Joueur 1']).map(name => ({
    name,
    score: 0,
  }));
  return {
    players,
    target: Math.max(1, Math.floor(target)),
    current: 0,
    turnTotal: 0,
    lastRoll: null,
    rolledThisTurn: false,
    busted: false,
    rollNonce: 0,
    phase: 'playing',
    winner: null,
  };
}

export function canRoll(state: PigState): boolean {
  return state.phase === 'playing';
}

/** On ne peut banquer qu'après avoir lancé au moins une fois ce tour. */
export function canBank(state: PigState): boolean {
  return (
    state.phase === 'playing' && state.rolledThisTurn && state.turnTotal > 0
  );
}

/** Passe la main au joueur suivant en réinitialisant le tour. */
function passTurn(state: PigState, busted: boolean): PigState {
  return {
    ...state,
    current: (state.current + 1) % state.players.length,
    turnTotal: 0,
    rolledThisTurn: false,
    busted,
  };
}

/** Lance le dé : un 1 fait perdre le tour, sinon le cumul progresse. */
export function rollDiceAction(
  state: PigState,
  rng: Rng = defaultRng
): PigState {
  if (!canRoll(state)) return state;
  const face = rollDie(6, rng);
  const rolled: PigState = {
    ...state,
    lastRoll: face,
    rolledThisTurn: true,
    busted: false,
    rollNonce: state.rollNonce + 1,
  };
  if (face === 1) {
    // Cumul perdu, la main passe (mais on garde lastRoll/nonce pour l'anim).
    return {
      ...passTurn(rolled, true),
      lastRoll: face,
      rollNonce: rolled.rollNonce,
    };
  }
  return { ...rolled, turnTotal: state.turnTotal + face };
}

/** Banque le cumul du tour ; détermine la victoire si la cible est atteinte. */
export function bankAction(state: PigState): PigState {
  if (!canBank(state)) return state;
  const players = state.players.map((p, i) =>
    i === state.current ? { ...p, score: p.score + state.turnTotal } : p
  );
  const newScore = players[state.current]!.score;

  if (newScore >= state.target) {
    return {
      ...state,
      players,
      phase: 'over',
      winner: state.current,
      turnTotal: 0,
      busted: false,
    };
  }
  return passTurn({ ...state, players }, false);
}
