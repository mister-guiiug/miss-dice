import { beforeEach, describe, expect, it } from 'vitest';
import {
  LEGACY_SETTINGS_KEY,
  LOCALE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  migrateLegacySettings,
} from './legacyMigration';
import { LOCALES } from '../i18n/messages';

/**
 * Ce que ces tests protègent : LE CHOIX DÉJÀ FAIT PAR L'UTILISATEUR.
 *
 * Adopter `react/i18n` et `react/use-theme` déplace la langue et le thème hors
 * du blob `miss-dice:settings` vers deux clés nues. Sans pont, l'utilisateur
 * qui avait choisi l'espagnol et le thème clair rouvre l'app en français
 * système — UNE SEULE FOIS, donc sans que personne ne remonte le bug. C'est
 * exactement le défaut que `legacyKeys` prétend fermer côté socle, et qu'il ne
 * peut PAS fermer ici : voir le dernier test.
 */
function seedBlob(fields: Record<string, unknown>): void {
  localStorage.setItem(
    LEGACY_SETTINGS_KEY,
    JSON.stringify({ haptics: true, sides: 6, ...fields })
  );
}

describe('migrateLegacySettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reprend la langue enregistrée dans le blob', () => {
    seedBlob({ locale: 'es' });
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es');
  });

  it('traduit le thème « auto » de l’app en « system » du socle', () => {
    seedBlob({ theme: 'auto' });
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('reprend un thème explicite tel quel', () => {
    seedBlob({ theme: 'light' });
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('reprend les deux d’un seul coup', () => {
    seedBlob({ locale: 'pt', theme: 'dark' });
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('pt');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  /**
   * LA GARDE QUI COMPTE. Sans elle, le blob — qui survit à la migration —
   * réimposerait l'ancien choix à CHAQUE rechargement : l'utilisateur passe en
   * clair, ferme l'app, la rouvre en sombre, indéfiniment.
   */
  it('ne réécrit jamais par-dessus un choix déjà migré', () => {
    seedBlob({ locale: 'es', theme: 'dark' });
    localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    migrateLegacySettings(LOCALES);

    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('ignore une langue que l’app ne sert pas', () => {
    seedBlob({ locale: 'xx' });
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('ignore un thème hors vocabulaire', () => {
    seedBlob({ theme: 'néon' });
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('ne bronche pas sans blob, ni sur un blob illisible', () => {
    expect(() => migrateLegacySettings(LOCALES)).not.toThrow();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    localStorage.setItem(LEGACY_SETTINGS_KEY, '{pas du JSON');
    expect(() => migrateLegacySettings(LOCALES)).not.toThrow();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    localStorage.setItem(LEGACY_SETTINGS_KEY, '"une chaîne"');
    expect(() => migrateLegacySettings(LOCALES)).not.toThrow();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  /**
   * LA CONTRE-ÉPREUVE : pourquoi ce module existe au lieu d'une option.
   *
   * `useTheme({ legacyKeys: [...] })` du socle relit d'anciennes clés en
   * attendant sous chacune une CHAÎNE NUE (`'dark'`). Le thème de miss-dice
   * était un CHAMP d'un blob JSON. On rejoue ici la lecture que ferait
   * `legacyKeys` : elle ne peut pas reconnaître de thème, et le socle
   * retomberait en silence sur son défaut.
   */
  it('legacyKeys du socle n’aurait rien pu récupérer d’un blob JSON', () => {
    seedBlob({ theme: 'dark' });

    const luParLegacyKeys = localStorage.getItem(LEGACY_SETTINGS_KEY);
    expect(luParLegacyKeys).toContain('"theme":"dark"');
    // Ce que le socle compare : la valeur ENTIÈRE, pas un champ dedans.
    expect(['light', 'dark', 'system']).not.toContain(luParLegacyKeys);

    // Notre pont, lui, va chercher le champ.
    migrateLegacySettings(LOCALES);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });
});
