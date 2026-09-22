// L'accessibilité des TROIS palettes, dans les DEUX thèmes, dans un vrai
// navigateur - le seul endroit où axe évalue les contrastes.
//
// POURQUOI UNE SPEC À PART. `a11y.spec.ts` tourne dans la palette par défaut :
// le violet. Feutrine et braise (#101), en clair et en sombre, soit quatre
// combinaisons sur six, n'avaient jamais été vues par axe avec un vrai rendu.
// Ce sont pourtant celles où les marges sont les plus minces - le blanc sur
// l'accent y tombait à 3,01 et 2,67, relevé par `tokens.test.ts`. Ce test-là
// fait l'arithmétique sur les jetons ; celui-ci regarde ce que l'écran PEINT,
// ce qui inclut les couleurs composées (`color-mix`), les transparences et les
// règles que personne n'a pensé à mesurer.
//
// CHROMIUM SEUL, et c'est délibéré. La CI ne joue que ce projet (le défaut
// `e2e-project` du socle), mais une exécution locale en lance cinq : un défaut
// de mise en page ou de focus peut être propre à un moteur, le contraste de
// couleurs hexadécimales non - c'est de l'arithmétique sur des valeurs que les
// cinq résolvent pareil. Multiplier ces vingt-quatre passages par cinq ne
// vérifierait rien de plus.
//
// CE QU'ELLE A TROUVÉ À SA PREMIÈRE EXÉCUTION, et qui justifie son coût :
//  - le score proposé de la grille du Yahtzee à 3,06:1 en violet sombre et
//    4,06 en feutrine sombre. Le Chrome des tests se déclare en thème CLAIR,
//    et le thème suit le système : aucune suite n'avait jamais audité un
//    thème sombre ;
//  - le bandeau de consentement posé sur la nouvelle pastille de dés, qu'il
//    empêchait de toucher.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expectNoA11yViolations } from '@mister-guiiug/dev-pwa-config/playwright-a11y';

const PALETTES = ['violet', 'feutrine', 'braise'] as const;
const THEMES = ['dark', 'light'] as const;

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'contraste : un seul moteur suffit, cf. en-tête'
  );
});

/** Ouvre l'app avec une palette et un thème posés AVANT la première peinture. */
async function ouvrir(
  page: Page,
  palette: string,
  theme: string,
  chemin = '/'
): Promise<void> {
  // Le script de pré-peinture d'`index.html` lit ces deux clés : les poser
  // ici, avant le chargement, c'est ouvrir l'app comme un visiteur qui les a
  // déjà choisies - sans passer par le tiroir, donc sans en dépendre.
  //
  // LA LANGUE EST FIXÉE AUSSI. Le Chrome de Playwright parle anglais : l'app
  // s'ouvrait en anglais, et un sélecteur écrit « réglages » ne trouvait
  // rien. `a11y.spec.ts` contourne en empilant les langues dans chaque
  // expression ; ici, où les contrastes sont l'objet, une seule langue connue
  // vaut mieux - et le français est celle de l'app par défaut.
  await page.addInitScript(
    ([p, t]) => {
      localStorage.setItem('miss-dice_palette', p);
      localStorage.setItem('miss-dice_theme', t);
      localStorage.setItem('miss-dice_locale', 'fr');
    },
    [palette, theme]
  );
  await page.goto(chemin);
  await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

/**
 * Fait paraître l'invite d'installation RÉELLE du socle.
 *
 * `beforeinstallprompt` est l'événement que Chrome émet quand l'app est
 * installable ; le composant du socle l'écoute. Un événement synthétique
 * portant `prompt` et `userChoice` lui suffit - c'est donc le vrai composant,
 * avec son vrai balisage, que axe analyse.
 */
async function montrerInvite(page: Page): Promise<void> {
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(e, {
      prompt: () => Promise.resolve(),
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      platforms: ['web'],
    });
    window.dispatchEvent(e);
  });
  await expect(page.locator('[data-dwc="pwa-install-prompt"]')).toBeVisible();
}

/**
 * Pose le bandeau de mise à jour - par INJECTION, et c'est la seule pièce de
 * cette spec qui ne soit pas le vrai composant.
 *
 * Il ne paraît que quand un service worker neuf attend, ce qu'aucun test ne
 * sait fabriquer proprement. Le balisage ci-dessous est celui que rend
 * `update-prompt-banner.js` du socle, attribut pour attribut : ce qui est
 * vérifié ici, c'est l'HABILLAGE que `styles.css` lui donne dans chaque
 * palette - le bouton qui portait 4,45:1 en violet sombre (#97).
 */
async function montrerBandeau(page: Page): Promise<void> {
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.className = 'sw-update-banner';
    d.setAttribute('role', 'status');
    d.setAttribute('data-dwc', 'update-banner');
    d.innerHTML =
      '<span data-dwc="update-banner-title">Mise à jour disponible</span>' +
      '<button type="button" data-dwc="update-banner-update">Mettre à jour</button>' +
      '<button type="button" data-dwc="update-banner-dismiss">Plus tard (4 h)</button>';
    document.body.appendChild(d);
  });
  await expect(page.locator('[data-dwc="update-banner"]')).toBeVisible();
}

for (const palette of PALETTES) {
  for (const theme of THEMES) {
    test.describe(`@a11y palette ${palette}, thème ${theme}`, () => {
      test('écran principal, invite d’installation et bandeau de mise à jour', async ({
        page,
      }) => {
        await ouvrir(page, palette, theme);
        await expect(page.getByRole('main')).toBeVisible();
        await montrerInvite(page);
        await montrerBandeau(page);
        await expectNoA11yViolations(page, AxeBuilder, expect);
      });

      test('choix des dés', async ({ page }) => {
        await ouvrir(page, palette, theme);
        await page.getByRole('button', { name: /changer de dés/i }).click();
        await expect(page.getByRole('dialog', { name: /dés/i })).toBeVisible();
        await expectNoA11yViolations(page, AxeBuilder, expect);
      });

      test('réglages', async ({ page }) => {
        await ouvrir(page, palette, theme);
        await page.getByRole('button', { name: /réglages/i }).click();
        await expect(
          page.getByRole('dialog', { name: /réglages/i })
        ).toBeVisible();
        await expectNoA11yViolations(page, AxeBuilder, expect);
      });

      // L'écran qui porte le plus d'aplats `--accent-strong` : bouton
      // principal, segments actifs, dés de couleur, cases sélectionnables.
      test('partie de Yahtzee après un lancer', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await ouvrir(page, palette, theme, '/?play=yahtzee');
        await page.getByRole('button', { name: /commencer/i }).click();
        await page
          .getByRole('button', { name: /^lancer$/i })
          .first()
          .click();
        await expect(page.locator('.scorecard__row--pick').first()).toBeVisible(
          {
            timeout: 10000,
          }
        );
        await expectNoA11yViolations(page, AxeBuilder, expect);
      });
    });
  }
}
