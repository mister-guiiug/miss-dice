/**
 * Types de dés supportés. Chaque type décrit :
 *  - `sides`    : nombre de faces (et donc l'intervalle de tirage 1..sides)
 *  - `render`   : `pips` (points, réservé au D6) ou `numeral` (chiffre)
 *  - `clipPath` : silhouette CSS de la face (absente = carré arrondi)
 *  - `nudgeY`   : recentrage vertical du chiffre dans les formes pointues
 *
 * Données pures, sans React ni DOM : la couche rendu se contente de lire
 * cette config.
 */
export interface DieType {
  sides: number;
  /** Étiquette courte, neutre linguistiquement, ex. « D6 ». */
  label: string;
  render: 'pips' | 'numeral';
  /** clip-path CSS de la silhouette ; absent → carré à coins arrondis. */
  clipPath?: string;
  /** Décalage vertical du chiffre (en %), pour les formes non centrées. */
  nudgeY?: number;
}

export const DICE_TYPES: readonly DieType[] = [
  {
    sides: 4,
    label: 'D4',
    render: 'numeral',
    clipPath: 'polygon(50% 4%, 96% 92%, 4% 92%)',
    nudgeY: 14,
  },
  { sides: 6, label: 'D6', render: 'pips' },
  {
    sides: 8,
    label: 'D8',
    render: 'numeral',
    clipPath: 'polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)',
  },
  {
    sides: 10,
    label: 'D10',
    render: 'numeral',
    clipPath: 'polygon(50% 0%, 95% 38%, 50% 100%, 5% 38%)',
  },
  {
    sides: 12,
    label: 'D12',
    render: 'numeral',
    clipPath: 'polygon(50% 1%, 99% 38%, 81% 99%, 19% 99%, 1% 38%)',
  },
  {
    sides: 20,
    label: 'D20',
    render: 'numeral',
    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
  },
];

export const DEFAULT_SIDES = 6;

const BY_SIDES = new Map(DICE_TYPES.map(type => [type.sides, type]));

/** Nombre de faces autorisés (pour valider les préférences stockées). */
export const SUPPORTED_SIDES: readonly number[] = DICE_TYPES.map(t => t.sides);

/** Renvoie la config d'un type de dé, avec repli sur le D6 si inconnu. */
export function dieType(sides: number): DieType {
  return BY_SIDES.get(sides) ?? BY_SIDES.get(DEFAULT_SIDES)!;
}
