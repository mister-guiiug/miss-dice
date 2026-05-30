/** Les six valeurs possibles d'un dé classique. */
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Cycle de vie d'un lancer :
 *  - `idle`    : au repos, en attente d'un tap
 *  - `rolling` : animation de défilement en cours
 *  - `result`  : une face est figée et mise en avant
 */
export type RollStatus = 'idle' | 'rolling' | 'result';

/** Toutes les faces, dans l'ordre — pratique pour itérer/tester. */
export const DIE_VALUES: readonly DieValue[] = [1, 2, 3, 4, 5, 6];
