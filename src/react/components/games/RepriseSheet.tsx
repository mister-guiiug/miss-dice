import { useEffect, useState } from 'react';
import { shareOrCopy } from '@mister-guiiug/dev-pwa-config/share';
import { qrToDataUrl } from '@mister-guiiug/dev-pwa-config/qr';
import { Sheet } from '../Sheet';
import { useI18n } from '../../../i18n/useI18n';
import { urlDeReprise } from '../../../games/transfer';
import type { GameKey } from '../../../games/persistence';

/**
 * « Continuer ailleurs » : la partie en cours, en lien et en QR.
 *
 * LE QR N'EST PAS UN ORNEMENT. Entre deux appareils posés sur la même table,
 * c'est le seul transport qui ne demande ni compte, ni réseau commun, ni
 * d'envoyer un lien à quelqu'un qu'on a en face de soi. Le lien reste à côté,
 * pour l'autre moitié des cas - une tablette hors de portée, un message.
 *
 * L'URL SE CALCULE À L'OUVERTURE, et pas au rendu du jeu : elle embarque
 * l'état complet, et la recalculer à chaque lancer ferait travailler le
 * navigateur pour une feuille que personne ne regarde. `uqr` n'est chargé
 * qu'ici, et de façon paresseuse par le module `qr` du socle : son poids ne
 * pèse pas sur le démarrage.
 *
 * ⚠️ L'INSTANTANÉ EST DATÉ. Ce qui part, c'est la partie à cet instant : si on
 * rejoue un tour avant que l'autre appareil ouvre le lien, il reprendra la
 * position d'avant. Le texte le dit, parce qu'une reprise qui « perd » un tour
 * sans explication passe pour une panne.
 */
interface RepriseSheetProps {
  open: boolean;
  onClose: () => void;
  mode: GameKey;
  state: unknown;
}

export function RepriseSheet({
  open,
  onClose,
  mode,
  state,
}: RepriseSheetProps) {
  const { t } = useI18n();
  const [lien, setLien] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!open) return;
    let vivant = true;
    void (async () => {
      try {
        const url = await urlDeReprise(mode, state);
        if (!vivant) return;
        // L'échec d'une ouverture précédente s'efface ICI, au succès, et non
        // au départ de l'effet : remettre l'état à zéro dans le corps même de
        // l'effet déclenche un rendu en cascade pour un cas qui, la plupart du
        // temps, n'a rien à corriger.
        setErreur(false);
        setLien(url);
        /*
         * NOIR SUR BLANC, QUEL QUE SOIT LE THÈME - et surtout quelle que soit
         * la palette. Un QR ne se lit pas par une teinte mais par le
         * CONTRASTE de ses modules, et un motif vert sur fond vert reste joli
         * en refusant de se faire scanner. Les modules sont donc noirs, le
         * fond transparent, et `styles.css` pose le cadre blanc sous l'image :
         * un lecteur cherche ses trois cibles d'angle sur un fond clair et
         * uni, et s'accommode mal d'un blanc sur sombre dès que l'appareil qui
         * scanne ajuste mal son exposition.
         */
        const image = await qrToDataUrl(url, {
          margin: 2,
          color: { dark: '#000000', light: '#00000000' },
        });
        if (vivant) setQr(image);
      } catch {
        // `uqr` absent, ou URL trop longue pour un QR : le lien reste.
        if (vivant) setErreur(true);
      }
    })();
    return () => {
      vivant = false;
    };
  }, [open, mode, state]);

  const partager = async () => {
    if (!lien) return;
    const resultat = await shareOrCopy({
      title: t('reprise.title'),
      text: t('reprise.shareText'),
      url: lien,
    });
    if (resultat === 'copied') {
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2200);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('reprise.title')}
      footer={
        <button type="button" className="sheet__close" onClick={onClose}>
          {t('settings.close')}
        </button>
      }
    >
      <p className="reprise__lead">{t('reprise.lead')}</p>

      {qr && <img className="reprise__qr" src={qr} alt={t('reprise.qrAlt')} />}
      {erreur && <p className="reprise__note">{t('reprise.qrUnavailable')}</p>}

      <div className="btn-row">
        <button
          type="button"
          className="primary-btn"
          disabled={!lien}
          onClick={() => void partager()}
        >
          {t('reprise.share')}
        </button>
      </div>

      <p className="about__feedback" role="status" aria-live="polite">
        {copie ? t('game.copied') : ''}
      </p>

      <p className="reprise__note">{t('reprise.snapshot')}</p>
    </Sheet>
  );
}
