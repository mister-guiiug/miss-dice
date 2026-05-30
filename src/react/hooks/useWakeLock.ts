import { useEffect } from 'react';

interface WakeLockSentinel {
  release: () => Promise<void>;
}
interface WakeLockNavigator {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
}

/**
 * Garde l'écran allumé tant que `active` est vrai (utile en pass-and-play).
 * Réacquiert le verrou au retour de l'app au premier plan. Sans effet si
 * l'API Screen Wake Lock est absente (fallback silencieux).
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & WakeLockNavigator;
    if (!nav.wakeLock) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await nav.wakeLock!.request('screen');
        if (cancelled) void lock.release();
        else sentinel = lock;
      } catch {
        /* refusé / non supporté : on continue sans */
      }
    };
    void request();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
