import type { D6Value } from '../types';

/**
 * Position d'un point (pip) sur la grille 3×3 d'une face de D6,
 * indexée de 0 à 8 :
 *
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Le rendu place neuf cellules dans une grille CSS et n'allume que
 * celles listées ici — la disposition reflète un vrai dé. Réservé au D6 ;
 * les autres dés affichent un chiffre.
 */
export const PIP_LAYOUT: Record<D6Value, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function isD6Value(value: number): value is D6Value {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

/** Vrai si la cellule `index` (0..8) doit afficher un point pour `value`. */
export function isPipFilled(value: number, index: number): boolean {
  return isD6Value(value) && PIP_LAYOUT[value].includes(index);
}
