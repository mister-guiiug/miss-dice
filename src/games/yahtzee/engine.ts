/**
 * Yahtzee — machine d'état pure (pass-and-play, 1 à N joueurs).
 *
 * Aucune dépendance React/DOM : chaque action renvoie un nouvel état, ce
 * qui rend tout le déroulé testable. L'aléa est injectable.
 */
import { rollDie, type Rng } from '../../dice/random';
import {
  CATEGORIES,
  UPPER_CATEGORIES,
  UPPER_BONUS,
  UPPER_BONUS_THRESHOLD,
  scoreCategory,
  type Category,
} from './scoring';

export const DICE_PER_TURN = 5;
export const ROLLS_PER_TURN = 3;

export interface YahtzeePlayer {
  name: string;
  scores: Partial<Record<Category, number>>;
}

export interface YahtzeeState {
  players: YahtzeePlayer[];
  current: number;
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  rolledThisTurn: boolean;
  /** Incrémenté à chaque lancer : sert de déclencheur d'animation à l'UI. */
  rollNonce: number;
  phase: 'play' | 'over';
}

function freshTurn(): Pick<
  YahtzeeState,
  'dice' | 'held' | 'rollsLeft' | 'rolledThisTurn'
> {
  return {
    dice: Array.from({ length: DICE_PER_TURN }, () => 1),
    held: Array.from({ length: DICE_PER_TURN }, () => false),
    rollsLeft: ROLLS_PER_TURN,
    rolledThisTurn: false,
  };
}

export function createYahtzee(names: string[]): YahtzeeState {
  const players = names.map(name => ({ name, scores: {} }));
  return {
    players: players.length > 0 ? players : [{ name: 'Joueur 1', scores: {} }],
    current: 0,
    ...freshTurn(),
    rollNonce: 0,
    phase: 'play',
  };
}

export function canRoll(state: YahtzeeState): boolean {
  return state.phase === 'play' && state.rollsLeft > 0;
}

export function canScore(state: YahtzeeState): boolean {
  return state.phase === 'play' && state.rolledThisTurn;
}

/** Relance les dés non gardés (au 1er lancer, tous les dés). */
export function rollDiceAction(
  state: YahtzeeState,
  rng: Rng = Math.random
): YahtzeeState {
  if (!canRoll(state)) return state;
  const dice = state.dice.map((value, i) =>
    state.held[i] && state.rolledThisTurn ? value : rollDie(6, rng)
  );
  return {
    ...state,
    dice,
    rollsLeft: state.rollsLeft - 1,
    rolledThisTurn: true,
    rollNonce: state.rollNonce + 1,
  };
}

/** Garde/relâche un dé (seulement après un lancer). */
export function toggleHold(state: YahtzeeState, index: number): YahtzeeState {
  if (!state.rolledThisTurn || state.phase === 'over') return state;
  if (index < 0 || index >= state.held.length) return state;
  const held = state.held.slice();
  held[index] = !held[index];
  return { ...state, held };
}

export function isCategoryFilled(
  player: YahtzeePlayer,
  category: Category
): boolean {
  return player.scores[category] !== undefined;
}

/** Score que rapporterait la catégorie avec la main courante. */
export function previewScore(state: YahtzeeState, category: Category): number {
  return scoreCategory(category, state.dice);
}

function allCategoriesFilled(player: YahtzeePlayer): boolean {
  return CATEGORIES.every(c => isCategoryFilled(player, c));
}

/** Inscrit la catégorie pour le joueur courant puis passe au tour suivant. */
export function scoreCategoryAction(
  state: YahtzeeState,
  category: Category
): YahtzeeState {
  if (!canScore(state)) return state;
  const player = state.players[state.current]!;
  if (isCategoryFilled(player, category)) return state;

  const players = state.players.slice();
  players[state.current] = {
    ...player,
    scores: {
      ...player.scores,
      [category]: scoreCategory(category, state.dice),
    },
  };

  const everyoneDone = players.every(allCategoriesFilled);
  if (everyoneDone) {
    return { ...state, players, phase: 'over' };
  }

  return {
    ...state,
    players,
    current: (state.current + 1) % players.length,
    ...freshTurn(),
  };
}

export function upperSum(player: YahtzeePlayer): number {
  return UPPER_CATEGORIES.reduce((acc, c) => acc + (player.scores[c] ?? 0), 0);
}

export function upperBonus(player: YahtzeePlayer): number {
  return upperSum(player) >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS : 0;
}

export function totalScore(player: YahtzeePlayer): number {
  const all = CATEGORIES.reduce((acc, c) => acc + (player.scores[c] ?? 0), 0);
  return all + upperBonus(player);
}

/** Index du/des joueur(s) en tête (gère les égalités). */
export function leaders(state: YahtzeeState): number[] {
  const totals = state.players.map(totalScore);
  const best = Math.max(...totals);
  return totals.flatMap((t, i) => (t === best ? [i] : []));
}
