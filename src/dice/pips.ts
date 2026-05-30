import type { DieValue } from '../types';

/**
 * Position d'un point (pip) sur la grille 3×3 d'une face de dé,
 * indexée de 0 à 8 :
 *
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Le rendu place neuf cellules dans une grille CSS et n'allume que
 * celles listées ici — la disposition reflète un vrai dé.
 */
export const PIP_LAYOUT: Record<DieValue, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Vrai si la cellule `index` (0..8) doit afficher un point pour `value`. */
export function isPipFilled(value: DieValue, index: number): boolean {
  return PIP_LAYOUT[value].includes(index);
}
