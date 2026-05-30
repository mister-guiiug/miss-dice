import { describe, expect, it } from 'vitest';
import { buildRollSchedule } from './rollSchedule';

describe('buildRollSchedule', () => {
  it('démarre à 0 et reste strictement croissant sous la durée', () => {
    const ticks = buildRollSchedule({ durationMs: 850 });
    expect(ticks[0]).toBe(0);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]!).toBeGreaterThan(ticks[i - 1]!);
      expect(ticks[i]!).toBeLessThan(850);
    }
  });

  it('produit assez de changements de face pour donner un vrai défilement', () => {
    const ticks = buildRollSchedule({ durationMs: 850 });
    expect(ticks.length).toBeGreaterThanOrEqual(6);
  });

  it('accélère puis décélère : intervalles plus courts au milieu qu’aux bords', () => {
    const ticks = buildRollSchedule({ durationMs: 1200 });
    const gaps = ticks.slice(1).map((t, i) => t - ticks[i]!);
    const first = gaps[0]!;
    const mid = gaps[Math.floor(gaps.length / 2)]!;
    const last = gaps[gaps.length - 1]!;
    expect(mid).toBeLessThan(first);
    expect(mid).toBeLessThan(last);
  });

  it('renvoie une liste vide pour une durée nulle ou négative', () => {
    expect(buildRollSchedule({ durationMs: 0 })).toEqual([]);
    expect(buildRollSchedule({ durationMs: -100 })).toEqual([]);
  });

  it('ne boucle pas sur un intervalle minimal absurde', () => {
    const ticks = buildRollSchedule({
      durationMs: 300,
      minIntervalMs: 0,
      maxIntervalMs: 0,
    });
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks.length).toBeLessThanOrEqual(300);
  });
});
