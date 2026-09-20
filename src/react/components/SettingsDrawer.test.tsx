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

/*
 * L'ORDRE DU BLOC « À PROPOS », que seule une lecture du DOM peut tenir.
 *
 * Ces deux défauts sont invisibles à la relecture du JSX et ne cassent aucun
 * rendu : ils se voient à l'écran, ou s'entendent au lecteur d'écran.
 */
describe('SettingsDrawer — le bloc « À propos »', () => {
  it('annonce « lien copié » entre les liens et le rechargement', async () => {
    openSettings();
    const propos = (await screen.findByText(/^à propos$/i)).parentElement;
    const enfants = [...(propos?.children ?? [])];
    const rang = (classe: string) =>
      enfants.findIndex(e => e.classList.contains(classe));

    // La région `aria-live` vivait APRÈS le bouton de rechargement et son
    // explication : deux blocs séparaient la confirmation du geste qui la
    // déclenche — « Partager l'app ». Un lecteur d'écran l'annonçait donc
    // loin de son bouton, et l'œil ne la voyait pas.
    expect(rang('about__links')).toBeLessThan(rang('about__feedback'));
    expect(rang('about__feedback')).toBeLessThan(rang('about__maintenance'));
  });

  it('range le rechargement HORS de la grille de liens', async () => {
    openSettings();
    const propos = (await screen.findByText(/^à propos$/i)).parentElement;
    const grille = propos?.querySelector('.about__links');
    const bouton = propos?.querySelector('[data-dwc="update-button"]');

    // Les quatre liens mènent AILLEURS ; celui-ci agit sur l'application.
    // Le glisser dans la grille en ferait un cinquième lien, et la grille de
    // deux colonnes laisserait une cellule vide.
    expect(grille?.children).toHaveLength(4);
    expect(bouton).not.toBeNull();
    expect(grille?.contains(bouton as Node)).toBe(false);
    expect(
      propos?.querySelector('.about__maintenance')?.contains(bouton as Node)
    ).toBe(true);
  });

  it('traduit le lien de soutien, au lieu de laisser la marque en anglais', async () => {
    // Le socle traduit `sponsor` dans les six langues ; cette app figeait
    // « Buy me a coffee » dans les six, au milieu d'un tiroir entièrement
    // traduit. Les libellés repris ici sont ceux du socle, pas les miens.
    for (const [locale, attendu] of [
      ['fr', 'M’offrir un café'],
      ['es', 'Invítame a un café'],
      ['de', 'Spendier mir einen Kaffee'],
      ['it', 'Offrimi un caffè'],
      ['pt', 'Pague-me um café'],
      ['en', 'Buy me a coffee'],
    ] as const) {
      renderWithProviders(<SettingsDrawer />, locale);
      fireEvent.click(screen.getAllByRole('button')[0] as HTMLElement);
      expect(await screen.findByRole('link', { name: attendu })).toBeTruthy();
      cleanup();
    }
  });
});
