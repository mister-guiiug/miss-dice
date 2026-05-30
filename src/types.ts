/** Résultat d'une face de dé (entier ≥ 1, borné par le nombre de faces). */
export type DieValue = number;

/** Les six valeurs d'un dé classique à 6 faces. */
export type D6Value = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Cycle de vie d'un lancer :
 *  - `idle`    : au repos, en attente d'un tap
 *  - `rolling` : animation de défilement en cours
 *  - `result`  : les faces sont figées et mises en avant
 */
export type RollStatus = 'idle' | 'rolling' | 'result';

/** Les six faces d'un D6, dans l'ordre — pratique pour itérer/tester. */
export const DIE_VALUES: readonly D6Value[] = [1, 2, 3, 4, 5, 6];
