import { useCallback } from 'react';
import { useSettings } from '../../settings/settingsStore';
import { localeToBcp47, speak } from '../../a11y/speech';

/**
 * Renvoie une fonction d'annonce vocale, active uniquement si l'option
 * « annonce vocale » est cochée. La langue suit la locale de l'interface.
 */
export function useSpeak(): (text: string) => void {
  const { tts, locale } = useSettings();
  return useCallback(
    (text: string) => {
      if (tts) speak(text, localeToBcp47(locale));
    },
    [tts, locale]
  );
}
