import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiceFace } from './DiceFace';
import { DIE_VALUES } from '../../types';

describe('<DiceFace /> — D6 (points)', () => {
  it('affiche exactement N points allumés pour la face N', () => {
    for (const value of DIE_VALUES) {
      const { container, unmount } = render(
        <DiceFace value={value} sides={6} />
      );
      expect(container.querySelectorAll('.dice-pip--on')).toHaveLength(value);
      expect(container.querySelectorAll('.dice-pip')).toHaveLength(9);
      unmount();
    }
  });

  it('expose un libellé accessible mentionnant le nombre (pas que la couleur)', () => {
    render(<DiceFace value={4} sides={6} />);
    expect(
      screen.getByRole('img', { name: /dé à 6 faces, résultat 4/i })
    ).toBeInTheDocument();
  });
});

describe('<DiceFace /> — autres dés (chiffre)', () => {
  it('affiche le chiffre et la silhouette pour un D20', () => {
    const { container } = render(<DiceFace value={17} sides={20} />);
    const numeral = container.querySelector('.dice-numeral');
    expect(numeral?.textContent).toBe('17');
    expect(container.querySelector('.dice-pip')).toBeNull();
    expect(container.querySelector('.dice-face--shaped')).not.toBeNull();
  });

  it('annonce l’état de roulement plutôt qu’une valeur figée', () => {
    render(<DiceFace value={3} sides={8} rolling />);
    expect(
      screen.getByRole('img', { name: /en train de rouler/i })
    ).toBeInTheDocument();
  });
});
