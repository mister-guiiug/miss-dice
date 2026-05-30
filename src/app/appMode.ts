import { useSyncExternalStore } from 'react';

/** Écran actif de l'application. */
export type AppMode = 'roll' | 'yahtzee' | 'dice421' | 'notation' | 'decide';

const MODES: readonly AppMode[] = [
  'roll',
  'yahtzee',
  'dice421',
  'notation',
  'decide',
];

/** Lit un mode initial depuis `?play=` (raccourcis manifest / liens). */
function initialMode(): AppMode {
  try {
    const play = new URLSearchParams(globalThis.location?.search).get('play');
    return play && (MODES as readonly string[]).includes(play)
      ? (play as AppMode)
      : 'roll';
  } catch {
    return 'roll';
  }
}

// Non persisté : l'app s'ouvre sur le lancer libre (sauf raccourci ?play=).
let mode: AppMode = initialMode();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setInternal(next: AppMode): void {
  if (next === mode) return;
  mode = next;
  emit();
}

export const appModeStore = {
  get: (): AppMode => mode,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /**
   * Entre dans un mode. Empile une entrée d'historique en quittant le
   * lancer libre, pour que le bouton « retour » du navigateur/Android
   * ramène à l'écran de dé au lieu de fermer l'app.
   */
  set(next: AppMode): void {
    if (next === mode) return;
    if (next !== 'roll' && mode === 'roll' && typeof history !== 'undefined') {
      try {
        history.pushState({ missDiceMode: next }, '');
      } catch {
        /* ignore */
      }
    }
    setInternal(next);
  },
  /** Quitte le mode courant (bouton retour) en dépilant l'historique. */
  leave(): void {
    if (mode !== 'roll' && typeof history !== 'undefined') {
      history.back(); // déclenche popstate → retour au lancer libre
    } else {
      setInternal('roll');
    }
  },
};

// Le bouton retour matériel/navigateur ramène au lancer libre.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (mode !== 'roll') setInternal('roll');
  });
}

export function useAppMode(): AppMode {
  return useSyncExternalStore(
    appModeStore.subscribe,
    appModeStore.get,
    appModeStore.get
  );
}
