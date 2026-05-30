import './styles/tokens.css';
import './styles/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './react/App';
import { registerServiceWorker } from './register-sw';

registerServiceWorker();

const rootElement = document.querySelector<HTMLDivElement>('#app');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
