/**
 * Internationalisation — données et résolution pures (sans React).
 *
 * `translate(locale, key, params)` est utilisable partout, y compris hors
 * React (ex. le bandeau de mise à jour du service worker). Le hook
 * `useI18n` n'en est qu'une enveloppe réactive branchée sur la locale du
 * store de préférences.
 */
export type Locale = 'fr' | 'en' | 'es';

export const LOCALES: readonly Locale[] = ['fr', 'en', 'es'];

/** Noms natifs, affichés tels quels dans le sélecteur (non traduits). */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

export interface Messages {
  settings: {
    title: string;
    language: string;
    dieType: string;
    diceCount: string;
    diceCountHint: string;
    shake: string;
    shakeHint: string;
    vibration: string;
    vibrationHint: string;
    reduceMotion: string;
    reduceMotionAuto: string;
    reduceMotionHint: string;
    close: string;
    open: string;
  };
  screen: {
    hintIdleOne: string;
    hintIdleMany: string;
    rolling: string;
    relaunch: string;
    total: string;
  };
  a11y: {
    removeDie: string;
    addDie: string;
    rollOne: string;
    rollMany: string;
    rollingNow: string;
    resultOne: string;
    resultMany: string;
    faceRolling: string;
    faceResult: string;
  };
  dice: {
    name: string;
  };
  colors: {
    red: string;
    orange: string;
    yellow: string;
    green: string;
    blue: string;
    violet: string;
  };
  install: {
    text: string;
    action: string;
    later: string;
    dismiss: string;
  };
  update: {
    available: string;
    action: string;
  };
}

const fr: Messages = {
  settings: {
    title: 'Réglages',
    language: 'Langue',
    dieType: 'Type de dé',
    diceCount: 'Nombre de dés',
    diceCountHint: 'Lancés tous ensemble (total affiché)',
    shake: 'Secouer pour lancer',
    shakeHint: 'Lance les dés en secouant le téléphone',
    vibration: 'Vibration',
    vibrationHint: 'Retour haptique au lancer (si supporté)',
    reduceMotion: 'Réduire les animations',
    reduceMotionAuto: 'Déjà activé par votre système',
    reduceMotionHint: 'Affiche le résultat sans défilement',
    close: 'Fermer',
    open: 'Réglages',
  },
  screen: {
    hintIdleOne: 'Touche l’écran pour lancer un {die}',
    hintIdleMany: 'Touche l’écran pour lancer {count} {die}',
    rolling: 'Les dés roulent…',
    relaunch: 'Touche pour relancer',
    total: 'Total {total}',
  },
  a11y: {
    removeDie: 'Retirer un dé',
    addDie: 'Ajouter un dé',
    rollOne: 'Lancer le dé. Dernier résultat : {value}',
    rollMany: 'Lancer {count} dés. Total précédent : {total}',
    rollingNow: 'Lancer en cours',
    resultOne: 'Résultat : {value}',
    resultMany: 'Résultats : {values}. Total : {total}.',
    faceRolling: '{die}, en train de rouler',
    faceResult: '{die}, résultat {value} ({color})',
  },
  dice: { name: 'dé à {sides} faces' },
  colors: {
    red: 'rouge',
    orange: 'orange',
    yellow: 'jaune',
    green: 'vert',
    blue: 'bleu',
    violet: 'violet',
  },
  install: {
    text: 'Installer Miss Dice',
    action: 'Installer',
    later: 'Plus tard',
    dismiss: 'Ne pas installer',
  },
  update: {
    available: 'Nouvelle version disponible.',
    action: 'Mettre à jour',
  },
};

const en: Messages = {
  settings: {
    title: 'Settings',
    language: 'Language',
    dieType: 'Die type',
    diceCount: 'Number of dice',
    diceCountHint: 'Rolled together (total shown)',
    shake: 'Shake to roll',
    shakeHint: 'Roll the dice by shaking your phone',
    vibration: 'Vibration',
    vibrationHint: 'Haptic feedback on roll (if supported)',
    reduceMotion: 'Reduce motion',
    reduceMotionAuto: 'Already enabled by your system',
    reduceMotionHint: 'Show the result without the rolling animation',
    close: 'Close',
    open: 'Settings',
  },
  screen: {
    hintIdleOne: 'Tap the screen to roll a {die}',
    hintIdleMany: 'Tap the screen to roll {count} {die}',
    rolling: 'Rolling…',
    relaunch: 'Tap to roll again',
    total: 'Total {total}',
  },
  a11y: {
    removeDie: 'Remove a die',
    addDie: 'Add a die',
    rollOne: 'Roll the die. Last result: {value}',
    rollMany: 'Roll {count} dice. Previous total: {total}',
    rollingNow: 'Rolling',
    resultOne: 'Result: {value}',
    resultMany: 'Results: {values}. Total: {total}.',
    faceRolling: '{die}, rolling',
    faceResult: '{die}, result {value} ({color})',
  },
  dice: { name: '{sides}-sided die' },
  colors: {
    red: 'red',
    orange: 'orange',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue',
    violet: 'violet',
  },
  install: {
    text: 'Install Miss Dice',
    action: 'Install',
    later: 'Later',
    dismiss: 'Don’t install',
  },
  update: {
    available: 'A new version is available.',
    action: 'Update',
  },
};

const es: Messages = {
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    dieType: 'Tipo de dado',
    diceCount: 'Número de dados',
    diceCountHint: 'Lanzados juntos (total mostrado)',
    shake: 'Agitar para lanzar',
    shakeHint: 'Lanza los dados agitando el teléfono',
    vibration: 'Vibración',
    vibrationHint: 'Respuesta háptica al lanzar (si es compatible)',
    reduceMotion: 'Reducir animaciones',
    reduceMotionAuto: 'Ya activado por tu sistema',
    reduceMotionHint: 'Muestra el resultado sin animación',
    close: 'Cerrar',
    open: 'Ajustes',
  },
  screen: {
    hintIdleOne: 'Toca la pantalla para lanzar un {die}',
    hintIdleMany: 'Toca la pantalla para lanzar {count} {die}',
    rolling: 'Lanzando…',
    relaunch: 'Toca para relanzar',
    total: 'Total {total}',
  },
  a11y: {
    removeDie: 'Quitar un dado',
    addDie: 'Añadir un dado',
    rollOne: 'Lanzar el dado. Último resultado: {value}',
    rollMany: 'Lanzar {count} dados. Total anterior: {total}',
    rollingNow: 'Lanzando',
    resultOne: 'Resultado: {value}',
    resultMany: 'Resultados: {values}. Total: {total}.',
    faceRolling: '{die}, lanzando',
    faceResult: '{die}, resultado {value} ({color})',
  },
  dice: { name: 'dado de {sides} caras' },
  colors: {
    red: 'rojo',
    orange: 'naranja',
    yellow: 'amarillo',
    green: 'verde',
    blue: 'azul',
    violet: 'violeta',
  },
  install: {
    text: 'Instalar Miss Dice',
    action: 'Instalar',
    later: 'Más tarde',
    dismiss: 'No instalar',
  },
  update: {
    available: 'Hay una nueva versión disponible.',
    action: 'Actualizar',
  },
};

export const messages: Record<Locale, Messages> = { fr, en, es };

/** Chemins typés « a.b.c » vers une chaîne de `Messages`. */
type Paths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends object
          ? `${K}.${Paths<T[K]>}`
          : never;
    }[keyof T & string];

export type MessageKey = Paths<Messages>;

function resolvePath(obj: Messages, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (
      acc &&
      typeof acc === 'object' &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`)
  );
}

/**
 * Traduit une clé dans la locale donnée. Renvoie la clé brute si elle est
 * introuvable (utile pour repérer un oubli). Interpole les `{paramètres}`.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>
): string {
  const resolved = resolvePath(messages[locale], key);
  if (typeof resolved !== 'string') return key;
  return interpolate(resolved, params);
}

/** Locale initiale : valeur stockée valide, sinon langue du navigateur, sinon FR. */
export function detectLocale(stored?: string | null): Locale {
  if (stored && (LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale;
  }
  const nav = globalThis.navigator?.language?.slice(0, 2).toLowerCase();
  return nav && (LOCALES as readonly string[]).includes(nav)
    ? (nav as Locale)
    : 'fr';
}
