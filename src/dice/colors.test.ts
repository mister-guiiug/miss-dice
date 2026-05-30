import { describe, expect, it } from 'vitest';
import { FACE_COLORS, colorForValue, faceColor } from './colors';
import { DIE_VALUES } from '../types';

const HEX = /^#[0-9a-f]{6}$/i;

describe('FACE_COLORS', () => {
  it('définit une teinte pour chacune des six faces', () => {
    for (const value of DIE_VALUES) {
      expect(FACE_COLORS[value]).toBeDefined();
    }
  });

  it('expose des couleurs hex valides (bg et bgDeep) et une clé de teinte', () => {
    for (const value of DIE_VALUES) {
      const c = faceColor(value);
      expect(c.bg).toMatch(HEX);
      expect(c.bgDeep).toMatch(HEX);
      expect(c.key).not.toHaveLength(0);
    }
  });

  it('attribue une teinte de fond distincte à chaque face du D6', () => {
    const backgrounds = DIE_VALUES.map(v => faceColor(v).bg.toLowerCase());
    expect(new Set(backgrounds).size).toBe(DIE_VALUES.length);
  });

  it('conserve les teintes 1..6 puis fait cycler la palette au-delà', () => {
    // Les six premières valeurs gardent la teinte d'origine.
    for (const v of DIE_VALUES) {
      expect(colorForValue(v)).toEqual(FACE_COLORS[v]);
    }
    // Au-delà du D6, la palette de 6 couleurs cycle (7 → couleur de 1).
    expect(colorForValue(7)).toEqual(FACE_COLORS[1]);
    expect(colorForValue(12)).toEqual(FACE_COLORS[6]);
    expect(colorForValue(20)).toEqual(colorForValue(2));
  });
});
