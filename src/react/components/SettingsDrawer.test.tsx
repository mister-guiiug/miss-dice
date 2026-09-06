import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { SettingsDrawer } from './SettingsDrawer';
import { renderWithProviders } from '../../test/renderWithProviders';

/**
 * LE CANAL DE RETOUR. Au relevé du 06/09/2026, zéro issue était ouverte sur
 * les vingt-deux dépôts du compte. Ce n'était pas du silence : miss-dice
 * n'offrait aucun endroit où dire ce qui ne va pas.
 *
 * Ce test tient le lien ET sa charge utile. Une URL vers `issues/new` sans le
 * gabarit ouvre un formulaire vide, où la première réponse serait à nouveau
 * « quelle version ? » ; sans le champ `environnement`, l'écran et le
 * navigateur repartent dans l'oubli. C'est le préremplissage qui fait la
 * différence entre un lien et un canal.
 */
afterEach(cleanup);

function openSettings() {
  renderWithProviders(<SettingsDrawer />);
  fireEvent.click(screen.getByRole('button', { name: /réglages/i }));
}

describe('SettingsDrawer — signaler un problème', () => {
  it('ouvre le gabarit d’anomalie du dépôt miss-dice', async () => {
    openSettings();
    const link = await screen.findByRole('link', {
      name: /signaler un problème/i,
    });
    const url = new URL(link.getAttribute('href') ?? '');
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://github.com/mister-guiiug/miss-dice/issues/new'
    );
    expect(url.searchParams.get('template')).toBe('bug.yml');
  });

  it('décrit l’écran, que l’utilisateur ne pense jamais à donner', async () => {
    openSettings();
    const link = await screen.findByRole('link', {
      name: /signaler un problème/i,
    });
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.searchParams.get('environnement')).toContain(
      globalThis.location.pathname
    );
  });
});
