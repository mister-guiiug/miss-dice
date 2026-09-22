import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PALETTE_STORAGE_KEY } from './palette';

/**
 * LE MODULE LIT LE STOCKAGE À SON IMPORT, et c'est ce qui commande la forme de
 * ces tests. `paletteStore` est créé avec la valeur trouvée dans
 * `localStorage` au moment où le module s'évalue : poser la clé APRÈS l'import
 * ne changerait plus rien. Chaque cas réimporte donc le module
 * (`vi.resetModules()`), exactement comme un vrai démarrage d'application.
 *
 * Ce n'est pas un détail d'implémentation : c'est le contrat qui permet au
 * script de pré-peinture d'`index.html` et à React de tomber sur la MÊME
 * palette, sans négociation ni frame intermédiaire.
 */
async function moduleNeuf() {
  vi.resetModules();
  return import('./palette');
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-palette');
});

afterEach(() => {
  localStorage.clear();
});

describe('la palette enregistrée', () => {
  it('appareil vierge : la palette d’origine', async () => {
    const { paletteStore, DEFAULT_PALETTE } = await moduleNeuf();
    expect(paletteStore.get()).toBe(DEFAULT_PALETTE);
    expect(DEFAULT_PALETTE).toBe('violet');
  });

  it('relit une palette servie', async () => {
    localStorage.setItem(PALETTE_STORAGE_KEY, 'feutrine');
    const { paletteStore } = await moduleNeuf();
    expect(paletteStore.get()).toBe('feutrine');
  });

  /*
   * LE CAS QUI ARRIVE VRAIMENT : une palette retirée d'une version à l'autre,
   * ou une clé écrite à la main. Sans cette garde, `data-palette="cendre"` se
   * poserait sur `<html>`, aucun bloc de `tokens.css` ne s'y accrocherait, et
   * l'app s'ouvrirait avec les jetons du repli `:root` - du sombre, même si
   * l'utilisateur avait demandé du clair.
   */
  it('une palette inconnue retombe sur celle d’origine', async () => {
    localStorage.setItem(PALETTE_STORAGE_KEY, 'cendre');
    const { paletteStore, DEFAULT_PALETTE } = await moduleNeuf();
    expect(paletteStore.get()).toBe(DEFAULT_PALETTE);
  });

  it('enregistre le choix pour le prochain démarrage', async () => {
    const { setPalette } = await moduleNeuf();
    setPalette('braise');
    expect(localStorage.getItem(PALETTE_STORAGE_KEY)).toBe('braise');

    // Et le démarrage suivant le retrouve.
    const { paletteStore } = await moduleNeuf();
    expect(paletteStore.get()).toBe('braise');
  });
});

describe('appliquerPalette', () => {
  it('pose l’attribut que `tokens.css` attend', async () => {
    const { appliquerPalette, PALETTE_ATTRIBUTE } = await moduleNeuf();
    appliquerPalette('feutrine');
    expect(document.documentElement.getAttribute(PALETTE_ATTRIBUTE)).toBe(
      'feutrine'
    );
  });
});

describe('estUnePalette', () => {
  it('ne reconnaît que les palettes servies', async () => {
    const { estUnePalette, PALETTES } = await moduleNeuf();
    for (const palette of PALETTES) expect(estUnePalette(palette)).toBe(true);
    for (const autre of ['', 'cendre', null, undefined, 42]) {
      expect(estUnePalette(autre)).toBe(false);
    }
  });
});
