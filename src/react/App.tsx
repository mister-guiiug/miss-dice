import { Suspense, lazy, useEffect } from 'react';
import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { InstallPrompt } from './components/InstallPrompt';
import { ModeMenu } from './components/ModeMenu';
import { useAppMode } from '../app/appMode';
import { useI18n } from '../i18n/useI18n';
import { useApplyTheme } from './hooks/useTheme';

// Les jeux sont chargés à la demande : le lancer libre (écran par défaut)
// garde un bundle initial minimal et un accès au dé immédiat.
const YahtzeeGame = lazy(() =>
  import('./components/games/YahtzeeGame').then(m => ({
    default: m.YahtzeeGame,
  }))
);
const Dice421Game = lazy(() =>
  import('./components/games/Dice421Game').then(m => ({
    default: m.Dice421Game,
  }))
);
const PigGame = lazy(() =>
  import('./components/games/PigGame').then(m => ({
    default: m.PigGame,
  }))
);
const NotationRoller = lazy(() =>
  import('./components/NotationRoller').then(m => ({
    default: m.NotationRoller,
  }))
);
const DecideScreen = lazy(() =>
  import('./components/DecideScreen').then(m => ({ default: m.DecideScreen }))
);

const LAZY = {
  yahtzee: YahtzeeGame,
  dice421: Dice421Game,
  pig: PigGame,
  notation: NotationRoller,
  decide: DecideScreen,
} as const;

/**
 * Aiguille entre le lancer libre (écran par défaut, cliquable partout) et
 * les jeux (Yahtzee, 421). Applique le thème et la langue choisis.
 */
export function App() {
  const { locale } = useI18n();
  const mode = useAppMode();
  useApplyTheme();

  // Garde l'attribut lang du document aligné sur la langue choisie.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  if (mode !== 'roll') {
    const Screen = LAZY[mode];
    return (
      <Suspense fallback={<div className="game-shell" aria-busy="true" />}>
        <Screen />
      </Suspense>
    );
  }

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
