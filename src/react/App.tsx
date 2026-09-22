import { Suspense, lazy } from 'react';
import { DiceScreen } from './components/DiceScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { DicePicker } from './components/DicePicker';
import { PwaInstallPrompt } from '@mister-guiiug/dev-pwa-config/react/pwa-install-prompt';
import { ConsentBanner } from '@mister-guiiug/dev-pwa-config/react/consent-banner';
import { usePageViews } from '@mister-guiiug/dev-pwa-config/react/use-page-views';
import { ModeMenu } from './components/ModeMenu';
import { FamilyLinks } from './components/FamilyLinks';
import { useAppMode } from '../app/appMode';
import { colisRecu } from '../games/transfer';

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

/*
 * L'ACCUEIL D'UNE PARTIE REÇUE EST CHARGÉ À LA DEMANDE, et la demande est
 * rare : sur cent ouvertures de l'app, quatre-vingt-dix-neuf n'ont aucun lien
 * de reprise dans l'URL. Le monter d'office coûtait 7,7 ko gzip au démarrage -
 * il tire la boîte de dialogue du socle - pour un écran que presque personne
 * ne verra. `colisRecu()` est, lui, une simple lecture de `location.search`
 * faite à l'import : elle nettoie l'URL tôt, sans rien peser.
 */
const RepriseRecue = lazy(() =>
  import('./components/RepriseRecue').then(m => ({ default: m.RepriseRecue }))
);

/** Un lien de reprise était-il présent au chargement ? Figé pour la session. */
const REPRISE_ATTENDUE = colisRecu() !== null;

/** Rend l'accueil de la partie reçue, et seulement s'il y en a une. */
function AccueilReprise() {
  if (!REPRISE_ATTENDUE) return null;
  return (
    <Suspense fallback={null}>
      <RepriseRecue />
    </Suspense>
  );
}

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

  /*
   * CETTE APP N'A PAS DE ROUTEUR : un seul écran, un seul chemin. Le hook est
   * donc appelé avec la racine, et il n'envoie QU'UNE vue par chargement - il
   * dédoublonne sur le chemin, donc un re-rendu ne recompte rien.
   *
   * SANS CET APPEL, POSTHOG NE RECEVRAIT RIEN DU TOUT. `initAnalytics` pose
   * `capture_pageview: false` pour que la première vue passe par ce hook comme
   * les autres ; dans une app sans routeur, il n'y a personne d'autre pour
   * l'envoyer, et le projet resterait vide.
   *
   * Ne fait rien tant que le consentement n'est pas accordé.
   */
  usePageViews('/');

  if (mode !== 'roll') {
    const Screen = LAZY[mode];
    return (
      <>
        {/* MONTÉ DANS LES DEUX BRANCHES. Un lien de reprise peut porter
            `?play=` : l'app s'ouvre alors directement sur le jeu, et
            l'accueil de la partie reçue ne doit pas dépendre de l'écran
            sur lequel on atterrit. */}
        <AccueilReprise />
        <Suspense fallback={<div className="game-shell" aria-busy="true" />}>
          <Screen />
        </Suspense>
      </>
    );
  }

  return (
    <div className="app">
      <AccueilReprise />
      <DiceScreen />
      <div className="app__overlay">
        <ModeMenu />
        {/* Entre les deux boutons d'angle, dans l'ordre de lecture : jeux,
            dés, réglages. */}
        <DicePicker />
        <SettingsDrawer />
        {/* PAS DE `dismissKey` À REPRENDRE : le bandeau maison ne persistait
            rien - un `useState`, donc un refus oublié au rechargement suivant.
            Le socle, lui, reporte d'un mois et s'arrête après trois fois. */}
        <PwaInstallPrompt />
        {/* Les deux liens de la règle famille sur le PREMIER écran : ils
            n'existaient que dans le tiroir de réglages, derrière un bouton.
            Dans l'overlay, qui ne capte pas les taps : la surface de lancer
            reste entière.
            APRÈS l'invite d'installation, qui occupe le même bas d'écran : le
            sélecteur `~` de la feuille de style efface les liens tant qu'elle
            est affichée, et il exige cet ordre-là dans le DOM. */}
        <FamilyLinks />
        {/* Une `region`, pas une boîte modale : elle ne recouvre rien et ne
            piège pas le focus - la surface de lancer reste entière. Ne rend
            RIEN tant que `VITE_POSTHOG_KEY` n'est pas posée. */}
        <ConsentBanner
          posthogKey={import.meta.env.VITE_POSTHOG_KEY}
          loader={() => import('posthog-js/dist/module.slim.js')}
        />
      </div>
    </div>
  );
}
