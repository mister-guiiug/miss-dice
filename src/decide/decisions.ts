import type { Rng } from '../dice/random';

/** Outils de décision aléatoires — logique pure, sans React. */

export type Coin = 'heads' | 'tails';

export function flipCoin(rng: Rng): Coin {
  return rng() < 0.5 ? 'heads' : 'tails';
}

export function yesNo(rng: Rng): boolean {
  return rng() < 0.5;
}

/** Choisit un élément au hasard ; null si la liste est vide. */
export function pickOne<T>(items: readonly T[], rng: Rng): T | null {
  if (items.length === 0) return null;
  const index = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[index]!;
}

/** Mélange (Fisher-Yates) sans muter l'entrée. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Nettoie une saisie multi-ligne en liste d'options non vides. */
export function parseOptions(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
