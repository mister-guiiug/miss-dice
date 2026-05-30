import type { DieValue } from '../types';

export interface FaceColor {
  /** Couleur de fond de la face (teinte propre à la valeur). */
  readonly bg: string;
  /** Variante plus sombre pour le dégradé / les ombres de relief. */
  readonly bgDeep: string;
  /** Libellé de la teinte, pour l'accessibilité et le debug. */
  readonly hue: string;
}

/**
 * Une teinte distincte par face. Les points restent toujours blancs et
 * portent une ombre, si bien que la lisibilité ne dépend jamais de cette
 * couleur : la valeur se lit au nombre de points (et via aria-label).
 * La couleur n'est qu'un repère ludique supplémentaire.
 */
export const FACE_COLORS: Record<DieValue, FaceColor> = {
  1: { bg: '#e5484d', bgDeep: '#b21d22', hue: 'rouge' },
  2: { bg: '#f2711c', bgDeep: '#bd4e05', hue: 'orange' },
  3: { bg: '#f5b700', bgDeep: '#bd8a00', hue: 'jaune' },
  4: { bg: '#2bb673', bgDeep: '#178551', hue: 'vert' },
  5: { bg: '#3b82f6', bgDeep: '#1d5fd0', hue: 'bleu' },
  6: { bg: '#8b5cf6', bgDeep: '#6635d8', hue: 'violet' },
};

export function faceColor(value: DieValue): FaceColor {
  return FACE_COLORS[value];
}
