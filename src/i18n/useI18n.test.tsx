import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider, useI18n } from './useI18n';
import { messages } from './messages';
import {
  LEGACY_SETTINGS_KEY,
  LOCALE_STORAGE_KEY,
  migrateLegacySettings,
} from '../settings/legacyMigration';
import { LOCALES } from './messages';

function Sonde() {
  const { locale, t, setLocale, fmt } = useI18n();
  return (
    <>
      <output data-testid="locale">{locale}</output>
      <output data-testid="titre">{t('settings.title')}</output>
      {/* Une clé interpolée : `MessageParams` impose le `{n}` à la compilation. */}
      <output data-testid="total">
        {t('settings.statsTotal', { n: 1234 })}
      </output>
      <output data-testid="nombre">{fmt.number(1234.5)}</output>
      <button type="button" onClick={() => setLocale('de')}>
        de
      </button>
    </>
  );
}

const monter = () =>
  render(
    <I18nProvider>
      <Sonde />
    </I18nProvider>
  );

describe('useI18n', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('ouvre sur la langue stockée sous la clé de l’app', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es');
    monter();
    expect(screen.getByTestId('locale')).toHaveTextContent('es');
    expect(screen.getByTestId('titre')).toHaveTextContent(
      messages.es.settings.title
    );
  });

  /**
   * LA CLÉ REPRISE. Sans `storageKey`, `createI18n` écrirait sous `dwc_locale`
   * — partagée par toutes les PWA de la famille sur l'origine GitHub Pages :
   * miss-dice hériterait de la langue d'une app voisine, et lui imposerait la
   * sienne en retour.
   */
  it('persiste sous « miss-dice_locale », et pas sous « dwc_locale »', () => {
    monter();
    fireEvent.click(screen.getByRole('button', { name: 'de' }));

    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de');
    expect(localStorage.getItem('dwc_locale')).toBeNull();
    expect(screen.getByTestId('titre')).toHaveTextContent(
      messages.de.settings.title
    );
  });

  /** De bout en bout : la langue choisie avant la migration est conservée. */
  it('honore une langue héritée de l’ancien blob de réglages', () => {
    localStorage.setItem(
      LEGACY_SETTINGS_KEY,
      JSON.stringify({ haptics: true, locale: 'it' })
    );
    migrateLegacySettings(LOCALES);

    monter();

    expect(screen.getByTestId('locale')).toHaveTextContent('it');
  });

  it('aligne lang et dir sur <html>', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'pt');
    monter();
    expect(document.documentElement.lang).toBe('pt');
    expect(document.documentElement.dir).toBe('ltr');
  });

  /**
   * `fmt` est le gain net de l'adoption : l'app n'avait AUCUN pont entre la
   * langue choisie et l'écriture des nombres. En allemand, le séparateur
   * décimal est la virgule et le séparateur de milliers le point.
   */
  it('formate les nombres dans la langue courante', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    monter();
    expect(screen.getByTestId('nombre')).toHaveTextContent('1,234.5');

    fireEvent.click(screen.getByRole('button', { name: 'de' }));
    expect(screen.getByTestId('nombre')).toHaveTextContent('1.234,5');
  });

  it('interpole les paramètres des clés typées', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr');
    monter();
    expect(screen.getByTestId('total')).toHaveTextContent('1234');
    expect(screen.getByTestId('total')).not.toHaveTextContent('{n}');
  });

  it('refuse d’être utilisé hors de son fournisseur', () => {
    expect(() => render(<Sonde />)).toThrow(/I18nProvider/);
  });
});
