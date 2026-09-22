import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { DicePicker } from './DicePicker';
import { SettingsDrawer } from './SettingsDrawer';
import { renderWithProviders } from '../../test/renderWithProviders';
import { settingsStore } from '../../settings/settingsStore';

/**
 * LA PASTILLE DE L'ÉCRAN PRINCIPAL.
 *
 * Elle remplace six gestes dans le tiroir par deux. Ces tests tiennent ce qui
 * la rend utile - dire ce qui va être lancé, et le changer sur place - et ce
 * qui la rend accessible : un nom qui contient ce qu'on voit.
 */
afterEach(cleanup);

beforeEach(() => {
  settingsStore.setSides(6);
  settingsStore.setDiceCount(1);
});

const pastille = () => screen.getByRole('button', { name: /changer de dés/i });

describe('DicePicker', () => {
  it('dit ce qui va être lancé', () => {
    renderWithProviders(<DicePicker />);
    expect(pastille().textContent).toContain('1 × D6');
  });

  /*
   * WCAG 2.5.3 : le nom accessible CONTIENT le texte visible. Qui pilote à la
   * voix dit ce qu'il voit - « 1 × D6 » - et doit être compris. Un
   * `aria-label` complet aurait remplacé ce texte au lieu de le prolonger.
   */
  it('porte un nom qui contient son texte visible', () => {
    renderWithProviders(<DicePicker />);
    expect(pastille()).toHaveAccessibleName(/changer de dés\s*:?\s*1 × D6/i);
    expect(pastille().hasAttribute('aria-label')).toBe(false);
  });

  it('ouvre une feuille avec le type de dé et leur nombre', () => {
    renderWithProviders(<DicePicker />);
    fireEvent.click(pastille());

    const feuille = screen.getByRole('dialog', { name: /dés/i });
    expect(
      within(feuille).getByRole('radiogroup', { name: /type de dé/i })
    ).toBeDefined();
    expect(
      within(feuille).getByRole('group', { name: /nombre de dés/i })
    ).toBeDefined();
  });

  it('change le lancer sur place, et la pastille suit', () => {
    renderWithProviders(<DicePicker />);
    fireEvent.click(pastille());
    const feuille = screen.getByRole('dialog', { name: /dés/i });

    fireEvent.click(
      within(feuille).getByRole('radio', { name: /dé à 20 faces/i })
    );
    fireEvent.click(within(feuille).getByRole('button', { name: /ajouter/i }));

    expect(settingsStore.get().sides).toBe(20);
    expect(settingsStore.get().diceCount).toBe(2);
    expect(pastille().textContent).toContain('2 × D20');
  });

  it('borne le nombre : pas de « − » sous un dé', () => {
    renderWithProviders(<DicePicker />);
    fireEvent.click(pastille());
    const feuille = screen.getByRole('dialog', { name: /dés/i });
    expect(
      within(feuille).getByRole('button', { name: /retirer/i })
    ).toBeDisabled();
  });
});

/*
 * UN RÉGLAGE À UN SEUL ENDROIT. Le laisser aussi dans le tiroir aurait gardé
 * la liste aussi longue qu'avant, et offert deux chemins vers la même
 * valeur - dont un que personne n'aurait plus eu de raison de prendre.
 */
describe('le tiroir de réglages', () => {
  it('ne porte plus le type ni le nombre de dés', () => {
    renderWithProviders(<SettingsDrawer />);
    fireEvent.click(screen.getByRole('button', { name: /réglages/i }));
    const tiroir = screen.getByRole('dialog', { name: /réglages/i });
    expect(
      within(tiroir).queryByRole('radiogroup', { name: /type de dé/i })
    ).toBeNull();
    expect(
      within(tiroir).queryByRole('group', { name: /nombre de dés/i })
    ).toBeNull();
  });

  it('regroupe ses réglages sous de vrais titres', () => {
    renderWithProviders(<SettingsDrawer />);
    fireEvent.click(screen.getByRole('button', { name: /réglages/i }));
    const tiroir = screen.getByRole('dialog', { name: /réglages/i });
    const titres = within(tiroir)
      .getAllByRole('heading', { level: 3 })
      .map(titre => titre.textContent);
    expect(titres).toEqual([
      'Affichage',
      'Lancer',
      'Accessibilité',
      'Statistiques',
      // L'historique n'a de titre que s'il y a des lancers à montrer.
      'À propos',
      'Nos autres applications',
    ]);
  });
});
