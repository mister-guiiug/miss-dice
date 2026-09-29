import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  isAnalyticsLoaded,
  resetAnalytics,
} from '@mister-guiiug/dev-pwa-config/analytics';
import {
  ConsentBanner,
  readConsentChoice,
  writeConsentChoice,
} from '@mister-guiiug/dev-pwa-config/react/consent-banner';
import { CLE_DE_TEST } from '@mister-guiiug/dev-pwa-config/testing/posthog';
import { SettingsDrawer } from './SettingsDrawer';
import { renderWithProviders } from '../../test/renderWithProviders';

/**
 * RETIRER SON CONSENTEMENT DOIT ÊTRE AUSSI SIMPLE QUE LE DONNER (RGPD, art.
 * 7.3). Au relevé du 29/09/2026, une fois le bandeau répondu, plus rien dans
 * l'app ne permettait de revenir sur son choix. Ces tests tiennent le chemin
 * du retour, du tiroir de réglages jusqu'à la bibliothèque de mesure.
 */

// L'accord rejoué au montage charge la bibliothèque : la vraie partirait
// interroger PostHog depuis jsdom. Le double du socle se souvient du retrait.
vi.mock('posthog-js/dist/module.slim.js', async () => {
  const { fauxPosthog } =
    await import('@mister-guiiug/dev-pwa-config/testing/posthog');
  return { default: fauxPosthog() };
});

beforeEach(() => {
  // Le setup partagé ne vide pas le stockage : un choix laissé par un test
  // serait relu par le suivant.
  localStorage.clear();
  vi.stubEnv('VITE_POSTHOG_KEY', CLE_DE_TEST);
  // L'état de la mesure est celui d'un module : sans remise à zéro, la
  // bibliothèque resterait « chargée » d'un test à l'autre.
  resetAnalytics();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

/** Ouvre le tiroir comme l'utilisateur : par le bouton d'engrenage. */
function ouvrirReglages(locale: 'fr' | 'en' = 'fr') {
  renderWithProviders(<SettingsDrawer />, locale);
  fireEvent.click(
    screen.getByRole('button', {
      name: locale === 'fr' ? 'Réglages' : 'Settings',
    })
  );
}

describe('SettingsDrawer - mesure d’audience', () => {
  it('les réglages permettent de retirer son consentement, en un clic', async () => {
    writeConsentChoice('granted');
    ouvrirReglages();

    const titre = await screen.findByRole('heading', {
      name: 'Mesure d’audience',
    });
    const section = titre.closest('section') as HTMLElement;
    expect(within(section).getByRole('status')).toHaveTextContent(
      'Vous avez accepté cette mesure.'
    );
    // L'accord rejoué au montage a chargé la bibliothèque - le double.
    await waitFor(() => expect(isAnalyticsLoaded()).toBe(true));
    const posthog = (await import('posthog-js/dist/module.slim.js')).default;
    expect(posthog.has_opted_out_capturing()).toBe(false);

    fireEvent.click(
      within(section).getByRole('button', {
        name: 'Retirer mon consentement',
      })
    );

    expect(readConsentChoice()).toBe('denied');
    // Le clic est PARVENU à la bibliothèque, pas seulement au libellé.
    expect(posthog.has_opted_out_capturing()).toBe(true);
    expect(within(section).getByRole('status')).toHaveTextContent(
      'Vous avez refusé cette mesure.'
    );
    // Retiré sur place : le tiroir reste ouvert, la question n'est pas
    // reposée.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('parle la langue du tiroir', async () => {
    writeConsentChoice('granted');
    ouvrirReglages('en');

    const titre = await screen.findByRole('heading', {
      name: 'Audience measurement',
    });
    const section = titre.closest('section') as HTMLElement;
    expect(within(section).getByRole('status')).toHaveTextContent(
      'You have accepted this measurement.'
    );
    expect(
      within(section).getByRole('button', { name: 'Withdraw my consent' })
    ).toBeInTheDocument();
  });

  it('« Modifier mon choix » ferme le tiroir et rend la question au bandeau', async () => {
    writeConsentChoice('denied');
    // Le bandeau vit SOUS le tiroir, sur l'écran de lancer : les deux sont
    // montés ensemble, comme dans `App`.
    renderWithProviders(
      <>
        <SettingsDrawer />
        <ConsentBanner
          posthogKey={import.meta.env.VITE_POSTHOG_KEY}
          loader={() => import('posthog-js/dist/module.slim.js')}
        />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Réglages' }));
    const titre = await within(screen.getByRole('dialog')).findByRole(
      'heading',
      { name: 'Mesure d’audience' }
    );
    const section = titre.closest('section') as HTMLElement;
    expect(within(section).getByRole('status')).toHaveTextContent(
      'Vous avez refusé cette mesure.'
    );

    fireEvent.click(
      within(section).getByRole('button', { name: 'Modifier mon choix' })
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(readConsentChoice()).toBeNull();
    // Le bandeau revient, et c'est lui qui a le focus - pas le bouton
    // d'engrenage, auquel le tiroir rend le sien en se fermant.
    const bandeau = await screen.findByRole('region', {
      name: 'Mesure d’audience',
    });
    await waitFor(() => expect(bandeau).toHaveFocus());
  });
});
