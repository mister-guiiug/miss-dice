import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useAppTheme } from './hooks/useTheme';
import {
  LEGACY_SETTINGS_KEY,
  THEME_STORAGE_KEY,
  migrateLegacySettings,
} from '../settings/legacyMigration';
import { LOCALES } from '../i18n/messages';

/**
 * Deux consommateurs, comme dans l'app : `App` applique le thème,
 * `SettingsDrawer` en change. Le piège que ce montage referme est que
 * `useTheme` du socle porte son état dans un `useState` LOCAL — deux appels
 * directs donneraient deux états indépendants écrivant tous deux `data-theme`.
 */
function Lecteur({ nom }: { nom: string }) {
  const { theme, resolved } = useAppTheme();
  return <output data-testid={nom}>{`${theme}/${resolved}`}</output>;
}

function Bouton() {
  const { setTheme } = useAppTheme();
  return (
    <button type="button" onClick={() => setTheme('dark')}>
      sombre
    </button>
  );
}

function monter() {
  return render(
    <ThemeProvider>
      <Lecteur nom="a" />
      <Lecteur nom="b" />
      <Bouton />
    </ThemeProvider>
  );
}

describe('<ThemeProvider />', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('applique le thème stocké sur <html>', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    monter();
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(screen.getByTestId('a')).toHaveTextContent('dark/dark');
  });

  it('part sur « system » quand rien n’est stocké', () => {
    monter();
    // `matchMedia` du setup partagé rend toujours `matches: false` → clair.
    expect(screen.getByTestId('a')).toHaveTextContent('system/light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  /**
   * LE test du lot thème. Les deux lecteurs voient la MÊME valeur après un
   * changement : il n'y a qu'un seul état, donc un seul écrivain de
   * `data-theme` côté React.
   */
  it('partage un état unique entre tous ses consommateurs', () => {
    monter();
    expect(screen.getByTestId('a')).toHaveTextContent('system/light');

    fireEvent.click(screen.getByRole('button', { name: 'sombre' }));

    expect(screen.getByTestId('a')).toHaveTextContent('dark/dark');
    expect(screen.getByTestId('b')).toHaveTextContent('dark/dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('persiste le choix sous la clé de l’app', () => {
    monter();
    fireEvent.click(screen.getByRole('button', { name: 'sombre' }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  /**
   * De bout en bout : un utilisateur qui avait choisi « clair » AVANT la
   * migration doit rouvrir l'app en clair, et non sur le thème système.
   */
  it('honore un thème hérité de l’ancien blob de réglages', () => {
    localStorage.setItem(
      LEGACY_SETTINGS_KEY,
      JSON.stringify({ haptics: true, theme: 'light' })
    );
    migrateLegacySettings(LOCALES);

    monter();

    expect(screen.getByTestId('a')).toHaveTextContent('light/light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('teinte la barre système à la couleur du thème affiché', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    monter();
    const meta = document.head.querySelector('meta[data-dwc="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#0f1220');
  });

  it('refuse d’être utilisé hors de son fournisseur', () => {
    expect(() => render(<Lecteur nom="seul" />)).toThrow(/ThemeProvider/);
  });
});
