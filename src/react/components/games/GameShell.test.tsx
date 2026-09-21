import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { GameShell } from './GameShell';
import { DiceScreen } from '../DiceScreen';
import { messages } from '../../../i18n/messages';
import { renderWithProviders } from '../../../test/renderWithProviders';

/**
 * Usage du verrou d'écran, pas sa mécanique : la ré-acquisition au retour au
 * premier plan, le silence quand l'API manque et la course « demande
 * aboutie après le démontage » sont testées chez le socle
 * (`@mister-guiiug/dev-pwa-config/react/use-wake-lock`). Ce qui est propre à
 * miss-dice, c'est *où* le verrou est demandé : dans le cadre de jeu
 * (pass-and-play, l'écran doit rester allumé entre deux tours) et nulle part
 * ailleurs - surtout pas sur le lancer libre.
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

/**
 * `onNewGame` appelle `quit()`, donc `clearGame()` : ce bouton EFFACE la
 * sauvegarde. Il était déclenché au premier tap, sans rien demander - et
 * son glyphe (`↺`) était le plus anodin des trois. Ce qui est vérifié ici,
 * c'est la GARDE : qu'aucun chemin ne mène à `onNewGame` sans un second
 * geste, et qu'elle disparaisse là où il n'y a plus rien à perdre.
 */
describe('<GameShell /> et la confirmation de nouvelle partie', () => {
  const fr = messages.fr;
  const cliquerSurNouvellePartie = () =>
    fireEvent.click(screen.getByRole('button', { name: fr.common.newGame }));

  it('ne lance rien au premier tap : elle demande d’abord', () => {
    const onNewGame = vi.fn();
    renderWithProviders(
      <GameShell title="Yam" onNewGame={onNewGame}>
        <p>plateau</p>
      </GameShell>
    );

    cliquerSurNouvellePartie();

    expect(onNewGame).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alertdialog', { name: fr.game.newGameConfirmTitle })
    ).toBeInTheDocument();
  });

  it('lance la partie une fois confirmée', () => {
    const onNewGame = vi.fn();
    renderWithProviders(
      <GameShell title="Yam" onNewGame={onNewGame}>
        <p>plateau</p>
      </GameShell>
    );

    cliquerSurNouvellePartie();
    // Le dialogue reprend le même libellé : on vise celui QUI EST DEDANS.
    const boite = screen.getByRole('alertdialog');
    fireEvent.click(
      within(boite).getByRole('button', { name: fr.common.newGame })
    );

    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('ne lance rien si on annule, et referme', () => {
    const onNewGame = vi.fn();
    renderWithProviders(
      <GameShell title="Yam" onNewGame={onNewGame}>
        <p>plateau</p>
      </GameShell>
    );

    cliquerSurNouvellePartie();
    fireEvent.click(screen.getByRole('button', { name: fr.common.cancel }));

    expect(onNewGame).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('ne demande rien quand la partie est finie (confirmNewGame={false})', () => {
    const onNewGame = vi.fn();
    renderWithProviders(
      <GameShell title="Yam" onNewGame={onNewGame} confirmNewGame={false}>
        <p>résultats</p>
      </GameShell>
    );

    cliquerSurNouvellePartie();

    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
