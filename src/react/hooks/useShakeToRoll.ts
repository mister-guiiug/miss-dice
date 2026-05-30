import { useEffect, useRef } from 'react';

/** Variation d'accélération (m/s²) au-delà de laquelle on considère un shake. */
const SHAKE_THRESHOLD = 14;
/** Délai minimal entre deux secousses, pour éviter les lancers en rafale. */
const SHAKE_COOLDOWN_MS = 900;

interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * iOS 13+ exige une autorisation explicite (depuis un geste utilisateur)
 * avant d'émettre `devicemotion`. Sur les autres plateformes, l'API est
 * disponible sans permission → on considère l'accès accordé.
 */
export async function requestMotionPermission(): Promise<boolean> {
  const Ctor = (globalThis as { DeviceMotionEvent?: DeviceMotionEventStatic })
    .DeviceMotionEvent;
  if (Ctor && typeof Ctor.requestPermission === 'function') {
    try {
      return (await Ctor.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  return typeof globalThis.DeviceMotionEvent !== 'undefined';
}

/**
 * Déclenche `onShake` quand l'appareil est secoué. Détection basée sur la
 * variation brutale de l'accélération (indépendante de l'orientation),
 * avec temporisation anti-rebond. Sans effet si `enabled` est faux ou si
 * l'API DeviceMotion est absente (fallback silencieux).
 */
export function useShakeToRoll(enabled: boolean, onShake: () => void): void {
  // onShake dans une ref : le handler reste stable, pas de ré-abonnement
  // à chaque rendu du parent. La ref est mise à jour en effet (et non
  // pendant le rendu) pour rester conforme aux règles des hooks.
  const onShakeRef = useRef(onShake);
  useEffect(() => {
    onShakeRef.current = onShake;
  });

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window))
      return;

    let lastMagnitude: number | null = null;
    let lastShakeAt = 0;

    const handler = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity;
      if (!a) return;
      const magnitude = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      if (lastMagnitude !== null) {
        const delta = Math.abs(magnitude - lastMagnitude);
        const now = Date.now();
        if (delta > SHAKE_THRESHOLD && now - lastShakeAt > SHAKE_COOLDOWN_MS) {
          lastShakeAt = now;
          onShakeRef.current();
        }
      }
      lastMagnitude = magnitude;
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [enabled]);
}
