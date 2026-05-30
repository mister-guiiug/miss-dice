import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ModeMenu } from './components/ModeMenu';

/**
 * Garde-fou accessibilité : on passe les écrans clés au crible d'axe-core
 * (mêmes règles que l'audit Lighthouse). La règle `color-contrast` est
 * désactivée : jsdom ne calcule pas la mise en page, donc le contraste
 * réel est vérifié côté Lighthouse/Playwright, pas ici.
 */
async function expectNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = results.violations.map(v => `${v.id}: ${v.help}`);
  expect(summary, summary.join('\n')).toEqual([]);
}

afterEach(cleanup);

describe('accessibilité (axe-core)', () => {
  it('le lancer libre n’a aucune violation', async () => {
    const { container } = render(<DiceScreen />);
    await expectNoViolations(container);
  });

  it('le tiroir de réglages ouvert n’a aucune violation', async () => {
    render(<SettingsDrawer />);
    fireEvent.click(screen.getByRole('button', { name: /réglages|settings/i }));
    const dialog = await screen.findByRole('dialog');
    await expectNoViolations(dialog);
  });

  it('le menu des jeux ouvert n’a aucune violation', async () => {
    render(<ModeMenu />);
    fireEvent.click(screen.getByRole('button', { name: /jeux|games/i }));
    const dialog = await screen.findByRole('dialog');
    await expectNoViolations(dialog);
  });
});
