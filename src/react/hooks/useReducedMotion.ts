import { useSyncExternalStore } from 'react';
import { useSettings } from '../../settings/settingsStore';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void): () => void {
  const mql = globalThis.matchMedia?.(QUERY);
  if (!mql) return () => {};
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSystemPreference(): boolean {
  return globalThis.matchMedia?.(QUERY).matches ?? false;
}

/** Préférence système brute `prefers-reduced-motion: reduce`. */
export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSystemPreference, () => false);
}

/**
 * Mouvement réduit EFFECTIF : vrai si l'OS le demande OU si l'utilisateur
 * l'a forcé dans les réglages. Les composants ne consultent que ceci.
 */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const { motion } = useSettings();
  return motion === 'reduced' || system;
}
