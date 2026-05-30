import { test, expect } from '@playwright/test';

/** Fumée : l'app charge et un lancer produit un résultat annoncé. */
test('@smoke lancer libre : un tap produit un résultat', async ({ page }) => {
  await page.goto('/');

  // La zone de lancer plein écran est un bouton accessible.
  const zone = page
    .getByRole('button', { name: /lancer|roll|lanzar/i })
    .first();
  await expect(zone).toBeVisible();

  await zone.click();
  // La région live annonce un résultat (« Résultat : N » / « Result: N »).
  await expect(page.getByRole('status')).toContainText(/\d/, { timeout: 5000 });
});

test('@smoke ouverture du menu des jeux', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /jeux|games|juegos/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/yahtzee/i)).toBeVisible();
});
