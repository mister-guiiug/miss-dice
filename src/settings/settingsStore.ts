import { useSyncExternalStore } from 'react';

/**
 * Préférences locales de l'utilisateur. Volontairement minimal :
 * miss-dice ne stocke QUE ce qui est nécessaire au confort de jeu,
 * tout reste sur l'appareil (localStorage), rien n'est transmis.
 */
export interface Settings {
  /** Vibration légère au résultat (si l'appareil la supporte). */
  haptics: boolean;
  /**
   * Préférence de mouvement :
   *  - `auto`    : suit le réglage système (prefers-reduced-motion)
   *  - `reduced` : force le mode sans animation, quel que soit le système
   */
  motion: 'auto' | 'reduced';
}

const STORAGE_KEY = 'miss-dice:settings';

const DEFAULTS: Settings = {
  haptics: true,
  motion: 'auto',
};

/** localStorage tolérant aux modes navigation privée / quota plein. */
function safeRead(): Settings {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      haptics:
        typeof parsed.haptics === 'boolean' ? parsed.haptics : DEFAULTS.haptics,
      motion: parsed.motion === 'reduced' ? 'reduced' : 'auto',
    };
  } catch {
    return DEFAULTS;
  }
}

function safeWrite(value: Settings): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore : pas de persistance possible, on reste en mémoire */
  }
}

let state: Settings = safeRead();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(patch: Partial<Settings>): void {
  state = { ...state, ...patch };
  safeWrite(state);
  emit();
}

export const settingsStore = {
  get: (): Settings => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setHaptics: (haptics: boolean) => setState({ haptics }),
  setMotion: (motion: Settings['motion']) => setState({ motion }),
  toggleHaptics: () => setState({ haptics: !state.haptics }),
};

/** Hook React : relit le store et re-rend au changement. */
export function useSettings(): Settings {
  return useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.get,
    settingsStore.get
  );
}
