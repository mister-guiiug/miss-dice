/**
 * Internationalisation — données et résolution pures (sans React).
 *
 * `translate(locale, key, params)` est utilisable partout, y compris hors
 * React (ex. le bandeau de mise à jour du service worker). Le hook
 * `useI18n` n'en est qu'une enveloppe réactive branchée sur la locale du
 * store de préférences.
 */
export type Locale = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt';

export const LOCALES: readonly Locale[] = ['fr', 'en', 'es', 'de', 'it', 'pt'];

/** Noms natifs, affichés tels quels dans le sélecteur (non traduits). */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
};

/**
 * Sens d'écriture par locale, pour piloter `document.dir`. Toutes les
 * langues actuelles sont LTR ; l'infrastructure est prête pour l'ajout
 * d'une langue RTL (arabe, hébreu) sans toucher au reste de l'app.
 */
export const LOCALE_DIR: Record<Locale, 'ltr' | 'rtl'> = {
  fr: 'ltr',
  en: 'ltr',
  es: 'ltr',
  de: 'ltr',
  it: 'ltr',
  pt: 'ltr',
};

/** Sens d'écriture de la locale (défaut LTR). */
export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_DIR[locale] ?? 'ltr';
}

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
    tts: string;
    ttsHint: string;
    colorblind: string;
    colorblindHint: string;
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
    history: string;
    historyExport: string;
    historyClear: string;
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
    pig: string;
    pigHint: string;
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
  pig: {
    turnTotal: string;
    bank: string;
    bust: string;
    target: string;
    rollOrBank: string;
    targetLabel: string;
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
    tts: 'Annonce vocale',
    ttsHint: 'Énonce le résultat à voix haute',
    colorblind: 'Mode daltonien',
    colorblindHint: 'Ajoute la valeur chiffrée sur chaque face',
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
    history: 'Historique',
    historyExport: 'Exporter en CSV',
    historyClear: 'Vider l’historique',
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
    pig: 'Cochon',
    pigHint: 'Stop ou encore, 1 dé',
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
  pig: {
    turnTotal: 'Cumul du tour : {n}',
    bank: 'Banquer',
    bust: 'Un 1 ! Tour perdu',
    target: 'Objectif : {n}',
    rollOrBank: 'Relance ou banque tes points',
    targetLabel: 'Objectif',
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
    tts: 'Spoken result',
    ttsHint: 'Reads the result out loud',
    colorblind: 'Colorblind mode',
    colorblindHint: 'Adds the numeric value on each face',
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
    history: 'History',
    historyExport: 'Export as CSV',
    historyClear: 'Clear history',
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
    pig: 'Pig',
    pigHint: 'Push your luck, 1 die',
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
  pig: {
    turnTotal: 'Turn total: {n}',
    bank: 'Bank',
    bust: 'A 1! Turn lost',
    target: 'Target: {n}',
    rollOrBank: 'Roll again or bank your points',
    targetLabel: 'Target',
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
    tts: 'Resultado hablado',
    ttsHint: 'Lee el resultado en voz alta',
    colorblind: 'Modo daltónico',
    colorblindHint: 'Añade el valor numérico en cada cara',
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
    history: 'Historial',
    historyExport: 'Exportar en CSV',
    historyClear: 'Vaciar el historial',
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
    pig: 'Cerdo',
    pigHint: 'Plántate o sigue, 1 dado',
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
  pig: {
    turnTotal: 'Acumulado del turno: {n}',
    bank: 'Plantarse',
    bust: '¡Un 1! Turno perdido',
    target: 'Objetivo: {n}',
    rollOrBank: 'Relanza o plántate con tus puntos',
    targetLabel: 'Objetivo',
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

const de: Messages = {
  settings: {
    title: 'Einstellungen',
    language: 'Sprache',
    dieType: 'Würfeltyp',
    diceCount: 'Anzahl Würfel',
    diceCountHint: 'Zusammen geworfen (Summe angezeigt)',
    shake: 'Schütteln zum Würfeln',
    shakeHint: 'Würfeln durch Schütteln des Telefons',
    vibration: 'Vibration',
    vibrationHint: 'Haptisches Feedback beim Wurf (wenn unterstützt)',
    reduceMotion: 'Bewegung reduzieren',
    reduceMotionAuto: 'Bereits vom System aktiviert',
    reduceMotionHint: 'Ergebnis ohne Wurfanimation anzeigen',
    close: 'Schließen',
    open: 'Einstellungen',
    theme: 'Design',
    themeAuto: 'Auto',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    sounds: 'Töne',
    soundsHint: 'Kleines Audio-Feedback beim Wurf',
    tts: 'Ergebnis vorlesen',
    ttsHint: 'Liest das Ergebnis laut vor',
    colorblind: 'Farbenblind-Modus',
    colorblindHint: 'Zeigt den Zahlenwert auf jeder Seite',
    about: 'Über',
    shareApp: 'App teilen',
    shareText: 'Miss Dice — wirf einen Würfel, spiele Yahtzee oder 421.',
    sourceCode: 'Quellcode',
    buyCoffee: 'Buy me a coffee',
    linkCopied: 'Link kopiert!',
    stats: 'Statistiken',
    statsTotal: '{n} Würfe',
    statsEmpty: 'Noch keine Würfe',
    statsReset: 'Zurücksetzen',
    history: 'Verlauf',
    historyExport: 'Als CSV exportieren',
    historyClear: 'Verlauf löschen',
  },
  screen: {
    hintIdleOne: 'Tippe auf den Bildschirm für einen {die}',
    hintIdleMany: 'Tippe auf den Bildschirm für {count} {die}',
    rolling: 'Würfeln…',
    relaunch: 'Tippen zum erneuten Würfeln',
    total: 'Summe {total}',
  },
  a11y: {
    removeDie: 'Einen Würfel entfernen',
    addDie: 'Einen Würfel hinzufügen',
    rollOne: 'Würfel werfen. Letztes Ergebnis: {value}',
    rollMany: '{count} Würfel werfen. Vorherige Summe: {total}',
    rollingNow: 'Wird geworfen',
    resultOne: 'Ergebnis: {value}',
    resultMany: 'Ergebnisse: {values}. Summe: {total}.',
    faceRolling: '{die}, wird geworfen',
    faceResult: '{die}, Ergebnis {value} ({color})',
  },
  dice: { name: '{sides}-seitiger Würfel' },
  colors: {
    red: 'rot',
    orange: 'orange',
    yellow: 'gelb',
    green: 'grün',
    blue: 'blau',
    violet: 'violett',
  },
  install: {
    text: 'Miss Dice installieren',
    action: 'Installieren',
    later: 'Später',
    dismiss: 'Nicht installieren',
  },
  update: {
    available: 'Eine neue Version ist verfügbar.',
    action: 'Aktualisieren',
  },
  modes: {
    title: 'Spiele',
    roll: 'Freier Wurf',
    rollHint: 'Ein oder mehrere Würfel, ein Tippen',
    yahtzee: 'Yahtzee',
    yahtzeeHint: '5 Würfel, Punktetabelle',
    d421: '421',
    d421Hint: '3 Würfel, Chip-Spiel',
    pig: 'Schwein',
    pigHint: 'Weiter oder halten, 1 Würfel',
    notation: 'Notation',
    notationHint: 'Wirf „2d6+3“, Vorteil…',
    decide: 'Entscheiden',
    decideHint: 'Münzwurf, Zufallsauswahl',
    resume: 'Fortsetzen',
  },
  common: {
    back: 'Zurück',
    quit: 'Beenden',
    newGame: 'Neues Spiel',
    start: 'Starten',
    players: 'Spieler',
    addPlayer: 'Spieler hinzufügen',
    removePlayer: 'Diesen Spieler entfernen',
    playerDefault: 'Spieler {n}',
  },
  setup: {
    title: 'Wer spielt?',
    playerName: 'Name von Spieler {n}',
  },
  game: {
    roll: 'Werfen',
    rollAgain: 'Erneut werfen',
    rollsLeft: '{n} Würfe übrig',
    rollsLeftOne: '1 Wurf übrig',
    lastRoll: 'Letzter Wurf',
    turnOf: '{name} ist dran',
    tapToRoll: 'Tippe „Werfen“ zum Starten',
    held: 'gehalten',
    toggleHold: 'Würfel {n} halten oder freigeben',
    gameOver: 'Spiel vorbei',
    winner: '{name} gewinnt!',
    tie: 'Unentschieden!',
    scores: 'Punkte',
    undo: 'Rückgängig',
    replay: 'Nochmal spielen (gleiche Spieler)',
    shareResult: 'Ergebnis teilen',
    copied: 'Kopiert!',
  },
  yahtzee: {
    pickCategory: 'Wähle ein Feld zum Eintragen',
    stopHint: 'oder trage ein Feld ein, um hier zu stoppen',
    upperTotal: 'Zwischensumme',
    bonus: 'Bonus',
    yahtzeeBonus: 'Yahtzee-Bonus',
    total: 'Gesamt',
    catOnes: 'Einser',
    catTwos: 'Zweier',
    catThrees: 'Dreier',
    catFours: 'Vierer',
    catFives: 'Fünfer',
    catSixes: 'Sechser',
    catThreeKind: 'Dreierpasch',
    catFourKind: 'Viererpasch',
    catFullHouse: 'Full House',
    catSmallStraight: 'Kleine Straße',
    catLargeStraight: 'Große Straße',
    catYahtzee: 'Yahtzee',
    catChance: 'Chance',
  },
  game421: {
    pot: 'Topf: {n}',
    potSize: 'Start-Chips',
    charge: 'Laden',
    decharge: 'Entladen',
    validate: 'Halten',
    tokens: '{n} Chips',
    tokensOne: '1 Chip',
    yourHand: 'Deine Hand: {hand}',
    hand421: '421!',
    handAces: 'Drei Asse',
    handTrips: 'Drei {value}er',
    handSuite: 'Straße',
    handNenette: 'Nenette (2-2-1)',
    handPlain: 'Einfache Hand',
    roundResult: '{winner} gewinnt die Runde, {loser} nimmt {tokens}',
  },
  pig: {
    turnTotal: 'Zug-Summe: {n}',
    bank: 'Halten',
    bust: 'Eine 1! Zug verloren',
    target: 'Ziel: {n}',
    rollOrBank: 'Erneut werfen oder Punkte sichern',
    targetLabel: 'Ziel',
  },
  notation: {
    placeholder: 'z. B. 2d6+3, 1d20, 4d6kh3',
    invalid: 'Ungültiger Ausdruck',
    presets: 'Vorlagen',
    total: 'Gesamt',
  },
  decide: {
    coin: 'Münzwurf',
    heads: 'Kopf',
    tails: 'Zahl',
    yesno: 'Ja / Nein',
    yes: 'Ja',
    no: 'Nein',
    pick: 'Zufällig auswählen',
    shuffle: 'Reihenfolge mischen',
    optionsLabel: 'Optionen',
    optionsPlaceholder: 'Eine Option pro Zeile',
    empty: 'Füge Optionen hinzu',
  },
};

const it: Messages = {
  settings: {
    title: 'Impostazioni',
    language: 'Lingua',
    dieType: 'Tipo di dado',
    diceCount: 'Numero di dadi',
    diceCountHint: 'Lanciati insieme (totale mostrato)',
    shake: 'Agita per lanciare',
    shakeHint: 'Lancia i dadi agitando il telefono',
    vibration: 'Vibrazione',
    vibrationHint: 'Feedback aptico al lancio (se supportato)',
    reduceMotion: 'Riduci animazioni',
    reduceMotionAuto: 'Già attivato dal sistema',
    reduceMotionHint: 'Mostra il risultato senza animazione',
    close: 'Chiudi',
    open: 'Impostazioni',
    theme: 'Tema',
    themeAuto: 'Auto',
    themeLight: 'Chiaro',
    themeDark: 'Scuro',
    sounds: 'Suoni',
    soundsHint: 'Piccolo feedback audio al lancio',
    tts: 'Risultato vocale',
    ttsHint: 'Legge il risultato ad alta voce',
    colorblind: 'Modalità daltonici',
    colorblindHint: 'Aggiunge il valore numerico su ogni faccia',
    about: 'Informazioni',
    shareApp: 'Condividi l’app',
    shareText: 'Miss Dice — lancia un dado, gioca a Yahtzee o 421.',
    sourceCode: 'Codice sorgente',
    buyCoffee: 'Buy me a coffee',
    linkCopied: 'Link copiato!',
    stats: 'Statistiche',
    statsTotal: '{n} lanci',
    statsEmpty: 'Ancora nessun lancio',
    statsReset: 'Reimposta',
    history: 'Cronologia',
    historyExport: 'Esporta in CSV',
    historyClear: 'Cancella la cronologia',
  },
  screen: {
    hintIdleOne: 'Tocca lo schermo per lanciare un {die}',
    hintIdleMany: 'Tocca lo schermo per lanciare {count} {die}',
    rolling: 'Lancio…',
    relaunch: 'Tocca per rilanciare',
    total: 'Totale {total}',
  },
  a11y: {
    removeDie: 'Rimuovi un dado',
    addDie: 'Aggiungi un dado',
    rollOne: 'Lancia il dado. Ultimo risultato: {value}',
    rollMany: 'Lancia {count} dadi. Totale precedente: {total}',
    rollingNow: 'Lancio in corso',
    resultOne: 'Risultato: {value}',
    resultMany: 'Risultati: {values}. Totale: {total}.',
    faceRolling: '{die}, in rotazione',
    faceResult: '{die}, risultato {value} ({color})',
  },
  dice: { name: 'dado a {sides} facce' },
  colors: {
    red: 'rosso',
    orange: 'arancione',
    yellow: 'giallo',
    green: 'verde',
    blue: 'blu',
    violet: 'viola',
  },
  install: {
    text: 'Installa Miss Dice',
    action: 'Installa',
    later: 'Più tardi',
    dismiss: 'Non installare',
  },
  update: {
    available: 'È disponibile una nuova versione.',
    action: 'Aggiorna',
  },
  modes: {
    title: 'Giochi',
    roll: 'Lancio libero',
    rollHint: 'Uno o più dadi, un tocco',
    yahtzee: 'Yahtzee',
    yahtzeeHint: '5 dadi, tabella combinazioni',
    d421: '421',
    d421Hint: '3 dadi, gioco a gettoni',
    pig: 'Maiale',
    pigHint: 'Continua o fermati, 1 dado',
    notation: 'Notazione',
    notationHint: 'Lancia «2d6+3», vantaggio…',
    decide: 'Decidere',
    decideHint: 'Testa o croce, sorteggio',
    resume: 'Riprendi',
  },
  common: {
    back: 'Indietro',
    quit: 'Esci',
    newGame: 'Nuova partita',
    start: 'Inizia',
    players: 'Giocatori',
    addPlayer: 'Aggiungi un giocatore',
    removePlayer: 'Rimuovi questo giocatore',
    playerDefault: 'Giocatore {n}',
  },
  setup: {
    title: 'Chi gioca?',
    playerName: 'Nome del giocatore {n}',
  },
  game: {
    roll: 'Lancia',
    rollAgain: 'Rilancia',
    rollsLeft: '{n} lanci rimasti',
    rollsLeftOne: '1 lancio rimasto',
    lastRoll: 'Ultimo lancio',
    turnOf: 'Turno di {name}',
    tapToRoll: 'Tocca «Lancia» per iniziare',
    held: 'tenuto',
    toggleHold: 'Tieni o rilascia il dado {n}',
    gameOver: 'Partita finita',
    winner: '{name} vince!',
    tie: 'Pareggio!',
    scores: 'Punteggi',
    undo: 'Annulla',
    replay: 'Rigioca (stessi giocatori)',
    shareResult: 'Condividi il risultato',
    copied: 'Copiato!',
  },
  yahtzee: {
    pickCategory: 'Scegli una casella da riempire',
    stopHint: 'o segna una casella per fermarti qui',
    upperTotal: 'Subtotale',
    bonus: 'Bonus',
    yahtzeeBonus: 'Bonus Yahtzee',
    total: 'Totale',
    catOnes: 'Uno',
    catTwos: 'Due',
    catThrees: 'Tre',
    catFours: 'Quattro',
    catFives: 'Cinque',
    catSixes: 'Sei',
    catThreeKind: 'Tris',
    catFourKind: 'Poker',
    catFullHouse: 'Full',
    catSmallStraight: 'Scala piccola',
    catLargeStraight: 'Scala grande',
    catYahtzee: 'Yahtzee',
    catChance: 'Chance',
  },
  game421: {
    pot: 'Piatto: {n}',
    potSize: 'Gettoni iniziali',
    charge: 'Carica',
    decharge: 'Scarica',
    validate: 'Tieni',
    tokens: '{n} gettoni',
    tokensOne: '1 gettone',
    yourHand: 'La tua mano: {hand}',
    hand421: '421!',
    handAces: 'Tris di assi',
    handTrips: 'Tris di {value}',
    handSuite: 'Scala',
    handNenette: 'Nenette (2-2-1)',
    handPlain: 'Mano semplice',
    roundResult: '{winner} vince il round, {loser} prende {tokens}',
  },
  pig: {
    turnTotal: 'Totale del turno: {n}',
    bank: 'Fermati',
    bust: 'Un 1! Turno perso',
    target: 'Obiettivo: {n}',
    rollOrBank: 'Rilancia o metti al sicuro i punti',
    targetLabel: 'Obiettivo',
  },
  notation: {
    placeholder: 'es. 2d6+3, 1d20, 4d6kh3',
    invalid: 'Espressione non valida',
    presets: 'Scorciatoie',
    total: 'Totale',
  },
  decide: {
    coin: 'Testa o croce',
    heads: 'Testa',
    tails: 'Croce',
    yesno: 'Sì / No',
    yes: 'Sì',
    no: 'No',
    pick: 'Sorteggia',
    shuffle: 'Mescola l’ordine',
    optionsLabel: 'Opzioni',
    optionsPlaceholder: 'Un’opzione per riga',
    empty: 'Aggiungi opzioni',
  },
};

const pt: Messages = {
  settings: {
    title: 'Definições',
    language: 'Idioma',
    dieType: 'Tipo de dado',
    diceCount: 'Número de dados',
    diceCountHint: 'Lançados juntos (total mostrado)',
    shake: 'Agitar para lançar',
    shakeHint: 'Lança os dados agitando o telemóvel',
    vibration: 'Vibração',
    vibrationHint: 'Resposta tátil ao lançar (se suportado)',
    reduceMotion: 'Reduzir animações',
    reduceMotionAuto: 'Já ativado pelo sistema',
    reduceMotionHint: 'Mostra o resultado sem animação',
    close: 'Fechar',
    open: 'Definições',
    theme: 'Tema',
    themeAuto: 'Auto',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    sounds: 'Sons',
    soundsHint: 'Pequeno som ao lançar',
    tts: 'Resultado falado',
    ttsHint: 'Lê o resultado em voz alta',
    colorblind: 'Modo daltónico',
    colorblindHint: 'Adiciona o valor numérico em cada face',
    about: 'Acerca de',
    shareApp: 'Partilhar a app',
    shareText: 'Miss Dice — lança um dado, joga ao Yahtzee ou 421.',
    sourceCode: 'Código-fonte',
    buyCoffee: 'Buy me a coffee',
    linkCopied: 'Link copiado!',
    stats: 'Estatísticas',
    statsTotal: '{n} lançamentos',
    statsEmpty: 'Ainda sem lançamentos',
    statsReset: 'Repor',
    history: 'Histórico',
    historyExport: 'Exportar em CSV',
    historyClear: 'Limpar o histórico',
  },
  screen: {
    hintIdleOne: 'Toca no ecrã para lançar um {die}',
    hintIdleMany: 'Toca no ecrã para lançar {count} {die}',
    rolling: 'A lançar…',
    relaunch: 'Toca para relançar',
    total: 'Total {total}',
  },
  a11y: {
    removeDie: 'Remover um dado',
    addDie: 'Adicionar um dado',
    rollOne: 'Lançar o dado. Último resultado: {value}',
    rollMany: 'Lançar {count} dados. Total anterior: {total}',
    rollingNow: 'A lançar',
    resultOne: 'Resultado: {value}',
    resultMany: 'Resultados: {values}. Total: {total}.',
    faceRolling: '{die}, a rolar',
    faceResult: '{die}, resultado {value} ({color})',
  },
  dice: { name: 'dado de {sides} faces' },
  colors: {
    red: 'vermelho',
    orange: 'laranja',
    yellow: 'amarelo',
    green: 'verde',
    blue: 'azul',
    violet: 'violeta',
  },
  install: {
    text: 'Instalar Miss Dice',
    action: 'Instalar',
    later: 'Mais tarde',
    dismiss: 'Não instalar',
  },
  update: {
    available: 'Está disponível uma nova versão.',
    action: 'Atualizar',
  },
  modes: {
    title: 'Jogos',
    roll: 'Lançamento livre',
    rollHint: 'Um ou mais dados, um toque',
    yahtzee: 'Yahtzee',
    yahtzeeHint: '5 dados, tabela de combinações',
    d421: '421',
    d421Hint: '3 dados, jogo de fichas',
    pig: 'Porco',
    pigHint: 'Continua ou para, 1 dado',
    notation: 'Notação',
    notationHint: 'Lança «2d6+3», vantagem…',
    decide: 'Decidir',
    decideHint: 'Cara ou coroa, sorteio',
    resume: 'Retomar',
  },
  common: {
    back: 'Voltar',
    quit: 'Sair',
    newGame: 'Novo jogo',
    start: 'Começar',
    players: 'Jogadores',
    addPlayer: 'Adicionar um jogador',
    removePlayer: 'Remover este jogador',
    playerDefault: 'Jogador {n}',
  },
  setup: {
    title: 'Quem joga?',
    playerName: 'Nome do jogador {n}',
  },
  game: {
    roll: 'Lançar',
    rollAgain: 'Relançar',
    rollsLeft: '{n} lançamentos restantes',
    rollsLeftOne: '1 lançamento restante',
    lastRoll: 'Último lançamento',
    turnOf: 'Vez de {name}',
    tapToRoll: 'Toca em «Lançar» para começar',
    held: 'guardado',
    toggleHold: 'Guardar ou soltar o dado {n}',
    gameOver: 'Jogo terminado',
    winner: '{name} ganha!',
    tie: 'Empate!',
    scores: 'Pontuações',
    undo: 'Anular',
    replay: 'Jogar de novo (mesmos jogadores)',
    shareResult: 'Partilhar o resultado',
    copied: 'Copiado!',
  },
  yahtzee: {
    pickCategory: 'Escolhe uma casa para preencher',
    stopHint: 'ou preenche uma casa para parar aqui',
    upperTotal: 'Subtotal',
    bonus: 'Bónus',
    yahtzeeBonus: 'Bónus Yahtzee',
    total: 'Total',
    catOnes: 'Uns',
    catTwos: 'Dois',
    catThrees: 'Três',
    catFours: 'Quatros',
    catFives: 'Cincos',
    catSixes: 'Seis',
    catThreeKind: 'Trio',
    catFourKind: 'Poker',
    catFullHouse: 'Full',
    catSmallStraight: 'Sequência pequena',
    catLargeStraight: 'Sequência grande',
    catYahtzee: 'Yahtzee',
    catChance: 'Sorte',
  },
  game421: {
    pot: 'Bolo: {n}',
    potSize: 'Fichas iniciais',
    charge: 'Carga',
    decharge: 'Descarga',
    validate: 'Ficar',
    tokens: '{n} fichas',
    tokensOne: '1 ficha',
    yourHand: 'A tua mão: {hand}',
    hand421: '421!',
    handAces: 'Trio de ases',
    handTrips: 'Trio de {value}',
    handSuite: 'Sequência',
    handNenette: 'Nenette (2-2-1)',
    handPlain: 'Mão simples',
    roundResult: '{winner} vence a ronda, {loser} recebe {tokens}',
  },
  pig: {
    turnTotal: 'Total do turno: {n}',
    bank: 'Ficar',
    bust: 'Um 1! Turno perdido',
    target: 'Objetivo: {n}',
    rollOrBank: 'Relança ou guarda os teus pontos',
    targetLabel: 'Objetivo',
  },
  notation: {
    placeholder: 'ex. 2d6+3, 1d20, 4d6kh3',
    invalid: 'Expressão inválida',
    presets: 'Atalhos',
    total: 'Total',
  },
  decide: {
    coin: 'Cara ou coroa',
    heads: 'Cara',
    tails: 'Coroa',
    yesno: 'Sim / Não',
    yes: 'Sim',
    no: 'Não',
    pick: 'Sortear',
    shuffle: 'Baralhar a ordem',
    optionsLabel: 'Opções',
    optionsPlaceholder: 'Uma opção por linha',
    empty: 'Adiciona opções',
  },
};

export const messages: Record<Locale, Messages> = {
  fr,
  en,
  es,
  de,
  it,
  pt,
};

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

/**
 * Paramètres attendus par clé interpolée. Sert à typer `t(...)` : oublier
 * un `{paramètre}` (ou se tromper de nom) devient une erreur de compilation
 * plutôt qu'un placeholder affiché tel quel. Les clés absentes d'ici
 * n'attendent aucun paramètre.
 */
export interface MessageParams {
  'settings.statsTotal': { n: number };
  'screen.hintIdleOne': { die: string };
  'screen.hintIdleMany': { count: number; die: string };
  'screen.total': { total: number };
  'a11y.rollOne': { value: number };
  'a11y.rollMany': { count: number; total: number };
  'a11y.resultOne': { value: number };
  'a11y.resultMany': { values: string; total: number };
  'a11y.faceRolling': { die: string };
  'a11y.faceResult': { die: string; value: number; color: string };
  'dice.name': { sides: number };
  'common.playerDefault': { n: number };
  'setup.playerName': { n: number };
  'game.rollsLeft': { n: number };
  'game.turnOf': { name: string };
  'game.toggleHold': { n: number };
  'game.winner': { name: string };
  'game421.pot': { n: number };
  'game421.tokens': { n: number };
  'game421.yourHand': { hand: string };
  'game421.handTrips': { value: number };
  'game421.roundResult': { winner: string; loser: string; tokens: string };
  'pig.turnTotal': { n: number };
  'pig.target': { n: number };
}

/** Tuple d'arguments de `t(key, …)` : requis si la clé attend des params. */
export type ParamsArg<K extends MessageKey> = K extends keyof MessageParams
  ? [params: MessageParams[K]]
  : [params?: Record<string, string | number>];

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
