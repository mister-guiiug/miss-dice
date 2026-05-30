import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Audit accessibilité en navigateur réel (axe-core). Contrairement au test
 * jsdom, celui-ci dispose de la mise en page, donc le contraste des
 * couleurs est réellement évalué. On cible les standards WCAG 2 A/AA.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test('@a11y lancer libre : aucune violation axe', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(results.violations).toEqual([]);
});

test('@a11y réglages : aucune violation axe', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: /réglages|settings|ajustes/i })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(results.violations).toEqual([]);
});
