import { afterEach, describe, expect, it } from 'vitest';
import {
  GAME_SCHEMA_VERSION,
  clearGame,
  hasSavedGame,
  loadGame,
  saveGame,
  type GameKey,
} from './persistence';
import {
  createDice421,
  rollDiceAction,
  validateTurn,
  type Dice421State,
} from './dice421/engine';

afterEach(() => localStorage.clear());

describe('persistence', () => {
  it('sauvegarde puis recharge une partie', () => {
    expect(loadGame('yahtzee')).toBeNull();
    expect(hasSavedGame('yahtzee')).toBe(false);
    saveGame('yahtzee', { turn: 3, players: ['A'] });
    expect(hasSavedGame('yahtzee')).toBe(true);
    expect(loadGame('yahtzee')).toEqual({ turn: 3, players: ['A'] });
  });

  it('isole les clés par jeu', () => {
    saveGame('yahtzee', { a: 1 });
    saveGame('dice421', { b: 2 });
    expect(loadGame('yahtzee')).toEqual({ a: 1 });
    expect(loadGame('dice421')).toEqual({ b: 2 });
  });

  it('efface une sauvegarde', () => {
    saveGame('dice421', { x: 1 });
    clearGame('dice421');
    expect(loadGame('dice421')).toBeNull();
    expect(hasSavedGame('dice421')).toBe(false);
  });

  it('renvoie null sur une sauvegarde corrompue', () => {
    localStorage.setItem('miss-dice:game:yahtzee', '{not json');
    expect(loadGame('yahtzee')).toBeNull();
  });

  it('ignore une sauvegarde d’un schéma périmé', () => {
    // Ancien format sans enveloppe de version → non repris.
    localStorage.setItem('miss-dice:game:yahtzee', JSON.stringify({ a: 1 }));
    expect(loadGame('yahtzee')).toBeNull();
  });
});

/** Écrit une sauvegarde telle qu'une version donnée de l'app l'aurait laissée. */
function sauvegardeEnVersion(mode: GameKey, v: number, state: unknown): void {
  localStorage.setItem(`miss-dice:game:${mode}`, JSON.stringify({ v, state }));
}

describe('persistence - migrations', () => {
  it('reprend un 421 de version 2 en lui donnant la règle qu’il jouait', () => {
    sauvegardeEnVersion('dice421', 2, { players: [{ name: 'A' }], pot: 21 });
    expect(loadGame('dice421')).toEqual({
      players: [{ name: 'A' }],
      pot: 21,
      decideur: false,
      rollsAllowed: 3,
    });
  });

  /*
   * UNE VRAIE PARTIE DE VERSION 2, construite comme elle l'était, reprise puis
   * jouée sur le vrai moteur.
   *
   * CE QUE CE TEST PROUVE, ET CE QU'IL NE PROUVE PAS. La montée 2 → 3
   * redoutait un `rollsLeft: undefined` au tour suivant ; il n'arrive pas,
   * même sans migration - `freshTurn` rend 3 pour `undefined`. La preuve
   * utile est donc sur le TYPE : repris, l'état porte les champs que
   * `Dice421State` déclare, avec le bon type. Retirer `rollsAllowed` de
   * l'étape fait tomber ce test ; le tour qui suit n'est vérifié qu'en
   * complément, pour montrer que la partie reprise avance.
   */
  it('le 421 repris porte les champs que son type déclare, et avance', () => {
    const neuve = createDice421(['A', 'B']);
    const { decideur: _d, rollsAllowed: _r, ...enVersion2 } = neuve;
    sauvegardeEnVersion('dice421', 2, enVersion2);

    const reprise = loadGame<Dice421State>('dice421')!;
    expect(typeof reprise.decideur).toBe('boolean');
    expect(typeof reprise.rollsAllowed).toBe('number');

    const suivant = validateTurn(rollDiceAction(reprise, () => 0.5));
    expect(suivant.current).toBe(1);
    expect(suivant.rollsLeft).toBe(3);
  });

  it('laisse passer Yahtzee et Cochon, dont la forme n’a pas changé', () => {
    const etat = { players: [{ name: 'A' }], current: 0, turn: 4 };
    sauvegardeEnVersion('yahtzee', 2, etat);
    sauvegardeEnVersion('pig', 2, etat);
    expect(loadGame('yahtzee')).toEqual(etat);
    expect(loadGame('pig')).toEqual(etat);
  });

  it('refuse une sauvegarde d’une version PLUS RÉCENTE que l’app', () => {
    sauvegardeEnVersion('pig', GAME_SCHEMA_VERSION + 1, { players: [] });
    expect(loadGame('pig')).toBeNull();
  });

  it('refuse une version qu’aucune étape ne sait lire', () => {
    for (const v of [0, 1, -3, 2.5]) {
      sauvegardeEnVersion('pig', v, { players: [] });
      expect(loadGame('pig')).toBeNull();
    }
  });

  /*
   * LE BADGE « REPRENDRE » DOIT TENIR SA PROMESSE. `hasSavedGame` répondait à
   * la présence de la clé : après une montée de schéma, le menu annonçait une
   * reprise que `loadGame` refusait, et le toucher démarrait une partie neuve.
   */
  it('n’annonce une reprise que si elle aura lieu', () => {
    sauvegardeEnVersion('pig', GAME_SCHEMA_VERSION + 1, { players: [] });
    expect(hasSavedGame('pig')).toBe(false);

    sauvegardeEnVersion('dice421', 2, { players: [{ name: 'A' }] });
    expect(hasSavedGame('dice421')).toBe(true);
  });
});
