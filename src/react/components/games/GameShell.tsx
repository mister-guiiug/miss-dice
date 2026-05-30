import type { ReactNode } from 'react';
import { appModeStore } from '../../../app/appMode';
import { useI18n } from '../../../i18n/useI18n';
import { useWakeLock } from '../../hooks/useWakeLock';

interface GameShellProps {
  title: string;
  onNewGame?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Cadre commun aux jeux : barre supérieure (retour vers le lancer libre,
 * annuler, titre, nouvelle partie), corps défilant et pied d'écran fixe.
 */
export function GameShell({
  title,
  onNewGame,
  onUndo,
  canUndo = false,
  footer,
  children,
}: GameShellProps) {
  const { t } = useI18n();
  // Empêche l'écran de s'éteindre pendant une partie (pass-and-play).
  useWakeLock(true);
  return (
    <div className="game-shell">
      <header className="game-shell__bar">
        <button
          type="button"
          className="icon-button"
          aria-label={t('common.back')}
          onClick={() => appModeStore.leave()}
        >
          ←
        </button>
        {onUndo && (
          <button
            type="button"
            className="icon-button"
            aria-label={t('game.undo')}
            disabled={!canUndo}
            onClick={onUndo}
          >
            ↶
          </button>
        )}
        <h1 className="game-shell__title">{title}</h1>
        {onNewGame ? (
          <button
            type="button"
            className="icon-button"
            aria-label={t('common.newGame')}
            onClick={onNewGame}
          >
            ↺
          </button>
        ) : (
          <span className="game-shell__spacer" aria-hidden="true" />
        )}
      </header>
      <div className="game-shell__body">{children}</div>
      {footer && <div className="game-shell__footer">{footer}</div>}
    </div>
  );
}
