import { useEffect, useSyncExternalStore } from 'react';
import { useSettings } from '../../settings/settingsStore';

const THEME_COLOR = { dark: '#0f1220', light: '#f4f5fb' } as const;
const QUERY = '(prefers-color-scheme: dark)';

function subscribe(callback: () => void): () => void {
  const mql = globalThis.matchMedia?.(QUERY);
  if (!mql) return () => {};
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/** Thème système courant (`dark` ou `light`). */
export function useSystemTheme(): 'dark' | 'light' {
  return useSyncExternalStore(
    subscribe,
    () => (globalThis.matchMedia?.(QUERY).matches ? 'dark' : 'light'),
    () => 'dark'
  );
}

/**
 * Applique le thème effectif (réglage manuel ou système) sur `data-theme`
 * et synchronise la couleur de la barre système (meta theme-color).
 * Renvoie le thème effectif.
 */
export function useApplyTheme(): 'dark' | 'light' {
  const { theme } = useSettings();
  const system = useSystemTheme();
  const effective = theme === 'auto' ? system : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = effective;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[effective]);
  }, [effective]);

  return effective;
}
