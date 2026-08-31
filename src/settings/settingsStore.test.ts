import { afterEach, describe, expect, it } from 'vitest';
import { settingsStore } from './settingsStore';

afterEach(() => {
  settingsStore.setSounds(false);
  settingsStore.setColorblind(false);
});

/**
 * Le thème et la langue ne sont plus ici : ils appartiennent à
 * `ThemeProvider` et `I18nProvider`, qui les persistent sous leur propre clé.
 * Le pont depuis l'ancien blob est couvert par `legacyMigration.test.ts`.
 */
describe('settingsStore', () => {
  it('a des valeurs par défaut sûres', () => {
    expect(typeof settingsStore.get().sounds).toBe('boolean');
    expect(typeof settingsStore.get().colorblind).toBe('boolean');
  });

  it('met à jour et persiste un réglage', () => {
    settingsStore.setSounds(true);
    expect(settingsStore.get().sounds).toBe(true);
    const raw = JSON.parse(localStorage.getItem('miss-dice:settings')!) as {
      sounds: boolean;
    };
    expect(raw.sounds).toBe(true);
  });

  it('ne persiste plus ni thème ni langue', () => {
    settingsStore.setColorblind(true);
    const raw = JSON.parse(
      localStorage.getItem('miss-dice:settings')!
    ) as Record<string, unknown>;
    expect(raw).not.toHaveProperty('theme');
    expect(raw).not.toHaveProperty('locale');
  });

  it('active/désactive les sons', () => {
    settingsStore.setSounds(true);
    expect(settingsStore.get().sounds).toBe(true);
  });
});
