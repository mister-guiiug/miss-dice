import { useCallback } from 'react';
import { speak } from '@mister-guiiug/dev-pwa-config/speech';
import { useSettings } from '../../settings/settingsStore';
import { useI18n } from '../../i18n/useI18n';

/**
 * Renvoie une fonction d'annonce vocale, active uniquement si l'option
 * « annonce vocale » est cochée. La langue suit la locale de l'interface,
 * lue depuis `I18nProvider` et non depuis `settingsStore`.
 *
 * LE MODULE VIENT DU SOCLE DEPUIS LA 6.6.0. miss-dice en portait une copie
 * (`src/a11y/speech.ts`) — c'est d'ailleurs elle qui avait été promue, avec
 * ses deux défauts. Le socle les corrige tous les deux et ajoute le choix de
 * la voix, que cette copie n'avait pas : garder deux versions du même module
 * revenait à corriger deux fois.
 *
 * La conversion `fr` → `fr-FR` se fait dans le socle : on lui passe la locale
 * telle quelle.
 */
export function useSpeak(): (text: string) => void {
  const { tts } = useSettings();
  const { locale } = useI18n();
  return useCallback(
    (text: string) => {
      if (tts) speak(text, locale);
    },
    [tts, locale]
  );
}
