/**
 * Retour haptique. L'API Vibration n'existe que sur certains mobiles
 * (Android Chrome notamment ; iOS l'ignore). Tous les appels sont gardés
 * et silencieux en cas d'absence — jamais d'erreur, simple no-op.
 */

/** Légère pichenette au lancer (accusé de réception du tap). */
export const HAPTIC_ROLL = 12;

/** Petit motif de validation quand la face finale se pose. */
export const HAPTIC_RESULT: number[] = [0, 22, 40, 16];

export function vibrate(pattern: number | number[]): void {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.vibrate !== 'function'
  ) {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
