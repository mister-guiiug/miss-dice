/**
 * Yahtzee — machine d'état pure (pass-and-play, 1 à N joueurs).
 *
 * Aucune dépendance React/DOM : chaque action renvoie un nouvel état, ce
 * qui rend tout le déroulé testable. L'aléa est injectable.
 */
import { defaultRng, type Rng } from '../../dice/random';
import { freshDice, freshHeld, reroll, toggleAt } from '../diceTurn';
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
/** Bonus par Yahtzee supplémentaire (après un premier Yahtzee à 50). */
export const YAHTZEE_BONUS = 100;

export interface YahtzeePlayer {
  name: string;
  scores: Partial<Record<Category, number>>;
  /** Nombre de Yahtzees bonus obtenus (chacun vaut YAHTZEE_BONUS). */
  bonusYahtzees: number;
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
    dice: freshDice(DICE_PER_TURN),
    held: freshHeld(DICE_PER_TURN),
    rollsLeft: ROLLS_PER_TURN,
    rolledThisTurn: false,
  };
}

export function createYahtzee(names: string[]): YahtzeeState {
  const list = names.length > 0 ? names : ['Joueur 1'];
  return {
    players: list.map(name => ({ name, scores: {}, bonusYahtzees: 0 })),
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
  rng: Rng = defaultRng
): YahtzeeState {
  if (!canRoll(state)) return state;
  return {
    ...state,
    dice: reroll(state.dice, state.held, state.rolledThisTurn, 6, rng),
    rollsLeft: state.rollsLeft - 1,
    rolledThisTurn: true,
    rollNonce: state.rollNonce + 1,
  };
}

/** Garde/relâche un dé (seulement après un lancer). */
export function toggleHold(state: YahtzeeState, index: number): YahtzeeState {
  if (!state.rolledThisTurn || state.phase === 'over') return state;
  const held = toggleAt(state.held, index);
  return held ? { ...state, held } : state;
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

/** La main courante est-elle un Yahtzee bonus pour le joueur courant ? */
export function earnsYahtzeeBonus(state: YahtzeeState): boolean {
  const player = state.players[state.current]!;
  return (
    player.scores.yahtzee === 50 && scoreCategory('yahtzee', state.dice) === 50
  );
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

  const bonus = earnsYahtzeeBonus(state) ? 1 : 0;
  const players = state.players.slice();
  players[state.current] = {
    ...player,
    scores: {
      ...player.scores,
      [category]: scoreCategory(category, state.dice),
    },
    bonusYahtzees: player.bonusYahtzees + bonus,
  };

  if (players.every(allCategoriesFilled)) {
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

export function yahtzeeBonusPoints(player: YahtzeePlayer): number {
  return player.bonusYahtzees * YAHTZEE_BONUS;
}

export function totalScore(player: YahtzeePlayer): number {
  const all = CATEGORIES.reduce((acc, c) => acc + (player.scores[c] ?? 0), 0);
  return all + upperBonus(player) + yahtzeeBonusPoints(player);
}

/** Index du/des joueur(s) en tête (gère les égalités). */
export function leaders(state: YahtzeeState): number[] {
  const totals = state.players.map(totalScore);
  const best = Math.max(...totals);
  return totals.flatMap((t, i) => (t === best ? [i] : []));
}
