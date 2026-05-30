# 🎲 Miss Dice

Lanceur de **dé à 6 faces**, _mobile-first_, 100 % offline, installable.
Toute la surface de l'écran est une zone de tap : on touche, le dé roule,
une face se pose. Sans pub, sans tracking, sans backend — seules les
préférences locales sont stockées dans le navigateur.

Membre de la famille PWA `miss-*` / `mister-*`, bâti sur les conventions
partagées de [`@mister-guiiug/dev-wpa-config`](https://github.com/mister-guiiug/dev-wpa-config)
(ESLint React, Prettier, tsconfig strict, Vitest, PWA).

---

## 1. Architecture

Séparation stricte **métier / animation / rendu / config**, comme demandé :

| Couche               | Fichier(s)                                            | Rôle                                                          |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| Aléa                 | `src/dice/random.ts`                                  | Tirage uniforme 1..N + multi-dés (rng injectable)             |
| Types de dés         | `src/dice/diceTypes.ts`                               | D4/D6/D8/D10/D12/D20 : faces, silhouette, rendu               |
| Disposition points   | `src/dice/pips.ts`                                    | Grille 3×3 → points (réservé au D6)                           |
| Couleurs             | `src/dice/colors.ts`                                  | Une teinte par face (palette cyclée au-delà du D6)            |
| Cadence d'animation  | `src/dice/rollSchedule.ts`                            | Instants de défilement (pur, testé)                           |
| Contrôleur de lancer | `src/react/hooks/useDiceRoll.ts`                      | État repos → défilement → résultat multi-dés, anti-double-tap |
| Secouer pour lancer  | `src/react/hooks/useShakeToRoll.ts`                   | Détection de secousse (DeviceMotion) + permission iOS         |
| Rendu d'une face     | `src/react/components/DiceFace.tsx`                   | Points (D6) ou chiffre + silhouette (sans logique métier)     |
| Plateau de dés       | `src/react/components/DiceTray.tsx`                   | Disposition de N dés, taille adaptative                       |
| Écran principal      | `src/react/components/DiceScreen.tsx`                 | Zone de tap plein écran, total, teinte immersive, a11y        |
| Réglages             | `src/settings/settingsStore.ts`, `SettingsDrawer.tsx` | Préfs locales (type, nombre, secousse, vibration, mouvement)  |
| PWA                  | `vite.config.ts`, `src/register-sw.ts`                | Manifest, service worker, base path GH Pages                  |

La logique pure (`src/dice/**`) ne connaît ni React ni le DOM : elle est
testable seule et couverte à ≥ 90 % (seuil CI).

## 2. Arborescence

```
miss-dice/
├── index.html
├── vite.config.ts            # React + PWA + base path + 404 SPA
├── vitest.config.ts
├── tsconfig*.json            # strict (conventions dev-wpa-config inlinées)
├── eslint.config.js          # @mister-guiiug/dev-wpa-config/eslint-react
├── prettier.config.js
├── scripts/generate-pwa-icons.mjs
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── icons/                # PNG 192/512/180/64 (générés)
└── src/
    ├── main.tsx
    ├── register-sw.ts
    ├── types.ts
    ├── dice/                 # logique pure + tests
    │   ├── random.ts          colors.ts       diceTypes.ts
    │   ├── pips.ts            rollSchedule.ts
    │   └── *.test.ts
    ├── settings/settingsStore.ts
    ├── styles/{tokens,styles}.css
    ├── react/
    │   ├── App.tsx
    │   ├── components/{DiceScreen,DiceTray,DiceFace,SettingsDrawer,InstallPrompt}.tsx
    │   ├── hooks/{useDiceRoll,useShakeToRoll,useReducedMotion,useInstallPrompt}.ts
    │   └── feedback/haptics.ts
    ├── assets/rive/README.md # comment activer Rive (optionnel)
    └── test/{setup,stub-pwa-register}.ts
```

## 3. Concept fonctionnel

- Tap n'importe où → lancer.
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

- **Type de dé** : D4, D6, D8, D10, D12, D20. Le D6 garde les points ; les
  autres affichent le chiffre dans la silhouette du polyèdre.
- **Nombre de dés** : de 1 à 6, lancés ensemble, avec le **total** affiché.
- **Secouer pour lancer** : un coup de poignet lance les dés
  (API DeviceMotion ; demande l'autorisation sur iOS, sinon sans effet).
- **Vibration** et **réduire les animations** (déjà présents).

Toutes ces préférences sont persistées localement (`localStorage`).

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
- **Lisibilité des points.** Points blancs avec ombre + anneau sombre :
  lisibles sur toutes les faces (jaune compris). La valeur se lit au
  nombre de points et via `aria-label` — jamais uniquement à la couleur.
- **PWA.** `vite-plugin-pwa` (`registerType: 'prompt'`), précache de
  l'app shell (offline), bandeau de mise à jour non intrusif.

## 5. Accessibilité

- Zone de tap = vrai `<button>` → clavier (Entrée/Espace) gratuit.
- `:focus-visible` net, contrastes sombres élevés.
- Région `aria-live` annonçant « Résultat : N ».
- `role="img"` + libellé chiffré sur chaque face.
- `prefers-reduced-motion` respecté (CSS + logique).

## 6. Démarrer en local

```bash
nvm use                 # Node 22 (.nvmrc)
npm install             # nécessite l'accès au registre @mister-guiiug
npm run dev             # http://localhost:5173
```

> Le registre GitHub Packages héberge `@mister-guiiug/dev-wpa-config`.
> En CI le token est injecté ; en local, exporter `NODE_AUTH_TOKEN`
> (cf. `.npmrc`).

Autres scripts :

```bash
npm test                # tests unitaires (Vitest)
npm run test:coverage   # couverture (seuil sur src/dice/**)
npm run lint            # ESLint
npm run format          # Prettier --write
npm run type-check      # tsc -b
npm run icons           # régénère public/icons/ (dé procédural)
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

- `src/dice/random.test.ts` — mapping des tranches, bornes, multi-dés, uniformité.
- `src/dice/diceTypes.test.ts` — set de dés, rendu pips/chiffre, repli D6.
- `src/dice/pips.test.ts` — N points pour la face N, symétrie 180°.
- `src/dice/colors.test.ts` — teintes valides, distinctes, palette cyclée.
- `src/dice/rollSchedule.test.ts` — courbe accélère/décélère, robustesse.
- `src/react/components/DiceFace.test.tsx` — points (D6) et chiffre (autres) + a11y.
- `src/react/hooks/useDiceRoll.test.ts` — états, multi-dés, callbacks, anti-double-tap.
- `src/react/hooks/useShakeToRoll.test.ts` — seuil de secousse + temporisation.

Couverture du domaine `src/dice/**` à **100 %** (seuil CI ≥ 90 %).

## 9. Évolutions prévues (sans refonte)

Historique des lancers, statistiques, sons activables, thèmes visuels : le
découpage métier/rendu et le store de préférences sont déjà prêts à les
accueillir (les types de dés, le multi-dés et le secouer-pour-lancer sont
désormais livrés).

## Licence

MIT — voir [LICENSE](LICENSE).
