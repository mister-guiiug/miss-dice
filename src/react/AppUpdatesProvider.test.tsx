import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';

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
} from '@mister-guiiug/dev-wpa-config/testing/pwa-register';
import { LABELS } from '@mister-guiiug/dev-wpa-config/react/labels';
import { LOCALES, messages } from '../i18n/messages';
import { settingsStore } from '../settings/settingsStore';
import { AppUpdatesProvider } from './AppUpdatesProvider';

/**
 * Ce que ces tests garantissent, et qu'aucune app du parc ne garantissait.
 *
 * 1. **Le bandeau peut S'AFFICHER.** Le double du socle LÈVE si personne n'a
 *    injecté `registerSW` : un bandeau monté mais structurellement incapable
 *    d'apparaître — le défaut vécu des mois par une app de la famille — fait
 *    donc échouer le test au lieu de passer en silence. L'ancien stub maison,
 *    muet, ne pouvait rien prouver de tel.
 *
 * 2. **Le bandeau parle la BONNE LANGUE, dans les SIX.** `react/labels` du
 *    socle ne livre que `fr` et `en`, et fait retomber toute locale inconnue
 *    sur le français SANS RIEN SIGNALER. Miss Dice parle fr/en/es/de/it/pt :
 *    sans les surcharges d'`AppUpdatesProvider`, quatre utilisateurs sur six
 *    verraient un bandeau français, et ni le typage, ni ESLint, ni aucun test
 *    ne le dirait.
 */

/** `LABELS` est un `Record<string, …>` : TS ignore quelles locales existent. */
function socleLabels(locale: string) {
  const group = LABELS[locale];
  if (!group) throw new Error(`LABELS.${locale} manquant`);
  return group;
}

function mount(registerSW?: typeof pilotableRegisterSW) {
  return render(
    <AppUpdatesProvider registerSW={registerSW}>
      <div data-testid="app" />
    </AppUpdatesProvider>
  );
}

describe('AppUpdatesProvider', () => {
  beforeEach(() => {
    cleanup();
    // Identité NEUVE pour `registerSW` : `useUpdatePrompt` mémorise sa
    // connexion par identité de fonction, le report d'un test survivrait sinon.
    swStub.reset();
    act(() => {
      settingsStore.setLocale('fr');
    });
  });

  it('le socle ne livre que fr et en — le piège que ces tests ferment', () => {
    expect(Object.keys(LABELS).sort()).toEqual(['en', 'fr']);
    for (const absente of ['es', 'de', 'it', 'pt']) {
      expect(LABELS[absente]).toBeUndefined();
    }
  });

  it("n'affiche rien tant qu'aucune version n'attend", () => {
    mount(pilotableRegisterSW);

    expect(swStub.registered).toBe(true);
    expect(screen.queryByText(messages.fr.update.available)).toBeNull();
  });

  // LE test du lot. Les six locales, une par une.
  it.each(LOCALES)(
    'locale « %s » : le bandeau affiche les libellés de l’app',
    locale => {
      act(() => {
        settingsStore.setLocale(locale);
      });
      mount(pilotableRegisterSW);
      act(() => {
        swStub.needRefresh();
      });

      const attendus = messages[locale].update;
      expect(screen.getByText(attendus.available)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: attendus.action })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: attendus.dismiss })
      ).toBeInTheDocument();

      // ET SURTOUT : le dictionnaire du socle est INATTEIGNABLE. Ses titres
      // `fr` et `en` diffèrent de ceux de l'app dans les six locales ; en
      // voir un à l'écran signifierait que la surcharge a sauté — et que
      // es/de/it/pt parlent français sans que personne ne le remarque.
      expect(screen.queryByText(socleLabels('fr').update.title)).toBeNull();
      expect(screen.queryByText(socleLabels('en').update.title)).toBeNull();
      expect(
        screen.queryByRole('button', { name: socleLabels('fr').update.update })
      ).toBeNull();
    }
  );

  it('sans registerSW (le cas du développement), aucun worker n’est enregistré', () => {
    mount(undefined);

    expect(swStub.registered).toBe(false);
    // Le double dit lui-même pourquoi le bandeau ne peut pas apparaître.
    expect(() => {
      swStub.needRefresh();
    }).toThrow(/registerSW n'a jamais été appelé/);
    expect(screen.queryByText(messages.fr.update.available)).toBeNull();
  });
});
