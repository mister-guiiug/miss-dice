import { afterEach, describe, expect, it } from 'vitest';
import { rollStatsStore } from './rollStats';

afterEach(() => {
  rollStatsStore.reset();
  localStorage.clear();
});

describe('rollStatsStore', () => {
  it('cumule les lancers, les dés et les occurrences par face', () => {
    rollStatsStore.record([3]);
    rollStatsStore.record([3, 5]);
    const s = rollStatsStore.get();
    expect(s.rolls).toBe(2);
    expect(s.dice).toBe(3);
    expect(s.counts[3]).toBe(2);
    expect(s.counts[5]).toBe(1);
  });

  it('réinitialise tout', () => {
    rollStatsStore.record([1, 2, 3]);
    rollStatsStore.reset();
    expect(rollStatsStore.get()).toEqual({ rolls: 0, dice: 0, counts: {} });
  });
});
