import { useState } from 'react';
import { GameShell } from './games/GameShell';
import { useI18n } from '../../i18n/useI18n';
import { useSound } from '../hooks/useSound';
import { defaultRng } from '../../dice/random';
import {
  flipCoin,
  parseOptions,
  pickOne,
  shuffle,
  yesNo,
} from '../../decide/decisions';

export function DecideScreen() {
  const { t } = useI18n();
  const sound = useSound();
  const [options, setOptions] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const list = parseOptions(options);

  const show = (value: string) => {
    setResult(value);
    sound('result');
  };

  return (
    <GameShell title={t('modes.decide')}>
      <div className="decide-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            show(
              flipCoin(defaultRng) === 'heads'
                ? t('decide.heads')
                : t('decide.tails')
            )
          }
        >
          {t('decide.coin')}
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() =>
            show(yesNo(defaultRng) ? t('decide.yes') : t('decide.no'))
          }
        >
          {t('decide.yesno')}
        </button>
      </div>

      {result !== null && (
        <div className="decide-result" role="status" aria-live="polite">
          {result}
        </div>
      )}

      <label className="decide-options">
        <span className="setting-row__label">{t('decide.optionsLabel')}</span>
        <textarea
          value={options}
          rows={5}
          placeholder={t('decide.optionsPlaceholder')}
          onChange={e => setOptions(e.target.value)}
        />
      </label>

      <div className="decide-actions">
        <button
          type="button"
          className="secondary-btn"
          disabled={list.length === 0}
          onClick={() => {
            const p = pickOne(list, defaultRng);
            if (p) show(p);
          }}
        >
          {t('decide.pick')}
        </button>
        <button
          type="button"
          className="secondary-btn"
          disabled={list.length < 2}
          onClick={() => {
            const s = shuffle(list, defaultRng);
            if (s.length > 0) show(s.join('  →  '));
          }}
        >
          {t('decide.shuffle')}
        </button>
      </div>

      {list.length === 0 && (
        <p className="setting-row__hint">{t('decide.empty')}</p>
      )}
    </GameShell>
  );
}
