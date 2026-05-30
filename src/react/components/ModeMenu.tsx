import { useState } from 'react';
import { appModeStore, type AppMode } from '../../app/appMode';
import { useI18n } from '../../i18n/useI18n';
import { hasSavedGame, type GameKey } from '../../games/persistence';
import { Sheet } from './Sheet';

function GamesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="currentColor"
    >
      <rect x="3" y="7" width="11" height="11" rx="2.5" />
      <rect
        x="10"
        y="3"
        width="11"
        height="11"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="6.2" cy="10.2" r="1.1" fill="var(--surface)" />
      <circle cx="10.8" cy="14.8" r="1.1" fill="var(--surface)" />
      <circle cx="8.5" cy="12.5" r="1.1" fill="var(--surface)" />
    </svg>
  );
}

interface ModeItem {
  mode: AppMode;
  title: string;
  hint: string;
  saveKey?: GameKey;
}

/**
 * Lanceur de jeux : un bouton ouvre une feuille proposant le lancer libre,
 * le Yahtzee ou le 421. Une partie sauvegardée est signalée « Reprendre ».
 */
export function ModeMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const choose = (mode: AppMode) => {
    appModeStore.set(mode);
    setOpen(false);
  };

  const items: ModeItem[] = [
    { mode: 'roll', title: t('modes.roll'), hint: t('modes.rollHint') },
    {
      mode: 'yahtzee',
      title: t('modes.yahtzee'),
      hint: t('modes.yahtzeeHint'),
      saveKey: 'yahtzee',
    },
    {
      mode: 'dice421',
      title: t('modes.d421'),
      hint: t('modes.d421Hint'),
      saveKey: 'dice421',
    },
    {
      mode: 'notation',
      title: t('modes.notation'),
      hint: t('modes.notationHint'),
    },
    { mode: 'decide', title: t('modes.decide'), hint: t('modes.decideHint') },
  ];

  return (
    <>
      <button
        type="button"
        className="icon-button mode-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('modes.title')}
      >
        <GamesIcon />
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        label={t('modes.title')}
      >
        <h2 className="sheet__title">{t('modes.title')}</h2>
        <div className="mode-list">
          {items.map(item => {
            const resumable = item.saveKey ? hasSavedGame(item.saveKey) : false;
            return (
              <button
                key={item.mode}
                type="button"
                className="mode-card"
                onClick={() => choose(item.mode)}
              >
                <span className="mode-card__head">
                  <span className="mode-card__title">{item.title}</span>
                  {resumable && (
                    <span className="mode-card__badge">
                      {t('modes.resume')}
                    </span>
                  )}
                </span>
                <span className="mode-card__hint">{item.hint}</span>
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
