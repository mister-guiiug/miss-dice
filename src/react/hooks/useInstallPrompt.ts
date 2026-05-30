import { useEffect, useState } from 'react';

/** Event non standard exposé par Chromium pour l'installation PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallPrompt {
  /** Vrai si le navigateur propose une installation et qu'on n'est pas déjà installé. */
  canInstall: boolean;
  /** Déclenche l'invite native ; résout à true si l'utilisateur a accepté. */
  promptInstall: () => Promise<boolean>;
}

function isStandalone(): boolean {
  return (
    globalThis.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari (propriété non standard)
    (globalThis.navigator as { standalone?: boolean })?.standalone === true
  );
}

/**
 * Capture l'événement `beforeinstallprompt` (Chromium) pour offrir un
 * bouton d'installation discret. Sur les navigateurs sans cet événement
 * (Firefox, iOS), `canInstall` reste faux et l'UI ne s'affiche pas.
 */
export function useInstallPrompt(): InstallPrompt {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    return outcome === 'accepted';
  };

  return { canInstall: deferred !== null, promptInstall };
}
