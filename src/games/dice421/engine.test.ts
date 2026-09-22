import { describe, expect, it } from 'vitest';
import {
  canRoll,
  createDice421,
  rollDiceAction,
  toggleHold,
  validateTurn,
  canValidate,
  currentHand,
  isDecideur,
  ROLLS_PER_TURN,
  STARTING_POT,
  type Dice421State,
} from './engine';
import type { Rng } from '../../dice/random';

/** Rng qui produit toujours la face `face` → un brelan [face,face,face]. */
function fixedFace(face: number): Rng {
  return () => (face - 1) / 6 + 0.001;
}

/** Joue un tour complet : lance (brelan de `face`) puis valide. */
function playTurn(state: Dice421State, face: number): Dice421State {
  return validateTurn(rollDiceAction(state, fixedFace(face)));
}

describe('421 engine - bases', () => {
  it('démarre en charge avec le pot plein et des joueurs sans jeton', () => {
    const state = createDice421(['A', 'B']);
    expect(state.pot).toBe(STARTING_POT);
    expect(state.phase).toBe('charge');
    expect(state.players.every(p => p.tokens === 0)).toBe(true);
  });

  it('lance, garde un dé et expose la main courante', () => {
    let state = createDice421(['A']);
    state = rollDiceAction(state, fixedFace(4)); // [4,4,4]
    expect(state.rolledThisTurn).toBe(true);
    expect(currentHand(state).kind).toBe('trips');
    state = toggleHold(state, 0);
    expect(state.held[0]).toBe(true);
  });

  it('ne valide pas un tour sans lancer', () => {
    const state = createDice421(['A']);
    expect(canValidate(state)).toBe(false);
    expect(validateTurn(state)).toBe(state);
  });
});

describe('421 engine - résolution de manche (charge)', () => {
  it('le perdant prend au pot des jetons = valeur de la meilleure main', () => {
    let state = createDice421(['A', 'B']);
    state = playTurn(state, 6); // P0 : 6-6-6 (rang fort, 6 jetons)
    state = playTurn(state, 2); // P1 : 2-2-2 (rang faible)
    expect(state.lastRound).toEqual({
      winner: 0,
      loser: 1,
      tokens: 6,
      fromPot: true,
    });
    expect(state.players[1]!.tokens).toBe(6);
    expect(state.players[0]!.tokens).toBe(0);
    expect(state.pot).toBe(STARTING_POT - 6);
    expect(state.current).toBe(1); // le perdant entame la manche suivante
  });

  it('bascule en décharge quand le pot se vide', () => {
    let state = createDice421(['A', 'B']);
    state.pot = 4; // sur le point de se vider
    state = playTurn(state, 6); // gagnant 6-6-6 → 6 jetons
    state = playTurn(state, 2); // perdant
    expect(state.players[1]!.tokens).toBe(4); // min(6, pot)
    expect(state.pot).toBe(0);
    expect(state.phase).toBe('decharge');
  });
});

describe('421 engine - décharge et victoire', () => {
  it('le gagnant se débarrasse de ses jetons ; à 0 il gagne', () => {
    let state = createDice421(['A', 'B']);
    state.phase = 'decharge';
    state.pot = 0;
    state.players[0]!.tokens = 6;
    state = playTurn(state, 6); // P0 meilleure main → donne ses jetons
    state = playTurn(state, 2); // P1 perd → les reçoit
    expect(state.players[0]!.tokens).toBe(0);
    expect(state.players[1]!.tokens).toBe(6);
    expect(state.phase).toBe('over');
    expect(state.winner).toBe(0);
  });
});

describe('421 engine - gardes et décharge partielle', () => {
  it('ignore garder un dé avant le lancer ou hors limites', () => {
    const state = createDice421(['A']);
    expect(toggleHold(state, 0)).toBe(state); // pas encore lancé
    const rolled = rollDiceAction(state, fixedFace(3));
    expect(toggleHold(rolled, 9)).toBe(rolled); // index invalide
  });

  it('ne relance pas une partie terminée', () => {
    const state = createDice421(['A', 'B']);
    state.phase = 'over';
    expect(rollDiceAction(state, fixedFace(6))).toBe(state);
  });

  it('en décharge, un gagnant qui garde des jetons ne termine pas la partie', () => {
    let state = createDice421(['A', 'B']);
    state.phase = 'decharge';
    state.pot = 0;
    state.players[0]!.tokens = 10; // plus que la valeur de la main (6)
    state = playTurn(state, 6); // gagnant
    state = playTurn(state, 2); // perdant
    expect(state.players[0]!.tokens).toBe(4); // 10 - 6
    expect(state.players[1]!.tokens).toBe(6);
    expect(state.phase).toBe('decharge');
    expect(state.winner).toBeNull();
  });
});

describe('421 engine - solo (entraînement)', () => {
  it('enregistre la main sans transfert de jetons et ne se termine pas', () => {
    let state = createDice421(['Moi']);
    state = playTurn(state, 4); // 4-4-4
    expect(state.players[0]!.tokens).toBe(0);
    expect(state.pot).toBe(STARTING_POT);
    expect(state.phase).toBe('charge');
    expect(state.lastRound?.tokens).toBe(4);
  });
});

/**
 * LA RÈGLE DU DÉCIDEUR : le premier de la manche ne fait pas que commencer,
 * il fixe le nombre de lancers de tout le monde. S'arrêter tôt avec une main
 * moyenne pour priver les autres de leurs relances EST le coup du 421 - sans
 * cette règle, c'est trois tirages côte à côte.
 */
describe('421 engine - règle du décideur', () => {
  it('désactivée par défaut : trois lancers pour tous, quoi que fasse le premier', () => {
    let state = createDice421(['A', 'B']);
    expect(state.decideur).toBe(false);
    expect(isDecideur(state)).toBe(false);

    // A s'arrête après UN lancer.
    state = playTurn(state, 4);
    expect(state.current).toBe(1);
    expect(state.rollsLeft).toBe(ROLLS_PER_TURN);
  });

  it('le décideur s’arrête au premier jet : le suivant n’en a qu’un', () => {
    let state = createDice421(['A', 'B'], STARTING_POT, true);
    expect(isDecideur(state)).toBe(true);

    state = playTurn(state, 4);

    expect(state.current).toBe(1);
    expect(state.rollsAllowed).toBe(1);
    expect(state.rollsLeft).toBe(1);
    // Et il n'ouvre pas la manche, lui : il la subit.
    expect(isDecideur(state)).toBe(false);

    // Un lancer, et plus rien : le tour est joué.
    state = rollDiceAction(state, fixedFace(2));
    expect(canRoll(state)).toBe(false);
  });

  // ON COMPTE LES LANCERS PRIS, PAS LE DROIT D'EN PRENDRE. Le décideur qui va
  // au bout ne prive personne : c'est le plafond ordinaire.
  it('le décideur qui prend ses trois lancers ne plafonne personne', () => {
    let state = createDice421(['A', 'B'], STARTING_POT, true);
    state = rollDiceAction(state, fixedFace(4));
    state = rollDiceAction(state, fixedFace(4));
    state = rollDiceAction(state, fixedFace(4));
    state = validateTurn(state);

    expect(state.rollsAllowed).toBe(ROLLS_PER_TURN);
    expect(state.rollsLeft).toBe(ROLLS_PER_TURN);
  });

  it('le plafond vaut pour la manche, pas pour la partie', () => {
    let state = createDice421(['A', 'B'], STARTING_POT, true);
    state = playTurn(state, 4); // A ouvre à un lancer
    expect(state.rollsAllowed).toBe(1);
    state = playTurn(state, 2); // B suit, la manche se résout

    // Manche suivante : le perdant entame, et décide à son tour.
    expect(state.rollsAllowed).toBe(ROLLS_PER_TURN);
    expect(state.rollsLeft).toBe(ROLLS_PER_TURN);
    expect(isDecideur(state)).toBe(true);
  });

  it('à trois joueurs, le plafond tient pour les DEUX suivants', () => {
    let state = createDice421(['A', 'B', 'C'], STARTING_POT, true);
    state = rollDiceAction(state, fixedFace(4));
    state = rollDiceAction(state, fixedFace(4));
    state = validateTurn(state); // A a pris deux lancers

    expect(state.rollsAllowed).toBe(2);
    expect(state.rollsLeft).toBe(2);

    state = playTurn(state, 2); // B valide après un lancer
    expect(state.current).toBe(2);
    expect(state.rollsAllowed).toBe(2); // C hérite du plafond de A, pas de B
    expect(state.rollsLeft).toBe(2);
  });

  // EN SOLO, PERSONNE NE PLAFONNE PERSONNE. La manche se résout au premier
  // `validateTurn`, donc le plafond est rendu avant d'avoir servi.
  it('en solo, la règle ne retire jamais de lancer', () => {
    let state = createDice421(['A'], STARTING_POT, true);
    state = playTurn(state, 4);
    expect(state.rollsAllowed).toBe(ROLLS_PER_TURN);
    expect(state.rollsLeft).toBe(ROLLS_PER_TURN);
  });
});
