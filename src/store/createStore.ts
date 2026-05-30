import { useSyncExternalStore } from 'react';

/**
 * Micro-store réactif partagé par toutes les sources d'état globales de
 * l'app (réglages, statistiques, mode courant, journal…). Mutualise la
 * plomberie répétitive — ensemble d'abonnés, émission, `subscribe`,
 * branchement `useSyncExternalStore` — pour qu'un store concret ne décrive
 * plus que SA logique métier (validateurs, setters, persistance).
 *
 * Volontairement minimal : `get` / `set` / `subscribe`. Les stores objet
 * appliquent un patch via `set({ ...store.get(), ...patch })` ; aucun
 * `update` magique pour rester typé sans compromis.
 */
export interface Store<T> {
  /** Lecture synchrone de l'état courant. */
  get: () => T;
  /** Remplace l'état et notifie les abonnés (no-op si identique). */
  set: (next: T) => void;
  /** Abonne un écouteur ; renvoie la fonction de désabonnement. */
  subscribe: (listener: () => void) => () => void;
}

/**
 * Crée un store.
 *
 * @param initial État de départ.
 * @param persist Effet optionnel joué à chaque changement (ex. écrire dans
 *   localStorage). Jamais appelé si l'état ne change pas (`Object.is`).
 */
export function createStore<T>(
  initial: T,
  persist?: (state: T) => void
): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set(next: T) {
      if (Object.is(next, state)) return;
      state = next;
      persist?.(state);
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Hook React : relit le store et re-rend à chaque changement. */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
