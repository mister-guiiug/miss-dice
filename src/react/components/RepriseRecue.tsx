import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@mister-guiiug/dev-pwa-config/react/confirm-dialog';
import { appModeStore } from '../../app/appMode';
import { useI18n } from '../../i18n/useI18n';
import { hasSavedGame, saveGame } from '../../games/persistence';
import {
  decoderPartie,
  prendreColis,
  type PartieRecue,
} from '../../games/transfer';

/**
 * L'autre moitié de « Continuer ailleurs » : accueillir la partie qui arrive.
 *
 * LA REPRISE ÉCRASE UNE PARTIE, ET ÇA SE DEMANDE. Le lien pose un état complet
 * dans le stockage local du jeu concerné. Si une partie y dort déjà, l'ouvrir
 * en silence la perdrait - et l'utilisateur qui scanne un QR ne pense pas
 * forcément à celle qu'il avait laissée en plan sur CET appareil-ci. On
 * demande donc, mais seulement dans ce cas : une boîte de dialogue devant un
 * emplacement vide ne protégerait rien et ferait du bruit.
 *
 * L'ÉCRITURE PRÉCÈDE LE CHANGEMENT D'ÉCRAN, et l'ordre compte. Chaque jeu lit
 * sa sauvegarde AU MONTAGE (`useUndoableGame`) : poser l'état d'abord, changer
 * de mode ensuite, c'est le composant qui se monte sur la partie reçue. Dans
 * l'autre sens, il se monterait sur l'ancienne et n'aurait plus de raison de
 * relire.
 *
 * UN LIEN REFUSÉ SE DIT. Version de schéma trop ancienne, colis tronqué par un
 * copier-coller, QR mal lu : dans tous les cas l'app s'ouvre normalement, et
 * l'utilisateur mérite de savoir pourquoi sa partie n'est pas là plutôt que de
 * croire à un oubli de sa part.
 */
export function RepriseRecue() {
  const { t } = useI18n();
  const [aConfirmer, setAConfirmer] = useState<PartieRecue | null>(null);
  const [refusee, setRefusee] = useState(false);

  const reprendre = useCallback((recue: PartieRecue) => {
    saveGame(recue.mode, recue.state);
    appModeStore.set(recue.mode);
  }, []);

  useEffect(() => {
    // `prendreColis` ne rend le colis QU'UNE FOIS, à l'échelle du module :
    // c'est ce qui tient face au montage-démontage-remontage de `StrictMode`,
    // qu'un `useRef` de garde ne verrait pas passer (cf. `transfer.ts`).
    const colis = prendreColis();
    if (!colis) return;

    void (async () => {
      const recue = await decoderPartie(colis);
      if (!recue) {
        setRefusee(true);
        return;
      }
      if (hasSavedGame(recue.mode)) {
        setAConfirmer(recue);
        return;
      }
      reprendre(recue);
    })();
  }, [reprendre]);

  return (
    <>
      <ConfirmDialog
        open={aConfirmer !== null}
        title={t('reprise.receivedTitle')}
        message={t('reprise.receivedBody')}
        confirmLabel={t('reprise.receivedConfirm')}
        cancelLabel={t('common.cancel')}
        destructive
        onCancel={() => setAConfirmer(null)}
        onConfirm={() => {
          const recue = aConfirmer;
          setAConfirmer(null);
          if (recue) reprendre(recue);
        }}
      />

      {/* Mono-action : il n'y a rien à annuler, seulement à prendre acte. */}
      <ConfirmDialog
        open={refusee}
        title={t('reprise.title')}
        message={t('reprise.rejected')}
        cancelLabel={null}
        onConfirm={() => setRefusee(false)}
      />
    </>
  );
}
