import { DiceFace } from '../DiceFace';
import { useDiceReveal } from '../../hooks/useDiceReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useI18n } from '../../../i18n/useI18n';

interface GameDiceProps {
  values: number[];
  held: boolean[];
  sides?: number;
  /** Nonce du moteur : change à chaque lancer pour déclencher l'animation. */
  nonce: number;
  onToggleHold: (index: number) => void;
  /** Autorise le tap « garder » (faux avant le 1er lancer ou pendant l'anim). */
  canHold: boolean;
}

/**
 * Rangée de dés d'un jeu : chaque dé se garde/relâche au tap. Réutilise
 * DiceFace pour le rendu et useDiceReveal pour le défilement de lancer.
 */
export function GameDice({
  values,
  held,
  sides = 6,
  nonce,
  onToggleHold,
  canHold,
}: GameDiceProps) {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const { display, rolling } = useDiceReveal({
    values,
    held,
    sides,
    nonce,
    reducedMotion,
  });

  return (
    <div className="game-dice" data-count={values.length}>
      {display.map((value, i) => (
        <button
          type="button"
          key={i}
          className={`game-die${held[i] ? ' game-die--held' : ''}`}
          onClick={() => onToggleHold(i)}
          disabled={!canHold || rolling}
          aria-pressed={held[i]}
          aria-label={t('game.toggleHold', { n: i + 1 })}
        >
          <DiceFace value={value} sides={sides} rolling={rolling && !held[i]} />
          {held[i] && <span className="game-die__badge">{t('game.held')}</span>}
        </button>
      ))}
    </div>
  );
}
