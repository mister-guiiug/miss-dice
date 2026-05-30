import { DiceFace } from './DiceFace';
import type { DieValue, RollStatus } from '../../types';

interface DiceTrayProps {
  values: DieValue[];
  sides: number;
  status: RollStatus;
}

/**
 * Dispose un ou plusieurs dés. La taille des tuiles s'adapte au nombre de
 * dés via l'attribut `data-count` (réglée en CSS). Chaque dé a sa propre
 * scène animée mais partage le statut global du lancer.
 */
export function DiceTray({ values, sides, status }: DiceTrayProps) {
  return (
    <div className="dice-tray" data-count={values.length}>
      {values.map((value, index) => (
        <div
          className="dice-stage"
          data-status={status}
          // Index stable : le nombre de dés ne change pas pendant un lancer.
          key={index}
        >
          <DiceFace
            value={value}
            sides={sides}
            rolling={status === 'rolling'}
          />
        </div>
      ))}
    </div>
  );
}
