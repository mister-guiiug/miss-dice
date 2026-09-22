import { defineConfig, type Plugin, type PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import { pwaSeoPlugin } from '@mister-guiiug/dev-pwa-config/vite-pwa-base';
import { cspPlugin } from '@mister-guiiug/dev-pwa-config/vite-csp';
import { visualizer } from 'rollup-plugin-visualizer';
import { versionPlugin } from '@mister-guiiug/dev-pwa-config/vite-version';

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
          /*
           * LE MORCEAU SENTRY GARDE SON NOM, SANS EMPREINTE — parce qu'il est
           * exclu du précache (`globIgnores` plus bas) et qu'une URL empreintée
           * y meurt à chaque déploiement.
           *
           * Le service worker sert la coquille précachée jusqu'à ce que
           * l'utilisateur accepte la mise à jour ; cette coquille demande
           * l'ANCIENNE empreinte, que le déploiement suivant a supprimée de
           * `assets/`. Mesuré en production sur mister-qowa le 22/09/2026 :
           * HTTP 404, « Échec du chargement pour le module » dans la console.
           * `initSentry` avale l'échec (son `try/catch`), donc l'application ne
           * casse pas — elle rapporte ses erreurs à personne, sans le dire.
           *
           * Rien n'est perdu au cache : GitHub Pages répond
           * `Cache-Control: max-age=600` sur TOUS les fichiers, empreinte ou pas.
           *
           * `pwa-doctor` tient l'invariant depuis le socle 6.8.0
           * (règle `chunk-hors-precache`).
           */
          chunkFileNames: chunk =>
            chunk.name === 'sentry'
              ? 'assets/sentry.js'
              : 'assets/[name]-[hash].js',
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            const norm = id.replace(/\\/g, '/');
            // Sentry est chargé par un `import()` que `loader` rend
            // analysable. Sans cette ligne il tomberait dans `vendor`,
            // qui est PRÉCHARGÉ : mesuré sur miss-uwh, 381,9 kB
            // préchargés au lieu de 227,2 - pour un total gzip identique
            // à 0,1 kB près. Le total ne voit pas la différence,
            // `bundleBudget.preloadGzipKb` si.
            if (norm.includes('/@sentry/')) return 'sentry';
            // ET POSTHOG POUR LA MÊME RAISON, EN PLUS GRAVE. Sentry préchargé
            // coûtait du poids ; PostHog préchargé casse une PROMESSE : l'ADR
            // 0012 dit que rien n'est chargé avant l'accord, et le socle ne
            // l'appelle qu'après. Sans cette ligne, la bibliothèque tombe
            // dans `vendor`, qui est PRÉCHARGÉ - elle serait donc
            // téléchargée chez un visiteur qui refuse. C'est `preloadGzipKb`
            // qui le voit, jamais le total.
            if (norm.includes('/posthog-js/')) return 'posthog';
            // ET LE CATALOGUE DES PALETTES, TROISIÈME FOIS LE MÊME PIÈGE.
            // `ThemeProvider` du socle charge `themes.js` - dix-sept palettes
            // - par un `import()` PARESSEUX, et ne le déclenche que si on lui
            // passe `appId`. Cette app ne lui en passe aucun : le catalogue
            // n'est jamais lu à l'exécution. Mais la règle ci-dessous range
            // tout `node_modules` dans `vendor`, qui est un morceau STATIQUE
            // et PRÉCHARGÉ : le chargement paresseux du socle est annulé par
            // le découpage de l'app, et le catalogue voyage dans le chemin
            // critique de chaque visiteur. Mesuré le 20/09/2026 : `vendor`
            // 32,0 → 28,4 Kio gzip, PRÉCHARGÉ 123,5 → 119,8 Kio, et un
            // morceau `themes` de 4,0 Kio que personne ne demande jamais.
            // La preuve tient à un marqueur PROPRE au catalogue - une couleur
            // de palette, `#f8fafc` : les noms d'apps ne valent rien, ils
            // vivent aussi dans `apps-catalog.js`.
            if (norm.includes('/dev-pwa-config/themes.js')) return 'themes';
            // ET `uqr`, QUATRIÈME FOIS LE MÊME PIÈGE. Le module `qr` du socle
            // charge la bibliothèque par un `import()` paresseux, pour que son
            // poids ne soit payé que si un QR s'affiche vraiment - la feuille
            // « Continuer ailleurs », que la plupart des parties n'ouvrent
            // jamais. La règle ci-dessous annulait ce soin en la rangeant dans
            // `vendor`, qui est STATIQUE et PRÉCHARGÉ. Mesuré le 22/09/2026 :
            // `vendor` 36,0 → 31,9 kB gzip, PRÉCHARGÉ 134,2 → 130,1, pour un
            // total inchangé. Le total ne voit jamais ce genre d'erreur ;
            // `preloadGzipKb`, si.
            if (norm.includes('/uqr/')) return 'qr';
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
      // AVANT cspPlugin : il pose un script inline dans le <head>, que la
      // CSP doit hacher après coup ; et il écrit version.json au build.
      versionPlugin({ manifest: true }),
      react(),
      // SEO partagé famille : canonical/OG via placeholders index.html +
      // sitemap.xml/robots.txt générés au build (source unique).
      pwaSeoPlugin({
        // Deux <meta name="theme-color"> par schéma : la barre du navigateur suit
        // le mode sombre dès le premier rendu (relevé du 02/09/2026 : 5 apps sur 16).
        themeColor: { light: '#f4f5fb', dark: '#0f1220' },
        siteName: 'Miss Dice',
        basePath,
        logoPath: '/favicon.svg',
      }),
      // CSP durcie : script-src par hash SHA-256 de l'IIFE anti-FOUC inline
      // (plus de 'unsafe-inline' en prod). Placé après pwaSeoPlugin pour hasher
      // aussi d'éventuels scripts injectés au build. Directives portées à
      // l'identique depuis l'ancienne meta statique de index.html.
      cspPlugin({
        dev: command === 'serve',
        // Ouvre les hôtes de PostHog - le nuage EUROPÉEN (ADR 0012). Sans
        // cette option, l'ingestion que `ConsentBanner` déclenche APRÈS
        // l'accord serait refusée par la politique - et l'échec ne se verrait
        // qu'en console, sur le site déployé, une fois le consentement donné.
        analytics: true,
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        extraDirectives: {
          'frame-ancestors': "'none'",
        },
      }),
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
        ],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2,webmanifest}'],
          /*
           * LE MORCEAU SENTRY HORS DU PRÉCACHE, sans quoi le découpage
           * ci-dessus ne servirait à rien : `globPatterns` ramasse TOUT le
           * JS émis, `import()` ou pas. Mesuré le 16/09/2026 sur la
           * production de deux apps du parc, 345 et 463 KiB bruts de SDK
           * téléchargés par chaque visiteur - sans qu’aucun DSN soit posé.
           *
           * Hors précache, il est cherché sur le réseau à la première
           * erreur, et jamais si l’observabilité reste éteinte. Ne pas
           * l’avoir hors ligne est sans conséquence : rapporter une erreur
           * demande le réseau.
           *
           * LE MORCEAU `qr` RESTE, LUI, ET C'EST LE MÊME RAISONNEMENT MENÉ
           * JUSQU'AU BOUT. Ce qui dispense Sentry du précache, c'est qu'il ne
           * sert à rien hors ligne. Un QR, si : deux appareils posés sur la
           * même table, sans réseau, c'est précisément le cas où « Continuer
           * ailleurs » n'a pas d'autre transport. 4,3 kB gzip, une fois, à
           * l'installation.
           */
          globIgnores: ['**/sentry.js', '**/sentry-*.js'],
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
          // Raccourcis (longue-pression sur l'icône) - lus via ?play= au boot.
          shortcuts: [
            {
              name: 'Yahtzee',
              short_name: 'Yahtzee',
              url: `${basePath}?play=yahtzee`,
            },
            { name: '421', short_name: '421', url: `${basePath}?play=dice421` },
            {
              name: 'Cochon',
              short_name: 'Cochon',
              url: `${basePath}?play=pig`,
            },
            {
              name: 'Notation',
              short_name: 'Notation',
              url: `${basePath}?play=notation`,
            },
          ],
          // UNE IMAGE PAR USAGE. Les deux PNG étaient déclarés
          // `any maskable` : la MÊME image servait au navigateur, qui la
          // montre telle quelle, et à Android, qui la rogne à son masque. Un
          // dessin ne peut pas être bon pour les deux - celui-ci a un fond
          // transparent et des coins arrondis, que le masque révélait.
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/icon-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          // Produites par `npm run captures` (`pwa-screenshots` du socle et
          // `scripts/captures-prepare.mjs`). Les TAILLES doivent être celles
          // des fichiers : Chrome ignore sans un mot une capture dont la
          // taille déclarée ne correspond pas.
          screenshots: [
            {
              src: 'screenshots/narrow.png',
              sizes: '540x1170',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Trois dés lancés, et leur total',
            },
            {
              src: 'screenshots/wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Une partie de Yahtzee en cours',
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
