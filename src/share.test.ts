import { afterEach, describe, expect, it, vi } from 'vitest';
import { shareOrCopy } from './share';

afterEach(() => vi.unstubAllGlobals());

describe('shareOrCopy', () => {
  it('utilise le partage natif quand il est disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share });
    await expect(shareOrCopy({ url: 'x' })).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ url: 'x' });
  });

  it('ne recopie pas si l’utilisateur annule le partage', async () => {
    const writeText = vi.fn();
    const share = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('cancel'), { name: 'AbortError' })
      );
    vi.stubGlobal('navigator', { share, clipboard: { writeText } });
    await expect(shareOrCopy({ url: 'x' })).resolves.toBe('shared');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('replie sur le presse-papiers quand le partage est absent', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await expect(
      shareOrCopy({ title: 'Miss Dice', url: 'https://x' })
    ).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('Miss Dice\nhttps://x');
  });

  it('échoue proprement sans partage ni presse-papiers', async () => {
    vi.stubGlobal('navigator', {});
    await expect(shareOrCopy({ url: 'x' })).resolves.toBe('failed');
  });
});
