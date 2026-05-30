import { useCallback, useEffect, useRef, useState } from 'react';
import type { DieValue, RollStatus } from '../../types';
import { defaultRng, rollDice, type Rng } from '../../dice/random';
import {
  buildRollSchedule,
  DEFAULT_ROLL_DURATION_MS,
} from '../../dice/rollSchedule';

export interface UseDiceRollOptions {
  /** Nombre de dés lancés simultanément (défaut 1). */
  count?: number;
  /** Nombre de faces de chaque dé (défaut 6). */
  sides?: number;
  /** Si vrai, aucun défilement : les faces finales s'affichent directement. */
  reducedMotion?: boolean;
  /** Durée du défilement (ms). Ignorée en mouvement réduit. */
  durationMs?: number;
  /** Source d'aléa injectable (tests). */
  rng?: Rng;
  /** Appelé quand un lancer démarre (utile pour un retour haptique). */
  onRollStart?: () => void;
  /** Appelé avec les faces finales une fois les dés posés. */
  onResult?: (values: DieValue[]) => void;
}

export interface DiceRoll {
  /** Dernières faces validées (stables hors animation). */
  values: DieValue[];
  /** Faces à afficher maintenant : défilent pendant le lancer, sinon = values. */
  displayValues: DieValue[];
  status: RollStatus;
  isRolling: boolean;
  /** Déclenche un lancer. Sans effet si un lancer est déjà en cours. */
  roll: () => void;
}

function initialValues(count: number): DieValue[] {
  return Array.from({ length: Math.max(1, count) }, () => 1);
}

/**
 * RollAnimationController : orchestre l'état d'un lancer multi-dés (repos
 * → défilement → résultat). Sépare strictement le « quoi » (tirage via
 * `rollDice`, cadence via `buildRollSchedule`) du « comment c'est rendu ».
 * Réentrance bloquée pendant l'animation pour neutraliser les doubles taps.
 */
export function useDiceRoll(options: UseDiceRollOptions = {}): DiceRoll {
  const {
    count = 1,
    sides = 6,
    reducedMotion = false,
    durationMs = DEFAULT_ROLL_DURATION_MS,
    rng = defaultRng,
    onRollStart,
    onResult,
  } = options;

  const [values, setValues] = useState<DieValue[]>(() => initialValues(count));
  const [displayValues, setDisplayValues] = useState<DieValue[]>(() =>
    initialValues(count)
  );
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

  // Changer de type ou de nombre de dés au repos réinitialise l'affichage.
  useEffect(() => {
    if (rollingRef.current) return;
    setValues(initialValues(count));
    setDisplayValues(initialValues(count));
    setStatus('idle');
  }, [count, sides]);

  const roll = useCallback(() => {
    if (rollingRef.current) return; // anti double-tap
    const final = rollDice(count, sides, rng);
    onRollStart?.();

    if (reducedMotion) {
      setValues(final);
      setDisplayValues(final);
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
        window.setTimeout(
          () => setDisplayValues(rollDice(count, sides, rng)),
          at
        )
      );
    }

    timers.current.push(
      window.setTimeout(() => {
        rollingRef.current = false;
        setValues(final);
        setDisplayValues(final);
        setStatus('result');
        onResult?.(final);
      }, durationMs)
    );
  }, [
    count,
    sides,
    reducedMotion,
    durationMs,
    rng,
    onRollStart,
    onResult,
    clearTimers,
  ]);

  return {
    values,
    displayValues: status === 'rolling' ? displayValues : values,
    status,
    isRolling: status === 'rolling',
    roll,
  };
}
