/**
 * Yahtzee - machine d'état pure (pass-and-play, 1 à N joueurs).
 *
 * Aucune dépendance React/DOM : chaque action renvoie un nouvel état, ce
 * qui rend tout le déroulé testable. L'aléa est injectable.
 */
import { defaultRng, type Rng } from '../../dice/random';
import { freshDice, freshHeld, reroll, toggleAt } from '../diceTurn';
import {
  CATEGORIES,
  LOWER_CATEGORIES,
  UPPER_CATEGORIES,
  UPPER_BONUS,
  UPPER_BONUS_THRESHOLD,
  scoreCategory,
  scoreCategoryAsJoker,
  type Category,
} from './scoring';

export const DICE_PER_TURN = 5;
export const ROLLS_PER_TURN = 3;
/** Bonus par Yahtzee supplémentaire (après un premier Yahtzee à 50). */
const YAHTZEE_BONUS = 100;

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

/**
 * La main courante joue-t-elle en JOKER ?
 *
 * Condition officielle : cinq dés identiques ALORS QUE la case Yahtzee est
 * déjà remplie - à 50 comme à 0. Le zéro compte : il ne donne pas les +100,
 * mais il impose exactement le même placement. Beaucoup d'implémentations
 * l'oublient et n'appliquent le joker qu'après un Yahtzee réussi ; c'est la
 * moitié de la règle.
 *
 * ⚠️ `rolledThisTurn` N'EST PAS UNE PRÉCAUTION D'USAGE. `freshDice` remplit le
 * tour de cinq 1 (`../diceTurn.ts`) : avant le premier lancer, l'état PORTE
 * un Yahtzee de 1 qui n'a jamais été lancé. Sans cette garde, un joueur ayant
 * déjà sa case Yahtzee verrait, en arrivant sur son tour, la grille se
 * restreindre à la case « Les 1 ».
 */
export function jokerActif(state: YahtzeeState): boolean {
  if (!state.rolledThisTurn) return false;
  const player = state.players[state.current]!;
  return (
    player.scores.yahtzee !== undefined &&
    scoreCategory('yahtzee', state.dice) === 50
  );
}

/**
 * Les cases où le joueur courant PEUT inscrire la main courante.
 *
 * Hors joker, c'est toute case libre - le joueur choisit, y compris de sacrifier
 * une case à zéro. Le joker, lui, IMPOSE un ordre, et c'est la partie de la
 * règle qui se perd le plus souvent :
 *
 *  1. la case haute de la figure (cinq 4 → « Les 4 ») si elle est libre : elle
 *     seule, sans discussion ;
 *  2. sinon, n'importe quelle combinaison basse libre, payée plein
 *     (`scoreCategoryAsJoker`) ;
 *  3. sinon seulement, une case haute libre - qui passera forcément à zéro.
 *
 * L'ordre n'est pas décoratif : il empêche de garder la meilleure main du jeu
 * pour bourrer une case haute pendant qu'une grande suite attend. Rendre la
 * liste plutôt qu'un booléen laisse l'IHM griser ce qui est interdit au lieu
 * de refuser le clic après coup.
 */
export function categoriesAutorisees(state: YahtzeeState): Category[] {
  const player = state.players[state.current]!;
  const libres = CATEGORIES.filter(c => !isCategoryFilled(player, c));
  if (!jokerActif(state)) return libres;

  // Cinq dés identiques : la première face suffit à nommer la figure.
  const haute = UPPER_CATEGORIES[state.dice[0]! - 1];
  if (haute !== undefined && libres.includes(haute)) return [haute];

  const basses = libres.filter(c =>
    (LOWER_CATEGORIES as readonly Category[]).includes(c)
  );
  return basses.length > 0 ? basses : libres;
}

/** Score que rapporterait la catégorie avec la main courante. */
export function previewScore(state: YahtzeeState, category: Category): number {
  return jokerActif(state)
    ? scoreCategoryAsJoker(category, state.dice)
    : scoreCategory(category, state.dice);
}

/** La main courante est-elle un Yahtzee bonus pour le joueur courant ? */
function earnsYahtzeeBonus(state: YahtzeeState): boolean {
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
  // Une case remplie était déjà refusée ; `categoriesAutorisees` l'exclut et
  // ajoute l'ordre imposé par le joker. Le moteur garde donc la règle même si
  // l'IHM laisse passer un clic - c'est lui qui fait foi, pas le bouton.
  if (!categoriesAutorisees(state).includes(category)) return state;

  const bonus = earnsYahtzeeBonus(state) ? 1 : 0;
  const players = state.players.slice();
  players[state.current] = {
    ...player,
    scores: {
      ...player.scores,
      [category]: previewScore(state, category),
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
