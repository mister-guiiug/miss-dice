import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

/**
 * Pastille d'installation discrète, en bas de l'écran. N'apparaît que si
 * le navigateur propose l'installation et tant que l'utilisateur ne l'a
 * pas écartée. Élément autonome, hors de la zone de tap du dé.
 */
export function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div
      className="install-prompt"
      role="dialog"
      aria-label="Installer Miss Dice"
    >
      <span className="install-prompt__text">Installer Miss Dice</span>
      <button
        type="button"
        className="install-prompt__btn install-prompt__btn--primary"
        onClick={() => void promptInstall()}
      >
        Installer
      </button>
      <button
        type="button"
        className="install-prompt__btn"
        onClick={() => setDismissed(true)}
        aria-label="Ne pas installer"
      >
        Plus tard
      </button>
    </div>
  );
}
