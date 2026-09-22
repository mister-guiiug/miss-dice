import {
  MAX_DICE,
  MIN_DICE,
  settingsStore,
  useSettings,
} from '../../settings/settingsStore';
import { DICE_TYPES } from '../../dice/diceTypes';
import { useI18n } from '../../i18n/useI18n';

/**
 * Le type de dé et leur nombre - les deux réglages du lancer libre.
 *
 * ILS VIVAIENT AU 4E ET AU 5E RANG DU TIROIR DE RÉGLAGES, entre la palette et
 * les sons. Sur téléphone, passer d'un D6 à deux D20 demandait six gestes :
 * ouvrir le tiroir, descendre, toucher D20, descendre encore, toucher +,
 * refermer. Ils sont désormais derrière la pastille de l'écran principal
 * (`DicePicker`), à deux gestes, et ne figurent plus que là.
 *
 * Aucun état local : les deux lisent et écrivent `settingsStore`, donc le dé
 * affiché change pendant qu'on règle, sous la feuille.
 */
export function DieTypePicker() {
  const { t } = useI18n();
  const { sides } = useSettings();

  return (
    <div className="setting-row setting-row--stack">
      <span className="setting-row__label">{t('settings.dieType')}</span>
      <div
        className="segmented"
        role="radiogroup"
        aria-label={t('settings.dieType')}
      >
        {DICE_TYPES.map(type => (
          <button
            key={type.sides}
            type="button"
            role="radio"
            aria-checked={sides === type.sides}
            aria-label={t('dice.name', { sides: type.sides })}
            className={`segmented__item${sides === type.sides ? ' segmented__item--active' : ''}`}
            onClick={() => settingsStore.setSides(type.sides)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DiceCountStepper() {
  const { t } = useI18n();
  const { diceCount } = useSettings();

  return (
    <div className="setting-row">
      <span>
        <span className="setting-row__label">{t('settings.diceCount')}</span>
        <span className="setting-row__hint">{t('settings.diceCountHint')}</span>
      </span>
      <div
        className="stepper"
        role="group"
        aria-label={t('settings.diceCount')}
      >
        <button
          type="button"
          className="stepper__btn"
          aria-label={t('a11y.removeDie')}
          disabled={diceCount <= MIN_DICE}
          onClick={() => settingsStore.setDiceCount(diceCount - 1)}
        >
          −
        </button>
        <span className="stepper__value" aria-live="polite">
          {diceCount}
        </span>
        <button
          type="button"
          className="stepper__btn"
          aria-label={t('a11y.addDie')}
          disabled={diceCount >= MAX_DICE}
          onClick={() => settingsStore.setDiceCount(diceCount + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
