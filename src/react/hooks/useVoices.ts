import { useEffect, useReducer } from 'react';
import {
  listVoices,
  onVoicesChanged,
} from '@mister-guiiug/dev-pwa-config/speech';

/**
 * Voix de synthèse disponibles dans la langue de l'interface, pour laisser
 * l'utilisateur en choisir une.
 *
 * L'ABONNEMENT N'EST PAS FACULTATIF. `speechSynthesis.getVoices()` rend un
 * tableau VIDE au premier appel sur la plupart des navigateurs — la liste
 * arrive de façon asynchrone. Un composant qui se contenterait de lire au
 * montage afficherait une liste vide et n'en sortirait jamais. Le socle
 * invalide son cache avant de prévenir, donc le rappel voit bien la liste
 * neuve.
 *
 * Rend un tableau vide là où Web Speech n'existe pas (SSR, jsdom des tests) :
 * l'appelant n'a rien à garder.
 *
 * ON NE GARDE PAS LA LISTE, ON LA RELIT. Un `useState` obligeait à la réécrire
 * depuis l'effet — donc un `setState` synchrone au montage, qui déclenche un
 * rendu en cascade. Et la mémoïser demandait une dépendance que le lint ne
 * peut pas comprendre, `listVoices` lisant une source que React ne voit pas.
 * L'effet ne fait donc que s'abonner, le compteur ne sert qu'à redemander un
 * rendu, et la liste est relue à chaque fois : c'est un filtre sur une
 * poignée d'entrées, et le tiroir de réglages n'est pas un chemin chaud.
 */
export function useVoices(locale: string): SpeechSynthesisVoice[] {
  const [, signale] = useReducer((n: number) => n + 1, 0);

  useEffect(() => onVoicesChanged(signale), []);

  return parNom(listVoices(locale));
}

/**
 * Une seule entrée par NOM, puisque c'est le nom qui sert de valeur et de clé
 * dans la liste déroulante : deux homonymes donneraient deux choix
 * indiscernables et une clé React en double.
 *
 * Ne confond pas avec les doublures de Firefox, qui expose la même voix sous
 * l'entrée OneCore et l'entrée SAPI5 « Desktop » — leurs noms DIFFÈRENT
 * (« Microsoft Hortense - French (France) » et « Microsoft Hortense
 * Desktop - French »), donc les deux restent proposées. C'est correct : rien
 * ne garantit qu'elles se comportent pareil.
 */
function parNom(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter(
    (voice, i) => voices.findIndex(autre => autre.name === voice.name) === i
  );
}
