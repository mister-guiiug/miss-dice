import { useEffect } from 'react';
import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { InstallPrompt } from './components/InstallPrompt';
import { useI18n } from '../i18n/useI18n';

/**
 * Compose l'écran de dé (base plein écran, cliquable partout) et les
 * contrôles en surimpression (réglages, invite d'installation). Les
 * overlays sont des frères du dé, donc un tap dessus ne lance pas le dé.
 */
export function App() {
  const { locale } = useI18n();

  // Garde l'attribut lang du document aligné sur la langue choisie
  // (utile pour les lecteurs d'écran et la sélection de police).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="app">
      <DiceScreen />
      <div className="app__overlay">
        <SettingsDrawer />
        <InstallPrompt />
      </div>
    </div>
  );
}
