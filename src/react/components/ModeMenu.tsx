import { useState } from 'react';
import { appModeStore, type AppMode } from '../../app/appMode';
import { useI18n } from '../../i18n/useI18n';

/** Icône « jeux » : deux petits dés. */
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
      <circle cx="6.2" cy="10.2" r="1.1" fill="#0f1220" />
      <circle cx="10.8" cy="14.8" r="1.1" fill="#0f1220" />
      <circle cx="8.5" cy="12.5" r="1.1" fill="#0f1220" />
    </svg>
  );
}

interface ModeItem {
  mode: AppMode;
  title: string;
  hint: string;
}

/**
 * Lanceur de jeux : un bouton ouvre une feuille proposant le lancer libre,
 * le Yahtzee ou le 421. Sélectionner un mode bascule l'écran de l'app.
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
    },
    { mode: 'dice421', title: t('modes.d421'), hint: t('modes.d421Hint') },
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

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-label={t('modes.title')}
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <div className="sheet__handle" aria-hidden="true" />
            <h2 className="sheet__title">{t('modes.title')}</h2>
            <div className="mode-list">
              {items.map(item => (
                <button
                  key={item.mode}
                  type="button"
                  className="mode-card"
                  onClick={() => choose(item.mode)}
                >
                  <span className="mode-card__title">{item.title}</span>
                  <span className="mode-card__hint">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
