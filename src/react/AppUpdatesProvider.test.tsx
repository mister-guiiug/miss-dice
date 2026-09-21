import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, screen } from '@testing-library/react';

// INDISPENSABLE, et c'est un piège du socle lui-même. `vitest-setup` pose un
// `vi.mock('virtual:pwa-register')` MUET pour toutes les suites. Or le
// `resolve.alias` de `vitest.config.ts` fait pointer ce spécificateur vers
// `testing/pwa-register` : le mock est donc enregistré sur le FICHIER du double
// du socle, et l'importer par son chemin de paquet rend le mock muet, pas le
// double. Sans cette ligne : « No "swStub" export is defined on the
// "virtual:pwa-register" mock ».
vi.unmock('virtual:pwa-register');

import {
  registerSW as pilotableRegisterSW,
  swStub,
} from '@mister-guiiug/dev-pwa-config/testing/pwa-register';
import { LABELS } from '@mister-guiiug/dev-pwa-config/react/labels';
import { LOCALES, type Locale } from '../i18n/messages';
import { renderWithProviders } from '../test/renderWithProviders';
import { AppUpdatesProvider } from './AppUpdatesProvider';

/**
 * Ce que ces tests garantissent, et qu'aucune app du parc ne garantissait.
 *
 * 1. **Le bandeau peut S'AFFICHER.** Le double du socle LÈVE si personne n'a
 *    injecté `registerSW` : un bandeau monté mais structurellement incapable
 *    d'apparaître - le défaut vécu des mois par une app de la famille - fait
 *    donc échouer le test au lieu de passer en silence. L'ancien stub maison,
 *    muet, ne pouvait rien prouver de tel.
 *
 * 2. **Le bandeau parle la BONNE LANGUE, dans les SIX.** `LabelsProvider`
 *    fait retomber toute locale INCONNUE sur le français SANS RIEN SIGNALER.
 *    Miss Dice parle fr/en/es/de/it/pt : ces six cas prouvent que le socle
 *    les sert lui-même, depuis qu'il livre sept locales et que l'app a cessé
 *    de passer ses propres libellés.
 */

/** `LABELS` est un `Record<string, …>` : TS ignore quelles locales existent. */
function socleLabels(locale: string) {
  const group = LABELS[locale];
  if (!group) throw new Error(`LABELS.${locale} manquant`);
  return group;
}

/**
 * `I18nProvider` est INDISPENSABLE ici, et pas seulement pour que `useI18n`
 * réponde : c'est lui qui fixe la langue dans laquelle
 * `AppUpdatesProvider` passe au `LabelsProvider` du socle. C'est exactement ce
 * que vérifie le test des six langues ci-dessous.
 */
function mount(registerSW?: typeof pilotableRegisterSW, locale: Locale = 'fr') {
  return renderWithProviders(
    <AppUpdatesProvider registerSW={registerSW}>
      <div data-testid="app" />
    </AppUpdatesProvider>,
    locale
  );
}

describe('AppUpdatesProvider', () => {
  beforeEach(() => {
    cleanup();
    // Identité NEUVE pour `registerSW` : `useUpdatePrompt` mémorise sa
    // connexion par identité de fonction, le report d'un test survivrait sinon.
    swStub.reset();
  });

  it('le socle livre les sept langues depuis 3.33.0 - le piège que ces tests fermaient', () => {
    // Jusqu'à 3.32, `react/labels` ne portait que fr et en : les autres
    // langues retombaient en français sans un mot. Ces tests figeaient ce
    // piège ; ils figent désormais sa disparition : l'app a retiré ses
    // surcharges, et c'est ce dictionnaire-ci qui répond dans les six langues.
    expect(Object.keys(LABELS).sort()).toEqual([
      'de',
      'en',
      'es',
      'fr',
      'it',
      'nl',
      'pt',
    ]);
    for (const presente of ['es', 'de', 'it', 'pt']) {
      expect(LABELS[presente]).toBeDefined();
    }
  });

  it("n'affiche rien tant qu'aucune version n'attend", () => {
    mount(pilotableRegisterSW);

    expect(swStub.registered).toBe(true);
    expect(screen.queryByText(socleLabels('fr').update.title)).toBeNull();
  });

  // LE test du lot. Les six locales, une par une.
  //
  // IL A CHANGÉ DE PREUVE, et il est devenu plus fort. Il vérifiait que les
  // surcharges de l'app couvraient six locales que le socle ignorait ; il
  // vérifie maintenant que le SOCLE les sert toutes les six lui-même. C'est la
  // seule chose dont elles dépendent depuis que la surcharge est retirée - et
  // le jour où le socle en perdrait une, ces six cas le diraient.
  it.each(LOCALES)(
    'locale « %s » : le bandeau affiche les libellés du socle',
    locale => {
      mount(pilotableRegisterSW, locale);
      act(() => {
        swStub.needRefresh();
      });

      const attendus = socleLabels(locale).update;
      expect(screen.getByText(attendus.title)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: attendus.update })
      ).toBeInTheDocument();
      // LE REPORT DIT SA DURÉE, et c'est ce que la surcharge masquait : elle
      // mappait `snooze` sur « Plus tard » tout court, alors qu'`AppUpdates`
      // reporte de quatre heures par défaut depuis le socle 4.19.0. Le libellé
      // du socle est `Plus tard ({hours} h)` et remplit `{hours}` lui-même.
      expect(
        screen.getByRole('button', {
          name: attendus.snooze.replaceAll('{hours}', '4'),
        })
      ).toBeInTheDocument();

      // ET SURTOUT : PAS DE REPLI SILENCIEUX. `LabelsProvider` retombe sur le
      // français pour toute locale qu'il ne connaît pas, sans rien signaler.
      // Hors du français, en voir le titre à l'écran signifierait exactement
      // ça - et c'est le seul défaut que ce test ne peut pas se permettre de
      // laisser passer.
      if (locale !== 'fr') {
        expect(screen.queryByText(socleLabels('fr').update.title)).toBeNull();
      }
    }
  );

  it('sans registerSW (le cas du développement), aucun worker n’est enregistré', () => {
    mount(undefined);

    expect(swStub.registered).toBe(false);
    // Le double dit lui-même pourquoi le bandeau ne peut pas apparaître.
    expect(() => {
      swStub.needRefresh();
    }).toThrow(/registerSW n'a jamais été appelé/);
    expect(screen.queryByText(socleLabels('fr').update.title)).toBeNull();
  });
});
