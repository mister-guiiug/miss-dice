export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

export type ShareResult = 'shared' | 'copied' | 'failed';

/**
 * Partage natif (Web Share API) avec repli sur le presse-papiers. Si
 * l'utilisateur annule le partage (AbortError), on ne recopie pas. Renvoie
 * ce qui s'est réellement passé pour permettre un retour visuel.
 */
export async function shareOrCopy(options: ShareOptions): Promise<ShareResult> {
  const nav = globalThis.navigator as
    | (Navigator & { share?: (data: ShareOptions) => Promise<void> })
    | undefined;

  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share(options);
      return 'shared';
    } catch (error) {
      // Annulation utilisateur : ne pas basculer sur le presse-papiers.
      if (error instanceof Error && error.name === 'AbortError')
        return 'shared';
      /* sinon, repli copie */
    }
  }

  const text = [options.title, options.text, options.url]
    .filter(Boolean)
    .join('\n');
  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text);
      return 'copied';
    } catch {
      /* ignore */
    }
  }
  return 'failed';
}
