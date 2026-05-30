/**
 * Génère les icônes PWA de miss-dice.
 *
 * Contrairement aux autres projets de la famille, miss-dice n'a pas de
 * logo bitmap source : l'icône (un dé affichant la face 5) est dessinée
 * procéduralement en pixels, puis encodée en PNG via pngjs. Aucune
 * dépendance native, rendu identique sur toutes les plateformes.
 *
 * Exécuter : npm run icons
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
await mkdir(outDir, { recursive: true });

// Palette alignée sur le theme_color du manifest / tokens.css.
const BG_TOP = [124, 92, 246]; // violet
const BG_BOTTOM = [59, 130, 246]; // bleu
const PIP = [255, 255, 255];

const mix = (a, b, t) => Math.round(a + (b - a) * t);

/** Couverture anti-crénelée d'un disque (supersampling léger). */
function pipCoverage(px, py, cx, cy, r) {
  const d = Math.hypot(px - cx, py - cy);
  if (d <= r - 0.75) return 1;
  if (d >= r + 0.75) return 0;
  return (r + 0.75 - d) / 1.5;
}

/** Masque d'un carré à coins arrondis (1 dedans, 0 dehors). */
function roundedRectMask(px, py, x0, y0, x1, y1, radius) {
  const dx = Math.max(x0 - px, 0, px - x1);
  const dy = Math.max(y0 - py, 0, py - y1);
  if (dx === 0 && dy === 0) {
    const ix = Math.min(px - x0, x1 - px);
    const iy = Math.min(py - y0, y1 - py);
    if (ix >= radius || iy >= radius) return 1;
    const cx = px < x0 + radius ? x0 + radius : x1 - radius;
    const cy = py < y0 + radius ? y0 + radius : y1 - radius;
    const d = Math.hypot(px - cx, py - cy);
    return d <= radius ? 1 : 0;
  }
  return 0;
}

function renderIcon(size) {
  const png = new PNG({ width: size, height: size });
  const d = png.data;
  // Le dé occupe la zone de sécurité maskable (~78 %), centré.
  const pad = size * 0.11;
  const x0 = pad;
  const y0 = pad;
  const x1 = size - pad;
  const y1 = size - pad;
  const radius = (x1 - x0) * 0.22;

  // Pips de la face 5 : 4 coins + centre, sur une grille 3×3.
  const span = (x1 - x0) * 0.62;
  const gx0 = (x0 + x1) / 2 - span / 2;
  const gy0 = (y0 + y1) / 2 - span / 2;
  const step = span / 2;
  const pipR = span * 0.16;
  const pips = [
    [gx0, gy0],
    [gx0 + 2 * step, gy0],
    [gx0 + step, gy0 + step],
    [gx0, gy0 + 2 * step],
    [gx0 + 2 * step, gy0 + 2 * step],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) << 2;
      const px = x + 0.5;
      const py = y + 0.5;
      const inDie = roundedRectMask(px, py, x0, y0, x1, y1, radius);
      if (!inDie) {
        d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0; // fond transparent
        continue;
      }
      const t = (py - y0) / (y1 - y0);
      let r = mix(BG_TOP[0], BG_BOTTOM[0], t);
      let g = mix(BG_TOP[1], BG_BOTTOM[1], t);
      let b = mix(BG_TOP[2], BG_BOTTOM[2], t);
      let cov = 0;
      for (const [cx, cy] of pips) {
        cov = Math.max(cov, pipCoverage(px, py, cx, cy, pipR));
      }
      r = mix(r, PIP[0], cov);
      g = mix(g, PIP[1], cov);
      b = mix(b, PIP[2], cov);
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = 255;
    }
  }
  return png;
}

const sizes = [
  { s: 192, name: 'icon-192.png' },
  { s: 512, name: 'icon-512.png' },
  { s: 180, name: 'apple-touch-icon.png' },
  { s: 64, name: 'favicon.png' },
];

for (const { s, name } of sizes) {
  await writeFile(join(outDir, name), PNG.sync.write(renderIcon(s)));
}

console.log(
  'Icônes écrites dans public/icons/ (192, 512, apple-touch 180, favicon 64).'
);
