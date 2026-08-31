import './styles/tokens.css';
import './styles/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  installErrorReporter,
  initSentry,
} from '@mister-guiiug/dev-wpa-config/react/observability';
import { unregisterServiceWorkers } from '@mister-guiiug/dev-wpa-config/sw-update';
import { registerSW } from 'virtual:pwa-register';
import { App } from './react/App';
import { AppUpdatesProvider } from './react/AppUpdatesProvider';
import { ErrorBoundary } from './react/ErrorBoundary';

installErrorReporter();
void initSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

// PURGE DE DÉVELOPPEMENT. Un service worker resté d'une session précédente sert
// du cache périmé pendant qu'on code, et se bat contre le HMR. Le socle fournit
// la désinscription (`unregisterServiceWorkers`), mais la CONDITION reste ici :
// ce paquet est aussi lu par `node --test`, qui n'a pas `import.meta.env`.
if (import.meta.env.DEV) {
  void unregisterServiceWorkers();
}

const rootElement = document.querySelector<HTMLDivElement>('#app');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        {/* En développement, `registerSW` vaut `undefined` : le hook du socle
            sort de son effet, aucun worker n'est enregistré, et le bandeau ne
            peut pas apparaître. C'est le versant « ne pas enregistrer en dev »
            de la purge ci-dessus. */}
        <AppUpdatesProvider
          registerSW={import.meta.env.PROD ? registerSW : undefined}
        >
          <App />
        </AppUpdatesProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
