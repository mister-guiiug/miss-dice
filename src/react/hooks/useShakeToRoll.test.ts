import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShakeToRoll } from './useShakeToRoll';

function fireMotion(x: number, y: number, z: number) {
  const event = new Event('devicemotion');
  Object.assign(event, { accelerationIncludingGravity: { x, y, z } });
  window.dispatchEvent(event);
}

describe('useShakeToRoll', () => {
  afterEach(() => {
    delete (window as { DeviceMotionEvent?: unknown }).DeviceMotionEvent;
  });

  it('ne s’abonne pas si désactivé', () => {
    (window as { DeviceMotionEvent?: unknown }).DeviceMotionEvent = class {};
    const onShake = vi.fn();
    renderHook(() => useShakeToRoll(false, onShake));
    fireMotion(0, 0, 0);
    fireMotion(40, 0, 0);
    expect(onShake).not.toHaveBeenCalled();
  });

  it('déclenche au-delà du seuil, puis respecte la temporisation', () => {
    (window as { DeviceMotionEvent?: unknown }).DeviceMotionEvent = class {};
    const onShake = vi.fn();
    renderHook(() => useShakeToRoll(true, onShake));

    fireMotion(0, 0, 0); // établit la base
    fireMotion(40, 0, 0); // variation forte -> secousse
    expect(onShake).toHaveBeenCalledTimes(1);

    fireMotion(0, 0, 0); // nouvelle variation forte mais dans la temporisation
    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it('ignore les petits mouvements sous le seuil', () => {
    (window as { DeviceMotionEvent?: unknown }).DeviceMotionEvent = class {};
    const onShake = vi.fn();
    renderHook(() => useShakeToRoll(true, onShake));

    fireMotion(9, 0, 0);
    fireMotion(11, 0, 0); // delta 2, sous le seuil
    expect(onShake).not.toHaveBeenCalled();
  });
});
