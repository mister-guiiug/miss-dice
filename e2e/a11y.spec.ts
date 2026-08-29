// Suite a11y (axe-core + Playwright) — helper partagé dev-wpa-config.
// Le tag @a11y permet de filtrer : `playwright test --grep @a11y`.
// Contrairement au test jsdom, le navigateur réel dispose de la mise en
// page, donc le contraste des couleurs est réellement évalué. Les tags par
// défaut du helper ciblent WCAG 2.0/2.1 niveaux A + AA.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNoA11yViolations } from '@mister-guiiug/dev-wpa-config/playwright-a11y';

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
});
