import { useState } from 'react';
import { useSettings } from '../../settings/settingsStore';
import { dieType } from '../../dice/diceTypes';
import { useI18n } from '../../i18n/useI18n';
import { DiceCountStepper, DieTypePicker } from './DiceControls';
import { Sheet } from './Sheet';

/**
 * La pastille « 2 × D20 » de l'écran principal, et la feuille qu'elle ouvre.
 *
 * CHANGER DE DÉ EST LE PREMIER GESTE APRÈS LE LANCER, et il était le plus
 * caché : six gestes dans le tiroir de réglages, contre deux ici. La pastille
 * dit aussi ce qui va être lancé, ce que seule la phrase d'aide disait - et
 * elle disparaît au premier lancer.
 *
 * HORS DE LA ZONE DE LANCER, et c'est structurel. L'écran entier est un
 * `<button>` qui lance ; un bouton n'en contient pas d'autre. La pastille vit
 * donc dans l'overlay, comme les deux boutons d'angle, et reçoit le toucher à
 * leur manière : l'overlay laisse passer, ses enfants captent.
 *
 * LE NOM ACCESSIBLE CONTIENT LE TEXTE VISIBLE. Le préfixe « Changer de dés »
 * est lu mais masqué, et « 2 × D20 » reste le texte du bouton : un
 * utilisateur de commande vocale qui dit ce qu'il voit est compris
 * (WCAG 2.5.3). Un `aria-label` complet l'aurait remplacé.
 */
export function DicePicker() {
  const { t } = useI18n();
  const { sides, diceCount } = useSettings();
  const [open, setOpen] = useState(false);
  const type = dieType(sides);

  return (
    <>
      <button
        type="button"
        className="dice-chip"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">{t('dicePicker.open')} </span>
        {diceCount} × {type.label}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('dicePicker.title')}
        footer={
          <button
            type="button"
            className="sheet__close"
            onClick={() => setOpen(false)}
          >
            {t('settings.close')}
          </button>
        }
      >
        <DieTypePicker />
        <DiceCountStepper />
      </Sheet>
    </>
  );
}
