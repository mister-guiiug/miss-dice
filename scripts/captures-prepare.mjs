/**
 * Met l'écran dans l'état qu'on photographie, AVANT chaque capture du
 * manifeste - `npm run captures`, qui appelle `pwa-screenshots` du socle.
 *
 * POURQUOI CE FICHIER. Les captures montraient l'app au repos : un seul D6
 * posé sur 1, la phrase d'aide et un tiers d'écran vide. C'est pourtant elles
 * que Chrome affiche dans sa fiche d'installation - la première image qu'un
 * visiteur voit de l'app. Elles montrent désormais ce qu'on y fait : trois dés
 * lancés et leur total sur téléphone, une partie de Yahtzee sur ordinateur.
 *
 * TOUT PASSE PAR L'INTERFACE, comme le demande l'outil : la pastille, le
 * bouton « Ajouter un dé », la zone de lancer. Une capture fabriquée en
 * écrivant l'état à la main pourrait montrer un écran que l'app ne sait pas
 * produire.
 *
 * LES FACES SONT CHOISIES, ET C'EST CE QUI REND LA CAPTURE REPRODUCTIBLE.
 * Chaque dé tire UNE valeur de `crypto.getRandomValues` (`src/dice/random.ts`),
 * et l'outil impose le mouvement réduit, donc aucun défilement ne consomme de
 * tirage. En servant ces valeurs-là à l'instant du lancer, deux passages
 * rendent le même fichier - sans quoi chaque exécution produirait un diff Git
 * illisible, ce que l'outil s'efforce justement d'éviter.
 */

/**
 * Remplace le générateur de la page par une file de faces, pour les `faces`
 * prochains tirages seulement ; au-delà, le vrai générateur reprend.
 *
 * `(face - 0,5) / côtés` vise le MILIEU de la tranche de la face : un arrondi
 * dans un sens ou dans l'autre ne la fait pas changer.
 */
async function servirFaces(page, faces, cotes) {
  await page.evaluate(
    ([file, n]) => {
      const origine = crypto.getRandomValues.bind(crypto);
      const valeurs = file.map(f => Math.floor(((f - 0.5) / n) * 2 ** 32));
      crypto.getRandomValues = tableau => {
        if (
          valeurs.length &&
          tableau instanceof Uint32Array &&
          tableau.length === 1
        ) {
          tableau[0] = valeurs.shift();
          return tableau;
        }
        return origine(tableau);
      };
    },
    [faces, cotes]
  );
}

export default async function preparer(page, { name }) {
  // L'INVITE D'INSTALLATION N'A RIEN À FAIRE SUR LA PHOTO d'une fiche
  // d'installation - et celle qui paraît ici est FAUSSE : elle donne la
  // consigne de Safari (« Fichier ▸ Ajouter au Dock ») dans un Chromium.
  // Le navigateur de capture s'annonce `HeadlessChrome/… Safari/…`, et le
  // motif Chromium du socle (`install.js`) exige une frontière de mot avant
  // `Chrome` : il n'y en a pas après `Headless`, et le navigateur passe pour
  // un Safari de bureau. Un vrai Chrome n'est pas touché. Fermée ici par son
  // propre bouton, en attendant que le socle soit corrigé.
  const invite = page.locator('[data-dwc="pwa-install-prompt"]');
  if (await invite.isVisible()) {
    await invite.getByRole('button', { name: /plus tard/i }).click();
    await invite.waitFor({ state: 'hidden' });
  }

  // Le bandeau de consentement non plus. Il n'existe que dans un build qui
  // porte une clé PostHog - celui de l'e2e en pose une - et `captures`
  // reconstruit sans. Mais si un tel build traîne dans `dist/`, il serait
  // sur la photo : refusé, s'il est là.
  const consentement = page.locator('[data-dwc="consent-banner"]');
  if (await consentement.isVisible()) {
    await consentement.getByRole('button', { name: /refuser/i }).click();
    await consentement.waitFor({ state: 'hidden' });
  }

  if (name === 'narrow') {
    // Trois D6, par la pastille : c'est aussi ce qui la fait figurer sur la
    // capture, avec « 3 × D6 ».
    await page.getByRole('button', { name: /changer de dés/i }).click();
    const plus = page.getByRole('button', { name: /ajouter un dé/i });
    await plus.click();
    await plus.click();
    // Échap plutôt qu'un clic : la feuille a DEUX boutons « Fermer », la
    // croix de l'en-tête et celui du pied, et un sélecteur par nom tombe sur
    // les deux.
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });

    // 5, 3, 6 : trois couleurs de face distinctes, et un total à deux
    // chiffres.
    await servirFaces(page, [5, 3, 6], 6);
    await page.locator('.dice-screen__zone').click();
    await page.locator('.dice-screen__total').waitFor();
    return;
  }

  if (name === 'wide') {
    // Une partie de Yahtzee, premier lancer : un full (4-4-4-2-2), qui
    // allume dans la grille les cases qu'il peut remplir.
    await page.getByRole('button', { name: /commencer/i }).click();
    await servirFaces(page, [4, 4, 4, 2, 2], 6);
    await page
      .getByRole('button', { name: /^lancer$/i })
      .first()
      .click();
    await page.locator('.scorecard__row--pick').first().waitFor();
  }
}
