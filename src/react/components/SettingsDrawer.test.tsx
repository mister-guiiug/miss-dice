import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { SettingsDrawer } from './SettingsDrawer';
import { renderWithProviders } from '../../test/renderWithProviders';
import { settingsStore } from '../../settings/settingsStore';

/**
 * LE CANAL DE RETOUR. Au relevé du 06/09/2026, zéro issue était ouverte sur
 * les vingt-deux dépôts du compte. Ce n'était pas du silence : miss-dice
 * n'offrait aucun endroit où dire ce qui ne va pas.
 *
 * Ce test tient le lien ET sa charge utile. Une URL vers `issues/new` sans le
 * gabarit ouvre un formulaire vide, où la première réponse serait à nouveau
 * « quelle version ? » ; sans le champ `environnement`, l'écran et le
 * navigateur repartent dans l'oubli. C'est le préremplissage qui fait la
 * différence entre un lien et un canal.
 */
afterEach(cleanup);

function openSettings() {
  renderWithProviders(<SettingsDrawer />);
  fireEvent.click(screen.getByRole('button', { name: /réglages/i }));
}

describe('SettingsDrawer — signaler un problème', () => {
  it('ouvre le gabarit d’anomalie du dépôt miss-dice', async () => {
    openSettings();
    const link = await screen.findByRole('link', {
      name: /signaler un problème/i,
    });
    const url = new URL(link.getAttribute('href') ?? '');
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://github.com/mister-guiiug/miss-dice/issues/new'
    );
    expect(url.searchParams.get('template')).toBe('bug.yml');
  });

  it('décrit l’écran, que l’utilisateur ne pense jamais à donner', async () => {
    openSettings();
    const link = await screen.findByRole('link', {
      name: /signaler un problème/i,
    });
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.searchParams.get('environnement')).toContain(
      globalThis.location.pathname
    );
  });
});

/*
 * L'ORDRE DU BLOC « À PROPOS », que seule une lecture du DOM peut tenir.
 *
 * Ces deux défauts sont invisibles à la relecture du JSX et ne cassent aucun
 * rendu : ils se voient à l'écran, ou s'entendent au lecteur d'écran.
 */
describe('SettingsDrawer — le bloc « À propos »', () => {
  it('annonce « lien copié » entre les liens et le rechargement', async () => {
    openSettings();
    const propos = (await screen.findByText(/^à propos$/i)).parentElement;
    const enfants = [...(propos?.children ?? [])];
    const rang = (classe: string) =>
      enfants.findIndex(e => e.classList.contains(classe));

    // La région `aria-live` vivait APRÈS le bouton de rechargement et son
    // explication : deux blocs séparaient la confirmation du geste qui la
    // déclenche — « Partager l'app ». Un lecteur d'écran l'annonçait donc
    // loin de son bouton, et l'œil ne la voyait pas.
    expect(rang('about__links')).toBeLessThan(rang('about__feedback'));
    expect(rang('about__feedback')).toBeLessThan(rang('about__maintenance'));
  });

  it('range le rechargement HORS de la grille de liens', async () => {
    openSettings();
    const propos = (await screen.findByText(/^à propos$/i)).parentElement;
    const grille = propos?.querySelector('.about__links');
    const bouton = propos?.querySelector('[data-dwc="update-button"]');

    // Les quatre liens mènent AILLEURS ; celui-ci agit sur l'application.
    // Le glisser dans la grille en ferait un cinquième lien, et la grille de
    // deux colonnes laisserait une cellule vide.
    expect(grille?.children).toHaveLength(4);
    expect(bouton).not.toBeNull();
    expect(grille?.contains(bouton as Node)).toBe(false);
    expect(
      propos?.querySelector('.about__maintenance')?.contains(bouton as Node)
    ).toBe(true);
  });

  it('traduit le lien de soutien, au lieu de laisser la marque en anglais', async () => {
    // Le socle traduit `sponsor` dans les six langues ; cette app figeait
    // « Buy me a coffee » dans les six, au milieu d'un tiroir entièrement
    // traduit. Les libellés repris ici sont ceux du socle, pas les miens.
    for (const [locale, attendu] of [
      ['fr', 'M’offrir un café'],
      ['es', 'Invítame a un café'],
      ['de', 'Spendier mir einen Kaffee'],
      ['it', 'Offrimi un caffè'],
      ['pt', 'Pague-me um café'],
      ['en', 'Buy me a coffee'],
    ] as const) {
      renderWithProviders(<SettingsDrawer />, locale);
      fireEvent.click(screen.getAllByRole('button')[0] as HTMLElement);
      expect(await screen.findByRole('link', { name: attendu })).toBeTruthy();
      cleanup();
    }
  });
});

/**
 * LE CHOIX DE LA VOIX. Aucune propriété de `SpeechSynthesisVoice` n'indique la
 * qualité d'une voix, et certaines articulent franchement mal : mesuré le
 * 21/09/2026, `Microsoft Hortense` — PREMIÈRE voix française de Windows, donc
 * celle que le socle retient d'office — écorche « cinq » dès qu'une ponctuation
 * le précède, alors que `Julie` et `Paul` sont justes sur la même machine.
 *
 * Sur Firefox, aucune voix n'est marquée `default` : sans ce réglage,
 * l'utilisateur n'a AUCUN recours, pas même en changeant la voix par défaut de
 * Windows. Ces tests tiennent donc une échappatoire, pas un confort.
 *
 * Les noms ci-dessous sont ceux réellement relevés sur ce Firefox.
 */
const VOIX_MESUREES = [
  'Microsoft Hortense - French (France)',
  'Microsoft Julie - French (France)',
  'Microsoft Paul - French (France)',
].map(
  name =>
    ({
      name,
      lang: 'fr-FR',
      default: false,
      localService: true,
      voiceURI: `urn:moz-tts:sapi:${name}?fr-FR`,
    }) as SpeechSynthesisVoice
);

class FauxUtterance {
  text: string;
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

/**
 * UNE SEULE fausse synthèse pour tout le fichier. Le module `speech` du socle
 * branche son écouteur `voiceschanged` sur l'objet qu'on lui donne et met les
 * voix en cache : remplacer l'objet entre deux tests laisserait l'écouteur sur
 * l'ancien et le cache ne serait plus jamais rafraîchi.
 */
class FausseSynthese extends EventTarget {
  voix: SpeechSynthesisVoice[] = [];
  enonces: FauxUtterance[] = [];
  speaking = false;
  pending = false;
  getVoices() {
    return this.voix;
  }
  speak(u: FauxUtterance) {
    this.enonces.push(u);
  }
  cancel() {}
}

const synth = new FausseSynthese();

/** Pose une liste de voix ET prévient, seule façon d'invalider le cache. */
function poseVoix(voix: SpeechSynthesisVoice[]) {
  synth.voix = voix;
  synth.dispatchEvent(new Event('voiceschanged'));
}

describe('SettingsDrawer — choix de la voix d’annonce', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'speechSynthesis', {
      value: synth,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      value: FauxUtterance,
      configurable: true,
    });
  });

  beforeEach(() => {
    synth.enonces = [];
    poseVoix(VOIX_MESUREES);
    settingsStore.setTts(true);
    settingsStore.setTtsVoice('');
  });

  afterEach(() => {
    settingsStore.setTts(false);
    settingsStore.setTtsVoice('');
  });

  it('reste caché tant que l’annonce vocale est éteinte', async () => {
    settingsStore.setTts(false);
    openSettings();
    await screen.findByText(/annonce vocale/i);
    expect(screen.queryByLabelText(/voix de l/i)).toBeNull();
  });

  it('propose le choix automatique et chacune des voix', async () => {
    openSettings();
    const select = (await screen.findByLabelText(
      /voix de l/i
    )) as HTMLSelectElement;
    expect([...select.options].map(o => o.textContent)).toEqual([
      'Automatique',
      ...VOIX_MESUREES.map(v => v.name),
    ]);
    expect(select.value).toBe('');
  });

  it('ne propose rien quand il n’y a pas de choix à faire', async () => {
    poseVoix(VOIX_MESUREES.slice(0, 1));
    openSettings();
    await screen.findByText(/annonce vocale/i);
    expect(screen.queryByLabelText(/voix de l/i)).toBeNull();
  });

  it('retient la voix choisie', async () => {
    openSettings();
    const select = await screen.findByLabelText(/voix de l/i);
    fireEvent.change(select, {
      target: { value: 'Microsoft Paul - French (France)' },
    });
    expect(settingsStore.get().ttsVoice).toBe(
      'Microsoft Paul - French (France)'
    );
  });

  /**
   * LE TEST QUI COMPTE. Il tient toute la chaîne — liste déroulante, store,
   * `useSpeak`, socle — et vérifie que la phrase essayée est bien CELLE DE
   * L'ANNONCE : une phrase de démonstration quelconque ne ferait pas entendre
   * le défaut, puisque ce sont les chiffres après une ponctuation qui
   * achoppent.
   */
  it('essaie la voix choisie sur la phrase réelle de l’annonce', async () => {
    openSettings();
    const select = await screen.findByLabelText(/voix de l/i);
    fireEvent.change(select, {
      target: { value: 'Microsoft Julie - French (France)' },
    });
    fireEvent.click(screen.getByRole('button', { name: /écouter/i }));

    expect(synth.enonces).toHaveLength(1);
    const énoncé = synth.enonces[0] as FauxUtterance;
    expect(énoncé.text).toBe('Résultat : 5.');
    expect(énoncé.lang).toBe('fr-FR');
    expect(énoncé.voice?.name).toBe('Microsoft Julie - French (France)');
  });

  /**
   * `getVoices()` rend un tableau VIDE au premier appel : sans l'abonnement à
   * `voiceschanged`, le réglage resterait invisible pour toujours sur les
   * navigateurs qui chargent leurs voix après le montage.
   */
  it('apparaît quand les voix arrivent après le montage', async () => {
    poseVoix([]);
    openSettings();
    await screen.findByText(/annonce vocale/i);
    expect(screen.queryByLabelText(/voix de l/i)).toBeNull();

    poseVoix(VOIX_MESUREES);
    expect(await screen.findByLabelText(/voix de l/i)).toBeTruthy();
  });
});
