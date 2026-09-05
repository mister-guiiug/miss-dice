import type { ReactNode } from 'react';
import { Sheet as DwcSheet } from '@mister-guiiug/dev-pwa-config/react/sheet';
import { useI18n } from '../../i18n/useI18n';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Titre VISIBLE, qui étiquette aussi le dialogue (`aria-labelledby`). */
  title: string;
  children: ReactNode;
  /** Barre d'actions épinglée en bas, visible pendant que le corps défile. */
  footer?: ReactNode;
}

/**
 * Feuille modale de miss-dice, bâtie sur `react/sheet` du socle.
 *
 * CE QUI DISPARAÎT. Quatre-vingts lignes qui refaisaient, à la main, le piège
 * de focus (`FOCUSABLE`, bouclage Tab/Maj+Tab), l'écoute d'Échap et la
 * restitution du focus. Le socle ajoute ce que la copie n'avait pas :
 *  - `aria-labelledby` pointant sur le titre VISIBLE, au lieu d'un `aria-label`
 *    qui recopiait le même texte une seconde fois ;
 *  - un bouton de fermeture dans l'en-tête, que ni ce composant ni `ModeMenu`
 *    n'offraient (on ne pouvait fermer le menu des jeux qu'au clavier ou en
 *    visant le fond) ;
 *  - un pied ÉPINGLÉ, qui reste visible pendant que le corps défile, et un
 *    en-tête qui ne défile plus avec le contenu ;
 *  - la fermeture au clic sur le fond qui accepte DEUX cibles, la racine et le
 *    voile. La copie locale n'en gérait qu'une (`onClick` sur la racine avec
 *    `stopPropagation` sur le panneau) et fermait donc, elle, correctement —
 *    mais sur `click` et non `mousedown` : un glisser-déposer né dans le
 *    panneau et relâché sur le fond fermait la feuille. Plus maintenant.
 *
 * Le socle apporte aussi un VERROU DE DÉFILEMENT du fond — sans effet ici, et
 * il faut le dire : `styles.css` pose déjà `body { overflow: hidden }` (l'écran
 * entier est une surface de jeu). Vérifié en navigateur : le verrou repose
 * `hidden` puis restaure la valeur d'origine, qui est la même.
 *
 * CE QUI RESTE LOCAL, ET POURQUOI. **L'HABILLAGE.** miss-dice n'importe PAS
 * `components.css` (design maison assumé) : le `Sheet` du socle y serait
 * entièrement nu — ni fond, ni voile, ni position, ni arrondi. Comme pour le
 * bandeau de mise à jour avant lui, on garde le CSS de `styles.css` et on le
 * branche par `className` sur la racine ; les règles visent ensuite les
 * `[data-dwc="sheet-*"]` du socle. La poignée de glissement
 * (`.sheet__handle`), qui n'a pas d'équivalent dans le paquet, est redessinée
 * en `::before` sur le panneau : elle survit sans nœud DOM.
 *
 * LE LIBELLÉ DU BOUTON DE FERMETURE EST TOUJOURS SURCHARGÉ. `react/labels` du
 * socle ne livre que `fr` et `en`, et fait retomber toute locale inconnue sur
 * le FRANÇAIS, en silence. miss-dice parle six langues : sans `closeLabel`,
 * quatre utilisateurs sur six liraient « Fermer ». Même parti pris que
 * `AppUpdatesProvider` — on ne s'en remet jamais au dictionnaire du paquet.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const { t } = useI18n();

  return (
    <DwcSheet
      open={open}
      onClose={onClose}
      title={title}
      closeLabel={t('settings.close')}
      className="sheet-root"
      footer={footer}
    >
      {children}
    </DwcSheet>
  );
}
