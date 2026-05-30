import { useState } from 'react';
import {
  MAX_DICE,
  MIN_DICE,
  settingsStore,
  useSettings,
} from '../../settings/settingsStore';
import { useSystemReducedMotion } from '../hooks/useReducedMotion';
import { requestMotionPermission } from '../hooks/useShakeToRoll';
import { DICE_TYPES } from '../../dice/diceTypes';
import { useI18n } from '../../i18n/useI18n';
import { LOCALES, LOCALE_LABELS } from '../../i18n/messages';

/** Icône d'engrenage minimaliste (inline, pas de dépendance). */
function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm9-2c0-.5 0-1-.1-1.5l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L15.5 2h-4l-.4 2.5A7.6 7.6 0 0 0 8.5 6l-2.4-1-2 3.4 2 1.6a7.7 7.7 0 0 0 0 3l-2 1.6 2 3.4 2.4-1c.8.6 1.6 1.1 2.6 1.5l.4 2.5h4l.4-2.5c1-.4 1.8-.9 2.6-1.5l2.4 1 2-3.4-2-1.6c.1-.5.1-1 .1-1.5Z" />
    </svg>
  );
}

/**
 * Réglages locaux : langue, type de dé, nombre de dés, secouer pour lancer,
 * vibration et mouvement réduit. Volontairement léger (un engrenage + une
 * feuille glissante). Élément autonome, hors de la zone de tap du dé.
 */
export function SettingsDrawer() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { haptics, motion, sides, diceCount, shake, locale } = useSettings();
  const systemReduced = useSystemReducedMotion();

  const onToggleShake = async (next: boolean) => {
    if (!next) {
      settingsStore.setShake(false);
      return;
    }
    // L'appel part d'un geste utilisateur (changement de case) → iOS peut
    // demander l'autorisation DeviceMotion à cet instant.
    const granted = await requestMotionPermission();
    settingsStore.setShake(granted);
  };

  return (
    <>
      <button
        type="button"
        className="icon-button settings-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('settings.open')}
      >
        <GearIcon />
      </button>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-label={t('settings.title')}
            aria-modal="true"
            onClick={event => event.stopPropagation()}
          >
            <div className="sheet__handle" aria-hidden="true" />
            <h2 className="sheet__title">{t('settings.title')}</h2>

            {/* Langue */}
            <div className="setting-row setting-row--stack">
              <span className="setting-row__label">
                {t('settings.language')}
              </span>
              <div
                className="segmented segmented--wide"
                role="radiogroup"
                aria-label={t('settings.language')}
              >
                {LOCALES.map(code => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={locale === code}
                    className={`segmented__item${locale === code ? ' segmented__item--active' : ''}`}
                    onClick={() => settingsStore.setLocale(code)}
                  >
                    {LOCALE_LABELS[code]}
                  </button>
                ))}
              </div>
            </div>

            {/* Type de dé */}
            <div className="setting-row setting-row--stack">
              <span className="setting-row__label">
                {t('settings.dieType')}
              </span>
              <div
                className="segmented"
                role="radiogroup"
                aria-label={t('settings.dieType')}
              >
                {DICE_TYPES.map(type => (
                  <button
                    key={type.sides}
                    type="button"
                    role="radio"
                    aria-checked={sides === type.sides}
                    aria-label={t('dice.name', { sides: type.sides })}
                    className={`segmented__item${sides === type.sides ? ' segmented__item--active' : ''}`}
                    onClick={() => settingsStore.setSides(type.sides)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre de dés */}
            <div className="setting-row">
              <span>
                <span className="setting-row__label">
                  {t('settings.diceCount')}
                </span>
                <span className="setting-row__hint">
                  {t('settings.diceCountHint')}
                </span>
              </span>
              <div className="stepper" aria-label={t('settings.diceCount')}>
                <button
                  type="button"
                  className="stepper__btn"
                  aria-label={t('a11y.removeDie')}
                  disabled={diceCount <= MIN_DICE}
                  onClick={() => settingsStore.setDiceCount(diceCount - 1)}
                >
                  −
                </button>
                <span className="stepper__value" aria-live="polite">
                  {diceCount}
                </span>
                <button
                  type="button"
                  className="stepper__btn"
                  aria-label={t('a11y.addDie')}
                  disabled={diceCount >= MAX_DICE}
                  onClick={() => settingsStore.setDiceCount(diceCount + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Secouer pour lancer */}
            <label className="setting-row">
              <span>
                <span className="setting-row__label">
                  {t('settings.shake')}
                </span>
                <span className="setting-row__hint">
                  {t('settings.shakeHint')}
                </span>
              </span>
              <input
                type="checkbox"
                className="switch"
                checked={shake}
                onChange={event => void onToggleShake(event.target.checked)}
              />
            </label>

            {/* Vibration */}
            <label className="setting-row">
              <span>
                <span className="setting-row__label">
                  {t('settings.vibration')}
                </span>
                <span className="setting-row__hint">
                  {t('settings.vibrationHint')}
                </span>
              </span>
              <input
                type="checkbox"
                className="switch"
                checked={haptics}
                onChange={event =>
                  settingsStore.setHaptics(event.target.checked)
                }
              />
            </label>

            {/* Mouvement réduit */}
            <label className="setting-row">
              <span>
                <span className="setting-row__label">
                  {t('settings.reduceMotion')}
                </span>
                <span className="setting-row__hint">
                  {systemReduced
                    ? t('settings.reduceMotionAuto')
                    : t('settings.reduceMotionHint')}
                </span>
              </span>
              <input
                type="checkbox"
                className="switch"
                checked={motion === 'reduced' || systemReduced}
                disabled={systemReduced}
                onChange={event =>
                  settingsStore.setMotion(
                    event.target.checked ? 'reduced' : 'auto'
                  )
                }
              />
            </label>

            <button
              type="button"
              className="sheet__close"
              onClick={() => setOpen(false)}
            >
              {t('settings.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
