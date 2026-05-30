import { describe, expect, it } from 'vitest';
import {
  LOCALES,
  LOCALE_LABELS,
  detectLocale,
  messages,
  translate,
} from './messages';

/** Aplati récursivement les clés « a.b.c » d'un objet de messages. */
function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flattenKeys(value, path);
  });
}

describe('messages', () => {
  it('définit toutes les langues annoncées', () => {
    for (const locale of LOCALES) {
      expect(messages[locale]).toBeDefined();
      expect(LOCALE_LABELS[locale]).not.toHaveLength(0);
    }
  });

  it('a exactement le même jeu de clés dans chaque langue (parité)', () => {
    const reference = flattenKeys(messages.fr).sort();
    for (const locale of LOCALES) {
      expect(flattenKeys(messages[locale]).sort()).toEqual(reference);
    }
  });

  it('ne laisse aucune valeur vide', () => {
    for (const locale of LOCALES) {
      for (const key of flattenKeys(messages[locale])) {
        expect(translate(locale, key as never).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('translate', () => {
  it('interpole les paramètres', () => {
    expect(translate('fr', 'a11y.resultOne', { value: 5 })).toBe(
      'Résultat : 5'
    );
    expect(translate('en', 'dice.name', { sides: 20 })).toBe('20-sided die');
    expect(translate('es', 'screen.total', { total: 12 })).toBe('Total 12');
  });

  it('renvoie la clé brute si elle est introuvable', () => {
    expect(translate('fr', 'does.not.exist' as never)).toBe('does.not.exist');
  });
});

describe('detectLocale', () => {
  it('retient une valeur stockée valide', () => {
    expect(detectLocale('es')).toBe('es');
    expect(detectLocale('en')).toBe('en');
  });

  it('ignore une valeur stockée invalide et reste sur une langue connue', () => {
    expect(LOCALES).toContain(detectLocale('xx'));
    expect(LOCALES).toContain(detectLocale(null));
  });
});
