import type { ReactNode } from 'react';
import { appModeStore } from '../../../app/appMode';
import { useI18n } from '../../../i18n/useI18n';

interface GameShellProps {
  title: string;
  onNewGame?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Cadre commun aux jeux : barre supérieure (retour vers le lancer libre,
 * titre, nouvelle partie), corps défilant et pied d'écran fixe optionnel.
 */
export function GameShell({
  title,
  onNewGame,
  footer,
  children,
}: GameShellProps) {
  const { t } = useI18n();
  return (
    <div className="game-shell">
      <header className="game-shell__bar">
        <button
          type="button"
          className="icon-button"
          aria-label={t('common.back')}
          onClick={() => appModeStore.set('roll')}
        >
          ←
        </button>
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
