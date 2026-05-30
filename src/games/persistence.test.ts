import { afterEach, describe, expect, it } from 'vitest';
import { clearGame, hasSavedGame, loadGame, saveGame } from './persistence';

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
