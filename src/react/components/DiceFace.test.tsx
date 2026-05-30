import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiceFace } from './DiceFace';
import { DIE_VALUES } from '../../types';

describe('<DiceFace />', () => {
  it('affiche exactement N points allumés pour la face N', () => {
    for (const value of DIE_VALUES) {
      const { container, unmount } = render(<DiceFace value={value} />);
      const on = container.querySelectorAll('.dice-pip--on');
      expect(on).toHaveLength(value);
      // La grille comporte toujours 9 cellules (allumées ou non).
      expect(container.querySelectorAll('.dice-pip')).toHaveLength(9);
      unmount();
    }
  });

  it('expose un libellé accessible mentionnant le nombre (pas que la couleur)', () => {
    render(<DiceFace value={4} />);
    expect(screen.getByRole('img', { name: /face 4/i })).toBeInTheDocument();
  });

  it('annonce l’état de roulement plutôt qu’une valeur figée', () => {
    render(<DiceFace value={3} rolling />);
    expect(screen.getByRole('img', { name: /roule/i })).toBeInTheDocument();
  });
});
