/**
 * Yahtzee — calcul des scores par catégorie. Logique pure, sans React ni
 * DOM, entièrement testable. Une « main » est un tableau de 5 faces (1..6).
 */
export type UpperCategory =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes';
export type LowerCategory =
  | 'threeKind'
  | 'fourKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yahtzee'
  | 'chance';
export type Category = UpperCategory | LowerCategory;

export const UPPER_CATEGORIES: readonly UpperCategory[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
];
export const LOWER_CATEGORIES: readonly LowerCategory[] = [
  'threeKind',
  'fourKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yahtzee',
  'chance',
];
export const CATEGORIES: readonly Category[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES,
];

export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS = 35;

const FULL_HOUSE_SCORE = 25;
const SMALL_STRAIGHT_SCORE = 30;
const LARGE_STRAIGHT_SCORE = 40;
const YAHTZEE_SCORE = 50;

/** Compte les occurrences de chaque face : counts[k] = nb de dés valant k. */
function faceCounts(dice: readonly number[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) {
    if (d >= 1 && d <= 6) counts[d]! += 1;
  }
  return counts;
}

const sum = (dice: readonly number[]): number =>
  dice.reduce((a, b) => a + b, 0);

function hasStraight(dice: readonly number[], length: 4 | 5): boolean {
  const present = new Set(dice);
  const runs =
    length === 5
      ? [
          [1, 2, 3, 4, 5],
          [2, 3, 4, 5, 6],
        ]
      : [
          [1, 2, 3, 4],
          [2, 3, 4, 5],
          [3, 4, 5, 6],
        ];
  return runs.some(run => run.every(n => present.has(n)));
}

/** Score d'une catégorie pour une main donnée (0 si la combinaison manque). */
export function scoreCategory(
  category: Category,
  dice: readonly number[]
): number {
  const counts = faceCounts(dice);
  switch (category) {
    case 'ones':
    case 'twos':
    case 'threes':
    case 'fours':
    case 'fives':
    case 'sixes': {
      const face = UPPER_CATEGORIES.indexOf(category) + 1;
      return counts[face]! * face;
    }
    case 'threeKind':
      return counts.some(c => c >= 3) ? sum(dice) : 0;
    case 'fourKind':
      return counts.some(c => c >= 4) ? sum(dice) : 0;
    case 'fullHouse': {
      const present = counts.filter(c => c > 0).sort((a, b) => a - b);
      // 3+2 strict (cinq identiques ne comptent pas comme full).
      return present.length === 2 && present[0] === 2 && present[1] === 3
        ? FULL_HOUSE_SCORE
        : 0;
    }
    case 'smallStraight':
      return hasStraight(dice, 4) ? SMALL_STRAIGHT_SCORE : 0;
    case 'largeStraight':
      return hasStraight(dice, 5) ? LARGE_STRAIGHT_SCORE : 0;
    case 'yahtzee':
      return counts.some(c => c === 5) ? YAHTZEE_SCORE : 0;
    case 'chance':
      return sum(dice);
  }
}
