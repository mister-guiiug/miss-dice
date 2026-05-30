import { registerSW } from 'virtual:pwa-register';
import { settingsStore } from './settings/settingsStore';
import { translate } from './i18n/messages';

const BANNER_ID = 'sw-update-banner';

/**
 * Bandeau « nouvelle version disponible ». registerType: 'prompt' fait
 * qu'une mise à jour n'est PAS appliquée en silence : on laisse l'app
 * shell déjà chargée fonctionner, et on propose de recharger.
 */
function showUpdateBanner(update: (reload?: boolean) => void): void {
  if (document.getElementById(BANNER_ID)) return;

  const locale = settingsStore.get().locale;
  const bar = document.createElement('div');
  bar.id = BANNER_ID;
  bar.className = 'sw-update-banner';
  bar.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.textContent = translate(locale, 'update.available');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = translate(locale, 'update.action');
  button.addEventListener('click', () => update(true));

  bar.append(text, button);
  document.body.appendChild(bar);
}

/**
 * Enregistre le service worker en production. En dev on le désactive et
 * on purge les anciens enregistrements pour éviter qu'un SW mis en cache
 * ne serve des assets périmés pendant le développement.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(regs => regs.forEach(r => r.unregister()))
        .catch(() => {});
    }
    return;
  }

  const updateSW = registerSW({
    onNeedRefresh() {
      showUpdateBanner(updateSW);
    },
    onOfflineReady() {
      // L'app shell est en cache : le mode hors-ligne est prêt.
    },
  });
}
