import { useSyncExternalStore } from 'react';

/** Écran actif de l'application. */
export type AppMode = 'roll' | 'yahtzee' | 'dice421';

// Non persisté : l'app s'ouvre toujours sur le lancer libre (accès
// immédiat au dé), conformément à l'UX d'origine.
let mode: AppMode = 'roll';
const listeners = new Set<() => void>();

export const appModeStore = {
  get: (): AppMode => mode,
  set(next: AppMode): void {
    if (next === mode) return;
    mode = next;
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useAppMode(): AppMode {
  return useSyncExternalStore(
    appModeStore.subscribe,
    appModeStore.get,
    appModeStore.get
  );
}
