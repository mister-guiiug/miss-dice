import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { App } from './App';
import { renderWithProviders } from '../test/renderWithProviders';

/**
 * L'ÉCRAN DE LANCER A UN TITRE.
 *
 * Relevé du 23/09/2026 dans un navigateur vierge : l'écran par défaut n'avait
 * AUCUN h1. Ni un lecteur d'écran ni Google - qui indexe la page rendue - ne
 * savaient ce qu'était la page. Il est masqué à l'écran (`sr-only`), la
 * surface de lancer occupant tout ; il n'en compte pas moins.
 */
afterEach(cleanup);

describe('App - écran de lancer', () => {
  it('porte un seul h1, qui dit ce qu’est l’app', () => {
    renderWithProviders(<App />);
    const titres = screen.getAllByRole('heading', { level: 1 });
    expect(titres).toHaveLength(1);
    expect(titres[0]).toHaveTextContent(/Miss Dice - lanceur de dés/);
  });
});
