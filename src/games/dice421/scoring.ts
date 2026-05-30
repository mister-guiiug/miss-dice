/**
 * 421 — classement et valeur en jetons d'une main de 3 dés. Logique pure.
 *
 * Version classique simplifiée (assumée et documentée) :
 *  - 4-2-1 : la meilleure main, vaut 10 jetons.
 *  - 1-1-1 (brelan d'as) : vaut 7 jetons.
 *  - autre brelan d-d-d : vaut la valeur du dé (2..6).
 *  - toute autre main (« quelconque ») : vaut 1 jeton.
 *
 * `rank` ordonne totalement les mains (plus grand = meilleur) :
 *  421 > 111 > brelans (6→2) > mains quelconques (comparées par dés
 *  triés décroissants).
 */
export type HandKind = '421' | 'aces' | 'trips' | 'plain';

export interface HandValue {
  /** Dés triés décroissants, ex. [6,5,2]. */
  dice: number[];
  kind: HandKind;
  /** Clé d'ordre total (plus grand = meilleur). */
  rank: number;
  /** Valeur en jetons quand cette main gagne la manche. */
  tokens: number;
}

function sortedDesc(dice: readonly number[]): number[] {
  return [...dice].sort((a, b) => b - a);
}

export function classify(dice: readonly number[]): HandValue {
  const d = sortedDesc(dice);
  const [a, b, c] = d as [number, number, number];

  // 4-2-1
  if (a === 4 && b === 2 && c === 1) {
    return { dice: d, kind: '421', rank: 1000, tokens: 10 };
  }
  // Brelan d'as 1-1-1
  if (a === 1 && b === 1 && c === 1) {
    return { dice: d, kind: 'aces', rank: 900, tokens: 7 };
  }
  // Brelan d-d-d (2..6)
  if (a === b && b === c) {
    return { dice: d, kind: 'trips', rank: 800 + a, tokens: a };
  }
  // Main quelconque : rang = dés triés décroissants concaténés (ex. 652).
  return { dice: d, kind: 'plain', rank: a * 100 + b * 10 + c, tokens: 1 };
}

/** Compare deux mains : > 0 si `x` est meilleure, < 0 si `y`, 0 si égalité. */
export function compareHands(x: HandValue, y: HandValue): number {
  return x.rank - y.rank;
}
