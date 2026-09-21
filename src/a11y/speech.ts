/** Étiquette BCP-47 par locale, pour choisir la bonne voix de synthèse. */
const LOCALE_BCP47: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
};

/** Convertit une locale interne en étiquette BCP-47 (défaut en-US). */
export function localeToBcp47(locale: string): string {
  return LOCALE_BCP47[locale] ?? 'en-US';
}

/**
 * RÉFÉRENCE VIVANTE DE L'ÉNONCÉ EN COURS — ce n'est pas une optimisation,
 * c'est ce qui empêche le son d'être coupé. Un `SpeechSynthesisUtterance`
 * que plus rien ne référence peut être ramassé par le GC **pendant qu'il
 * parle** : bug de longue date de Chrome, nettement plus visible sur Android.
 * Ce qui saute alors, c'est la FIN de la phrase — et la fin de nos annonces
 * est toujours le nombre. D'où « sur le 5, le mot est écorché ».
 */
let enCours: SpeechSynthesisUtterance | null = null;

/**
 * Délai laissé au moteur entre `cancel()` et `speak()`. `cancel()` est
 * ASYNCHRONE : enchaîner les deux dans le même tour de boucle fait avaler le
 * début — parfois la totalité — de la nouvelle phrase. 120 ms est
 * imperceptible après l'animation d'un lancer, et laisse au moteur de quoi
 * vider sa file.
 */
const REPRISE_MS = 120;

let minuteur: ReturnType<typeof setTimeout> | undefined;

/**
 * Énonce un texte via la synthèse vocale du navigateur, si disponible.
 * Tolérant : aucune erreur si l'API manque (Web Speech non supporté,
 * SSR/tests). Un nouvel énoncé interrompt le précédent — mais sans se faire
 * écraser par lui, cf. `REPRISE_MS`.
 */
export function speak(text: string, lang: string): void {
  const synth = globalThis.speechSynthesis;
  if (
    !synth ||
    typeof globalThis.SpeechSynthesisUtterance === 'undefined' ||
    !text
  ) {
    return;
  }
  try {
    const utterance = new globalThis.SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Tenue jusqu'à la fin, puis relâchée : garder la référence au-delà
    // retiendrait inutilement le dernier énoncé de la session.
    const libere = () => {
      if (enCours === utterance) enCours = null;
    };
    utterance.onend = libere;
    utterance.onerror = libere;
    enCours = utterance;

    // Un lancer plus récent remplace celui qui attendait son tour.
    if (minuteur !== undefined) {
      clearTimeout(minuteur);
      minuteur = undefined;
    }

    // On n'annule QUE s'il y a réellement quelque chose à interrompre : sans
    // cette garde, chaque annonce payait le délai de reprise pour rien.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      minuteur = setTimeout(() => {
        minuteur = undefined;
        synth.speak(utterance);
      }, REPRISE_MS);
    } else {
      synth.speak(utterance);
    }
  } catch {
    /* synthèse indisponible : on reste silencieux */
  }
}
