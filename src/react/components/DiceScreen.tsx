import type { CSSProperties } from 'react';
import { DiceTray } from './DiceTray';
import { useDiceRoll } from '../hooks/useDiceRoll';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useShakeToRoll } from '../hooks/useShakeToRoll';
import { useSettings } from '../../settings/settingsStore';
import { colorForValue } from '../../dice/colors';
import { dieType } from '../../dice/diceTypes';
import { vibrate, HAPTIC_ROLL, HAPTIC_RESULT } from '../feedback/haptics';

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

/**
 * Écran principal : toute la surface est une zone de tap. Un appui (ou une
 * secousse, si activée) lance les dés ; pendant l'animation les déclencheurs
 * suivants sont ignorés (géré dans useDiceRoll). Le fond se teinte de la
 * couleur du premier dé pour un ressenti immersif.
 */
export function DiceScreen() {
  const reducedMotion = useReducedMotion();
  const { haptics, sides, diceCount, shake } = useSettings();

  const { displayValues, values, status, isRolling, roll } = useDiceRoll({
    count: diceCount,
    sides,
    reducedMotion,
    onRollStart: () => haptics && vibrate(HAPTIC_ROLL),
    onResult: () => haptics && vibrate(HAPTIC_RESULT),
  });

  // Secouer pour lancer (si l'option est active). Désactivé pendant un
  // lancer pour ne pas empiler les déclenchements.
  useShakeToRoll(shake && !isRolling, roll);

  const type = dieType(sides);
  const tint = colorForValue(displayValues[0] ?? 1);
  const screenStyle = {
    '--screen-tint': tint.bg,
    '--screen-tint-deep': tint.bgDeep,
  } as CSSProperties;

  const total = sum(values);
  const showTotal = status === 'result' && diceCount > 1;

  const hint =
    status === 'idle'
      ? `Touche l’écran pour lancer ${diceCount > 1 ? `${diceCount} ${type.label}` : `un ${type.label}`}`
      : isRolling
        ? 'Les dés roulent…'
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
            : `Lancer ${diceCount > 1 ? `${diceCount} dés` : 'le dé'}. ${
                diceCount > 1
                  ? `Total précédent : ${total}`
                  : `Dernier résultat : ${values[0] ?? 1}`
              }`
        }
      >
        <DiceTray values={displayValues} sides={sides} status={status} />

        <p className="dice-screen__meta" aria-hidden="true">
          {showTotal && (
            <span className="dice-screen__total">Total {total}</span>
          )}
          <span className="dice-screen__hint">{hint}</span>
        </p>
      </button>

      {/* Annonce du résultat pour les lecteurs d'écran, sans dépendre du
          visuel ni de la couleur. */}
      <p className="sr-only" role="status" aria-live="polite">
        {status === 'result'
          ? diceCount > 1
            ? `Résultats : ${values.join(', ')}. Total : ${total}.`
            : `Résultat : ${values[0]}`
          : ''}
      </p>
    </main>
  );
}
