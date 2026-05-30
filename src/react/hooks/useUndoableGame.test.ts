import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUndoableGame } from './useUndoableGame';
import { hasSavedGame } from '../../games/persistence';

interface G {
  n: number;
  over: boolean;
}
const isOver = (g: G): boolean => g.over;

afterEach(() => localStorage.clear());

describe('useUndoableGame', () => {
  it('démarre, applique des transitions et permet d’annuler', () => {
    const { result } = renderHook(() => useUndoableGame<G>('yahtzee', isOver));
    expect(result.current.game).toBeNull();
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.start({ n: 0, over: false }));
    act(() => result.current.apply({ n: 1, over: false }));
    expect(result.current.game?.n).toBe(1);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.game?.n).toBe(0);
    expect(result.current.canUndo).toBe(false);
  });

  it('persiste la partie en cours et l’efface à la fin', () => {
    const { result } = renderHook(() => useUndoableGame<G>('dice421', isOver));
    act(() => result.current.start({ n: 0, over: false }));
    expect(hasSavedGame('dice421')).toBe(true);
    act(() => result.current.apply({ n: 1, over: true })); // partie terminée
    expect(hasSavedGame('dice421')).toBe(false);
  });

  it('quitter efface la sauvegarde et remet à zéro', () => {
    const { result } = renderHook(() => useUndoableGame<G>('yahtzee', isOver));
    act(() => result.current.start({ n: 5, over: false }));
    act(() => result.current.quit());
    expect(result.current.game).toBeNull();
    expect(hasSavedGame('yahtzee')).toBe(false);
  });

  it('reprend une partie déjà sauvegardée au montage', () => {
    localStorage.setItem(
      'miss-dice:game:yahtzee',
      JSON.stringify({ n: 9, over: false })
    );
    const { result } = renderHook(() => useUndoableGame<G>('yahtzee', isOver));
    expect(result.current.game?.n).toBe(9);
  });
});
