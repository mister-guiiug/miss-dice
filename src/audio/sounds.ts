/**
 * Petits sons synthétisés en WebAudio — aucun fichier asset, tout est
 * généré. Entièrement gardé : silencieux si l'API est absente (jamais
 * d'erreur). L'AudioContext n'est créé qu'au premier son (geste utilisateur).
 */
export type SoundName = 'roll' | 'result' | 'win';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

/** Une note brève avec enveloppe (attaque rapide, extinction douce). */
function blip(
  c: AudioContext,
  at: number,
  freq: number,
  duration: number,
  type: OscillatorType = 'triangle',
  gain = 0.06
): void {
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(env).connect(c.destination);
  osc.start(at);
  osc.stop(at + duration + 0.02);
}

export function playSound(name: SoundName): void {
  const c = getCtx();
  if (!c) return;
  try {
    if (c.state === 'suspended') void c.resume();
    const t = c.currentTime;
    switch (name) {
      case 'roll':
        blip(c, t, 200, 0.06, 'square', 0.04);
        blip(c, t + 0.05, 150, 0.06, 'square', 0.04);
        break;
      case 'result':
        blip(c, t, 520, 0.09);
        blip(c, t + 0.09, 720, 0.13);
        break;
      case 'win':
        blip(c, t, 523, 0.12);
        blip(c, t + 0.12, 659, 0.12);
        blip(c, t + 0.24, 784, 0.22);
        break;
    }
  } catch {
    /* ignore */
  }
}
