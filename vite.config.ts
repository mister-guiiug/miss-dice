import { defineConfig, type Plugin, type PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

const analyze = process.env.ANALYZE === '1';

export default defineConfig(({ command }) => {
  // GitHub Pages serves the app under /<repo>/. The deploy workflow sets
  // VITE_BASE_PATH from the repo name; locally we serve from root on dev
  // and from /miss-dice/ on a production preview so the SW scope matches.
  const envBase = process.env.VITE_BASE_PATH;
  const basePath = envBase ?? (command === 'build' ? '/miss-dice/' : '/');

  // usePolling is required when running on a Windows NTFS mount via WSL:
  // inotify does not fire for /mnt/ paths, so Vite never detects saves.
  const usePolling =
    process.platform === 'linux' && process.env.WSL_DISTRO_NAME != null;

  return {
    base: basePath,
    server: {
      watch: { usePolling, interval: 300 },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            const norm = id.replace(/\\/g, '/');
            if (
              norm.includes('/vite-plugin-pwa/') ||
              norm.includes('/workbox-')
            ) {
              return 'pwa';
            }
            if (
              norm.includes('/react-dom/') ||
              norm.includes('/node_modules/react/') ||
              norm.includes('/scheduler/')
            ) {
              return 'react-vendor';
            }
            return 'vendor';
          },
        },
      },
    },
    plugins: [
      react(),
      // GitHub Pages has no SPA fallback: a refresh on a deep link returns
      // its stock 404. We ship a 404.html identical to index.html so the
      // app shell always boots. miss-dice has a single screen today, but
      // this keeps deep-link refreshes safe if routes are ever added.
      {
        name: 'miss-dice-spa-404',
        apply: 'build',
        async closeBundle() {
          const { copyFile } = await import('node:fs/promises');
          const { resolve } = await import('node:path');
          const dist = resolve(process.cwd(), 'dist');
          try {
            await copyFile(
              resolve(dist, 'index.html'),
              resolve(dist, '404.html')
            );
          } catch (err) {
            console.warn('[spa-404] could not emit 404.html:', err);
          }
        },
      } satisfies Plugin,
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/apple-touch-icon.png',
          'robots.txt',
        ],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2,webmanifest}'],
        },
        manifest: {
          id: basePath,
          name: 'Miss Dice',
          short_name: 'Miss Dice',
          description:
            'Lancer un dé à 6 faces d’un simple tap. Mobile-first, 100 % offline, sans pub ni tracking.',
          theme_color: '#0f1220',
          background_color: '#0f1220',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: basePath,
          scope: basePath,
          lang: 'fr',
          categories: ['games', 'utilities'],
          launch_handler: { client_mode: 'navigate-existing' },
          // Raccourcis (longue-pression sur l'icône) — lus via ?play= au boot.
          shortcuts: [
            {
              name: 'Yahtzee',
              short_name: 'Yahtzee',
              url: `${basePath}?play=yahtzee`,
            },
            { name: '421', short_name: '421', url: `${basePath}?play=dice421` },
            {
              name: 'Notation',
              short_name: 'Notation',
              url: `${basePath}?play=notation`,
            },
          ],
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
      analyze &&
        (visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }) as PluginOption),
    ].filter(Boolean),
  };
});
