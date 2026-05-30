import { describe, expect, it } from 'vitest';
import { FACE_COLORS, faceColor } from './colors';
import { DIE_VALUES } from '../types';

const HEX = /^#[0-9a-f]{6}$/i;

describe('FACE_COLORS', () => {
  it('définit une teinte pour chacune des six faces', () => {
    for (const value of DIE_VALUES) {
      expect(FACE_COLORS[value]).toBeDefined();
    }
  });

  it('expose des couleurs hex valides (bg et bgDeep)', () => {
    for (const value of DIE_VALUES) {
      const c = faceColor(value);
      expect(c.bg).toMatch(HEX);
      expect(c.bgDeep).toMatch(HEX);
      expect(c.hue).not.toHaveLength(0);
    }
  });

  it('attribue une teinte de fond distincte à chaque face', () => {
    const backgrounds = DIE_VALUES.map(v => faceColor(v).bg.toLowerCase());
    expect(new Set(backgrounds).size).toBe(DIE_VALUES.length);
  });
});
