import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { Sheet } from './Sheet';
import { messages } from '../../i18n/messages';
import { renderWithProviders } from '../../test/renderWithProviders';

/**
 * Ce qui est testé ici, c'est le BRANCHEMENT de miss-dice sur le `Sheet` du
 * socle — pas le comportement du socle, qui a ses propres tests dans un vrai
 * DOM. Trois choses lui appartiennent en propre : le titre visible qui
 * étiquette le dialogue, l'habillage local (miss-dice n'importe pas
 * `components.css`), et le libellé de fermeture dans les six langues.
 */
describe('<Sheet />', () => {
  it('expose un dialogue modal étiqueté par son titre VISIBLE', () => {
    renderWithProviders(
      <Sheet open onClose={() => {}} title="Réglages">
        <button type="button">Un réglage</button>
      </Sheet>
    );

    const dialog = screen.getByRole('dialog', { name: 'Réglages' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // Étiqueté PAR le titre affiché, pas par une copie du texte : c'est ce que
    // l'ancien `aria-label` faisait, en écrivant « Réglages » deux fois.
    expect(dialog).toHaveAttribute('aria-labelledby');
    const titre = screen.getByRole('heading', { name: 'Réglages' });
    expect(dialog.getAttribute('aria-labelledby')).toBe(titre.id);
  });

  it('déplace le focus dans le panneau à l’ouverture', () => {
    renderWithProviders(
      <Sheet open onClose={() => {}} title="X">
        <button type="button">B</button>
      </Sheet>
    );
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('ferme sur Échap', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <Sheet open onClose={onClose} title="X">
        <button type="button">B</button>
      </Sheet>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * LE CLIC SUR LE FOND, ET LE PIÈGE QUI VA AVEC.
   *
   * Le voile est un ENFANT qui recouvre toute la racine (`inset: 0` dans
   * `styles.css`) : en navigateur, c'est LUI que le hit-testing désigne comme
   * cible d'un clic dans le fond, jamais la racine. jsdom, lui, ne fait aucun
   * hit-testing — il laisse dispatcher où l'on veut. Un test qui viserait
   * seulement la racine passerait donc au vert tout en laissant la feuille
   * infermable en vrai (mesuré par deux apps du parc pendant la campagne
   * `components.css`). On vise donc la topologie RÉELLE : le voile.
   */
  it('ferme au clic sur le voile, la cible réelle d’un clic dans le fond', () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <Sheet open onClose={onClose} title="X">
        <button type="button">B</button>
      </Sheet>
    );

    const voile = container.querySelector('[data-dwc="sheet-backdrop"]');
    expect(voile).not.toBeNull();
    fireEvent.mouseDown(voile!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ne ferme pas sur un geste né DANS le panneau', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <Sheet open onClose={onClose} title="X">
        <button type="button">B</button>
      </Sheet>
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: 'B' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ne rend rien quand fermé', () => {
    const { container } = renderWithProviders(
      <Sheet open={false} onClose={() => {}} title="X">
        <button type="button">B</button>
      </Sheet>
    );
    expect(container.querySelector('[data-dwc="sheet"]')).toBeNull();
  });

  it('épingle le pied hors du corps défilant', () => {
    const { container } = renderWithProviders(
      <Sheet
        open
        onClose={() => {}}
        title="X"
        footer={<button type="button">Fermer</button>}
      >
        <p>corps</p>
      </Sheet>
    );

    const pied = container.querySelector('[data-dwc="sheet-footer"]');
    const corps = container.querySelector('[data-dwc="sheet-body"]');
    expect(pied).not.toBeNull();
    // Le pied est un FRÈRE du corps, pas un descendant : c'est ce qui lui
    // permet de rester visible pendant que le corps défile.
    expect(corps?.contains(pied!)).toBe(false);
  });

  /**
   * LES SIX LANGUES. `react/labels` du socle ne livre que `fr` et `en` et fait
   * retomber toute locale inconnue sur le FRANÇAIS, en silence. Sans le
   * `closeLabel` que passe notre `Sheet`, quatre utilisateurs sur six liraient
   * « Fermer » sur le bouton de fermeture. Même parti pris que le bandeau de
   * mise à jour : on ne s'en remet jamais au dictionnaire du paquet.
   *
   * PORTÉE EXACTE DE CE TEST, vérifiée par mutation : en retirant
   * `closeLabel`, **quatre** cas tombent (es, de, it, pt) et deux passent
   * encore. `fr` et `en` survivent parce que l'app et le socle emploient par
   * coïncidence le même mot (« Fermer », « Close ») — ce ne sont pas eux que
   * ce test protège, et il ne faut pas croire qu'il les couvre. Ce sont bien
   * les quatre langues absentes du dictionnaire du paquet qui sont en jeu.
   */
  it.each(['fr', 'en', 'es', 'de', 'it', 'pt'] as const)(
    'locale « %s » : le bouton de fermeture porte le libellé de l’app',
    locale => {
      renderWithProviders(
        <Sheet open onClose={() => {}} title="X">
          <p>corps</p>
        </Sheet>,
        locale
      );

      expect(
        screen.getByRole('button', { name: messages[locale].settings.close })
      ).toBeInTheDocument();
    }
  );
});
