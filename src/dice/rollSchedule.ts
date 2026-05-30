/**
 * Calendrier d'animation d'un lancer — logique pure, sans DOM ni React.
 *
 * Renvoie les instants (ms depuis le début) où la face AFFICHÉE doit
 * changer pendant le défilement. La cadence dessine une courbe en cloche
 * inversée : intervalles longs au début (accélération perçue), courts au
 * milieu (flou rapide), puis de nouveau longs à la fin (décélération,
 * « le dé se pose »). La face finale est figée séparément à `duration`.
 */
export interface RollScheduleOptions {
  /** Durée totale du défilement, en ms. */
  durationMs: number;
  /** Intervalle minimal entre deux faces (au plus rapide). */
  minIntervalMs?: number;
  /** Intervalle maximal entre deux faces (au début et à la fin). */
  maxIntervalMs?: number;
}

export const DEFAULT_ROLL_DURATION_MS = 850;
const DEFAULT_MIN_INTERVAL_MS = 45;
const DEFAULT_MAX_INTERVAL_MS = 150;

export function buildRollSchedule(options: RollScheduleOptions): number[] {
  const {
    durationMs,
    minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
    maxIntervalMs = DEFAULT_MAX_INTERVAL_MS,
  } = options;

  if (durationMs <= 0) return [];

  const ticks: number[] = [];
  let t = 0;
  // Filet de sécurité contre une config absurde (min <= 0) qui bouclerait.
  const min = Math.max(1, minIntervalMs);
  const max = Math.max(min, maxIntervalMs);

  while (t < durationMs) {
    ticks.push(t);
    const p = t / durationMs; // progression 0..1
    const edge = Math.abs(2 * p - 1); // 1 aux extrémités, 0 au centre
    const interval = min + (max - min) * edge;
    t += interval;
  }

  return ticks;
}
