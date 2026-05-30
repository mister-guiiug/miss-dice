import { rollDie, type Rng } from './random';

/**
 * Évaluation de notation de dés (JDR) — logique pure, sans React.
 * Exemples : `2d6+3`, `d20`, `4d6kh3` (garder les 3 meilleurs),
 * `2d20kh1` (avantage), `3d6dl1` (retirer le plus bas), `1d100`, `2dF`
 * (dés Fudge : -1/0/+1), `1d%` (= d100), `2d6+1d4+1`.
 */
export type Sides = number | 'F';

export interface DiceTerm {
  sign: 1 | -1;
  count: number;
  sides: Sides;
  /** Garde/retire : nombre de dés conservés (après tri), ou null = tous. */
  keep: { mode: 'kh' | 'kl' | 'dh' | 'dl'; n: number } | null;
}

export interface ParsedNotation {
  dice: DiceTerm[];
  /** Somme signée des constantes. */
  modifier: number;
}

export interface DiceTermRoll extends DiceTerm {
  rolls: number[];
  kept: number[];
  subtotal: number;
}

export interface NotationRoll {
  input: string;
  dice: DiceTermRoll[];
  modifier: number;
  total: number;
}

const MAX_COUNT = 100;
const MAX_SIDES = 1000;

const TERM_RE = /^(\d*)d(\d+|f|%)(kh|kl|dh|dl)?(\d+)?$/;

/** Parse une expression de notation. Renvoie null si invalide. */
export function parseNotation(input: string): ParsedNotation | null {
  const cleaned = input.replace(/\s+/g, '').toLowerCase();
  if (!cleaned) return null;
  // Découpe en termes signés (+/-), le 1er signe optionnel.
  const parts = cleaned.match(/[+-]?[^+-]+/g);
  if (!parts) return null;

  const dice: DiceTerm[] = [];
  let modifier = 0;

  for (const part of parts) {
    let body = part;
    let sign: 1 | -1 = 1;
    if (body[0] === '+') body = body.slice(1);
    else if (body[0] === '-') {
      sign = -1;
      body = body.slice(1);
    }
    if (!body) return null;

    if (/^\d+$/.test(body)) {
      modifier += sign * Number(body);
      continue;
    }

    const m = TERM_RE.exec(body);
    if (!m) return null;
    const count = m[1] ? Number(m[1]) : 1;
    const sidesRaw = m[2]!;
    const keepMode = m[3] as 'kh' | 'kl' | 'dh' | 'dl' | undefined;
    const keepN = m[4] ? Number(m[4]) : undefined;

    if (count < 1 || count > MAX_COUNT) return null;

    let sides: Sides;
    if (sidesRaw === 'f') sides = 'F';
    else if (sidesRaw === '%') sides = 100;
    else {
      const s = Number(sidesRaw);
      if (s < 2 || s > MAX_SIDES) return null;
      sides = s;
    }

    let keep: DiceTerm['keep'] = null;
    if (m[3]) {
      if (!keepMode || keepN === undefined || keepN < 1 || keepN > count)
        return null;
      keep = { mode: keepMode, n: keepN };
    }

    dice.push({ sign, count, sides, keep });
  }

  if (dice.length === 0 && modifier === 0 && !/\d/.test(cleaned)) return null;
  return { dice, modifier };
}

function rollTermDie(sides: Sides, rng: Rng): number {
  if (sides === 'F') return Math.floor(rng() * 3) - 1; // -1 / 0 / +1
  return rollDie(sides, rng);
}

/** Sélectionne les dés conservés selon keep/drop. */
function applyKeep(rolls: number[], keep: DiceTerm['keep']): number[] {
  if (!keep) return rolls;
  const sorted = [...rolls].sort((a, b) => a - b); // croissant
  const { mode, n } = keep;
  if (mode === 'kh') return sorted.slice(rolls.length - n);
  if (mode === 'kl') return sorted.slice(0, n);
  if (mode === 'dh') return sorted.slice(0, rolls.length - n);
  return sorted.slice(n); // dl
}

/** Lance une expression parsée. */
export function rollParsed(parsed: ParsedNotation, rng: Rng): NotationRoll {
  const dice: DiceTermRoll[] = parsed.dice.map(term => {
    const rolls = Array.from({ length: term.count }, () =>
      rollTermDie(term.sides, rng)
    );
    const kept = applyKeep(rolls, term.keep);
    const subtotal = term.sign * kept.reduce((a, b) => a + b, 0);
    return { ...term, rolls, kept, subtotal };
  });
  const total = dice.reduce((a, d) => a + d.subtotal, 0) + parsed.modifier;
  return { input: '', dice, modifier: parsed.modifier, total };
}

/** Parse puis lance ; renvoie null si l'expression est invalide. */
export function rollNotation(input: string, rng: Rng): NotationRoll | null {
  const parsed = parseNotation(input);
  if (!parsed) return null;
  return { ...rollParsed(parsed, rng), input };
}
