import { useCallback, useEffect, useRef, useState } from 'react';
import type { DieValue, RollStatus } from '../../types';
import { defaultRng, rollDie, type Rng } from '../../dice/random';
import {
  buildRollSchedule,
  DEFAULT_ROLL_DURATION_MS,
} from '../../dice/rollSchedule';

export interface UseDiceRollOptions {
  /** Si vrai, aucun défilement : la face finale s'affiche directement. */
  reducedMotion?: boolean;
  /** Durée du défilement (ms). Ignorée en mouvement réduit. */
  durationMs?: number;
  /** Source d'aléa injectable (tests). */
  rng?: Rng;
  /** Appelé quand un lancer démarre (utile pour un retour haptique). */
  onRollStart?: () => void;
  /** Appelé avec la face finale une fois le dé posé. */
  onResult?: (value: DieValue) => void;
}

export interface DiceRoll {
  /** Dernière face validée (stable hors animation). */
  value: DieValue;
  /** Face à afficher maintenant : défile pendant le lancer, sinon = value. */
  displayValue: DieValue;
  status: RollStatus;
  isRolling: boolean;
  /** Déclenche un lancer. Sans effet si un lancer est déjà en cours. */
  roll: () => void;
}

/**
 * RollAnimationController : orchestre l'état d'un lancer (repos →
 * défilement → résultat). Sépare strictement le « quoi » (tirage via
 * `rollDie`, cadence via `buildRollSchedule`) du « comment c'est rendu »
 * (laissé aux composants). Réentrance bloquée pendant l'animation pour
 * neutraliser les doubles taps.
 */
export function useDiceRoll(options: UseDiceRollOptions = {}): DiceRoll {
  const {
    reducedMotion = false,
    durationMs = DEFAULT_ROLL_DURATION_MS,
    rng = defaultRng,
    onRollStart,
    onResult,
  } = options;

  const [value, setValue] = useState<DieValue>(1);
  const [displayValue, setDisplayValue] = useState<DieValue>(1);
  const [status, setStatus] = useState<RollStatus>('idle');

  const timers = useRef<number[]>([]);
  // Miroir synchrone du statut : évite la fenêtre de re-render pendant
  // laquelle deux taps rapprochés liraient encore l'ancien `status`.
  const rollingRef = useRef(false);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
  }, []);

  // Nettoyage au démontage : aucun timer ne survit au composant.
  useEffect(() => clearTimers, [clearTimers]);

  const roll = useCallback(() => {
    if (rollingRef.current) return; // anti double-tap
    const final = rollDie(rng);
    onRollStart?.();

    if (reducedMotion) {
      setValue(final);
      setDisplayValue(final);
      setStatus('result');
      onResult?.(final);
      return;
    }

    rollingRef.current = true;
    clearTimers();
    setStatus('rolling');

    const schedule = buildRollSchedule({ durationMs });
    for (const at of schedule) {
      timers.current.push(
        window.setTimeout(() => setDisplayValue(rollDie(rng)), at)
      );
    }

    timers.current.push(
      window.setTimeout(() => {
        rollingRef.current = false;
        setValue(final);
        setDisplayValue(final);
        setStatus('result');
        onResult?.(final);
      }, durationMs)
    );
  }, [reducedMotion, durationMs, rng, onRollStart, onResult, clearTimers]);

  return {
    value,
    displayValue: status === 'rolling' ? displayValue : value,
    status,
    isRolling: status === 'rolling',
    roll,
  };
}
