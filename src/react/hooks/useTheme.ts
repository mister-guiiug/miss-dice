import { useThemeContext } from '@mister-guiiug/dev-pwa-config/react/theme-provider';
import type { ThemePreference } from '@mister-guiiug/dev-pwa-config/react/use-theme';

export interface AppTheme {
  /** Le choix de l'utilisateur : `light`, `dark` ou `system`. */
  theme: ThemePreference;
  /** Le thème réellement affiché, `system` résolu. */
  resolved: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}

/**
 * L'état du thème, PARTAGÉ, tel que le tient `ThemeProvider`.
 *
 * Ce fichier tenait la mécanique complète : abonnement à `matchMedia` via
 * `useSyncExternalStore`, résolution `auto → dark|light`, pose de `data-theme`
 * et de `<meta name="theme-color">`. Tout est passé au socle. Il ne reste que
 * la lecture du contexte — et la garde ci-dessous.
 *
 * ON N'APPELLE PAS `useTheme()` DIRECTEMENT, et c'est le point. Le hook du
 * socle porte son état dans un `useState` local : deux appels, c'est deux
 * états indépendants qui écrivent tous deux `data-theme` sur `<html>`. Or il
 * faut ici deux points d'accès — l'un pour afficher, l'autre pour changer.
 * Passer par le contexte garantit un seul écrivain.
 */
export function useAppTheme(): AppTheme {
  const ctx = useThemeContext();
  if (!ctx) {
    throw new Error('useAppTheme doit être utilisé dans son ThemeProvider');
  }
  return ctx as AppTheme;
}
