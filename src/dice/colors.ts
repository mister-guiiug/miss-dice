import type { D6Value, DieValue } from '../types';

/** Clé de teinte stable (traduite côté i18n, jamais affichée brute). */
export type ColorKey =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet';

export interface FaceColor {
  /** Couleur de fond de la face (teinte propre à la valeur). */
  readonly bg: string;
  /** Variante plus sombre pour le dégradé / les ombres de relief. */
  readonly bgDeep: string;
  /** Clé de teinte (pour l'accessibilité, traduite à l'affichage). */
  readonly key: ColorKey;
}

/**
 * Une teinte distincte par face. Les points/chiffres restent toujours
 * blancs et portent une ombre : la lisibilité ne dépend jamais de cette
 * couleur. La valeur se lit au nombre de points (D6) ou au chiffre, et
 * via aria-label. La couleur n'est qu'un repère ludique.
 */
export const FACE_COLORS: Record<D6Value, FaceColor> = {
  1: { bg: '#e5484d', bgDeep: '#b21d22', key: 'red' },
  2: { bg: '#f2711c', bgDeep: '#bd4e05', key: 'orange' },
  3: { bg: '#f5b700', bgDeep: '#bd8a00', key: 'yellow' },
  4: { bg: '#2bb673', bgDeep: '#178551', key: 'green' },
  5: { bg: '#3b82f6', bgDeep: '#1d5fd0', key: 'blue' },
  6: { bg: '#8b5cf6', bgDeep: '#6635d8', key: 'violet' },
};

const PALETTE: readonly FaceColor[] = [
  FACE_COLORS[1],
  FACE_COLORS[2],
  FACE_COLORS[3],
  FACE_COLORS[4],
  FACE_COLORS[5],
  FACE_COLORS[6],
];

/**
 * Teinte d'une valeur quelconque (au-delà du D6, la palette de 6 couleurs
 * cycle). Les faces 1..6 conservent leur teinte d'origine.
 */
export function colorForValue(value: DieValue): FaceColor {
  const index = (Math.max(1, Math.floor(value)) - 1) % PALETTE.length;
  return PALETTE[index]!;
}

/** Alias rétro-compatible (rendu d'une face). */
export const faceColor = colorForValue;
