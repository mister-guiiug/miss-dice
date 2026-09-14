/**
 * Génère les icônes PWA de miss-dice.
 *
 * Contrairement aux autres projets de la famille, miss-dice n'a pas de logo
 * bitmap source : l'icône (un dé affichant la face 5) est dessinée
 * procéduralement en pixels. Le dessin reste donc ici, entier ; seul
 * l'encodage PNG est confié à sharp.
 *
 * SHARP PLUTÔT QUE PNGJS. Le dépôt portait DEUX bibliothèques d'images pour un
 * seul travail : `sharp`, exigé par `pwa-icons` du socle, et `pngjs`, que ce
 * script était seul à employer. L'en-tête d'alors s'en justifiait par « aucune
 * dépendance native » — ce qui a cessé d'être vrai le jour où le socle est
 * entré. Restait le coût : `pngjs` n'a plus rien publié depuis février 2023 et
 * figurait, à ce titre, parmi les librairies dormantes du parc.
 *
 * Les pixels ne bougent pas d'un iota : le dessin est le même, et les deux
 * encodeurs écrivent le même PNG sans perte. Ce sont les octets qui changent,
 * sharp compressant mieux — le 512 tombe de 15,1 à 11,8 ko.
 *
 * CE QUI EXPLIQUE QUE `public/icons/` NE SOIT PAS REDEVENU IDENTIQUE. Les
 * quatre fichiers à fond transparent datent du premier commit et sont plus
 * compressés que ce que produit aujourd'hui l'un ou l'autre encodeur — ils ont
 * été optimisés après coup. Les régénérer ajouterait 2,7 ko à l'application
 * sans changer un pixel, alors ils restent tels quels.
 *
 * Exécuter : npm run icons
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
await mkdir(outDir, { recursive: true });

// Palette alignée sur le theme_color du manifest / tokens.css.
const BG_TOP = [124, 92, 246]; // violet
const BG_BOTTOM = [59, 130, 246]; // bleu
const PIP = [255, 255, 255];

/**
 * Niveau 9 et filtrage adaptatif, et non les défauts de sharp (niveau 6,
 * filtre fixe) : ceux-là rendaient des fichiers plus lourds que pngjs, qui
 * compresse au maximum. Sans perte dans les deux cas — une palette, elle,
 * allégerait encore mais quantifierait le dégradé, qui se mettrait à bander.
 */
const PNG_OPTIONS = { compressionLevel: 9, adaptiveFiltering: true };

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

/** Les cinq pips de la face 5, sur une grille 3×3 de côté `span`. */
function facesCinq(gx0, gy0, span) {
  const step = span / 2;
  return [
    [gx0, gy0],
    [gx0 + 2 * step, gy0],
    [gx0 + step, gy0 + step],
    [gx0, gy0 + 2 * step],
    [gx0 + 2 * step, gy0 + 2 * step],
  ];
}

function renderIcon(size) {
  const d = Buffer.alloc(size * size * 4);
  // Le dé occupe la zone de sécurité maskable (~78 %), centré.
  const pad = size * 0.11;
  const x0 = pad;
  const y0 = pad;
  const x1 = size - pad;
  const y1 = size - pad;
  const radius = (x1 - x0) * 0.22;

  const span = (x1 - x0) * 0.62;
  const pips = facesCinq(
    (x0 + x1) / 2 - span / 2,
    (y0 + y1) / 2 - span / 2,
    span
  );
  const pipR = span * 0.16;

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
  return d;
}

/**
 * LE MASKABLE EST UNE AUTRE IMAGE, PAS LA MÊME EN PLUS PETIT.
 *
 * L'icône ci-dessus dessine un dé arrondi sur un fond TRANSPARENT, inséré à
 * 11 % du bord. Déclarée `maskable`, elle laissait Android faire deux choses
 * qu'on ne veut pas : remplir la transparence d'un aplat de son choix, puis
 * rogner au masque de l'appareil — et les coins arrondis du dé, eux, se
 * voyaient à l'intérieur du masque. Le résultat est un dé rétréci posé sur du
 * blanc, avec un liseré.
 *
 * Ici le dégradé occupe TOUTE la toile : quel que soit le masque — cercle,
 * squircle, goutte — il n'y a pas de raccord à voir, puisqu'il n'y a pas de
 * bord. C'est la toile entière qui EST la face du dé.
 *
 * LES PIPS TIENNENT DANS LA ZONE DE SÉCURITÉ, le disque de 80 % de la toile.
 * Le point le plus éloigné du centre est un pip de coin :
 *   (span/2)·√2 + rayon = 0,22·1,414 + 0,0792 = 0,390 < 0,4 ✅
 */
function renderMaskable(size) {
  const d = Buffer.alloc(size * size * 4);

  const span = size * 0.44;
  const pips = facesCinq(size / 2 - span / 2, size / 2 - span / 2, span);
  const pipR = span * 0.18;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) << 2;
      const px = x + 0.5;
      const py = y + 0.5;
      const t = py / size;
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
  return d;
}

/** Écrit un tampon RVBA brut en PNG : sharp ne devine pas la géométrie. */
const ecrire = (data, size, name) =>
  sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png(PNG_OPTIONS)
    .toFile(join(outDir, name));

const sizes = [
  { s: 192, name: 'icon-192.png' },
  { s: 512, name: 'icon-512.png' },
  { s: 180, name: 'apple-touch-icon.png' },
  { s: 64, name: 'favicon.png' },
];

for (const { s, name } of sizes) {
  await ecrire(renderIcon(s), s, name);
}

await ecrire(renderMaskable(512), 512, 'icon-maskable.png');

console.log(
  'Icônes écrites dans public/icons/ (192, 512, apple-touch 180, favicon 64, maskable 512).'
);
