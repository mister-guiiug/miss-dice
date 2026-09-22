import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decoderPartie,
  encoderPartie,
  RESUME_PARAM,
  urlDeReprise,
} from './transfer';
import { GAME_SCHEMA_VERSION } from './persistence';

/**
 * CE QUI ARRIVE PAR UNE URL EST DU TEXTE ÉTRANGER.
 *
 * Une sauvegarde locale vient de nous : la relire sans la valider est un pari
 * raisonnable. Un lien vient de n'importe où - d'une version d'hier, d'un
 * copier-coller qui a perdu sa fin, d'une main qui a voulu voir. Ces tests
 * fixent ce que `decoderPartie` refuse, parce que tout ce qui passe ira
 * directement dans un moteur qui indexe `players[current]` sans filet.
 */

const PARTIE = {
  players: [
    { name: 'Alexandra', tokens: 3 },
    { name: 'Émilien', tokens: 5 },
  ],
  current: 1,
  dice: [4, 2, 1],
  phase: 'charge',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('aller-retour', () => {
  it('rend la partie telle qu’elle est partie', async () => {
    const colis = await encoderPartie('dice421', PARTIE);
    await expect(decoderPartie(colis)).resolves.toEqual({
      mode: 'dice421',
      state: PARTIE,
    });
  });

  it('survit aux accents et aux caractères hors ASCII', async () => {
    const joueurs = {
      players: [{ name: 'Zoé 🎲' }, { name: 'Jean-Noël' }],
      current: 0,
    };
    const colis = await encoderPartie('pig', joueurs);
    const recue = await decoderPartie(colis);
    expect(recue?.state).toEqual(joueurs);
  });

  /*
   * LES DEUX CHEMINS COMPTENT. `CompressionStream` ramène une partie de
   * Yahtzee à quatre joueurs de 1 410 à 354 caractères - la différence entre
   * un QR qui demande une main sûre et un QR qui se scanne du premier coup.
   * Mais il manque encore chez quelques-uns, et le repli en texte brut doit
   * faire un aller-retour aussi bon. Le marqueur d'un caractère en tête est ce
   * qui permet au lecteur de savoir lequel des deux il tient.
   */
  it('se passe de `CompressionStream` quand le navigateur ne l’a pas', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    const colis = await encoderPartie('dice421', PARTIE);
    expect(colis.startsWith('0')).toBe(true);
    await expect(decoderPartie(colis)).resolves.toEqual({
      mode: 'dice421',
      state: PARTIE,
    });
  });

  it('compresse quand il le peut, et le dit', async () => {
    const colis = await encoderPartie('dice421', PARTIE);
    // Le test tourne sous Node, qui l'a : si un jour ce n'est plus vrai, c'est
    // le repli qui sera exercé - les deux sont couverts.
    expect(['0', '1']).toContain(colis.slice(0, 1));
  });
});

describe('ce qui est refusé', () => {
  it('un colis d’une autre version de schéma', async () => {
    const perime = btoa(
      JSON.stringify({ v: GAME_SCHEMA_VERSION - 1, m: 'pig', s: PARTIE })
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    await expect(decoderPartie(`0${perime}`)).resolves.toBeNull();
  });

  it('un jeu qui n’existe pas', async () => {
    const inconnu = btoa(
      JSON.stringify({ v: GAME_SCHEMA_VERSION, m: 'tarot', s: PARTIE })
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    await expect(decoderPartie(`0${inconnu}`)).resolves.toBeNull();
  });

  it('un colis sans marqueur, tronqué, ou franchement quelconque', async () => {
    for (const colis of ['', 'bonjour', '2abc', '0!!!!', '1zzzz']) {
      await expect(decoderPartie(colis)).resolves.toBeNull();
    }
  });

  it('une fin de colis perdue en chemin', async () => {
    const colis = await encoderPartie('dice421', PARTIE);
    await expect(decoderPartie(colis.slice(0, -8))).resolves.toBeNull();
  });

  /*
   * LE CAS QUI PLANTERAIT L'ÉCRAN. Les trois moteurs font `players[current]!`
   * et s'en servent aussitôt : un index hors du tableau ne donne pas un
   * affichage bizarre, il donne une exception au premier rendu. Sur un lien,
   * l'absurde n'est pas qu'un accident - il peut être écrit exprès.
   */
  it('une partie dont l’index de joueur sort du tableau', async () => {
    const colis = await encoderPartie('pig', {
      players: [{ name: 'Seul' }],
      current: 3,
    });
    await expect(decoderPartie(colis)).resolves.toBeNull();
  });

  it('une partie sans joueurs, ou avec des joueurs sans nom', async () => {
    for (const etat of [
      { players: [], current: 0 },
      { players: [{ tokens: 2 }], current: 0 },
      { players: [{ name: 'A' }], current: '0' },
      { current: 0 },
      null,
    ]) {
      const colis = await encoderPartie('pig', etat);
      await expect(decoderPartie(colis)).resolves.toBeNull();
    }
  });
});

describe('urlDeReprise', () => {
  it('pose le colis dans le paramètre attendu, et rien d’autre', async () => {
    const url = new URL(await urlDeReprise('yahtzee', PARTIE));
    expect([...url.searchParams.keys()]).toEqual([RESUME_PARAM]);
    const recue = await decoderPartie(url.searchParams.get(RESUME_PARAM)!);
    expect(recue?.mode).toBe('yahtzee');
  });
});

/**
 * LE COLIS EST LU UNE FOIS, ET L'URL EST NETTOYÉE DANS LA FOULÉE.
 *
 * Deux raisons de ne pas le laisser dans la barre d'adresse : rechargeant la
 * page, on rejouerait la reprise PAR-DESSUS une partie déjà avancée ; et
 * l'URL d'une partie en cours n'a rien à faire dans un historique de
 * navigation ni dans un signet. Le module le fait à son import - donc avant
 * le premier rendu - ce qui oblige ces tests à le réimporter comme le ferait
 * un vrai démarrage.
 */
describe('le colis reçu au chargement', () => {
  async function demarrerAvec(recherche: string) {
    globalThis.history.replaceState(null, '', `/${recherche}`);
    vi.resetModules();
    return import('./transfer');
  }

  afterEach(() => {
    globalThis.history.replaceState(null, '', '/');
  });

  it('retire le paramètre de l’URL en le lisant', async () => {
    const { colisRecu } = await demarrerAvec('?reprise=0abc&play=pig');
    expect(colisRecu()).toBe('0abc');
    expect(globalThis.location.search).toBe('?play=pig');
  });

  it('rend `null` quand il n’y a rien à reprendre', async () => {
    const { colisRecu } = await demarrerAvec('?play=pig');
    expect(colisRecu()).toBeNull();
    expect(globalThis.location.search).toBe('?play=pig');
  });

  it('le lit une seule fois : un second appel rend la même valeur', async () => {
    const { colisRecu } = await demarrerAvec('?reprise=0abc');
    expect(colisRecu()).toBe('0abc');
    expect(colisRecu()).toBe('0abc');
    expect(globalThis.location.search).toBe('');
  });

  /*
   * LA REPRISE NE SE REJOUE PAS, et le garde appartient au MODULE - pas à un
   * composant. `StrictMode` monte, démonte et remonte : un `useRef` de garde
   * repart à zéro au remontage, et la reprise se jouait DEUX fois. Mesuré en
   * navigateur le 22/09/2026 - le second passage trouvait la sauvegarde que le
   * premier venait d'écrire et demandait « une partie est déjà en cours, la
   * remplacer ? » par-dessus l'écran qu'il venait lui-même d'ouvrir.
   */
  it('`prendreColis` ne sert le colis qu’une fois', async () => {
    const { prendreColis, colisRecu } = await demarrerAvec('?reprise=0abc');
    expect(prendreColis()).toBe('0abc');
    expect(prendreColis()).toBeNull();
    // La lecture pure, elle, reste disponible : `App` s'en sert pour décider
    // s'il vaut la peine de charger l'écran d'accueil.
    expect(colisRecu()).toBe('0abc');
  });
});
