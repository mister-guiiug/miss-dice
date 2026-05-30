import type { DieValue } from '../types';
import { DEFAULT_SIDES } from './diceTypes';

/**
 * Source d'aléa : une fonction renvoyant un flottant dans [0, 1).
 * Identique au contrat de `Math.random`, ce qui la rend injectable
 * (tests déterministes) et permet de brancher une source plus forte.
 */
export type Rng = () => number;

/**
 * Aléa par défaut : `crypto.getRandomValues` (uniforme, non prévisible)
 * normalisé sur [0, 1), sinon repli silencieux sur `Math.random`. La
 * résolution 32 bits rend le biais de mappage flottant→face négligeable
 * pour des dés de 4 à 20 faces.
 */
export const defaultRng: Rng = () => {
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0]! / 2 ** 32;
  }
  return Math.random();
};

/**
 * Tire une face uniformément dans 1..sides.
 *
 * Toute la part « hasard » du produit vit ici, isolée du rendu et de
 * l'animation, pour être testée seule.
 */
export function rollDie(
  sides: number = DEFAULT_SIDES,
  rng: Rng = defaultRng
): DieValue {
  const faces = Math.max(1, Math.floor(sides));
  const value = Math.floor(rng() * faces) + 1;
  // Garde-fou : un rng pathologique renvoyant 1.0 ne doit pas déborder.
  return Math.min(faces, Math.max(1, value));
}

/** Tire `count` dés indépendants à `sides` faces. */
export function rollDice(
  count: number,
  sides: number = DEFAULT_SIDES,
  rng: Rng = defaultRng
): DieValue[] {
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n }, () => rollDie(sides, rng));
}
