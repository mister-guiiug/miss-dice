// Suite a11y (axe-core + Playwright) — helper partagé dev-pwa-config.
// Le tag @a11y permet de filtrer : `playwright test --grep @a11y`.
// Contrairement au test jsdom, le navigateur réel dispose de la mise en
// page, donc le contraste des couleurs est réellement évalué. Les tags par
// défaut du helper ciblent WCAG 2.0/2.1 niveaux A + AA.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNoA11yViolations } from '@mister-guiiug/dev-pwa-config/playwright-a11y';

test.describe('@a11y accessibilité', () => {
  test('lancer libre : aucune violation axe', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoA11yViolations(page, AxeBuilder, expect);
  });

  test('réglages : aucune violation axe', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /réglages|settings|ajustes/i })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoA11yViolations(page, AxeBuilder, expect);
  });

  // Le `ConfirmDialog` du socle arrive NON STYLÉ : tout son habillage est
  // local (miss-dice n'importe pas `components.css`). Le contraste du bouton
  // destructeur est donc un choix de cette app, et c'est ici qu'il se
  // vérifie — dans un vrai navigateur, seul endroit où axe voit des couleurs.
  //
  // PORTÉE RESTREINTE À LA BOÎTE, et c'est mesuré : l'écran de jeu porte une
  // violation `scrollable-region-focusable` sur `.game-shell__body`, ANTÉRIEURE
  // à cette boîte — avant le premier lancer, toutes les cases de la grille sont
  // `disabled`, donc la zone défilante ne contient rien de focalisable.
  // Vérifié le 21/09/2026 en sondant l'écran SANS ouvrir la boîte : la même
  // violation tombe. L'élargissement de cette garde à tout l'écran attend ce
  // correctif-là, qui est un autre sujet.
  test('confirmation de nouvelle partie : aucune violation axe', async ({
    page,
  }) => {
    await page.goto('/?play=yahtzee');
    await page
      .getByRole('button', { name: /commencer|^start$|empezar/i })
      .click();
    await page
      .getByRole('button', { name: /nouvelle partie|new game|nueva partida/i })
      .first()
      .click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expectNoA11yViolations(page, AxeBuilder, expect, {
      include: '[data-dwc="confirm"]',
    });
  });
});
