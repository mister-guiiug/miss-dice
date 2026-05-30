import { useCallback } from 'react';
import { useSettings } from '../settings/settingsStore';
import { translate, type Locale, type MessageKey } from './messages';

export interface I18n {
  locale: Locale;
  /** Traduit une clé typée, avec interpolation des `{paramètres}`. */
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
}

/**
 * Accès réactif à la traduction. La locale vit dans le store de
 * préférences (persistée) ; changer de langue re-rend tous les
 * consommateurs. Pas de Provider nécessaire : le store est déjà global.
 */
export function useI18n(): I18n {
  const { locale } = useSettings();
  const t = useCallback<I18n['t']>(
    (key, params) => translate(locale, key, params),
    [locale]
  );
  return { locale, t };
}
