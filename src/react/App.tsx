import { useEffect } from 'react';
import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { InstallPrompt } from './components/InstallPrompt';
import { ModeMenu } from './components/ModeMenu';
import { YahtzeeGame } from './components/games/YahtzeeGame';
import { Dice421Game } from './components/games/Dice421Game';
import { useAppMode } from '../app/appMode';
import { useI18n } from '../i18n/useI18n';

/**
 * Aiguille entre le lancer libre (écran par défaut, cliquable partout) et
 * les jeux (Yahtzee, 421). En mode lancer, les contrôles en surimpression
 * (jeux, réglages, installation) sont des frères du dé pour ne pas
 * déclencher de lancer au tap.
 */
export function App() {
  const { locale } = useI18n();
  const mode = useAppMode();

  // Garde l'attribut lang du document aligné sur la langue choisie.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (mode === 'yahtzee') return <YahtzeeGame />;
  if (mode === 'dice421') return <Dice421Game />;

  return (
    <div className="app">
      <DiceScreen />
      <div className="app__overlay">
        <ModeMenu />
        <SettingsDrawer />
        <InstallPrompt />
      </div>
    </div>
  );
}
