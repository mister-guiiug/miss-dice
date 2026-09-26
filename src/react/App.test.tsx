import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { App } from './App';
import { renderWithProviders } from '../test/renderWithProviders';

/**
 * L'ÉCRAN DE LANCER A UN TITRE.
 *
 * Relevé du 23/09/2026 : l'écran par défaut n'avait AUCUN h1. Relevé du
 * 26/09/2026 : un h1 en `sr-only` (clip) était ignoré par Bing SEO/GEO —
 * d'où la marque visible `.app__brand`.
 */
afterEach(cleanup);

describe('App - écran de lancer', () => {
  it('porte un seul h1, qui dit ce qu’est l’app', () => {
    renderWithProviders(<App />);
    const titres = screen.getAllByRole('heading', { level: 1 });
    expect(titres).toHaveLength(1);
    expect(titres[0]).toHaveTextContent(/Miss Dice - lanceur de dés/);
    expect(titres[0]).toHaveClass('app__brand');
  });
});
