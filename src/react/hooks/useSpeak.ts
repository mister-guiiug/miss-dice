import { useCallback } from 'react';
import { useSettings } from '../../settings/settingsStore';
import { useI18n } from '../../i18n/useI18n';
import { localeToBcp47, speak } from '../../a11y/speech';

/**
 * Renvoie une fonction d'annonce vocale, active uniquement si l'option
 * « annonce vocale » est cochée. La langue suit la locale de l'interface,
 * désormais lue depuis `I18nProvider` et non plus depuis `settingsStore`.
 */
export function useSpeak(): (text: string) => void {
  const { tts } = useSettings();
  const { locale } = useI18n();
  return useCallback(
    (text: string) => {
      if (tts) speak(text, localeToBcp47(locale));
    },
    [tts, locale]
  );
}
