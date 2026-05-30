import { rollDie, type Rng } from '../dice/random';

/** Helpers de tour partagés entre les moteurs Yahtzee et 421 (DRY). */

export function freshDice(count: number): number[] {
  return Array.from({ length: count }, () => 1);
}

export function freshHeld(count: number): boolean[] {
  return Array.from({ length: count }, () => false);
}

/** Relance les dés non gardés (au 1er lancer, rolledThisTurn=false → tous). */
export function reroll(
  dice: number[],
  held: boolean[],
  rolledThisTurn: boolean,
  sides: number,
  rng: Rng
): number[] {
  return dice.map((value, i) =>
    held[i] && rolledThisTurn ? value : rollDie(sides, rng)
  );
}

/** Bascule la garde d'un dé ; renvoie null si l'index est hors limites. */
export function toggleAt(held: boolean[], index: number): boolean[] | null {
  if (index < 0 || index >= held.length) return null;
  const next = held.slice();
  next[index] = !next[index];
  return next;
}
