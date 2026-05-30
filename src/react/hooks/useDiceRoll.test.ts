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
    expect(result.current.value).toBe(4);
    expect(onResult).toHaveBeenCalledWith(4);
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
    expect(result.current.value).toBe(4);
    expect(onResult).toHaveBeenCalledWith(4);
  });

  it('ignore les taps pendant une animation (anti double-tap)', () => {
    const onRollStart = vi.fn();
    const { result } = renderHook(() =>
      useDiceRoll({ durationMs: 600, rng: () => 0.5, onRollStart })
    );

    act(() => result.current.roll());
    act(() => result.current.roll()); // doit être ignoré
    act(() => result.current.roll()); // idem

    expect(onRollStart).toHaveBeenCalledTimes(1);

    // Une fois posé, un nouveau lancer est de nouveau possible.
    act(() => vi.advanceTimersByTime(600));
    act(() => result.current.roll());
    expect(onRollStart).toHaveBeenCalledTimes(2);
  });
});
