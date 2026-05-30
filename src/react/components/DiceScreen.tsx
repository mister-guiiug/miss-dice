import type { CSSProperties } from 'react';
import { DiceTray } from './DiceTray';
import { useDiceRoll } from '../hooks/useDiceRoll';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useShakeToRoll } from '../hooks/useShakeToRoll';
import { useSettings } from '../../settings/settingsStore';
import { useI18n } from '../../i18n/useI18n';
import { colorForValue } from '../../dice/colors';
import { dieType } from '../../dice/diceTypes';
import { vibrate, HAPTIC_ROLL, HAPTIC_RESULT } from '../feedback/haptics';
import { useSound } from '../hooks/useSound';
import { rollStatsStore } from '../../stats/rollStats';

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

/**
 * Écran principal : toute la surface est une zone de tap. Un appui (ou une
 * secousse, si activée) lance les dés ; pendant l'animation les déclencheurs
 * suivants sont ignorés (géré dans useDiceRoll). Le fond se teinte de la
 * couleur du premier dé pour un ressenti immersif.
 */
export function DiceScreen() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const { haptics, sides, diceCount, shake } = useSettings();
  const playSound = useSound();

  const { displayValues, values, status, isRolling, roll } = useDiceRoll({
    count: diceCount,
    sides,
    reducedMotion,
    onRollStart: () => {
      if (haptics) vibrate(HAPTIC_ROLL);
      playSound('roll');
    },
    onResult: rolled => {
      if (haptics) vibrate(HAPTIC_RESULT);
      playSound('result');
      rollStatsStore.record(rolled);
    },
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
      ? diceCount > 1
        ? t('screen.hintIdleMany', { count: diceCount, die: type.label })
        : t('screen.hintIdleOne', { die: type.label })
      : isRolling
        ? t('screen.rolling')
        : t('screen.relaunch');

  const buttonLabel = isRolling
    ? t('a11y.rollingNow')
    : diceCount > 1
      ? t('a11y.rollMany', { count: diceCount, total })
      : t('a11y.rollOne', { value: values[0] ?? 1 });

  return (
    <main className="dice-screen" style={screenStyle}>
      <button
        type="button"
        className="dice-screen__zone"
        data-status={status}
        onClick={roll}
        aria-label={buttonLabel}
      >
        <DiceTray values={displayValues} sides={sides} status={status} />

        <p className="dice-screen__meta" aria-hidden="true">
          {showTotal && (
            <span className="dice-screen__total">
              {t('screen.total', { total })}
            </span>
          )}
          <span className="dice-screen__hint">{hint}</span>
        </p>
      </button>

      {/* Annonce du résultat pour les lecteurs d'écran, sans dépendre du
          visuel ni de la couleur. */}
      <p className="sr-only" role="status" aria-live="polite">
        {status === 'result'
          ? diceCount > 1
            ? t('a11y.resultMany', { values: values.join(', '), total })
            : t('a11y.resultOne', { value: values[0] ?? 1 })
          : ''}
      </p>
    </main>
  );
}
