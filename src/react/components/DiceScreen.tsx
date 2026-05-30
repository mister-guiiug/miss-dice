import type { CSSProperties } from 'react';
import { DiceFace } from './DiceFace';
import { useDiceRoll } from '../hooks/useDiceRoll';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSettings } from '../../settings/settingsStore';
import { faceColor } from '../../dice/colors';
import { vibrate, HAPTIC_ROLL, HAPTIC_RESULT } from '../feedback/haptics';

/**
 * Écran principal : toute la surface est une zone de tap. Un appui lance
 * le dé ; pendant l'animation les taps suivants sont ignorés (géré dans
 * useDiceRoll). Le fond se teinte discrètement de la couleur de la face
 * courante pour un ressenti immersif.
 */
export function DiceScreen() {
  const reducedMotion = useReducedMotion();
  const { haptics } = useSettings();

  const { value, displayValue, status, isRolling, roll } = useDiceRoll({
    reducedMotion,
    onRollStart: () => haptics && vibrate(HAPTIC_ROLL),
    onResult: () => haptics && vibrate(HAPTIC_RESULT),
  });

  const tint = faceColor(displayValue);
  const screenStyle = {
    '--screen-tint': tint.bg,
    '--screen-tint-deep': tint.bgDeep,
  } as CSSProperties;

  const hint =
    status === 'idle'
      ? 'Touche l’écran pour lancer le dé'
      : isRolling
        ? 'Le dé roule…'
        : 'Touche pour relancer';

  return (
    <main className="dice-screen" style={screenStyle}>
      <button
        type="button"
        className="dice-screen__zone"
        data-status={status}
        onClick={roll}
        aria-label={
          isRolling
            ? 'Lancer en cours'
            : `Lancer le dé. Dernier résultat : ${value}`
        }
      >
        <div className="dice-stage" data-status={status}>
          <DiceFace value={displayValue} rolling={isRolling} />
        </div>
        <p className="dice-screen__hint" aria-hidden="true">
          {hint}
        </p>
      </button>

      {/* Annonce du résultat pour les lecteurs d'écran, sans dépendre du
          visuel ni de la couleur. */}
      <p className="sr-only" role="status" aria-live="polite">
        {status === 'result' ? `Résultat : ${value}` : ''}
      </p>
    </main>
  );
}
