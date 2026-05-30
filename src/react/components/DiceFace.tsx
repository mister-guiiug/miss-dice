import type { CSSProperties } from 'react';
import type { DieValue } from '../../types';
import { isPipFilled } from '../../dice/pips';
import { colorForValue } from '../../dice/colors';
import { dieType } from '../../dice/diceTypes';
import { useI18n } from '../../i18n/useI18n';
import { useSettings } from '../../settings/settingsStore';

interface DiceFaceProps {
  value: DieValue;
  /** Nombre de faces du dé : décide pips (6) ou chiffre, et la silhouette. */
  sides?: number;
  /** Vrai pendant le défilement : adoucit le rendu (flou/échelle en CSS). */
  rolling?: boolean;
}

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Rendu d'une face de dé. Pour un D6 : neuf cellules en grille 3×3 dont
 * seules les bonnes s'allument. Pour les autres dés : le chiffre, dans la
 * silhouette du polyèdre. Aucune logique métier — valeur, type et état
 * d'animation arrivent en props ; seul le libellé a11y est traduit.
 */
export function DiceFace({ value, sides = 6, rolling = false }: DiceFaceProps) {
  const { t } = useI18n();
  const { colorblind } = useSettings();
  const type = dieType(sides);
  const { bg, bgDeep, key } = colorForValue(value);

  // Mode daltonien : un repère chiffré redondant sur les dés à pips (où la
  // couleur, sinon, est le seul indice rapide de la valeur d'une face).
  const showValueBadge = colorblind && type.render === 'pips' && !rolling;

  const style = {
    '--face-bg': bg,
    '--face-bg-deep': bgDeep,
    ...(type.clipPath ? { clipPath: type.clipPath } : {}),
  } as CSSProperties;

  // Libellé non dépendant de la couleur : le nombre est énoncé,
  // la teinte n'est qu'un complément.
  const dieName = t('dice.name', { sides: type.sides });
  const label = rolling
    ? t('a11y.faceRolling', { die: dieName })
    : t('a11y.faceResult', { die: dieName, value, color: t(`colors.${key}`) });

  return (
    <div
      className={`dice-face dice-face--d${type.sides}${type.clipPath ? ' dice-face--shaped' : ''}${rolling ? ' dice-face--rolling' : ''}`}
      style={style}
      role="img"
      aria-label={label}
    >
      {type.render === 'pips' ? (
        <div className="dice-face__grid" aria-hidden="true">
          {CELLS.map(cell => (
            <span
              key={cell}
              className={`dice-pip${isPipFilled(value, cell) ? ' dice-pip--on' : ''}`}
            />
          ))}
        </div>
      ) : (
        <span
          className="dice-numeral"
          aria-hidden="true"
          style={{ '--nudge-y': `${type.nudgeY ?? 0}%` } as CSSProperties}
        >
          {value}
        </span>
      )}
      {showValueBadge && (
        <span className="dice-face__badge" aria-hidden="true">
          {value}
        </span>
      )}
    </div>
  );
}
