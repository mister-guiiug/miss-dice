import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sheet } from './Sheet';

describe('<Sheet /> (a11y)', () => {
  it('expose un dialogue modal étiqueté et déplace le focus dedans', () => {
    render(
      <Sheet open onClose={() => {}} label="Réglages">
        <button type="button">Fermer</button>
      </Sheet>
    );
    const dialog = screen.getByRole('dialog', { name: 'Réglages' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Fermer' })).toHaveFocus();
  });

  it('ferme sur Échap', () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} label="X">
        <button type="button">B</button>
      </Sheet>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ne rend rien quand fermé', () => {
    const { container } = render(
      <Sheet open={false} onClose={() => {}} label="X">
        <button type="button">B</button>
      </Sheet>
    );
    expect(container.firstChild).toBeNull();
  });
});
