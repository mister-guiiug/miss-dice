import { useState, type ReactNode } from 'react';
import { useWakeLock } from '@mister-guiiug/dev-pwa-config/react/use-wake-lock';
import { ConfirmDialog } from '@mister-guiiug/dev-pwa-config/react/confirm-dialog';
import { appModeStore } from '../../../app/appMode';
import { useI18n } from '../../../i18n/useI18n';
import { RepriseSheet } from './RepriseSheet';
import type { GameKey } from '../../../games/persistence';

/* Icônes de la barre, au gabarit des deux autres de l'app (ModeMenu,
   SettingsDrawer) : 22 px dans un viewBox 24, `currentColor`. Elles
   remplacent les glyphes `←`, `↶` et `↺`, dont le dessin dépendait de la
   police de l'appareil. */

/** Quitter la partie. Une CROIX, pas une flèche : `←` et `↶` se lisaient
 *  tous deux « reviens en arrière » alors que l'un sort et l'autre annule. */
function QuitIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

/** Annuler le dernier coup. */
function UndoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 13 5 9l4-4" />
      <path d="M5 9h8a5 5 0 0 1 0 10h-3" />
    </svg>
  );
}

/** Continuer la partie sur un autre appareil. Deux appareils, une flèche. */
function RepriseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4" width="8" height="12" rx="1.5" />
      <rect x="14" y="8" width="7.5" height="12" rx="1.5" />
      <path d="M11.5 6.5h2.5M12.5 5.2l1.8 1.3-1.8 1.3" />
    </svg>
  );
}

/** Nouvelle partie. */
function NewGameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 5.5a6.5 6.5 0 1 0 6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 2.6 16 5.5 12 8.4Z" fill="currentColor" />
    </svg>
  );
}

interface GameShellProps {
  title: string;
  onNewGame?: () => void;
  /**
   * Demander confirmation avant `onNewGame`. **Vrai par défaut**, et c'est
   * délibéré : ce bouton appelle `quit()`, qui appelle `clearGame()` - il
   * EFFACE la sauvegarde. Oublier la prop doit donner la confirmation, pas
   * la perte. Les écrans de fin de partie la passent à `false` : là, il n'y
   * a plus rien à perdre, et une boîte de dialogue n'y serait que du bruit.
   */
  confirmNewGame?: boolean;
  onUndo?: () => void;
  canUndo?: boolean;
  /**
   * La partie à transmettre pour une reprise ailleurs (lien + QR).
   *
   * PORTÉE PAR LE CADRE, ET NON PAR CHAQUE JEU : les trois écrans ont déjà
   * leur mode et leur état sous la main, et l'action est la même pour tous.
   * La poser ici, c'est un bouton au même endroit dans les trois jeux, et une
   * feuille à tenir plutôt que trois. Absente - écran de fin de partie,
   * notamment - le bouton ne s'affiche pas : il n'y a plus rien à continuer.
   */
  reprise?: { mode: GameKey; state: unknown };
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Cadre commun aux jeux : barre supérieure (quitter, annuler, titre,
 * nouvelle partie), corps défilant et pied d'écran fixe.
 */
export function GameShell({
  title,
  onNewGame,
  confirmNewGame = true,
  onUndo,
  canUndo = false,
  reprise,
  footer,
  children,
}: GameShellProps) {
  const { t } = useI18n();
  const [confirmation, setConfirmation] = useState(false);
  const [partage, setPartage] = useState(false);
  // Empêche l'écran de s'éteindre pendant une partie (pass-and-play).
  useWakeLock(true);

  const demanderNouvellePartie = () => {
    if (!onNewGame) return;
    if (confirmNewGame) setConfirmation(true);
    else onNewGame();
  };

  return (
    <div className="game-shell">
      <header className="game-shell__bar">
        <button
          type="button"
          className="icon-button"
          aria-label={t('common.quit')}
          onClick={() => appModeStore.leave()}
        >
          <QuitIcon />
        </button>
        {onUndo && (
          <button
            type="button"
            className="icon-button"
            aria-label={t('game.undo')}
            disabled={!canUndo}
            onClick={onUndo}
          >
            <UndoIcon />
          </button>
        )}
        <h1 className="game-shell__title">{title}</h1>
        {reprise && (
          <button
            type="button"
            className="icon-button"
            aria-label={t('reprise.title')}
            onClick={() => setPartage(true)}
          >
            <RepriseIcon />
          </button>
        )}
        {onNewGame ? (
          <button
            type="button"
            className="icon-button"
            aria-label={t('common.newGame')}
            onClick={demanderNouvellePartie}
          >
            <NewGameIcon />
          </button>
        ) : (
          <span className="game-shell__spacer" aria-hidden="true" />
        )}
      </header>
      {/* `tabIndex` SUR UNE ZONE QUI DÉFILE : c'est le remède de la règle axe
          `scrollable-region-focusable`. Sans lui, personne au clavier ne peut
          faire défiler ce corps avant le premier lancer - toutes les cases de
          la grille y sont `disabled`, donc hors du parcours, et la zone n'a
          plus un seul enfant focalisable à offrir.

          INCONDITIONNEL, ET C'EST UN CHOIX. Ne le poser que quand la zone
          déborde vraiment supposerait de mesurer en continu : le contenu
          change à chaque lancer, et le débordement dépend aussi du zoom, de la
          taille de police et de l'orientation. Une mesure en retard d'une
          image, et l'arrêt de tabulation manque à l'instant où l'on tabule.
          Le prix payé est un arrêt de tabulation en trop quand tout tient à
          l'écran ; le prix évité est une zone dont on ne peut pas sortir.

          DEUX RÈGLES D'ACCESSIBILITÉ S'OPPOSENT ICI, et celle d'axe gagne.
          `jsx-a11y/no-noninteractive-tabindex` existe pour empêcher de rendre
          focalisable un `div` quelconque ; une zone qui DÉFILE n'en est pas
          un, et c'est l'exception que la règle d'axe décrit. Le silence est
          donc posé à la ligne, avec sa raison, plutôt que laissé à traîner
          dans le flot des avertissements. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- remède de la règle axe scrollable-region-focusable */}
      <div className="game-shell__body" tabIndex={0}>
        {children}
      </div>
      {footer && <div className="game-shell__footer">{footer}</div>}

      {/* Les libellés viennent de l'i18n de l'app, pas de ceux du socle :
          `I18nProvider` pose son `LabelsProvider` SANS surcharge, donc les
          défauts du paquet resteraient en français dans les six langues. */}
      <ConfirmDialog
        open={confirmation}
        title={t('game.newGameConfirmTitle')}
        message={t('game.newGameConfirmBody')}
        confirmLabel={t('common.newGame')}
        cancelLabel={t('common.cancel')}
        destructive
        onCancel={() => setConfirmation(false)}
        onConfirm={() => {
          setConfirmation(false);
          onNewGame?.();
        }}
      />

      {reprise && (
        <RepriseSheet
          open={partage}
          onClose={() => setPartage(false)}
          mode={reprise.mode}
          state={reprise.state}
        />
      )}
    </div>
  );
}
