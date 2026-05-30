import type { DieValue } from '../types';

/**
 * Source d'aléa : une fonction renvoyant un flottant dans [0, 1).
 * Identique au contrat de `Math.random`, ce qui la rend injectable
 * (tests déterministes) et permet de brancher une source plus forte.
 */
export type Rng = () => number;

/**
 * Aléa par défaut : `crypto.getRandomValues` si disponible (uniforme,
 * non prévisible), sinon repli silencieux sur `Math.random`. On rejette
 * la fenêtre haute non divisible par 6 pour éviter le biais modulo.
 */
export const defaultRng: Rng = () => {
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const max = 0xffffffff;
    const limit = max - (max % 6); // borne sans biais
    const buf = new Uint32Array(1);
    let n: number;
    do {
      c.getRandomValues(buf);
      n = buf[0]!;
    } while (n >= limit);
    return n / (limit || 1);
  }
  return Math.random();
};

/**
 * Tire une face uniformément dans 1..6.
 *
 * Toute la part « hasard » du produit vit ici, isolée du rendu et de
 * l'animation, pour être testée seule.
 */
export function rollDie(rng: Rng = defaultRng): DieValue {
  const value = Math.floor(rng() * 6) + 1;
  // Garde-fou : un rng pathologique renvoyant 1.0 produirait 7.
  const clamped = Math.min(6, Math.max(1, value));
  return clamped as DieValue;
}
