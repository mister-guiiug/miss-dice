import { dieShape } from '../../dice/polyhedra';

/**
 * La forme en 3D d'un dé, sous son nom dans le sélecteur de type.
 *
 * DÉCORATIVE (`aria-hidden`) : le bouton porte déjà son nom accessible,
 * « Dé à 20 faces ». Tout est dessiné en `currentColor`, et l'ombrage est une
 * opacité : la forme suit la couleur du bouton — actif ou non, thème clair ou
 * sombre, et chacune des trois palettes — sans une couleur à maintenir.
 */
export function DieShape3D({ sides }: { sides: number }) {
  return (
    <svg
      className="die-shape"
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      {dieShape(sides).map(face => (
        <path
          key={face.d}
          d={face.d}
          // Une face dos à la lumière reste lisible ; en face, elle s'éclaire.
          fillOpacity={(0.14 + 0.5 * face.light).toFixed(2)}
        />
      ))}
    </svg>
  );
}
