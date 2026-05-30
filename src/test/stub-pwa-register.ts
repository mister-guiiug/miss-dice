/**
 * Stub de `virtual:pwa-register` pour vitest (alias défini dans
 * vitest.config.ts). En dev/build c'est vite-plugin-pwa qui fournit le
 * vrai module virtuel.
 */
export function registerSW(): () => Promise<void> {
  return () => Promise.resolve();
}
