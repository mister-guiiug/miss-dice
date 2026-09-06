import {
  SPONSOR_URL,
  repoUrl,
} from '@mister-guiiug/dev-pwa-config/apps-catalog';
import { useI18n } from '../../i18n/useI18n';

/**
 * Les deux liens de la règle famille — code source et soutien — sur le PREMIER
 * écran.
 *
 * Ils n'existaient que dans le tiroir de réglages, derrière un bouton : qui
 * ouvre l'application ne voyait ni d'où vient le code ni comment soutenir.
 * La règle famille du 05/09/2026 les veut aux deux endroits ; le tiroir garde
 * les siens, ceci est l'autre moitié.
 *
 * IL VIT DANS `.app__overlay`, ET C'EST LA SEULE PLACE POSSIBLE. Tout l'écran
 * de dé est une zone de lancer : y poser un pied de page dans le flux
 * mangerait la surface tapable. L'overlay est `pointer-events: none` et ne
 * réactive que ses enfants — deux liens de seize pixels n'y prennent rien.
 *
 * Les icônes sont dessinées en ligne, comme celles du tiroir : cette
 * application ne déclare pas de bibliothèque d'icônes.
 */
export function FamilyLinks() {
  const { t } = useI18n();
  return (
    <div className="family-links">
      <a
        className="family-links__link"
        href={repoUrl('miss-dice')}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <span>{t('settings.sourceCode')}</span>
      </a>
      <a
        className="family-links__link"
        href={SPONSOR_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4 3h13v2H4V3Zm0 4h15a3 3 0 0 1 0 6h-1.1A6 6 0 0 1 12 17H9a6 6 0 0 1-5.92-5H4V7Zm14 2v2h1a1 1 0 0 0 0-2h-1ZM3 19h15v2H3v-2Z" />
        </svg>
        <span>{t('settings.buyCoffee')}</span>
      </a>
    </div>
  );
}
