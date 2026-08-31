/**
 * Extraction PONCTUELLE de `locale` et `theme` hors du blob de réglages.
 *
 * POURQUOI CE FICHIER EXISTE — et pourquoi `legacyKeys` ne suffisait pas.
 *
 * Les deux modules du socle qu'on adopte ici possèdent leur propre
 * persistance, et tous deux lisent une **chaîne nue** sous leur clé :
 * `createI18n` fait `localStorage.getItem(storageKey)` et compare à `locales` ;
 * `useTheme` fait de même et compare à `light|dark|system`. L'option
 * `legacyKeys` de `useTheme` est bâtie sur cette hypothèse : elle relit
 * d'ANCIENNES CLÉS, chacune contenant elle aussi une chaîne nue.
 *
 * Or miss-dice ne range pas ses préférences ainsi. Ses DIX réglages vivent
 * dans un **unique blob JSON** sous `miss-dice:settings` :
 *
 *     miss-dice:settings → {"haptics":true,…,"locale":"es","theme":"dark"}
 *
 * `legacyKeys: ['miss-dice:settings']` lirait donc `'{"haptics":true,…}'`,
 * ne le reconnaîtrait pas comme un thème valide, et retomberait en silence
 * sur le défaut : exactement la perte de préférence que l'option prétend
 * empêcher. Pire, `createI18n` n'a même pas d'équivalent — et s'il pointait
 * sur cette clé, son `setLocale` **écraserait le blob entier** par `"es"`,
 * emportant les neuf autres réglages.
 *
 * Le repli doit donc être écrit, pas configuré. C'est ce que fait
 * `migrateLegacySettings()` : elle ouvre le blob, en tire les deux valeurs et
 * les réécrit sous les clés nues attendues par le socle. Elle est appelée au
 * chargement de `useI18n.ts` et de `useTheme.ts`, donc avant tout montage.
 *
 * IDEMPOTENTE, et c'est essentiel : dès qu'une clé neuve porte une valeur
 * valide, elle fait autorité et le blob n'est plus relu. Sans cette garde, un
 * utilisateur qui repasse en clair après avoir choisi sombre se verrait
 * réappliquer l'ancien choix à chaque rechargement.
 *
 * Le blob n'est PAS réécrit : `safeRead()` ignore déjà les champs qu'il ne
 * connaît plus, et y toucher exposerait à écraser des réglages en cas
 * d'erreur. Les deux valeurs mortes disparaîtront d'elles-mêmes à la
 * prochaine écriture du store.
 */

/** Le blob historique — dix réglages sous une seule clé. */
export const LEGACY_SETTINGS_KEY = 'miss-dice:settings';

/**
 * Clés nues lues par le socle. Motif de la famille (`'<app>_locale'`), et NON
 * les défauts `dwc_locale` / `dwc_theme` : les PWA de la famille partagent une
 * origine GitHub Pages, donc un même `localStorage`. Sous la clé par défaut,
 * miss-dice hériterait de la langue et du thème d'une app voisine au lieu des
 * siens — et les lui imposerait en retour.
 */
export const LOCALE_STORAGE_KEY = 'miss-dice_locale';
export const THEME_STORAGE_KEY = 'miss-dice_theme';

/** Vocabulaire du socle. L'app disait `auto` là où il dit `system`. */
const THEMES = new Set(['light', 'dark', 'system']);

function readLegacyBlob(): Record<string, unknown> | null {
  try {
    const raw = globalThis.localStorage?.getItem(LEGACY_SETTINGS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Repose `locale` et `theme` sous leurs clés nues si elles n'y sont pas déjà.
 *
 * @param locales Les langues réellement servies — une valeur hors liste est
 *   ignorée plutôt que propagée jusqu'à `document.documentElement.lang`.
 */
export function migrateLegacySettings(locales: readonly string[]): void {
  let blob: Record<string, unknown> | null | undefined;
  const legacy = (): Record<string, unknown> | null =>
    (blob ??= readLegacyBlob());

  try {
    const storage = globalThis.localStorage;
    if (!storage) return;

    if (!locales.includes(storage.getItem(LOCALE_STORAGE_KEY) ?? '')) {
      const value = legacy()?.['locale'];
      if (typeof value === 'string' && locales.includes(value)) {
        storage.setItem(LOCALE_STORAGE_KEY, value);
      }
    }

    if (!THEMES.has(storage.getItem(THEME_STORAGE_KEY) ?? '')) {
      const value = legacy()?.['theme'];
      // `auto` était le mot de l'app pour ce que le socle appelle `system`.
      const mapped = value === 'auto' ? 'system' : value;
      if (typeof mapped === 'string' && THEMES.has(mapped)) {
        storage.setItem(THEME_STORAGE_KEY, mapped);
      }
    }
  } catch {
    /* localStorage indisponible (navigation privée, quota) : on reste sur les
       défauts, comme le faisait déjà `safeRead()`. */
  }
}
