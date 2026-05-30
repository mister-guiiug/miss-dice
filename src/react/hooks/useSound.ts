import { useCallback } from 'react';
import { useSettings } from '../../settings/settingsStore';
import { playSound, type SoundName } from '../../audio/sounds';

/** Renvoie une fonction de lecture de son, active seulement si l'option l'est. */
export function useSound(): (name: SoundName) => void {
  const { sounds } = useSettings();
  return useCallback(
    (name: SoundName) => {
      if (sounds) playSound(name);
    },
    [sounds]
  );
}
