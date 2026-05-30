import { createStore, useStore } from '../store/createStore';

/** Écran actif de l'application. */
export type AppMode =
  | 'roll'
  | 'yahtzee'
  | 'dice421'
  | 'pig'
  | 'notation'
  | 'decide';

const MODES: readonly AppMode[] = [
  'roll',
  'yahtzee',
  'dice421',
  'pig',
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
const store = createStore<AppMode>(initialMode());

export const appModeStore = {
  get: store.get,
  subscribe: store.subscribe,
  /**
   * Entre dans un mode. Empile une entrée d'historique en quittant le
   * lancer libre, pour que le bouton « retour » du navigateur/Android
   * ramène à l'écran de dé au lieu de fermer l'app.
   */
  set(next: AppMode): void {
    const mode = store.get();
    if (next === mode) return;
    if (next !== 'roll' && mode === 'roll' && typeof history !== 'undefined') {
      try {
        history.pushState({ missDiceMode: next }, '');
      } catch {
        /* ignore */
      }
    }
    store.set(next);
  },
  /** Quitte le mode courant (bouton retour) en dépilant l'historique. */
  leave(): void {
    if (store.get() !== 'roll' && typeof history !== 'undefined') {
      history.back(); // déclenche popstate → retour au lancer libre
    } else {
      store.set('roll');
    }
  },
};

// Le bouton retour matériel/navigateur ramène au lancer libre.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (store.get() !== 'roll') store.set('roll');
  });
}

export function useAppMode(): AppMode {
  return useStore(store);
}
