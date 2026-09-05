import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { GameShell } from './GameShell';
import { DiceScreen } from '../DiceScreen';
import { renderWithProviders } from '../../../test/renderWithProviders';

/**
 * Usage du verrou d'écran, pas sa mécanique : la ré-acquisition au retour au
 * premier plan, le silence quand l'API manque et la course « demande
 * aboutie après le démontage » sont testées chez le socle
 * (`@mister-guiiug/dev-pwa-config/react/use-wake-lock`). Ce qui est propre à
 * miss-dice, c'est *où* le verrou est demandé : dans le cadre de jeu
 * (pass-and-play, l'écran doit rester allumé entre deux tours) et nulle part
 * ailleurs — surtout pas sur le lancer libre.
 */

const release = vi.fn(() => Promise.resolve());
const request = vi.fn(() => Promise.resolve({ released: false, release }));

beforeEach(() => {
  release.mockClear();
  request.mockClear();
  Object.defineProperty(navigator, 'wakeLock', {
    value: { request },
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, 'wakeLock');
});

describe('<GameShell /> et le verrou d’écran', () => {
  it('demande le verrou tant qu’une partie est affichée', async () => {
    renderWithProviders(
      <GameShell title="Yam">
        <p>plateau</p>
      </GameShell>
    );
    await vi.waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
  });

  it('relâche le verrou en quittant la partie', async () => {
    const { unmount } = renderWithProviders(
      <GameShell title="Yam">
        <p>plateau</p>
      </GameShell>
    );
    await vi.waitFor(() => expect(request).toHaveBeenCalled());
    unmount();
    await vi.waitFor(() => expect(release).toHaveBeenCalled());
  });

  it('ne demande rien sur le lancer libre', () => {
    renderWithProviders(<DiceScreen />);
    expect(request).not.toHaveBeenCalled();
  });
});
