import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

class FakeUtterance {
  lang = '';
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

/** Fausse synthèse : `speaking`/`pending` pilotent la branche testée. */
function poseSynthese(etat: { speaking?: boolean; pending?: boolean } = {}) {
  const cancel = vi.fn();
  const speakFn = vi.fn();
  Object.defineProperty(globalThis, 'speechSynthesis', {
    value: { cancel, speak: speakFn, speaking: false, pending: false, ...etat },
    configurable: true,
  });
  globalThis.SpeechSynthesisUtterance =
    FakeUtterance as unknown as typeof SpeechSynthesisUtterance;
  return { cancel, speakFn };
}

describe('speak', () => {
  const original = globalThis.speechSynthesis;
  const originalUtter = globalThis.SpeechSynthesisUtterance;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('ignore un texte vide', () => {
    const { speakFn } = poseSynthese();
    speak('', 'fr-FR');
    expect(speakFn).not.toHaveBeenCalled();
  });

  it('énonce SANS attendre quand rien ne parle, et sans annuler', () => {
    const { cancel, speakFn } = poseSynthese({ speaking: false });
    speak('Résultat : 5', 'fr-FR');

    // La garde évite de payer le délai de reprise pour rien.
    expect(cancel).not.toHaveBeenCalled();
    expect(speakFn).toHaveBeenCalledOnce();
    const utterance = speakFn.mock.calls[0]![0] as FakeUtterance;
    expect(utterance.text).toBe('Résultat : 5');
    expect(utterance.lang).toBe('fr-FR');
  });

  /**
   * LE DÉFAUT CORRIGÉ. `cancel()` est asynchrone : l'ancien code enchaînait
   * `speak()` dans le même tour de boucle, et le moteur avalait le début —
   * parfois tout — de la nouvelle phrase. Sur Android, ce qui sautait était
   * la FIN, c'est-à-dire le nombre.
   */
  it('n’énonce PAS dans le même tour de boucle qu’un cancel', () => {
    const { cancel, speakFn } = poseSynthese({ speaking: true });
    speak('Résultat : 5', 'fr-FR');

    expect(cancel).toHaveBeenCalledOnce();
    expect(speakFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(120);
    expect(speakFn).toHaveBeenCalledOnce();
    expect((speakFn.mock.calls[0]![0] as FakeUtterance).text).toBe(
      'Résultat : 5'
    );
  });

  /**
   * L'AUTRE MOITIÉ DU CORRECTIF : un utterance que plus rien ne référence
   * peut être ramassé par le GC pendant qu'il parle, et le son se coupe. Le
   * module en garde une référence jusqu'à `onend`/`onerror` — leur présence
   * est la trace observable de cette tenue. Le ramassage lui-même n'est pas
   * observable depuis jsdom.
   */
  it('branche de quoi relâcher sa référence à la fin', () => {
    const { speakFn } = poseSynthese();
    speak('Résultat : 5', 'fr-FR');
    const utterance = speakFn.mock.calls[0]![0] as FakeUtterance;

    expect(typeof utterance.onend).toBe('function');
    expect(typeof utterance.onerror).toBe('function');
    expect(() => utterance.onend?.()).not.toThrow();
  });

  it('un lancer plus récent remplace celui qui attendait son tour', () => {
    const { speakFn } = poseSynthese({ speaking: true });
    speak('Résultat : 1', 'fr-FR');
    speak('Résultat : 2', 'fr-FR');

    vi.advanceTimersByTime(120);
    expect(speakFn).toHaveBeenCalledOnce();
    expect((speakFn.mock.calls[0]![0] as FakeUtterance).text).toBe(
      'Résultat : 2'
    );
  });
});
