import { useMemo, type ReactNode } from 'react';
import { AppUpdates } from '@mister-guiiug/dev-pwa-config/react/app-updates';
import {
  LabelsProvider,
  type LabelOverrides,
} from '@mister-guiiug/dev-pwa-config/react/labels';
import type { RegisterSW } from '@mister-guiiug/dev-pwa-config/react/use-update-prompt';
import { useI18n } from '../i18n/useI18n';

/**
 * Pont entre le i18n de l'app et le bandeau de mise à jour du socle.
 *
 * POURQUOI CE FICHIER EXISTE. `react/labels` du socle ne livre que **`fr` et
 * `en`**, et `LabelsProvider` fait retomber toute locale inconnue sur le
 * **français**, en silence : ni erreur, ni avertissement. Miss Dice parle
 * **six** langues — fr, en, es, de, it, pt. Monter `AppUpdates` sans surcharges
 * ferait donc parler français à quatre utilisateurs sur six, et rien ne le
 * signalerait : ni le typage, ni ESLint, ni aucun test.
 *
 * On ne s'en remet donc jamais au dictionnaire du socle : les libellés du
 * bandeau sont TOUJOURS surchargés depuis `messages.ts`, y compris en français.
 * Le repli du socle devient inatteignable — c'est le but.
 * `AppUpdatesProvider.test.tsx` le prouve pour les six locales.
 *
 * `registerSW` est une PROP, pas un import : la décision « on n'enregistre pas
 * de service worker en développement » appartient à `main.tsx`, seul endroit
 * qui lit `import.meta.env`. Sans elle, `useUpdatePrompt` sort de son effet et
 * le bandeau ne peut pas apparaître — exactement ce qu'on veut en dev.
 *
 * `className` : Miss Dice n'importe PAS `components.css` (design maison
 * assumé). Le bandeau du socle y serait donc entièrement nu — ni fond, ni
 * filet, ni position. C'est `.sw-update-banner` de `styles.css`, conservé et
 * retaillé pour les deux boutons du socle, qui l'habille.
 */
export function AppUpdatesProvider({
  registerSW,
  children,
}: {
  registerSW?: RegisterSW;
  children: ReactNode;
}) {
  const { locale, t } = useI18n();

  const overrides = useMemo<LabelOverrides>(
    () => ({
      update: {
        title: t('update.available'),
        update: t('update.action'),
        updating: t('update.updating'),
        dismiss: t('update.dismiss'),
        snooze: t('update.dismiss'),
      },
    }),
    [t]
  );

  return (
    <LabelsProvider locale={locale} overrides={overrides}>
      <AppUpdates
        registerSW={registerSW}
        bannerProps={{ className: 'sw-update-banner' }}
      >
        {children}
      </AppUpdates>
    </LabelsProvider>
  );
}
