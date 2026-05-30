import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useI18n } from '../../i18n/useI18n';

/**
 * Pastille d'installation discrète, en bas de l'écran. N'apparaît que si
 * le navigateur propose l'installation et tant que l'utilisateur ne l'a
 * pas écartée. Élément autonome, hors de la zone de tap du dé.
 */
export function InstallPrompt() {
  const { t } = useI18n();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div
      className="install-prompt"
      role="dialog"
      aria-label={t('install.text')}
    >
      <span className="install-prompt__text">{t('install.text')}</span>
      <button
        type="button"
        className="install-prompt__btn install-prompt__btn--primary"
        onClick={() => void promptInstall()}
      >
        {t('install.action')}
      </button>
      <button
        type="button"
        className="install-prompt__btn"
        onClick={() => setDismissed(true)}
        aria-label={t('install.dismiss')}
      >
        {t('install.later')}
      </button>
    </div>
  );
}
