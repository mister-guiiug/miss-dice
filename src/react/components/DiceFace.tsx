import type { CSSProperties } from 'react';
import type { DieValue } from '../../types';
import { isPipFilled } from '../../dice/pips';
import { faceColor } from '../../dice/colors';

interface DiceFaceProps {
  value: DieValue;
  /** Vrai pendant le défilement : adoucit le rendu (flou/échelle en CSS). */
  rolling?: boolean;
}

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Rendu pur d'une face de dé : neuf cellules en grille 3×3 dont seules
 * les bonnes s'allument (cf. PIP_LAYOUT). Aucune logique métier ici —
 * la valeur et l'état d'animation arrivent en props.
 */
export function DiceFace({ value, rolling = false }: DiceFaceProps) {
  const { bg, bgDeep, hue } = faceColor(value);
  const style = {
    '--face-bg': bg,
    '--face-bg-deep': bgDeep,
  } as CSSProperties;

  // Libellé non dépendant de la couleur : le nombre est énoncé,
  // la teinte n'est qu'un complément.
  const label = rolling ? 'Dé en train de rouler' : `Face ${value} (${hue})`;

  return (
    <div
      className={`dice-face${rolling ? ' dice-face--rolling' : ''}`}
      style={style}
      role="img"
      aria-label={label}
    >
      <div className="dice-face__grid" aria-hidden="true">
        {CELLS.map(cell => (
          <span
            key={cell}
            className={`dice-pip${isPipFilled(value, cell) ? ' dice-pip--on' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
