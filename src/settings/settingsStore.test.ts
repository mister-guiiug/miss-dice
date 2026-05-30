import { afterEach, describe, expect, it } from 'vitest';
import { settingsStore } from './settingsStore';

afterEach(() => {
  settingsStore.setTheme('auto');
  settingsStore.setSounds(false);
});

describe('settingsStore — thème et sons', () => {
  it('a des valeurs par défaut sûres', () => {
    expect(['auto', 'light', 'dark']).toContain(settingsStore.get().theme);
    expect(typeof settingsStore.get().sounds).toBe('boolean');
  });

  it('met à jour et persiste le thème', () => {
    settingsStore.setTheme('dark');
    expect(settingsStore.get().theme).toBe('dark');
    const raw = JSON.parse(localStorage.getItem('miss-dice:settings')!);
    expect(raw.theme).toBe('dark');
  });

  it('ignore un thème invalide (repli sur auto)', () => {
    settingsStore.setTheme('néon' as never);
    expect(settingsStore.get().theme).toBe('auto');
  });

  it('active/désactive les sons', () => {
    settingsStore.setSounds(true);
    expect(settingsStore.get().sounds).toBe(true);
  });
});
