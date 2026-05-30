import { createStore, useStore } from '../store/createStore';
import { DEFAULT_SIDES, SUPPORTED_SIDES } from '../dice/diceTypes';
import { detectLocale, type Locale } from '../i18n/messages';

/** Bornes du nombre de dés affichés simultanément. */
export const MIN_DICE = 1;
export const MAX_DICE = 6;

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
  /** Nombre de faces du dé (4, 6, 8, 10, 12, 20). */
  sides: number;
  /** Nombre de dés lancés simultanément. */
  diceCount: number;
  /** Autoriser le lancer en secouant l'appareil. */
  shake: boolean;
  /** Langue de l'interface. */
  locale: Locale;
  /** Thème visuel : `auto` suit le système, sinon forcé. */
  theme: 'auto' | 'light' | 'dark';
  /** Sons activés (petit retour audio au lancer / résultat). */
  sounds: boolean;
  /** Annonce vocale du résultat (synthèse vocale du navigateur). */
  tts: boolean;
  /** Mode daltonien : ajoute la valeur chiffrée sur chaque face. */
  colorblind: boolean;
}

const STORAGE_KEY = 'miss-dice:settings';

const DEFAULTS: Settings = {
  haptics: true,
  motion: 'auto',
  sides: DEFAULT_SIDES,
  diceCount: 1,
  shake: false,
  // Détectée depuis la langue du navigateur au premier lancement.
  locale: detectLocale(),
  theme: 'auto',
  sounds: false,
  tts: false,
  colorblind: false,
};

function validTheme(value: unknown): Settings['theme'] {
  return value === 'light' || value === 'dark' || value === 'auto'
    ? value
    : DEFAULTS.theme;
}

function clampDice(value: unknown): number {
  const n = typeof value === 'number' ? Math.floor(value) : DEFAULTS.diceCount;
  return Math.min(MAX_DICE, Math.max(MIN_DICE, n));
}

function validSides(value: unknown): number {
  return typeof value === 'number' && SUPPORTED_SIDES.includes(value)
    ? value
    : DEFAULTS.sides;
}

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
      sides: validSides(parsed.sides),
      diceCount: clampDice(parsed.diceCount),
      shake: typeof parsed.shake === 'boolean' ? parsed.shake : DEFAULTS.shake,
      locale: detectLocale(parsed.locale),
      theme: validTheme(parsed.theme),
      sounds:
        typeof parsed.sounds === 'boolean' ? parsed.sounds : DEFAULTS.sounds,
      tts: typeof parsed.tts === 'boolean' ? parsed.tts : DEFAULTS.tts,
      colorblind:
        typeof parsed.colorblind === 'boolean'
          ? parsed.colorblind
          : DEFAULTS.colorblind,
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

const store = createStore<Settings>(safeRead(), safeWrite);

function setState(patch: Partial<Settings>): void {
  store.set({ ...store.get(), ...patch });
}

export const settingsStore = {
  get: store.get,
  subscribe: store.subscribe,
  setHaptics: (haptics: boolean) => setState({ haptics }),
  setMotion: (motion: Settings['motion']) => setState({ motion }),
  setSides: (sides: number) => setState({ sides: validSides(sides) }),
  setDiceCount: (diceCount: number) =>
    setState({ diceCount: clampDice(diceCount) }),
  setShake: (shake: boolean) => setState({ shake }),
  setLocale: (locale: Locale) => setState({ locale }),
  setTheme: (theme: Settings['theme']) =>
    setState({ theme: validTheme(theme) }),
  setSounds: (sounds: boolean) => setState({ sounds }),
  setTts: (tts: boolean) => setState({ tts }),
  setColorblind: (colorblind: boolean) => setState({ colorblind }),
  toggleHaptics: () => setState({ haptics: !store.get().haptics }),
};

/** Hook React : relit le store et re-rend au changement. */
export function useSettings(): Settings {
  return useStore(store);
}
