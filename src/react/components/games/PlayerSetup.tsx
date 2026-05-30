import { useState } from 'react';
import { useI18n } from '../../../i18n/useI18n';

const MAX_PLAYERS = 8;

interface PlayerSetupProps {
  onStart: (names: string[]) => void;
}

/**
 * Saisie des joueurs (1 à 8) avant une partie. Les noms vides sont
 * remplacés par « Joueur N » au démarrage. 1 joueur = entraînement solo.
 */
export function PlayerSetup({ onStart }: PlayerSetupProps) {
  const { t } = useI18n();
  const [names, setNames] = useState<string[]>(['']);

  const update = (index: number, value: string) =>
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  const add = () =>
    setNames(prev => (prev.length < MAX_PLAYERS ? [...prev, ''] : prev));
  const remove = (index: number) =>
    setNames(prev =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );

  const start = () =>
    onStart(
      names.map((n, i) => n.trim() || t('common.playerDefault', { n: i + 1 }))
    );

  return (
    <div className="setup">
      <h2 className="setup__title">{t('setup.title')}</h2>
      <ul className="setup__list">
        {names.map((name, i) => (
          <li className="setup__row" key={i}>
            <span className="setup__index" aria-hidden="true">
              {i + 1}
            </span>
            <input
              className="setup__input"
              value={name}
              placeholder={t('common.playerDefault', { n: i + 1 })}
              aria-label={t('setup.playerName', { n: i + 1 })}
              maxLength={16}
              onChange={e => update(i, e.target.value)}
            />
            {names.length > 1 && (
              <button
                type="button"
                className="icon-button icon-button--sm"
                aria-label={t('common.removePlayer')}
                onClick={() => remove(i)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {names.length < MAX_PLAYERS && (
        <button type="button" className="setup__add" onClick={add}>
          + {t('common.addPlayer')}
        </button>
      )}
      <button type="button" className="setup__start" onClick={start}>
        {t('common.start')}
      </button>
    </div>
  );
}
