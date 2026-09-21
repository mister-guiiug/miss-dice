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

// Régression du 21/09/2026 : le statut du tour portait un `min-height`
// chiffré, qui remplace le `min-height: auto` - la SEULE protection d'un
// élément flex contre la compression sous son contenu. Le corps du jeu
// débordant, flex écrasait ce paragraphe à une ligne et la seconde
// (« ou inscris une case pour t'arrêter ») se dessinait sous la grille de
// score. Invisible en jsdom, qui n'a pas de moteur de mise en page : cette
// garde n'a de sens QUE dans un vrai navigateur.
test('@smoke Yahtzee : le statut du tour n’est rogné par rien', async ({
  page,
}) => {
  // Le plus petit téléphone courant : c'est le seul endroit où la grille
  // déborde encore du corps, donc le seul où flex a de quoi comprimer. Sur
  // un écran confortable cette garde ne prouverait rien.
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/?play=yahtzee');
  await page
    .getByRole('button', { name: /commencer|^start$|empezar/i })
    .click();
  await page
    .getByRole('button', { name: /^(lancer|roll|lanzar)$/i })
    .first()
    .click();

  // Deux lancers restent : le statut porte bien sa seconde ligne. On vise
  // l'élément, pas son texte - la garde vaut dans les six langues.
  const statut = page.locator('.game-status');
  await expect(statut.locator('.game-status__sub')).toBeVisible({
    timeout: 10000,
  });

  // `toBeVisible` ne suffirait pas : rogné, ce texte se dessinait quand
  // même, par-dessous le bloc suivant. Ce qu'on exige, c'est que la BOÎTE
  // contienne son contenu.
  const rogne = await statut.evaluate(
    el => el.scrollHeight > el.clientHeight + 1
  );
  expect(rogne).toBe(false);
});
