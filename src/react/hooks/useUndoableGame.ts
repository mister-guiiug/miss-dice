import { useCallback, useEffect, useRef, useState } from 'react';
import { GESTES, trackEvent } from '@mister-guiiug/dev-pwa-config/analytics';
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

  /*
   * LA PARTIE EST MESURÉE ICI, ET NULLE PART AILLEURS.
   *
   * Ce hook est le seul endroit qui connaisse À LA FOIS le jeu (`mode`, une
   * énumération `GameKey`) et le moment où il se termine (`isOver`). Chaque
   * écran de jeu l'utilise : l'instrumenter ici les couvre tous, du même nom,
   * là où trois composants auraient donné trois vocabulaires.
   *
   * IL N'Y A PAS D'ÉVÉNEMENT PAR LANCER, et c'est une décision. Un tap est le
   * battement de cœur de cette app : un événement par lancer pèserait plus que
   * tout le reste du parc réuni, pour un chiffre que la vue de page donne
   * déjà. Ce qui manque, c'est le RAPPORT — combien de parties commencées vont
   * au bout.
   *
   * NI LES NOMS DES JOUEURS, NI LES SCORES. Les noms sont saisis, et un score
   * ne dit rien qu'on veuille savoir de quelqu'un.
   */
  const finComptee = useRef(false);

  useEffect(() => {
    if (!wrap) return;
    if (isOver(wrap.present)) {
      clearGame(mode);
      // UNE SEULE FOIS PAR PARTIE. L'effet rejoue à chaque changement d'état,
      // et `isOver` reste vrai : sans ce garde, une partie finie se compterait
      // à chaque rendu suivant.
      if (!finComptee.current) {
        finComptee.current = true;
        trackEvent(GESTES.PARTIE, { etape: 'terminee', jeu: mode });
      }
    } else {
      // Un `undo` ramène la partie en cours : sa fin redeviendra comptable.
      finComptee.current = false;
      saveGame(mode, wrap.present);
    }
  }, [wrap, mode, isOver]);

  const start = useCallback(
    (game: T) => {
      finComptee.current = false;
      setWrap({ present: game, past: [] });
      trackEvent(GESTES.PARTIE, { etape: 'demarree', jeu: mode });
    },
    [mode]
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
