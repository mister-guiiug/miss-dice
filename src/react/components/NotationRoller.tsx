import { useState } from 'react';
import { GameShell } from './games/GameShell';
import { useI18n } from '../../i18n/useI18n';
import { useSound } from '../hooks/useSound';
import { defaultRng } from '../../dice/random';
import { rollNotation, type NotationRoll } from '../../dice/notation';

const PRESETS = [
  '1d20',
  '2d6',
  '3d6',
  '4d6kh3',
  '2d20kh1',
  '2d20kl1',
  '1d100',
  '4dF',
];

/** Drapeaux « gardé » par dé (multiset) pour barrer les dés retirés. */
function keptFlags(rolls: number[], kept: number[]): boolean[] {
  const remaining = new Map<number, number>();
  for (const k of kept) remaining.set(k, (remaining.get(k) ?? 0) + 1);
  return rolls.map(r => {
    const left = remaining.get(r) ?? 0;
    if (left > 0) {
      remaining.set(r, left - 1);
      return true;
    }
    return false;
  });
}

export function NotationRoller() {
  const { t } = useI18n();
  const sound = useSound();
  const [input, setInput] = useState('2d6');
  const [result, setResult] = useState<NotationRoll | null>(null);
  const [error, setError] = useState(false);

  const roll = () => {
    const r = rollNotation(input, defaultRng);
    if (!r) {
      setError(true);
      setResult(null);
      return;
    }
    setError(false);
    setResult(r);
    sound('result');
  };

  const footer = (
    <button type="button" className="primary-btn" onClick={roll}>
      {t('game.roll')}
    </button>
  );

  return (
    <GameShell title={t('modes.notation')} footer={footer}>
      <input
        className="notation-input"
        value={input}
        placeholder={t('notation.placeholder')}
        aria-label={t('modes.notation')}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') roll();
        }}
      />

      <div className="chips" aria-label={t('notation.presets')}>
        {PRESETS.map(p => (
          <button
            key={p}
            type="button"
            className="chip"
            onClick={() => setInput(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {error && <p className="notation-error">{t('notation.invalid')}</p>}

      {result && (
        <div className="notation-result" aria-live="polite">
          <div className="notation-total">{result.total}</div>
          <ul className="notation-breakdown">
            {result.dice.map((d, i) => {
              const flags = keptFlags(d.rolls, d.kept);
              const label = `${d.sign < 0 ? '−' : ''}${d.count}d${d.sides === 'F' ? 'F' : d.sides}${d.keep ? ` ${d.keep.mode}${d.keep.n}` : ''}`;
              return (
                <li key={i}>
                  <span className="notation-term">{label}</span>
                  <span className="notation-rolls">
                    {d.rolls.map((r, j) => (
                      <span
                        key={j}
                        className={`notation-die${flags[j] ? '' : ' notation-die--dropped'}`}
                      >
                        {r}
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
            {result.modifier !== 0 && (
              <li>
                <span className="notation-term">
                  {result.modifier > 0 ? '+' : '−'}
                  {Math.abs(result.modifier)}
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </GameShell>
  );
}
