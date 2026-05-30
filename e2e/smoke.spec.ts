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

test('@smoke Cochon : démarrer une partie et lancer le dé', async ({
  page,
}) => {
  await page.goto('/?play=pig');
  await page
    .getByRole('button', { name: /commencer|^start$|empezar/i })
    .click();
  const rollBtn = page
    .getByRole('button', { name: /^(lancer|roll|lanzar)$/i })
    .first();
  await expect(rollBtn).toBeVisible();
  await rollBtn.click();
  // Le cumul du tour s'affiche après un lancer réussi (animation réduite
  // en e2e : le résultat est immédiat, mais on laisse de la marge au cold
  // start du serveur de dev partagé entre workers).
  await expect(
    page.getByText(/cumul du tour|turn total|acumulado del turno/i)
  ).toBeVisible({ timeout: 10000 });
});
