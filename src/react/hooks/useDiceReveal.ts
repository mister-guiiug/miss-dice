import { useEffect, useRef, useState } from 'react';
import { rollDie } from '../../dice/random';
import { buildRollSchedule } from '../../dice/rollSchedule';

const REVEAL_DURATION_MS = 700;

export interface UseDiceRevealOptions {
  values: number[];
  held: boolean[];
  sides?: number;
  /** Incrémenté à chaque lancer côté moteur : déclenche l'animation. */
  nonce: number;
  reducedMotion?: boolean;
}

export interface DiceReveal {
  /** Faces à afficher : valeurs du moteur, ou défilement pendant l'animation. */
  display: number[];
  /** Vrai pendant le défilement. */
  rolling: boolean;
}

/**
 * Anime un lancer pour un plateau de jeu : quand `nonce` change, les dés
 * non gardés défilent ~700 ms puis se figent sur les valeurs du moteur.
 * Hors animation, `display` suit directement les valeurs (réinitialisations
 * de tour incluses). Le moteur reste seule source de vérité.
 */
export function useDiceReveal({
  values,
  held,
  sides = 6,
  nonce,
  reducedMotion = false,
}: UseDiceRevealOptions): DiceReveal {
  const [animating, setAnimating] = useState(false);
  const [flicker, setFlicker] = useState(values);

  // Dernières valeurs/gardes lues au déclenchement, via ref pour garder
  // l'effet (qui ne dépend que de `nonce`) conforme aux règles des hooks.
  const ref = useRef({ values, held, sides });
  useEffect(() => {
    ref.current = { values, held, sides };
  });

  useEffect(() => {
    if (nonce === 0 || reducedMotion) return;
    const snapshot = ref.current;
    const ids: number[] = [];
    // Tout passe par des timers (jamais de setState synchrone dans le
    // corps de l'effet) : on amorce l'animation au premier tick.
    ids.push(
      window.setTimeout(() => {
        setAnimating(true);
        setFlicker(snapshot.values);
      }, 0)
    );
    for (const at of buildRollSchedule({ durationMs: REVEAL_DURATION_MS })) {
      ids.push(
        window.setTimeout(() => {
          setFlicker(
            snapshot.values.map((v, i) =>
              snapshot.held[i] ? v : rollDie(snapshot.sides)
            )
          );
        }, at)
      );
    }
    ids.push(window.setTimeout(() => setAnimating(false), REVEAL_DURATION_MS));
    return () => ids.forEach(id => clearTimeout(id));
  }, [nonce, reducedMotion]);

  return { display: animating ? flicker : values, rolling: animating };
}
