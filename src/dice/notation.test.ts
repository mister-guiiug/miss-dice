import { describe, expect, it } from 'vitest';
import { parseNotation, rollNotation, rollParsed } from './notation';
import type { Rng } from './random';

/** Rng déterministe rejouant des valeurs [0,1). */
function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length]!;
}

describe('parseNotation', () => {
  it('parse une expression simple avec modificateur', () => {
    const p = parseNotation('2d6+3')!;
    expect(p.dice).toHaveLength(1);
    expect(p.dice[0]).toMatchObject({
      sign: 1,
      count: 2,
      sides: 6,
      keep: null,
    });
    expect(p.modifier).toBe(3);
  });

  it('accepte d20 sans compte, d%, dF et plusieurs termes', () => {
    expect(parseNotation('d20')!.dice[0]).toMatchObject({
      count: 1,
      sides: 20,
    });
    expect(parseNotation('1d%')!.dice[0]!.sides).toBe(100);
    expect(parseNotation('2df')!.dice[0]!.sides).toBe('F');
    const multi = parseNotation('2d6+1d4-1')!;
    expect(multi.dice).toHaveLength(2);
    expect(multi.modifier).toBe(-1);
  });

  it('parse keep/drop (avantage = 2d20kh1)', () => {
    expect(parseNotation('2d20kh1')!.dice[0]!.keep).toEqual({
      mode: 'kh',
      n: 1,
    });
    expect(parseNotation('4d6dl1')!.dice[0]!.keep).toEqual({
      mode: 'dl',
      n: 1,
    });
  });

  it('rejette les expressions invalides', () => {
    expect(parseNotation('')).toBeNull();
    expect(parseNotation('abc')).toBeNull();
    expect(parseNotation('2d')).toBeNull();
    expect(parseNotation('0d6')).toBeNull();
    expect(parseNotation('2d6kh3')).toBeNull(); // garder 3 sur 2
    expect(parseNotation('2d1')).toBeNull(); // d1 interdit
  });
});

describe('rollParsed / rollNotation', () => {
  it('additionne les dés et le modificateur', () => {
    // rng 0.5 -> face = floor(0.5*6)+1 = 4 ; 2d6 = 8 ; +3 = 11
    const roll = rollNotation('2d6+3', seqRng([0.5]))!;
    expect(roll.dice[0]!.rolls).toEqual([4, 4]);
    expect(roll.total).toBe(11);
  });

  it('applique l’avantage (kh1) en gardant le meilleur', () => {
    // 0.1 -> 1, 0.95 -> 6 ; kh1 garde 6
    const roll = rollNotation('2d20kh1', seqRng([0.0, 0.95]))!;
    expect(roll.dice[0]!.kept).toEqual([20]);
    expect(roll.total).toBe(20);
  });

  it('gère 4d6 drop lowest', () => {
    const p = parseNotation('4d6dl1')!;
    const roll = rollParsed(p, seqRng([0.0, 0.5, 0.83, 0.99])); // 1,4,5,6
    expect(roll.dice[0]!.kept).toEqual([4, 5, 6]); // le 1 retiré
    expect(roll.total).toBe(15);
  });

  it('gère les dés Fudge (-1/0/+1)', () => {
    // 0.1->-1, 0.5->0, 0.9->+1
    const roll = rollNotation('3df', seqRng([0.1, 0.5, 0.9]))!;
    expect(roll.dice[0]!.rolls).toEqual([-1, 0, 1]);
    expect(roll.total).toBe(0);
  });

  it('gère keep-lowest (kl) et drop-highest (dh)', () => {
    // rolls 1,4,5,6
    const seq = [0.0, 0.5, 0.83, 0.99];
    expect(
      rollParsed(parseNotation('4d6kl1')!, seqRng(seq)).dice[0]!.kept
    ).toEqual([1]);
    expect(
      rollParsed(parseNotation('4d6dh1')!, seqRng(seq)).dice[0]!.kept
    ).toEqual([1, 4, 5]);
  });

  it('renvoie null pour une expression invalide', () => {
    expect(rollNotation('nope', seqRng([0.5]))).toBeNull();
    expect(parseNotation('+')).toBeNull();
    expect(parseNotation('200d6')).toBeNull(); // trop de dés
  });
});
