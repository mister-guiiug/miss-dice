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
import { REPO_URL, SPONSOR_URL, appUrl } from '../../links';
import { shareOrCopy } from '../../share';
import { rollStatsStore, useRollStats } from '../../stats/rollStats';
import { rollLogStore, toCsv, useRollLog } from '../../log/rollLog';
import { Sheet } from './Sheet';

/** Déclenche le téléchargement d'un fichier texte (sans dépendance). */
function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4a3 3 0 1 0-.9-1.8L8 10A3 3 0 1 0 8 14l6.7 3.4A3 3 0 1 0 18 16Z" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function CoffeeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 3h13v2H4V3Zm0 4h15a3 3 0 0 1 0 6h-1.1A6 6 0 0 1 12 17H9a6 6 0 0 1-5.92-5H4V7Zm14 2v2h1a1 1 0 0 0 0-2h-1ZM3 19h15v2H3v-2Z" />
    </svg>
  );
}

const THEME_KEYS = [
  { value: 'auto', label: 'settings.themeAuto' },
  { value: 'light', label: 'settings.themeLight' },
  { value: 'dark', label: 'settings.themeDark' },
] as const;

/** Réglages locaux : langue, thème, sons, type de dé, nombre, secousse… */
export function SettingsDrawer() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { haptics, motion, sides, diceCount, shake, locale, theme, sounds } =
    useSettings();
  const systemReduced = useSystemReducedMotion();
  const stats = useRollStats();
  const log = useRollLog();
  const faces = Array.from({ length: sides }, (_, i) => i + 1);
  const maxCount = Math.max(1, ...faces.map(v => stats.counts[v] ?? 0));

  const onExport = () =>
    downloadText('miss-dice-historique.csv', toCsv(log), 'text/csv');

  const onShare = async () => {
    const result = await shareOrCopy({
      title: 'Miss Dice',
      text: t('settings.shareText'),
      url: appUrl(),
    });
    if (result === 'copied') {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const onToggleShake = async (next: boolean) => {
    if (!next) {
      settingsStore.setShake(false);
      return;
    }
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

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        label={t('settings.title')}
      >
        <h2 className="sheet__title">{t('settings.title')}</h2>

        {/* Langue */}
        <div className="setting-row setting-row--stack">
          <span className="setting-row__label">{t('settings.language')}</span>
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

        {/* Thème */}
        <div className="setting-row setting-row--stack">
          <span className="setting-row__label">{t('settings.theme')}</span>
          <div
            className="segmented segmented--wide"
            role="radiogroup"
            aria-label={t('settings.theme')}
          >
            {THEME_KEYS.map(item => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={theme === item.value}
                className={`segmented__item${theme === item.value ? ' segmented__item--active' : ''}`}
                onClick={() => settingsStore.setTheme(item.value)}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        </div>

        {/* Type de dé */}
        <div className="setting-row setting-row--stack">
          <span className="setting-row__label">{t('settings.dieType')}</span>
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

        {/* Sons */}
        <label className="setting-row">
          <span>
            <span className="setting-row__label">{t('settings.sounds')}</span>
            <span className="setting-row__hint">
              {t('settings.soundsHint')}
            </span>
          </span>
          <input
            type="checkbox"
            className="switch"
            checked={sounds}
            onChange={event => settingsStore.setSounds(event.target.checked)}
          />
        </label>

        {/* Secouer pour lancer */}
        <label className="setting-row">
          <span>
            <span className="setting-row__label">{t('settings.shake')}</span>
            <span className="setting-row__hint">{t('settings.shakeHint')}</span>
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
            onChange={event => settingsStore.setHaptics(event.target.checked)}
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
              settingsStore.setMotion(event.target.checked ? 'reduced' : 'auto')
            }
          />
        </label>

        {/* Statistiques du lancer libre */}
        <div className="about">
          <span className="about__label">{t('settings.stats')}</span>
          {stats.rolls === 0 ? (
            <p className="setting-row__hint">{t('settings.statsEmpty')}</p>
          ) : (
            <>
              <p className="stats__total">
                {t('settings.statsTotal', { n: stats.rolls })}
              </p>
              <div className="stats__bars">
                {faces.map(v => {
                  const count = stats.counts[v] ?? 0;
                  return (
                    <div className="stats__row" key={v}>
                      <span className="stats__face">{v}</span>
                      <span className="stats__bar">
                        <span
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </span>
                      <span className="stats__count">{count}</span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="link-btn"
                onClick={() => rollStatsStore.reset()}
              >
                {t('settings.statsReset')}
              </button>
            </>
          )}
        </div>

        {/* Historique des lancers libres + export CSV */}
        {log.length > 0 && (
          <div className="about">
            <span className="about__label">{t('settings.history')}</span>
            <ul className="rolllog">
              {log.slice(0, 8).map((entry, i) => (
                <li className="rolllog__row" key={i}>
                  <span className="rolllog__die">d{entry.sides}</span>
                  <span className="rolllog__values">
                    {entry.values.join(' ')}
                  </span>
                  <span className="rolllog__total">{entry.total}</span>
                </li>
              ))}
            </ul>
            <div className="about__links">
              <button type="button" className="link-btn" onClick={onExport}>
                {t('settings.historyExport')}
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => rollLogStore.clear()}
              >
                {t('settings.historyClear')}
              </button>
            </div>
          </div>
        )}

        {/* À propos : partage, code source, sponsor */}
        <div className="about">
          <span className="about__label">{t('settings.about')}</span>
          <div className="about__links">
            <button
              type="button"
              className="link-btn"
              onClick={() => void onShare()}
            >
              <ShareIcon />
              {t('settings.shareApp')}
            </button>
            <a
              className="link-btn"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
              {t('settings.sourceCode')}
            </a>
            <a
              className="link-btn link-btn--coffee"
              href={SPONSOR_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CoffeeIcon />
              {t('settings.buyCoffee')}
            </a>
          </div>
          <p className="about__feedback" role="status" aria-live="polite">
            {copied ? t('settings.linkCopied') : ''}
          </p>
        </div>

        <button
          type="button"
          className="sheet__close"
          onClick={() => setOpen(false)}
        >
          {t('settings.close')}
        </button>
      </Sheet>
    </>
  );
}
