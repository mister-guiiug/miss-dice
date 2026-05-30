import { describe, expect, it } from 'vitest';
import { playSound } from './sounds';

describe('playSound', () => {
  it('reste silencieux et sans erreur si WebAudio est absent', () => {
    // jsdom ne fournit pas AudioContext → no-op garanti.
    expect(() => {
      playSound('roll');
      playSound('result');
      playSound('win');
    }).not.toThrow();
  });
});
