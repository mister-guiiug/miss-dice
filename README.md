# 🎲 Miss Dice

[![CI](https://github.com/mister-guiiug/miss-dice/actions/workflows/ci.yml/badge.svg)](https://github.com/mister-guiiug/miss-dice/actions/workflows/ci.yml)
[![Deploy](https://github.com/mister-guiiug/miss-dice/actions/workflows/deploy.yml/badge.svg)](https://github.com/mister-guiiug/miss-dice/actions/workflows/deploy.yml)

Lanceur de dés **D4 à D20**, _mobile-first_, 100 % offline, installable.
Toute la surface de l'écran est une zone de tap : on touche, le dé roule,
une face se pose. Autour du lancer libre : trois jeux en _pass-and-play_
(Yahtzee, 421, Cochon), un lanceur en **notation JDR** (`4d6kh3`) et un
écran **Décider**. Sans pub, sans tracking, sans backend - seules les
préférences locales sont stockées dans le navigateur.

Membre de la famille PWA `miss-*` / `mister-*`, bâti sur les conventions
partagées de [`@mister-guiiug/dev-pwa-config`](https://github.com/mister-guiiug/dev-pwa-config)
(ESLint React, Prettier, tsconfig strict, Vitest, PWA).

---

## 1. Architecture

Séparation stricte **métier / animation / rendu / config**, comme demandé :

| Couche                     | Fichier(s)                                             | Rôle                                                                   |
| -------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| Aléa                       | `src/dice/random.ts`                                   | Tirage uniforme 1..N + multi-dés (rng injectable)                      |
| Types de dés               | `src/dice/diceTypes.ts`                                | D4/D6/D8/D10/D12/D20 : faces, silhouette, rendu                        |
| Disposition points         | `src/dice/pips.ts`                                     | Grille 3×3 → points (réservé au D6)                                    |
| Couleurs                   | `src/dice/colors.ts`                                   | Une teinte par face (palette cyclée au-delà du D6)                     |
| Cadence d'animation        | `src/dice/rollSchedule.ts`                             | Instants de défilement (pur, testé)                                    |
| Contrôleur de lancer       | `src/react/hooks/useDiceRoll.ts`                       | État repos → défilement → résultat multi-dés, anti-double-tap          |
| Secouer pour lancer        | `src/react/hooks/useShakeToRoll.ts`                    | Détection de secousse (DeviceMotion) + permission iOS                  |
| Clavier (desktop)          | `src/react/hooks/useKeyboardRoll.ts`                   | Espace/Entrée lance, `+`/`−`/flèches changent le nombre de dés         |
| Annonce vocale             | `src/react/hooks/useSpeak.ts`                          | Branche le `speech` du socle (Web Speech) sur le réglage et la locale  |
| Voix disponibles           | `src/react/hooks/useVoices.ts`                         | Voix de la langue courante ; s'abonne, car la liste arrive en différé  |
| Sons                       | `src/audio/sounds.ts`, `src/react/hooks/useSound.ts`   | Retours audio synthétisés (WebAudio, aucun asset), entièrement gardés  |
| Notation JDR               | `src/dice/notation.ts`                                 | Parseur pur `2d6+3`, `4d6kh3`, `2d20kh1`, `4dF` → total + détail       |
| Décider                    | `src/decide/decisions.ts`                              | Pile ou face, oui/non, tirage au sort, mélange (pur)                   |
| Rendu d'une face           | `src/react/components/DiceFace.tsx`                    | Points (D6) ou chiffre + silhouette (sans logique métier)              |
| Plateau de dés             | `src/react/components/DiceTray.tsx`                    | Disposition de N dés, taille adaptative                                |
| Écran principal            | `src/react/components/DiceScreen.tsx`                  | Zone de tap plein écran, total, teinte immersive, a11y                 |
| Micro-store réactif        | `src/store/createStore.ts`                             | Plomberie commune à tous les états globaux (`useSyncExternalStore`)    |
| Réglages                   | `src/settings/settingsStore.ts`, `SettingsDrawer.tsx`  | Préfs locales (langue, type, nombre, secousse, voix, daltonien…)       |
| Reprise des anciennes clés | `src/settings/legacyMigration.ts`                      | Extrait `locale` et `theme` du blob historique vers les clés du socle  |
| Statistiques               | `src/stats/rollStats.ts`                               | Distribution des faces du lancer libre, réinitialisable                |
| Journal des lancers        | `src/log/rollLog.ts`                                   | Historique local borné, exportable en CSV ; rien ne sort de l'appareil |
| Traductions                | `src/i18n/messages.ts`, `useI18n.ts`                   | Six langues, clés typées, détection navigateur, `translate` pur        |
| Liens famille              | `src/links.ts`, `src/react/components/FamilyLinks.tsx` | URL à partager (locale) ; source et soutien dès le PREMIER écran       |
| Jeu Yahtzee                | `src/games/yahtzee/{scoring,engine}.ts`                | Score des 13 cases + machine d'état pure (pass-and-play)               |
| Jeu 421                    | `src/games/dice421/{scoring,engine}.ts`                | Classement des mains + manches à jetons (charge/décharge)              |
| Jeu Cochon (Pig)           | `src/games/pig/engine.ts`                              | Stop-ou-encore à un dé : cumul du tour, perte sur le 1, banque         |
| Aiguillage écrans          | `src/app/appMode.ts`                                   | Lancer libre / Yahtzee / 421 / Cochon / notation / décider             |
| PWA                        | `vite.config.ts`, `src/main.tsx`                       | Manifest, service worker, base path GH Pages                           |
| Thème                      | `src/styles/tokens.css`, `src/react/hooks/useTheme.ts` | Palette claire/sombre **et** le pont `--dwc-*` lu par le socle         |

La logique pure (`src/dice/**`) ne connaît ni React ni le DOM : elle est
testable seule et couverte à ≥ 90 % (seuil CI).

## 2. Arborescence

```
miss-dice/
├── index.html
├── vite.config.ts            # React + PWA + base path + 404 SPA
├── vitest.config.ts
├── tsconfig*.json            # strict (conventions dev-pwa-config inlinées)
├── eslint.config.js          # @mister-guiiug/dev-pwa-config/eslint-react
├── prettier.config.js
├── scripts/generate-pwa-icons.mjs
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── icons/                # PNG 192/512/180/64 (générés)
└── src/
    ├── main.tsx              # racine React + enregistrement du SW
    ├── types.ts
    ├── links.ts              # URL canonique à partager, résolue à l'exécution
    ├── dice/                 # logique pure + tests
    │   ├── random.ts          colors.ts       diceTypes.ts
    │   ├── pips.ts            rollSchedule.ts notation.ts
    │   └── *.test.ts
    ├── store/createStore.ts         # micro-store réactif, base de tous les autres
    ├── settings/{settingsStore,legacyMigration}.ts
    ├── stats/rollStats.ts           # distribution des faces
    ├── log/rollLog.ts               # historique local + export CSV
    ├── audio/sounds.ts              # WebAudio, sans asset
    ├── decide/decisions.ts          # pile ou face, tirage, mélange
    ├── i18n/{messages,useI18n}.ts   # 6 langues + clés typées + tests
    ├── app/appMode.ts               # écran actif (lancer libre / jeux)
    ├── games/                       # moteurs purs + tests
    │   ├── yahtzee/{scoring,engine}.ts
    │   ├── dice421/{scoring,engine}.ts
    │   └── pig/engine.ts
    ├── styles/{tokens,styles}.css   # tokens + pont --dwc-* + sections du socle
    ├── react/
    │   ├── App.tsx
    │   ├── components/{DiceScreen,DiceTray,DiceFace,SettingsDrawer,ModeMenu}.tsx
    │   ├── components/{NotationRoller,DecideScreen,FamilyLinks,Sheet}.tsx
    │   ├── components/games/{GameShell,PlayerSetup,GameDice,YahtzeeGame,Dice421Game,PigGame}.tsx
    │   ├── hooks/{useDiceRoll,useDiceReveal,useShakeToRoll,useKeyboardRoll,useReducedMotion}.ts
    │   ├── hooks/{useSpeak,useVoices,useSound,useTheme,useUndoableGame}.ts
    │   └── feedback/haptics.ts
    ├── assets/rive/README.md # comment activer Rive (optionnel)
    └── test/{setup.ts,renderWithProviders.tsx}
```

## 3. Concept fonctionnel

- Tap n'importe où → lancer.
- Au clavier (desktop) : **Espace** ou **Entrée** lance, `+`/`=`/`↑` ajoute un
  dé, `-`/`↓` en retire - neutralisé pendant la saisie et tant qu'une feuille
  modale est ouverte (`src/react/hooks/useKeyboardRoll.ts`).
- Pendant le lancer : défilement rapide des faces, cadence en cloche
  inversée (accélère puis décélère, « le dé se pose »).
- Fin : une face est figée et mise en avant (animation _pop_ + teinte du
  fond).
- Doubles taps neutralisés pendant l'animation (`useDiceRoll`).
- Vibration légère au lancer et au résultat si l'appareil la supporte
  (fallback silencieux sinon).
- `prefers-reduced-motion` (ou réglage manuel) → résultat direct, sans
  défilement.

### Réglages (engrenage, en haut à droite)

- **Langue** : Français, English, Español, Deutsch, Italiano, Português.
  Détectée depuis le navigateur au premier lancement, puis mémorisée ; tout
  le texte et les libellés d'accessibilité suivent (l'attribut `<html lang>`
  aussi).
- **Thème** : auto (suit le système), clair ou sombre. Posé avant le 1er
  rendu (script de pré-peinture, pas de flash) et synchronisé avec la
  barre système (`theme-color`).
- **Sons** : petit retour audio synthétisé (WebAudio, aucun asset) au
  lancer et au résultat, activable.
- **Annonce vocale** : le résultat énoncé à voix haute par la synthèse du
  navigateur, dans la voix de la langue choisie (`speech` du socle).
  Silencieuse et sans erreur là où l'API manque.
- **Voix de l'annonce** : n'apparaît que s'il y a un choix à faire. La voix
  retenue d'office n'est pas toujours la bonne - mesuré le 21/09/2026,
  `Microsoft Hortense` écorche « cinq » dès qu'une ponctuation le précède,
  alors que `Julie` et `Paul` sont justes sur la même machine. Aucune
  propriété de `SpeechSynthesisVoice` n'annonce la qualité d'une voix : le
  bouton d'essai énonce donc la phrase RÉELLE de l'annonce, l'oreille étant
  le seul juge. Le choix est retenu par `name`, pas par `voiceURI` - Chrome
  et Firefox ne nomment pas la même voix pareil.
- **Mode daltonien** : une pastille chiffrée redondante dans un coin de
  chaque face. La valeur ne dépend jamais de la couleur seule.
- **Statistiques** : distribution des faces du lancer libre + total,
  réinitialisable.
- **Historique** : les derniers lancers libres, conservés localement et
  **exportables en CSV**. Le journal est borné, et rien n'est transmis.
- **Type de dé** : D4, D6, D8, D10, D12, D20. Le D6 garde les points ; les
  autres affichent le chiffre dans la silhouette du polyèdre.
- **Nombre de dés** : de 1 à 6, lancés ensemble, avec le **total** affiché.
- **Secouer pour lancer** : un coup de poignet lance les dés
  (API DeviceMotion ; demande l'autorisation sur iOS, sinon sans effet).
- **Vibration** et **réduire les animations** (déjà présents).
- **Nos autres applications** : la grille `FamilyApps` du socle, alimentée par
  son catalogue. Elle est rendue **en une colonne** (`layout="list"`, le
  tiroir est étroit) et **groupée par catégorie** (`groupBy="category"`) -
  dix-neuf cartes d'affilée faisaient un mur, il en reste sept lignes.
- **À propos** : partager le lien de l'app (Web Share API, repli
  presse-papiers), lien vers le **code source** (GitHub), **Buy me a coffee**
  (sponsor) et **Signaler un problème** - cf. `src/links.ts` ; le partage et
  le signalement viennent des modules `share` et `issue-report` du socle.
- **Signaler un problème** ouvre le gabarit d'anomalie du compte
  (`issues/new?template=bug.yml`) **prérempli** avec la version, le commit,
  l'écran et le navigateur : l'utilisateur n'a plus qu'à décrire ce qui ne va
  pas. L'URL est recalculée au clic (`currentIssueReportUrl`), jamais figée
  au chargement.

Toutes ces préférences sont persistées localement (`localStorage`).

### Modes (bouton « dés », en haut à gauche)

Plusieurs écrans, accessibles depuis le lanceur ; on revient au lancer
libre par la flèche **ou le bouton retour du navigateur/Android** (intégré
à l'History API). Raccourcis longue-pression sur l'icône installée
(`shortcuts` du manifest → `?play=`).

- **Notation de dés** (JDR) : `2d6+3`, `1d20`, `4d6kh3`, avantage
  `2d20kh1`, `1d100`, dés Fudge `4dF`… - parseur pur testé, total + détail
  des dés gardés/retirés (logique `src/dice/notation.ts`).
- **Décider** : pile ou face, oui/non, tirer un nom au sort, mélanger une
  liste (`src/decide/decisions.ts`).

Pass-and-play **1 à 8 joueurs** (1 joueur = solo) pour les jeux suivants.

**Yahtzee** - 5 dés, **jusqu'à 3 lancers** par tour (on garde les dés au
tap entre les lancers) : on peut s'arrêter et inscrire une case **dès le
1er ou le 2e lancer** (le statut le rappelle). Grille de 13 combinaisons,
bonus supérieur (+35 si la somme des « 1…6 » atteint 63). Chaque joueur
remplit sa propre grille ; le plus haut total l'emporte. Logique :
`src/games/yahtzee/`.

**421** - 3 dés, jeu à jetons (version classique simplifiée, assumée et
documentée dans `src/games/dice421/scoring.ts`) :

- Valeur des mains : `4-2-1` = 10 jetons (la meilleure), `1-1-1` = 7,
  autre brelan `d-d-d` = `d` (2…6), toute autre main = 1.
- **Charge** : un pot de 21 jetons. Chaque manche, le joueur à la plus
  petite main prend au pot un nombre de jetons = valeur de la meilleure
  main de la manche.
- **Décharge** : quand le pot est vide, le perdant prend désormais ses
  jetons au gagnant de la manche. Le premier à n'avoir **plus aucun
  jeton** gagne la partie.

**Cochon** (« Pig ») - 1 dé, jeu de _stop-ou-encore_ : à son tour, on relance
autant qu'on veut, chaque face 2–6 s'ajoute au **cumul du tour** ; un **1**
efface ce cumul et passe la main ; **banquer** verse le cumul au score. Le
premier à **100** gagne (à un joueur : atteindre la cible en un minimum de
tours). Logique : `src/games/pig/engine.ts`.

L'aléa, le score et l'enchaînement des tours sont des fonctions pures
(`engine.ts`) testées indépendamment de l'UI ; les composants ne font que
les afficher.

Confort de jeu : **reprise** d'une partie après refresh (sauvegarde
locale, signalée « Reprendre » dans le menu), **annuler** le dernier coup
(mistaps), **rejouer** avec les mêmes joueurs, **partager** le résultat, et
l'écran reste **allumé** pendant la partie (Screen Wake Lock). Le bouton qui
quitte efface la sauvegarde : il demande donc **confirmation** par défaut, et
ne s'en passe qu'en fin de partie, où il n'y a plus rien à perdre. Les icônes
de la barre sont **dessinées**, pas des glyphes `←` `↶` `↺` dont le rendu
dépendait de la police de l'appareil. Le Yahtzee gère le **bonus
Yahtzee** (+100) et rappelle dans son statut qu'on peut inscrire une case
dès le 1er lancer ; le 421 reconnaît **suites** et **nénette** et laisse
choisir la **taille du pot**.

## 4. Choix techniques

- **Animation CSS/React, pas Rive.** Pour un D6, l'animation CSS est
  suffisante, plus légère (pas de runtime WASM) et sans asset binaire.
  Le point d'extension Rive est documenté dans
  [`src/assets/rive/README.md`](src/assets/rive/README.md) : le rendu est
  isolé du contrôleur, on peut le remplacer sans toucher au métier.
- **Aléa.** `crypto.getRandomValues` normalisé sur [0, 1) (résolution
  32 bits → biais de mappage négligeable pour 4 à 20 faces), repli
  `Math.random`. Source injectable → tests déterministes.
- **Pas de state manager lourd.** Les préférences tiennent dans un petit
  store `useSyncExternalStore` + `localStorage` (tolérant au mode privé).
  Réglages, statistiques, mode courant et journal partagent la même
  plomberie (`src/store/createStore.ts`) : un store concret ne décrit plus
  que sa logique métier.
- **Le CSS du socle, par SECTION.** L'app n'importait aucune feuille du
  paquet, donc ses composants partagés sortaient en couleurs système - c'est
  ce qui faisait rendre l'indice du bouton de rechargement en texte de page
  nue. Elle importe maintenant `components/base.css` et
  `components/app-footer.css`, **pas** la feuille entière : rien d'autre que
  le pied de page et la grille famille n'est touché. Tout est en
  `@layer components`, donc chaque règle de `styles.css` continue de gagner.
  Le contrat `--dwc-*` qu'elles lisent est un **pont** posé dans
  `src/styles/tokens.css` : il pointe les jetons déjà déclarés au-dessus, et
  la bascule clair/sombre suit sans être redite. Seuls les quatre tons d'état
  y portent une valeur, faute d'équivalent dans l'app - en `light-dark()`,
  `color-scheme` étant déclaré dans les deux blocs de thème.
- **TypeScript 7 en SECOND AVIS, pas en remplacement.** `typescript-eslint`
  refuse la 7 par une assertion à l'import - ESLint meurt alors pour tous les
  fichiers. La cohabitation est la voie documentée : `npm run type-check:7`
  fait tourner le portage natif Go à côté de la 6, en `continue-on-error` en
  CI. Il sert à voir venir, pas à bloquer.
- **Lisibilité des points.** Points blancs avec ombre + anneau sombre :
  lisibles sur toutes les faces (jaune compris). La valeur se lit au
  nombre de points et via `aria-label` - jamais uniquement à la couleur.
- **PWA.** `vite-plugin-pwa` (`registerType: 'prompt'`), précache de
  l'app shell (offline), bandeau de mise à jour non intrusif.

## 5. Accessibilité

- Zone de tap = vrai `<button>` → clavier (Entrée/Espace) gratuit.
- Raccourcis clavier globaux au lancer libre (`useKeyboardRoll`) : lancer et
  changer le nombre de dés sans viser une cible à la souris. Ils se taisent
  dès qu'un champ ou une feuille modale a le focus.
- **La zone de jeu qui défile est atteignable au clavier.** `.game-shell__body`
  déborde mais ne contenait, avant le premier lancer, aucun élément focalisable
  - les cases de la grille sont toutes `disabled` tant qu'on n'a pas lancé, et
    un bouton désactivé sort du parcours. Elle porte donc un `tabIndex`
    inconditionnel : mesurer le débordement en continu laisserait manquer
    l'arrêt de tabulation à l'instant précis où l'on tabule.
- `:focus-visible` net, contrastes sombres élevés. Sur la zone de jeu, le
  contour se dessine à l'INTÉRIEUR (`outline-offset: -3px`) : posé dehors sur
  un bloc pleine largeur, il sortirait de l'écran à gauche et à droite.
- Région `aria-live` annonçant « Résultat : N », doublée au besoin par
  l'**annonce vocale** (`speech` du socle, réglage « Annonce vocale »).
- `role="img"` + libellé chiffré sur chaque face.
- `prefers-reduced-motion` respecté (CSS + logique).

## 6. Démarrer en local

```bash
nvm use                 # Node 26 (.nvmrc)
npm install             # nécessite l'accès au registre @mister-guiiug
npm run dev             # http://localhost:5173
```

> Le registre GitHub Packages héberge `@mister-guiiug/dev-pwa-config`.
> En CI le token est injecté ; en local, exporter `NODE_AUTH_TOKEN`
> (cf. `.npmrc`).

Autres scripts :

```bash
npm test                # tests unitaires (Vitest)
npm run test:coverage   # couverture (seuil 90 % sur les domaines purs)
npm run lint            # ESLint
npm run format          # Prettier --write
npm run type-check      # tsc -b (TypeScript 6)
npm run type-check:7    # second avis TypeScript 7 (portage natif Go)
npm run icons           # régénère public/icons/ (dé procédural)
npm run test:e2e        # e2e Playwright (après `npx playwright install`)
npm run build:analyze   # build + visualisation du poids des chunks
```

## 7. Build & déploiement GitHub Pages

```bash
npm run build           # tsc -b && vite build  ->  dist/
npm run preview         # prévisualise sous /miss-dice/
```

Déploiement automatique via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) :
push sur `main` → build avec `VITE_BASE_PATH=/<repo>/` → publication sur
GitHub Pages. Un `404.html` identique à `index.html` est émis pour que les
rafraîchissements de liens profonds bootent l'app shell. Le `base` Vite et
le `scope` du service worker sont alignés sur ce chemin.

Activer une fois dans **Settings → Pages → Source : GitHub Actions**.

## 8. Tests

- `src/dice/random.test.ts` - mapping des tranches, bornes, multi-dés, uniformité.
- `src/dice/diceTypes.test.ts` - set de dés, rendu pips/chiffre, repli D6.
- `src/dice/pips.test.ts` - N points pour la face N, symétrie 180°.
- `src/dice/colors.test.ts` - teintes valides, distinctes, palette cyclée.
- `src/dice/rollSchedule.test.ts` - courbe accélère/décélère, robustesse.
- `src/react/components/DiceFace.test.tsx` - points (D6) et chiffre (autres) + a11y.
- `src/react/hooks/useDiceRoll.test.ts` - états, multi-dés, callbacks, anti-double-tap.
- `src/react/hooks/useShakeToRoll.test.ts` - seuil de secousse + temporisation.
- `src/dice/notation.test.ts` - parseur de notation (avantage, drop, Fudge).
- `src/i18n/messages.test.ts` - parité des clés des six langues, interpolation, détection.
- `src/i18n/useI18n.test.tsx` - bascule de langue, `<html lang>`, persistance.
- `src/games/yahtzee/{scoring,engine}.test.ts` - 13 combinaisons, bonus, tours, fin.
- `src/games/dice421/{scoring,engine}.test.ts` - classement des mains, charge/décharge, victoire.
- `src/games/pig/engine.test.ts` - cumul du tour, perte sur le 1, banque, victoire, solo.
- `src/react/components/SettingsDrawer.test.tsx` - le lien de signalement et son préremplissage.
- `src/games/persistence.test.ts` - sauvegarde/reprise/effacement de partie.
- `src/react/hooks/useUndoableGame.test.ts` - annuler, persister, reprendre.
- `src/react/components/Sheet.test.tsx` - dialogue modal, focus, Échap.
- `src/react/components/games/GameShell.test.tsx` - coquille de jeu, retour, confirmation.
- `src/settings/settingsStore.test.ts` + `src/stats/rollStats.test.ts` - préfs et stats.
- `src/settings/legacyMigration.test.ts` - reprise des anciennes clés de réglages.
- `src/store/createStore.test.ts` - abonnement, émission, isolation entre stores.
- `src/log/rollLog.test.ts` - journal borné, export CSV.
- `src/audio/sounds.test.ts` - silence garanti quand l'API WebAudio manque.
- `src/decide/decisions.test.ts` - pièce, oui/non, tirage, mélange.
- `src/react/ThemeProvider.test.tsx` - thème auto/clair/sombre, pas de flash.
- `src/react/AppUpdatesProvider.test.tsx` - bandeau de mise à jour, dans la bonne langue.
- `src/react/a11y.test.tsx` - axe-core sur les écrans clés (hors contraste : jsdom ne
  calcule pas la mise en page).
- `src/readme.test.ts` - ce document ne cite aucun fichier de `src/` disparu.
- `e2e/smoke.spec.ts` - fumée Playwright (lancer, menu des jeux).
- `e2e/a11y.spec.ts` - axe-core dans un VRAI navigateur : là, le contraste est
  réellement évalué (WCAG 2.0/2.1 A + AA).
- `e2e/entree.spec.ts` - l'écran d'entrée, vérifié là où il casse : rien à effet de
  bord ne doit se monter derrière la porte.

**Couverture : 98,5 % d'instructions**, seuil CI ≥ 90 %. La porte ne mesure
que les domaines PURS - `src/dice/**`, `src/games/**`, `src/decide/**`,
`src/log/**` et `src/store/createStore.ts` (cf. `vitest.config.ts`). La
surface d'interface en est volontairement exclue : l'y verser diluerait le
seuil au lieu de le renforcer.

## 9. Évolutions prévues (sans refonte)

Sont livrés : types de dés, multi-dés, secouer-pour-lancer, **six langues**
(FR/EN/ES/DE/IT/PT), jeux **Yahtzee**, **421** et **Cochon**, **notation JDR**
et écran **Décider**, partage/source/sponsor, **signalement d'un problème**,
**thème clair/auto**, **sons**, **annonce vocale** et **choix de la voix**,
**mode daltonien**, **raccourcis clavier**, **statistiques**, **historique
exportable en CSV**, **reprise de partie**, **annuler**, rejouer, partage de
résultat, **wake lock**. Côté technique : jeux en **lazy-load**, **error
boundary**, **feuilles modales accessibles** (focus trap + Échap), habillage
du socle importé **par section**, husky/lint-staged/commitlint, Lighthouse CI,
**second avis TypeScript 7** et e2e Playwright (fumée, entrée, a11y). Pistes
restantes : thèmes additionnels, règles 421 avancées (décideur), joker Yahtzee
complet, synchronisation multi-appareils.

## Licence

MIT - voir [LICENSE](LICENSE).
