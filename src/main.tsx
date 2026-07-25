import './styles/tokens.css';
import './styles/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  installErrorReporter,
  initSentry,
} from '@mister-guiiug/dev-wpa-config/react/observability';
import { App } from './react/App';
import { ErrorBoundary } from './react/ErrorBoundary';
import { registerServiceWorker } from './register-sw';

installErrorReporter();
void initSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
registerServiceWorker();

const rootElement = document.querySelector<HTMLDivElement>('#app');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
