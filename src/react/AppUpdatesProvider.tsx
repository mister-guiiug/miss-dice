import type { ReactNode } from 'react';
import { AppUpdates } from '@mister-guiiug/dev-pwa-config/react/app-updates';
import { LabelsProvider } from '@mister-guiiug/dev-pwa-config/react/labels';
import type { RegisterSW } from '@mister-guiiug/dev-pwa-config/react/use-update-prompt';
import { useI18n } from '../i18n/useI18n';

/**
 * Pont entre le i18n de l'app et le bandeau de mise à jour du socle.
 *
 * CE FICHIER SURCHARGEAIT LES LIBELLÉS, ET LA RAISON A DISPARU. Elle était
 * écrite ici : « `react/labels` du socle ne livre que **`fr` et `en`**, et
 * `LabelsProvider` fait retomber toute locale inconnue sur le **français**, en
 * silence. Miss Dice parle **six** langues - fr, en, es, de, it, pt. Monter
 * `AppUpdates` sans surcharges ferait donc parler français à quatre
 * utilisateurs sur six. »
 *
 * C'était exact - et ça ne l'est plus : le socle livre SEPT locales, les six
 * de Miss Dice comprises, groupe `update` complet. La surcharge ne protégeait
 * donc plus de rien ; elle ajoutait seulement une neuvième façon d'annoncer
 * une mise à jour dans un parc qui en comptait déjà huit.
 *
 * `AppUpdatesProvider.test.tsx` prouve toujours les six locales - sur les
 * libellés du socle, désormais.
 *
 * `registerSW` est une PROP, pas un import : la décision « on n'enregistre pas
 * de service worker en développement » appartient à `main.tsx`, seul endroit
 * qui lit `import.meta.env`. Sans elle, `useUpdatePrompt` sort de son effet et
 * le bandeau ne peut pas apparaître - exactement ce qu'on veut en dev.
 *
 * `className` : Miss Dice n'importe PAS `components.css` (design maison
 * assumé). Le bandeau du socle y serait donc entièrement nu - ni fond, ni
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
  const { locale } = useI18n();

  return (
    <LabelsProvider locale={locale}>
      <AppUpdates
        checkEvery="1h"
        registerSW={registerSW}
        bannerProps={{ className: 'sw-update-banner' }}
      >
        {children}
      </AppUpdates>
    </LabelsProvider>
  );
}
