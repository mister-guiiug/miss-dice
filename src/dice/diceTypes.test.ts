import { describe, expect, it } from 'vitest';
import {
  DICE_TYPES,
  SUPPORTED_SIDES,
  dieType,
  DEFAULT_SIDES,
} from './diceTypes';

describe('diceTypes', () => {
  it('expose les six dés polyédriques standards', () => {
    expect(SUPPORTED_SIDES).toEqual([4, 6, 8, 10, 12, 20]);
  });

  it('réserve l’affichage par points au seul D6', () => {
    for (const type of DICE_TYPES) {
      if (type.sides === 6) {
        expect(type.render).toBe('pips');
        expect(type.clipPath).toBeUndefined();
      } else {
        expect(type.render).toBe('numeral');
        expect(type.clipPath).toBeTruthy();
      }
    }
  });

  it('retrouve un type par son nombre de faces', () => {
    expect(dieType(20).label).toBe('D20');
    expect(dieType(4).sides).toBe(4);
  });

  it('replie sur le D6 pour un nombre de faces inconnu', () => {
    expect(dieType(7).sides).toBe(DEFAULT_SIDES);
    expect(dieType(0).sides).toBe(DEFAULT_SIDES);
  });
});
