import { useState } from 'react';
import { settingsStore, useSettings } from '../../settings/settingsStore';
import { useSystemReducedMotion } from '../hooks/useReducedMotion';

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
 * Réglages locaux : vibration et mouvement réduit. Volontairement léger
 * (un engrenage + une feuille glissante). Élément autonome, hors de la
 * zone de tap du dé.
 */
export function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const { haptics, motion } = useSettings();
  const systemReduced = useSystemReducedMotion();

  return (
    <>
      <button
        type="button"
        className="icon-button settings-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Réglages"
      >
        <GearIcon />
      </button>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-label="Réglages"
            aria-modal="true"
            onClick={event => event.stopPropagation()}
          >
            <div className="sheet__handle" aria-hidden="true" />
            <h2 className="sheet__title">Réglages</h2>

            <label className="setting-row">
              <span>
                <span className="setting-row__label">Vibration</span>
                <span className="setting-row__hint">
                  Retour haptique au lancer (si supporté)
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

            <label className="setting-row">
              <span>
                <span className="setting-row__label">
                  Réduire les animations
                </span>
                <span className="setting-row__hint">
                  {systemReduced
                    ? 'Déjà activé par votre système'
                    : 'Affiche le résultat sans défilement'}
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
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
