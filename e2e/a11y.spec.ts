// Suite a11y (axe-core + Playwright) - helper partagé dev-pwa-config.
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
  // vérifie - dans un vrai navigateur, seul endroit où axe voit des couleurs.
  //
  // La portée était restreinte à la boîte tant que `.game-shell__body` portait
  // une violation `scrollable-region-focusable` : avant le premier lancer,
  // toutes les cases de la grille sont `disabled`, donc la zone défilante ne
  // contenait rien de focalisable. Corrigé depuis (`tabIndex` sur le corps),
  // la garde couvre donc tout l'écran.
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
    await expectNoA11yViolations(page, AxeBuilder, expect);
  });

  // LE PETIT ÉCRAN EST DÉLIBÉRÉ. `.game-shell__body` ne déborde que s'il est
  // plus court que son contenu : sur les grands viewports de la matrice, la
  // zone ne défile pas et la règle `scrollable-region-focusable` ne s'applique
  // même pas. Mesuré le 21/09/2026 : la violation tombait sur chromium,
  // firefox, webkit et mobile-safari, mais PAS sur mobile-chrome, plus haut.
  // 320 × 568 fait déborder partout, donc la garde vaut sur les cinq.
  test('écran de jeu AVANT le premier lancer : aucune violation axe', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/?play=yahtzee');
    await page
      .getByRole('button', { name: /commencer|^start$|empezar/i })
      .click();
    // L'instant qui compte : toutes les cases sont encore `disabled`, la zone
    // défilante n'a donc aucun enfant focalisable à offrir.
    await expect(
      page.getByRole('button', { name: /^(lancer|roll|lanzar)$/i }).first()
    ).toBeVisible();
    await expectNoA11yViolations(page, AxeBuilder, expect);
  });

  test('écran de jeu APRÈS un lancer : aucune violation axe', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/?play=yahtzee');
    await page
      .getByRole('button', { name: /commencer|^start$|empezar/i })
      .click();
    await page
      .getByRole('button', { name: /^(lancer|roll|lanzar)$/i })
      .first()
      .click();
    // La grille s'allume : c'est l'écran tel qu'on le joue, avec ses dés
    // colorés, ses cases sélectionnables et son statut de tour.
    await expect(page.locator('.scorecard__row--pick').first()).toBeVisible({
      timeout: 10000,
    });
    await expectNoA11yViolations(page, AxeBuilder, expect);
  });
});
