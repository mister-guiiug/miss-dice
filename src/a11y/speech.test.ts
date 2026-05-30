import { afterEach, describe, expect, it, vi } from 'vitest';
import { localeToBcp47, speak } from './speech';

describe('localeToBcp47', () => {
  it('mappe les locales connues', () => {
    expect(localeToBcp47('fr')).toBe('fr-FR');
    expect(localeToBcp47('de')).toBe('de-DE');
    expect(localeToBcp47('pt')).toBe('pt-PT');
  });

  it('retombe sur en-US pour une locale inconnue', () => {
    expect(localeToBcp47('xx')).toBe('en-US');
  });
});

describe('speak', () => {
  const original = globalThis.speechSynthesis;
  const originalUtter = globalThis.SpeechSynthesisUtterance;

  afterEach(() => {
    Object.defineProperty(globalThis, 'speechSynthesis', {
      value: original,
      configurable: true,
    });
    globalThis.SpeechSynthesisUtterance = originalUtter;
  });

  it('ne fait rien si l’API est absente', () => {
    Object.defineProperty(globalThis, 'speechSynthesis', {
      value: undefined,
      configurable: true,
    });
    expect(() => speak('coucou', 'fr-FR')).not.toThrow();
  });

  it('annule puis énonce le texte avec la bonne langue', () => {
    const cancel = vi.fn();
    const speakFn = vi.fn();
    Object.defineProperty(globalThis, 'speechSynthesis', {
      value: { cancel, speak: speakFn },
      configurable: true,
    });
    class FakeUtterance {
      lang = '';
      constructor(public text: string) {}
    }
    globalThis.SpeechSynthesisUtterance =
      FakeUtterance as unknown as typeof SpeechSynthesisUtterance;

    speak('Résultat : 5', 'fr-FR');
    expect(cancel).toHaveBeenCalledOnce();
    expect(speakFn).toHaveBeenCalledOnce();
    const utterance = speakFn.mock.calls[0]![0] as FakeUtterance;
    expect(utterance.text).toBe('Résultat : 5');
    expect(utterance.lang).toBe('fr-FR');
  });

  it('ignore un texte vide', () => {
    const speakFn = vi.fn();
    Object.defineProperty(globalThis, 'speechSynthesis', {
      value: { cancel: vi.fn(), speak: speakFn },
      configurable: true,
    });
    speak('', 'fr-FR');
    expect(speakFn).not.toHaveBeenCalled();
  });
});
