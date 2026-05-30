import { useCallback, useEffect, useState } from 'react';
import {
  clearGame,
  loadGame,
  saveGame,
  type GameKey,
} from '../../games/persistence';

const MAX_HISTORY = 50;

interface Wrap<T> {
  present: T;
  past: T[];
}

export interface UndoableGame<T> {
  /** État courant, ou null tant qu'aucune partie n'est lancée. */
  game: T | null;
  canUndo: boolean;
  /** Démarre une nouvelle partie (vide l'historique). */
  start: (game: T) => void;
  /** Applique une transition (empile l'état précédent pour l'undo). */
  apply: (next: T) => void;
  /** Revient à l'état précédent. */
  undo: () => void;
  /** Quitte la partie (efface la sauvegarde) → retour à l'écran de mise en place. */
  quit: () => void;
}

/**
 * Gère l'état d'une partie avec **annulation** et **reprise** : l'état
 * courant est persisté (sauf partie terminée) pour survivre à un refresh,
 * et chaque transition est empilée pour permettre l'undo (mistaps en
 * pass-and-play). L'historique n'est pas persisté (repart propre au reload).
 */
export function useUndoableGame<T>(
  mode: GameKey,
  isOver: (state: T) => boolean
): UndoableGame<T> {
  const [wrap, setWrap] = useState<Wrap<T> | null>(() => {
    const saved = loadGame<T>(mode);
    return saved ? { present: saved, past: [] } : null;
  });

  useEffect(() => {
    if (!wrap) return;
    if (isOver(wrap.present)) clearGame(mode);
    else saveGame(mode, wrap.present);
  }, [wrap, mode, isOver]);

  const start = useCallback(
    (game: T) => setWrap({ present: game, past: [] }),
    []
  );

  const apply = useCallback(
    (next: T) =>
      setWrap(w =>
        w
          ? { present: next, past: [...w.past, w.present].slice(-MAX_HISTORY) }
          : { present: next, past: [] }
      ),
    []
  );

  const undo = useCallback(
    () =>
      setWrap(w =>
        w && w.past.length > 0
          ? { present: w.past[w.past.length - 1]!, past: w.past.slice(0, -1) }
          : w
      ),
    []
  );

  const quit = useCallback(() => {
    clearGame(mode);
    setWrap(null);
  }, [mode]);

  return {
    game: wrap?.present ?? null,
    canUndo: (wrap?.past.length ?? 0) > 0,
    start,
    apply,
    undo,
    quit,
  };
}
