import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// vite-plugin-pwa injecte `virtual:pwa-register` au build ; le runner
// vitest ne passe pas par le plugin, donc on stubbe l'import pour que
// register-sw.ts soit importable sans crash.
vi.mock('virtual:pwa-register', () => ({
  registerSW: () => () => Promise.resolve(),
}));

// jsdom n'implémente pas matchMedia : on fournit un stub neutre
// (aucune préférence active) pour les hooks qui l'interrogent.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
