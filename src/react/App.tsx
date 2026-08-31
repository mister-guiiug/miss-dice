import { Suspense, lazy } from 'react';
import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { InstallPrompt } from './components/InstallPrompt';
import { ModeMenu } from './components/ModeMenu';
import { useAppMode } from '../app/appMode';

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
 * les jeux (Yahtzee, 421).
 *
 * Le thème et la langue ne sont plus appliqués ici : `ThemeProvider` et
 * `I18nProvider` (montés dans `main.tsx`) posent respectivement `data-theme`
 * et `lang`/`dir` sur `<html>`. L'effet qui recopiait la locale dans
 * `documentElement.lang` faisait double emploi avec le provider du socle.
 */
export function App() {
  const mode = useAppMode();

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
