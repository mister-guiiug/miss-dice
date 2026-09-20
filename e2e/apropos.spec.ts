/*
 * LE TIROIR DE RÉGLAGES, VU PAR UN VRAI NAVIGATEUR.
 *
 * CES DEUX DÉFAUTS SONT HORS DE PORTÉE DES TESTS JSDOM, et ce n'est pas une
 * question d'effort : `vitest` ne charge pas `styles.css` — un `?raw` sur une
 * feuille y rend la CHAÎNE VIDE, donc un contrôle écrit là-bas passerait à
 * vide en donnant l'illusion d'une garde. Il faut la mise en page réelle.
 */
import { test, expect } from '@playwright/test';

async function ouvrirLesReglages(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page
    .getByRole('button', { name: /réglages|settings|ajustes/i })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test('@ui la maturité ne colore que la pastille, jamais la carte', async ({
  page,
}) => {
  await ouvrirLesReglages(page);

  /*
   * LE DÉFAUT FIGÉ ICI. `data-maturity` est porté par DEUX éléments : la
   * pastille « ALPHA / STABLE », et le `<li>` de la carte entière — le socle
   * l'y pose comme prise de filtrage. Les règles de couleur ciblaient
   * `[data-maturity='alpha']` tout court : elles peignaient donc aussi le
   * `<li>`, en rectangle teinté PLEINE LARGEUR ET À ANGLES DROITS, derrière
   * une carte aux coins arrondis. Un double contour bien visible.
   */
  const carte = page.locator('[data-dwc="family-app-item"]').first();
  await expect(carte).toBeAttached();
  const fond = await carte.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(fond).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

  // Et la pastille, elle, garde bien sa couleur et sa forme de gélule.
  const pastille = page.locator('[data-dwc="maturity"]').first();
  const style = await pastille.evaluate(el => ({
    fond: getComputedStyle(el).backgroundColor,
    rayon: getComputedStyle(el).borderRadius,
  }));
  expect(style.fond).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(style.rayon).toBe('999px');
});

test('@ui les quatre liens « À propos » tiennent sur deux rangées égales', async ({
  page,
}) => {
  await ouvrirLesReglages(page);

  /*
   * En `flex`, chaque lien prenait la largeur de SON TEXTE : trois sur la
   * première ligne, « Signaler un problème » seul sur la seconde et étiré sur
   * toute la largeur. Le découpage suivait la longueur des mots — il changeait
   * donc d'une langue à l'autre. Deux colonnes fixes, quatre cellules égales.
   */
  const liens = page.locator('.about__links .link-btn');
  await expect(liens).toHaveCount(4);

  const boites = await liens.evaluateAll(els =>
    els.map(el => {
      const r = el.getBoundingClientRect();
      return { largeur: Math.round(r.width), haut: Math.round(r.top) };
    })
  );
  const largeurs = new Set(boites.map(b => b.largeur));
  const rangees = new Set(boites.map(b => b.haut));
  expect(largeurs.size).toBe(1);
  expect(rangees.size).toBe(2);

  // Et le rechargement reste HORS de cette grille : il agit sur l'application,
  // là où les quatre autres mènent ailleurs.
  await expect(
    page.locator('.about__links [data-dwc="update-button"]')
  ).toHaveCount(0);
  await expect(
    page.locator('.about__maintenance [data-dwc="update-button"]')
  ).toHaveCount(1);
});
