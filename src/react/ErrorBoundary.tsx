import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Garde-fou : intercepte les erreurs de rendu pour éviter l'écran blanc et
 * proposer un rechargement. Volontairement sans hook ni i18n (doit rester
 * fonctionnel même si le reste de l'app est cassé).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[miss-dice] erreur de rendu :', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="crash" role="alert">
          <span className="crash__emoji" aria-hidden="true">
            🎲
          </span>
          <p className="crash__text">Oups — une erreur est survenue.</p>
          <button
            type="button"
            className="primary-btn crash__btn"
            onClick={() => window.location.reload()}
          >
            Recharger / Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
