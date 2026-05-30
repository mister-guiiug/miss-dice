import { useEffect } from 'react';

interface KeyboardRollHandlers {
  /** Lancer (Espace / Entrée). */
  onRoll: () => void;
  /** Ajouter un dé (+ / = / Flèche haut). */
  onAddDie?: () => void;
  /** Retirer un dé (- / Flèche bas). */
  onRemoveDie?: () => void;
  /** Actif uniquement quand l'écran de lancer est au premier plan. */
  enabled?: boolean;
}

/** Vrai si la frappe vise un champ de saisie : on ne capture pas alors. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

/** Vrai si une feuille modale est ouverte : les touches lui appartiennent. */
function isModalOpen(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.querySelector('[role="dialog"]') !== null
  );
}

/**
 * Raccourcis clavier desktop pour le lancer libre :
 *  - Espace / Entrée → lancer
 *  - + / = / ↑       → ajouter un dé
 *  - − / ↓           → retirer un dé
 *
 * Neutralisé pendant la saisie dans un champ et tant qu'une feuille
 * (réglages, jeux) est ouverte, pour ne pas voler le focus clavier.
 */
export function useKeyboardRoll({
  onRoll,
  onAddDie,
  onRemoveDie,
  enabled = true,
}: KeyboardRollHandlers): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat ||
        isTypingTarget(event.target) ||
        isModalOpen()
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Spacebar':
        case 'Enter':
          event.preventDefault();
          onRoll();
          break;
        case '+':
        case '=':
        case 'ArrowUp':
          if (onAddDie) {
            event.preventDefault();
            onAddDie();
          }
          break;
        case '-':
        case 'ArrowDown':
          if (onRemoveDie) {
            event.preventDefault();
            onRemoveDie();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onRoll, onAddDie, onRemoveDie, enabled]);
}
