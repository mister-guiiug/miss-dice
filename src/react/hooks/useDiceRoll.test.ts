import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDiceRoll } from './useDiceRoll';

describe('useDiceRoll', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('en mouvement réduit, affiche le résultat immédiatement sans rouler', () => {
    const onResult = vi.fn();
    // rng constant -> face 4 (floor(0.5*6)+1)
    const { result } = renderHook(() =>
      useDiceRoll({ reducedMotion: true, rng: () => 0.5, onResult })
    );

    act(() => result.current.roll());

    expect(result.current.status).toBe('result');
    expect(result.current.isRolling).toBe(false);
    expect(result.current.values).toEqual([4]);
    expect(onResult).toHaveBeenCalledWith([4]);
  });

  it('passe par rolling puis result, et appelle les callbacks', () => {
    const onRollStart = vi.fn();
    const onResult = vi.fn();
    const { result } = renderHook(() =>
      useDiceRoll({ durationMs: 600, rng: () => 0.5, onRollStart, onResult })
    );

    act(() => result.current.roll());
    expect(result.current.status).toBe('rolling');
    expect(result.current.isRolling).toBe(true);
    expect(onRollStart).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(600));
    expect(result.current.status).toBe('result');
    expect(result.current.values).toEqual([4]);
    expect(onResult).toHaveBeenCalledWith([4]);
  });

  it('lance plusieurs dés à la fois (count) avec le bon nombre de faces (sides)', () => {
    const onResult = vi.fn();
    const { result } = renderHook(() =>
      useDiceRoll({
        count: 3,
        sides: 20,
        reducedMotion: true,
        rng: () => 0.5,
        onResult,
      })
    );

    act(() => result.current.roll());
    // floor(0.5 * 20) + 1 = 11
    expect(result.current.values).toEqual([11, 11, 11]);
    expect(onResult).toHaveBeenCalledWith([11, 11, 11]);
  });

  it('réinitialise l’affichage quand le nombre de dés change au repos', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useDiceRoll({ count, rng: () => 0.5 }),
      { initialProps: { count: 1 } }
    );
    expect(result.current.values).toHaveLength(1);
    rerender({ count: 4 });
    expect(result.current.values).toHaveLength(4);
  });

  it('ignore les taps pendant une animation (anti double-tap)', () => {
    const onRollStart = vi.fn();
    const { result } = renderHook(() =>
      useDiceRoll({ durationMs: 600, rng: () => 0.5, onRollStart })
    );

    act(() => result.current.roll());
    act(() => result.current.roll()); // ignoré
    act(() => result.current.roll()); // ignoré
    expect(onRollStart).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(600));
    act(() => result.current.roll());
    expect(onRollStart).toHaveBeenCalledTimes(2);
  });
});
