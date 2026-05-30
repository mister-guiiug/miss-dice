import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { InstallPrompt } from './components/InstallPrompt';

/**
 * Compose l'écran de dé (base plein écran, cliquable partout) et les
 * contrôles en surimpression (réglages, invite d'installation). Les
 * overlays sont des frères du dé, donc un tap dessus ne lance pas le dé.
 */
export function App() {
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
