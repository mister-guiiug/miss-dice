import { describe, expect, it } from 'vitest';
import { dieShape, solidFaces } from './polyhedra';
import { DICE_TYPES } from './diceTypes';

/**
 * LA VRAIE FORME, PAS UNE SILHOUETTE.
 *
 * Les faces se déduisent des sommets. Un sommet mal placé, et le solide n'a
 * plus le bon nombre de faces : c'est ce que ces tests tiennent — y compris
 * les dix cerfs-volants du D10, qui ne sont plans qu'à une seule hauteur de
 * pointe. Hors de celle-là, chacun se casse en deux triangles.
 */
describe('les solides des dés', () => {
  it.each(DICE_TYPES.map(t => [t.label, t.sides] as const))(
    'le %s a exactement autant de faces que de valeurs',
    (_, sides) => {
      expect(solidFaces(sides)).toHaveLength(sides);
    }
  );

  it.each([
    [10, 4],
    [12, 5],
    [20, 3],
  ])('les faces du D%i ont %i côtés', (sides, corners) => {
    for (const face of solidFaces(sides)) {
      expect(face.vertices).toHaveLength(corners);
    }
  });

  it('en montre plusieurs faces, jamais toutes : c’est ce qui fait le relief', () => {
    for (const type of DICE_TYPES) {
      const visible = dieShape(type.sides).length;
      expect(visible).toBeGreaterThanOrEqual(2);
      expect(visible).toBeLessThan(type.sides);
    }
  });

  /*
   * PAS DE FACE DE CHANT. Réglé à l'œil, l'icosaèdre montrait une face presque
   * de profil (0,07 de face) : un trait écrasé au bas du dé. Les vues sont
   * désormais choisies par le calcul ; ce plancher les empêche de régresser.
   */
  it('ne montre aucune face presque de profil', () => {
    for (const type of DICE_TYPES) {
      const facing = dieShape(type.sides).map(f => f.facing);
      expect(Math.min(...facing)).toBeGreaterThanOrEqual(0.18);
    }
  });

  it('éclaire les faces différemment, sans quoi la forme serait plate', () => {
    for (const type of DICE_TYPES) {
      const lights = new Set(dieShape(type.sides).map(f => f.light.toFixed(2)));
      expect(lights.size).toBeGreaterThan(1);
    }
  });

  it('tient dans sa boîte de 0 à 100', () => {
    for (const type of DICE_TYPES) {
      for (const face of dieShape(type.sides)) {
        const nums = face.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
        expect(nums.length).toBeGreaterThanOrEqual(6);
        expect(Math.min(...nums)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...nums)).toBeLessThanOrEqual(100);
      }
    }
  });

  it('se calcule une fois par type', () => {
    expect(dieShape(12)).toBe(dieShape(12));
  });
});
