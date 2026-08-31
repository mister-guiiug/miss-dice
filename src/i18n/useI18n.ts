import { createI18n } from '@mister-guiiug/dev-wpa-config/react/i18n';
import type { I18nApi } from '@mister-guiiug/dev-wpa-config/react/i18n';
import {
  LOCALES,
  messages,
  type Locale,
  type MessageKey,
  type Messages,
  type ParamsArg,
} from './messages';
import {
  LOCALE_STORAGE_KEY,
  migrateLegacySettings,
} from '../settings/legacyMigration';

/**
 * L'i18n de l'app, bâti sur `react/i18n` du socle.
 *
 * CE QUI DISPARAÎT. La copie locale réimplémentait, sous une autre forme, tout
 * ce que le module partagé fait déjà : résolution de clé en notation pointée,
 * interpolation des `{paramètres}`, détection de la langue initiale depuis
 * `navigator.language`, persistance, et pose de `lang`/`dir` sur `<html>`
 * (celle-ci vivait dans un `useEffect` d'`App.tsx`). Le type `Paths<T>` de
 * `messages.ts` était même le SOSIE EXACT d'`I18nPaths<T>` du paquet.
 *
 * CE QU'ON GAGNE. `fmt.*` — nombres, dates, monnaie, pluriel — déjà lié à la
 * langue choisie, là où l'app n'avait aucun pont entre « la langue » et
 * « comment on écrit les nombres ». `dir` calculé par `Intl.Locale#textInfo`
 * plutôt que par la table `LOCALE_DIR` tenue à la main. Et le repli sur la
 * locale de secours pour une clé manquante, que `translate()` n'avait pas :
 * elle affichait la clé brute.
 *
 * CE QU'ON GARDE, ET POURQUOI CE FICHIER SUBSISTE. Le `t` du socle est typé
 * `(path, params?) => string` : les paramètres y sont TOUJOURS facultatifs.
 * Celui de l'app exige à la compilation les paramètres des vingt et une clés
 * interpolées (voir `MessageParams`) — oublier le `{n}` de
 * `settings.statsTotal` est une erreur de build, pas un `{n}` affiché tel quel
 * à l'utilisateur. C'est une garantie que le socle n'offre pas ; on ne la rend
 * pas. Le ré-typage ci-dessous est purement statique : à l'exécution, les deux
 * `interpolate` sont à la lettre le même code.
 *
 * LA LANGUE QUITTE `settingsStore`. Elle vivait dans le blob JSON des dix
 * réglages ; `I18nProvider` la persiste désormais sous sa propre clé nue.
 * `migrateLegacySettings` fait le pont une fois — voir ce fichier, l'option
 * `legacyKeys` du socle étant inopérante sur un blob.
 */

// AVANT le montage du provider, qui lit `localStorage` à son initialisation.
migrateLegacySettings(LOCALES);

const i18n = createI18n<Messages, Locale>({
  messages,
  locales: LOCALES,
  fallbackLocale: 'fr',
  // Sans clé explicite, ce serait `dwc_locale`, partagé par toute la famille
  // sur l'origine GitHub Pages : miss-dice adopterait la langue d'une app
  // voisine au premier chargement. On reprend la nôtre.
  storageKey: LOCALE_STORAGE_KEY,
});

/**
 * Pose la langue, `lang`/`dir` sur `<html>`, et le `LabelsProvider` dont
 * dépendent les libellés des composants du socle.
 */
export const I18nProvider = i18n.I18nProvider;

/** L'API du socle, dont le seul `t` est resserré sur `MessageParams`. */
export type I18n = Omit<I18nApi<Messages, Locale>, 't'> & {
  /**
   * Traduit une clé typée avec interpolation des `{paramètres}`. Les clés qui
   * attendent des paramètres les EXIGENT à la compilation.
   */
  t: <K extends MessageKey>(key: K, ...params: ParamsArg<K>) => string;
};

/** Accès réactif à la traduction. À utiliser sous `I18nProvider`. */
export function useI18n(): I18n {
  // Le seul écart entre les deux signatures est la rigueur des `params` : le
  // socle les accepte tous facultatifs, l'app les impose. Aucune conversion
  // n'a lieu à l'exécution, d'où la double assertion.
  return i18n.useI18n() as unknown as I18n;
}
