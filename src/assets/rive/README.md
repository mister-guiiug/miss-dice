# Animations — Rive (optionnel)

miss-dice fonctionne **sans Rive** : l'animation par défaut est en
CSS/React (défilement des faces piloté par `useDiceRoll`, rendu par
`DiceFace`, keyframes `dice-tumble` / `dice-pop` dans `styles.css`).
C'est le mode livré, léger et robuste, sans dépendance supplémentaire.

## Pourquoi pas Rive par défaut ?

Pour un dé à 6 faces, l'animation CSS est suffisante, plus performante au
premier chargement (pas de runtime WASM ~200 Ko) et n'a aucun asset
binaire à maintenir. On garde donc Rive **optionnel**.

## Le point d'extension

La logique métier est déjà isolée de l'animation :

- `src/dice/random.ts` — tirage aléatoire (le « quoi »)
- `src/dice/rollSchedule.ts` — cadence du défilement (pur, testé)
- `src/react/hooks/useDiceRoll.ts` — **contrôleur** d'état du lancer
- `src/react/components/DiceFace.tsx` — **rendu** d'une face

Pour brancher Rive, on remplace uniquement la couche de _rendu_ : le
contrôleur `useDiceRoll` reste la seule source de vérité (valeur, statut).

## Activer Rive

1. Déposer un fichier `dice.riv` dans ce dossier (`src/assets/rive/`),
   avec une state machine exposant un input numérique `face` (1..6) et un
   trigger `roll`.
2. Installer le runtime : `npm i @rive-app/react-canvas`.
3. Créer `src/react/components/RiveDice.tsx` (chargé en `React.lazy` pour
   ne pas alourdir le bundle initial) qui :
   - lit `value` / `status` depuis `useDiceRoll`,
   - pousse `face` et déclenche `roll` sur la state machine.
4. Dans `DiceScreen`, rendre `<RiveDice />` si l'asset existe, sinon
   conserver `<DiceFace />`. Le fallback CSS reste le défaut si aucun
   `.riv` n'est présent.

Tant qu'aucun `.riv` n'est fourni, **rien à faire** : l'app utilise le
rendu CSS/React.
