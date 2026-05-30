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
    theme: string;
    themeAuto: string;
    themeLight: string;
    themeDark: string;
    sounds: string;
    soundsHint: string;
    about: string;
    shareApp: string;
    shareText: string;
    sourceCode: string;
    buyCoffee: string;
    linkCopied: string;
    stats: string;
    statsTotal: string;
    statsEmpty: string;
    statsReset: string;
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
  modes: {
    title: string;
    roll: string;
    rollHint: string;
    yahtzee: string;
    yahtzeeHint: string;
    d421: string;
    d421Hint: string;
    notation: string;
    notationHint: string;
    decide: string;
    decideHint: string;
    resume: string;
  };
  common: {
    back: string;
    quit: string;
    newGame: string;
    start: string;
    players: string;
    addPlayer: string;
    removePlayer: string;
    playerDefault: string;
  };
  setup: {
    title: string;
    playerName: string;
  };
  game: {
    roll: string;
    rollAgain: string;
    rollsLeft: string;
    rollsLeftOne: string;
    lastRoll: string;
    turnOf: string;
    tapToRoll: string;
    held: string;
    toggleHold: string;
    gameOver: string;
    winner: string;
    tie: string;
    scores: string;
    undo: string;
    replay: string;
    shareResult: string;
    copied: string;
  };
  yahtzee: {
    pickCategory: string;
    stopHint: string;
    upperTotal: string;
    bonus: string;
    yahtzeeBonus: string;
    total: string;
    catOnes: string;
    catTwos: string;
    catThrees: string;
    catFours: string;
    catFives: string;
    catSixes: string;
    catThreeKind: string;
    catFourKind: string;
    catFullHouse: string;
    catSmallStraight: string;
    catLargeStraight: string;
    catYahtzee: string;
    catChance: string;
  };
  game421: {
    pot: string;
    potSize: string;
    charge: string;
    decharge: string;
    validate: string;
    tokens: string;
    tokensOne: string;
    yourHand: string;
    hand421: string;
    handAces: string;
    handTrips: string;
    handSuite: string;
    handNenette: string;
    handPlain: string;
    roundResult: string;
  };
  notation: {
    placeholder: string;
    invalid: string;
    presets: string;
    total: string;
  };
  decide: {
    coin: string;
    heads: string;
    tails: string;
    yesno: string;
    yes: string;
    no: string;
    pick: string;
    shuffle: string;
    optionsLabel: string;
    optionsPlaceholder: string;
    empty: string;
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
    theme: 'Thème',
    themeAuto: 'Auto',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    sounds: 'Sons',
    soundsHint: 'Petit retour audio au lancer',
    about: 'À propos',
    shareApp: 'Partager l’app',
    shareText: 'Miss Dice — lance un dé, joue au Yahtzee ou au 421.',
    sourceCode: 'Code source',
    buyCoffee: 'Buy me a coffee',
    linkCopied: 'Lien copié !',
    stats: 'Statistiques',
    statsTotal: '{n} lancers',
    statsEmpty: 'Aucun lancer pour le moment',
    statsReset: 'Réinitialiser',
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
  modes: {
    title: 'Jeux',
    roll: 'Lancer libre',
    rollHint: 'Un ou plusieurs dés, d’un tap',
    yahtzee: 'Yahtzee',
    yahtzeeHint: '5 dés, grille de combinaisons',
    d421: '421',
    d421Hint: '3 dés, jeu à jetons',
    notation: 'Notation',
    notationHint: 'Lance « 2d6+3 », avantage…',
    decide: 'Décider',
    decideHint: 'Pile ou face, tirer au sort',
    resume: 'Reprendre',
  },
  common: {
    back: 'Retour',
    quit: 'Quitter',
    newGame: 'Nouvelle partie',
    start: 'Commencer',
    players: 'Joueurs',
    addPlayer: 'Ajouter un joueur',
    removePlayer: 'Retirer ce joueur',
    playerDefault: 'Joueur {n}',
  },
  setup: {
    title: 'Qui joue ?',
    playerName: 'Nom du joueur {n}',
  },
  game: {
    roll: 'Lancer',
    rollAgain: 'Relancer',
    rollsLeft: '{n} lancers restants',
    rollsLeftOne: '1 lancer restant',
    lastRoll: 'Dernier lancer',
    turnOf: 'Au tour de {name}',
    tapToRoll: 'Touche « Lancer » pour commencer',
    held: 'gardé',
    toggleHold: 'Garder ou relâcher le dé {n}',
    gameOver: 'Partie terminée',
    winner: '{name} gagne !',
    tie: 'Égalité !',
    scores: 'Scores',
    undo: 'Annuler',
    replay: 'Rejouer (mêmes joueurs)',
    shareResult: 'Partager le résultat',
    copied: 'Copié !',
  },
  yahtzee: {
    pickCategory: 'Choisis une case à remplir',
    stopHint: 'ou inscris une case pour t’arrêter',
    upperTotal: 'Sous-total',
    bonus: 'Bonus',
    yahtzeeBonus: 'Bonus Yahtzee',
    total: 'Total',
    catOnes: 'Les 1',
    catTwos: 'Les 2',
    catThrees: 'Les 3',
    catFours: 'Les 4',
    catFives: 'Les 5',
    catSixes: 'Les 6',
    catThreeKind: 'Brelan',
    catFourKind: 'Carré',
    catFullHouse: 'Full',
    catSmallStraight: 'Petite suite',
    catLargeStraight: 'Grande suite',
    catYahtzee: 'Yahtzee',
    catChance: 'Chance',
  },
  game421: {
    pot: 'Pot : {n}',
    potSize: 'Jetons de départ',
    charge: 'Charge',
    decharge: 'Décharge',
    validate: 'Valider',
    tokens: '{n} jetons',
    tokensOne: '1 jeton',
    yourHand: 'Ta main : {hand}',
    hand421: '421 !',
    handAces: 'Brelan d’as',
    handTrips: 'Brelan de {value}',
    handSuite: 'Suite',
    handNenette: 'Nénette (2-2-1)',
    handPlain: 'Main simple',
    roundResult: '{winner} remporte la manche, {loser} prend {tokens}',
  },
  notation: {
    placeholder: 'ex. 2d6+3, 1d20, 4d6kh3',
    invalid: 'Expression invalide',
    presets: 'Raccourcis',
    total: 'Total',
  },
  decide: {
    coin: 'Pile ou face',
    heads: 'Pile',
    tails: 'Face',
    yesno: 'Oui / Non',
    yes: 'Oui',
    no: 'Non',
    pick: 'Tirer au sort',
    shuffle: 'Mélanger l’ordre',
    optionsLabel: 'Options',
    optionsPlaceholder: 'Une option par ligne',
    empty: 'Ajoute des options',
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
    theme: 'Theme',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    sounds: 'Sounds',
    soundsHint: 'Small audio feedback on roll',
    about: 'About',
    shareApp: 'Share the app',
    shareText: 'Miss Dice — roll a die, play Yahtzee or 421.',
    sourceCode: 'Source code',
    buyCoffee: 'Buy me a coffee',
    linkCopied: 'Link copied!',
    stats: 'Statistics',
    statsTotal: '{n} rolls',
    statsEmpty: 'No rolls yet',
    statsReset: 'Reset',
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
  modes: {
    title: 'Games',
    roll: 'Free roll',
    rollHint: 'One or more dice, one tap',
    yahtzee: 'Yahtzee',
    yahtzeeHint: '5 dice, scorecard',
    d421: '421',
    d421Hint: '3 dice, token game',
    notation: 'Notation',
    notationHint: 'Roll "2d6+3", advantage…',
    decide: 'Decide',
    decideHint: 'Coin flip, pick at random',
    resume: 'Resume',
  },
  common: {
    back: 'Back',
    quit: 'Quit',
    newGame: 'New game',
    start: 'Start',
    players: 'Players',
    addPlayer: 'Add a player',
    removePlayer: 'Remove this player',
    playerDefault: 'Player {n}',
  },
  setup: {
    title: 'Who’s playing?',
    playerName: 'Player {n} name',
  },
  game: {
    roll: 'Roll',
    rollAgain: 'Roll again',
    rollsLeft: '{n} rolls left',
    rollsLeftOne: '1 roll left',
    lastRoll: 'Last roll',
    turnOf: '{name}’s turn',
    tapToRoll: 'Tap “Roll” to start',
    held: 'held',
    toggleHold: 'Hold or release die {n}',
    gameOver: 'Game over',
    winner: '{name} wins!',
    tie: 'It’s a tie!',
    scores: 'Scores',
    undo: 'Undo',
    replay: 'Play again (same players)',
    shareResult: 'Share the result',
    copied: 'Copied!',
  },
  yahtzee: {
    pickCategory: 'Pick a box to fill',
    stopHint: 'or fill a box to stop here',
    upperTotal: 'Subtotal',
    bonus: 'Bonus',
    yahtzeeBonus: 'Yahtzee bonus',
    total: 'Total',
    catOnes: 'Ones',
    catTwos: 'Twos',
    catThrees: 'Threes',
    catFours: 'Fours',
    catFives: 'Fives',
    catSixes: 'Sixes',
    catThreeKind: 'Three of a kind',
    catFourKind: 'Four of a kind',
    catFullHouse: 'Full house',
    catSmallStraight: 'Small straight',
    catLargeStraight: 'Large straight',
    catYahtzee: 'Yahtzee',
    catChance: 'Chance',
  },
  game421: {
    pot: 'Pot: {n}',
    potSize: 'Starting tokens',
    charge: 'Charging',
    decharge: 'Discharging',
    validate: 'Keep',
    tokens: '{n} tokens',
    tokensOne: '1 token',
    yourHand: 'Your hand: {hand}',
    hand421: '421!',
    handAces: 'Three aces',
    handTrips: 'Three {value}s',
    handSuite: 'Straight',
    handNenette: 'Nenette (2-2-1)',
    handPlain: 'Plain hand',
    roundResult: '{winner} wins the round, {loser} takes {tokens}',
  },
  notation: {
    placeholder: 'e.g. 2d6+3, 1d20, 4d6kh3',
    invalid: 'Invalid expression',
    presets: 'Presets',
    total: 'Total',
  },
  decide: {
    coin: 'Coin flip',
    heads: 'Heads',
    tails: 'Tails',
    yesno: 'Yes / No',
    yes: 'Yes',
    no: 'No',
    pick: 'Pick at random',
    shuffle: 'Shuffle order',
    optionsLabel: 'Options',
    optionsPlaceholder: 'One option per line',
    empty: 'Add some options',
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
    theme: 'Tema',
    themeAuto: 'Auto',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    sounds: 'Sonidos',
    soundsHint: 'Pequeño sonido al lanzar',
    about: 'Acerca de',
    shareApp: 'Compartir la app',
    shareText: 'Miss Dice — lanza un dado, juega al Yahtzee o al 421.',
    sourceCode: 'Código fuente',
    buyCoffee: 'Buy me a coffee',
    linkCopied: '¡Enlace copiado!',
    stats: 'Estadísticas',
    statsTotal: '{n} lanzamientos',
    statsEmpty: 'Aún no hay lanzamientos',
    statsReset: 'Reiniciar',
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
  modes: {
    title: 'Juegos',
    roll: 'Lanzamiento libre',
    rollHint: 'Uno o varios dados, un toque',
    yahtzee: 'Yahtzee',
    yahtzeeHint: '5 dados, tabla de combinaciones',
    d421: '421',
    d421Hint: '3 dados, juego de fichas',
    notation: 'Notación',
    notationHint: 'Lanza «2d6+3», ventaja…',
    decide: 'Decidir',
    decideHint: 'Cara o cruz, sorteo',
    resume: 'Reanudar',
  },
  common: {
    back: 'Atrás',
    quit: 'Salir',
    newGame: 'Nueva partida',
    start: 'Empezar',
    players: 'Jugadores',
    addPlayer: 'Añadir un jugador',
    removePlayer: 'Quitar este jugador',
    playerDefault: 'Jugador {n}',
  },
  setup: {
    title: '¿Quién juega?',
    playerName: 'Nombre del jugador {n}',
  },
  game: {
    roll: 'Lanzar',
    rollAgain: 'Relanzar',
    rollsLeft: '{n} lanzamientos restantes',
    rollsLeftOne: '1 lanzamiento restante',
    lastRoll: 'Último lanzamiento',
    turnOf: 'Turno de {name}',
    tapToRoll: 'Toca «Lanzar» para empezar',
    held: 'guardado',
    toggleHold: 'Guardar o soltar el dado {n}',
    gameOver: 'Partida terminada',
    winner: '¡{name} gana!',
    tie: '¡Empate!',
    scores: 'Puntuaciones',
    undo: 'Deshacer',
    replay: 'Jugar otra vez (mismos jugadores)',
    shareResult: 'Compartir el resultado',
    copied: '¡Copiado!',
  },
  yahtzee: {
    pickCategory: 'Elige una casilla',
    stopHint: 'o anota una casilla para parar aquí',
    upperTotal: 'Subtotal',
    bonus: 'Bonificación',
    yahtzeeBonus: 'Bonificación Yahtzee',
    total: 'Total',
    catOnes: 'Unos',
    catTwos: 'Doses',
    catThrees: 'Treses',
    catFours: 'Cuatros',
    catFives: 'Cincos',
    catSixes: 'Seises',
    catThreeKind: 'Trío',
    catFourKind: 'Póker',
    catFullHouse: 'Full',
    catSmallStraight: 'Escalera pequeña',
    catLargeStraight: 'Escalera grande',
    catYahtzee: 'Yahtzee',
    catChance: 'Suerte',
  },
  game421: {
    pot: 'Bote: {n}',
    potSize: 'Fichas iniciales',
    charge: 'Carga',
    decharge: 'Descarga',
    validate: 'Plantarse',
    tokens: '{n} fichas',
    tokensOne: '1 ficha',
    yourHand: 'Tu mano: {hand}',
    hand421: '¡421!',
    handAces: 'Trío de ases',
    handTrips: 'Trío de {value}',
    handSuite: 'Escalera',
    handNenette: 'Nenette (2-2-1)',
    handPlain: 'Mano simple',
    roundResult: '{winner} gana la ronda, {loser} toma {tokens}',
  },
  notation: {
    placeholder: 'ej. 2d6+3, 1d20, 4d6kh3',
    invalid: 'Expresión no válida',
    presets: 'Atajos',
    total: 'Total',
  },
  decide: {
    coin: 'Cara o cruz',
    heads: 'Cara',
    tails: 'Cruz',
    yesno: 'Sí / No',
    yes: 'Sí',
    no: 'No',
    pick: 'Sortear',
    shuffle: 'Mezclar el orden',
    optionsLabel: 'Opciones',
    optionsPlaceholder: 'Una opción por línea',
    empty: 'Añade opciones',
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
