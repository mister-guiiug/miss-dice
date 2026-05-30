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
 * Énonce un texte via la synthèse vocale du navigateur, si disponible.
 * Tolérant : aucune erreur si l'API manque (Web Speech non supporté,
 * SSR/tests). Annule l'énoncé précédent pour ne pas empiler les phrases.
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
    synth.cancel();
    const utterance = new globalThis.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    synth.speak(utterance);
  } catch {
    /* synthèse indisponible : on reste silencieux */
  }
}
