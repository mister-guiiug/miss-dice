/**
 * Les six solides des dés, en vraie 3D, projetés en SVG.
 *
 * « D4 », « D12 » : des noms que seuls les joueurs de rôle savent lire. La
 * forme du dé, elle, se reconnaît d'un coup d'œil — encore faut-il que ce
 * soit LA forme, pas une silhouette approximative. On part donc des sommets
 * réels de chaque polyèdre, on en déduit les faces, on le tourne de trois
 * quarts, on le projette, et chaque face visible reçoit un ombrage selon son
 * orientation face à une lumière venue d'en haut à gauche.
 *
 * LES FACES SE DÉDUISENT DES SOMMETS (enveloppe convexe), elles ne sont pas
 * recopiées à la main : une face oubliée ou un sommet mal ordonné ne se
 * verrait qu'à l'écran. Le test vérifie qu'on retrouve 4, 6, 8, 10, 12 et 20
 * faces — ce qui prouve au passage que les cerfs-volants du D10 sont plans.
 *
 * Données pures, sans React ni DOM, calculées une fois par type.
 */
type Vec3 = readonly [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const EPS = 1e-6;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const deg = (d: number) => (d * Math.PI) / 180;

/** Les sommets de chaque solide, posé comme le dé se pose sur une table. */
function vertices(sides: number): Vec3[] {
  switch (sides) {
    case 4: {
      // Tétraèdre sur une face, pointe en haut.
      const r = Math.sqrt(8 / 9);
      return [
        [0, 1, 0],
        ...[90, 210, 330].map(
          a => [r * Math.cos(deg(a)), -1 / 3, r * Math.sin(deg(a))] as Vec3
        ),
      ];
    }
    case 6:
      return [-1, 1].flatMap(x =>
        [-1, 1].flatMap(y => [-1, 1].map(z => [x, y, z] as Vec3))
      );
    case 8:
      // Octaèdre sur une pointe : le losange de la face à plat.
      return [
        [0, 1, 0],
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, 1],
        [0, 0, -1],
      ];
    case 10: {
      // Trapézoèdre pentagonal : deux couronnes de cinq sommets décalées de
      // 36°, deux pointes. Les cerfs-volants ne sont plans que si la pointe
      // est à H = a (1 + cos 36°) / (1 − cos 36°) de l'axe, pour des
      // couronnes à ±a : c'est la seule hauteur libre, l'autre s'en déduit.
      const a = 0.11;
      const c = Math.cos(deg(36));
      const h = (a * (1 + c)) / (1 - c);
      const ring = (y: number, offset: number) =>
        [0, 72, 144, 216, 288].map(
          t => [Math.cos(deg(t + offset)), y, Math.sin(deg(t + offset))] as Vec3
        );
      return [[0, h, 0], [0, -h, 0], ...ring(a, 0), ...ring(-a, 36)];
    }
    case 12: {
      const p = PHI;
      const q = 1 / PHI;
      const out: Vec3[] = [];
      for (const x of [-1, 1])
        for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x, y, z]);
      for (const s of [-1, 1])
        for (const t of [-1, 1])
          out.push([0, s * q, t * p], [s * q, t * p, 0], [s * p, 0, t * q]);
      return out;
    }
    default: {
      // D20 : icosaèdre.
      const out: Vec3[] = [];
      for (const s of [-1, 1])
        for (const t of [-1, 1])
          out.push([0, s, t * PHI], [s, t * PHI, 0], [t * PHI, 0, s]);
      return out;
    }
  }
}

export interface Face {
  readonly vertices: readonly number[];
  readonly normal: Vec3;
}

/**
 * Les faces d'un polyèdre convexe : tout plan passant par trois sommets et
 * laissant tous les autres du même côté en porte une. Vingt sommets au plus,
 * donc 1 140 triplets : rien à optimiser.
 */
function hullFaces(vs: readonly Vec3[]): Face[] {
  const seen = new Set<string>();
  const faces: Face[] = [];
  for (let i = 0; i < vs.length; i++)
    for (let j = i + 1; j < vs.length; j++)
      for (let k = j + 1; k < vs.length; k++) {
        const [a, b, c] = [vs[i]!, vs[j]!, vs[k]!];
        const raw = cross(sub(b, a), sub(c, a));
        if (Math.hypot(...raw) < EPS) continue;
        let n = norm(raw);
        let d = dot(n, a);
        const side = vs.map(v => dot(n, v) - d);
        if (side.some(s => s > EPS)) {
          if (side.some(s => s < -EPS)) continue;
          n = [-n[0], -n[1], -n[2]];
          d = -d;
        }
        const on = vs.flatMap((_, idx) =>
          Math.abs(side[idx]!) <= EPS ? [idx] : []
        );
        const key = on.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        faces.push({ vertices: orderAround(vs, on, n), normal: n });
      }
  return faces;
}

/** Les sommets d'une face, dans l'ordre du tour — sinon le polygone se croise. */
function orderAround(
  vs: readonly Vec3[],
  idx: readonly number[],
  n: Vec3
): number[] {
  const pts = idx.map(i => vs[i]!);
  const mean = (k: 0 | 1 | 2) => pts.reduce((s, p) => s + p[k], 0) / pts.length;
  const c: Vec3 = [mean(0), mean(1), mean(2)];
  const u = norm(sub(pts[0]!, c));
  const w = cross(n, u);
  return [...idx].sort((p, q) => {
    const ap = sub(vs[p]!, c);
    const aq = sub(vs[q]!, c);
    return (
      Math.atan2(dot(ap, w), dot(ap, u)) - Math.atan2(dot(aq, w), dot(aq, u))
    );
  });
}

/** Toutes les faces du solide, visibles ou non — ce que le test compte. */
export function solidFaces(sides: number): readonly Face[] {
  return hullFaces(vertices(sides));
}

/**
 * La vue de trois quarts : un quart de tour (`yaw`), puis vu d'un peu au-dessus
 * (`pitch`).
 *
 * CHOISIE PAR LE CALCUL, PAS À L'ŒIL. Pour chaque solide, parmi les vues qui
 * montrent assez de faces pour avoir du relief, celle dont la face visible la
 * plus « de profil » l'est le moins (`facing` minimal le plus grand). Réglées
 * à l'œil, l'icosaèdre gardait une face presque de chant (0,07) — un trait
 * écrasé en bas du dé —, le D12 et le D8 aussi (0,12 et 0,13). Le test tient
 * désormais le plancher.
 */
const VIEW: Record<number, { yaw: number; pitch: number }> = {
  4: { yaw: 0, pitch: 24 },
  6: { yaw: 40, pitch: 28 },
  8: { yaw: 90, pitch: 12 },
  10: { yaw: 18, pitch: 16 },
  12: { yaw: 90, pitch: 26 },
  20: { yaw: 49, pitch: 26 },
};

/** Une lumière d'en haut à gauche, un peu de face. */
const LIGHT = norm([-0.45, 0.75, 0.55]);
const CAMERA = 7;

export interface ShapeFace {
  /** Le tracé SVG de la face, dans une boîte de 0 à 100. */
  readonly d: string;
  /** Éclairement de la face, de 0 (dos à la lumière) à 1 (en face). */
  readonly light: number;
  /**
   * À quel point la face regarde l'observateur : 0 de profil, 1 de face. Une
   * vue dont une face visible tombe près de 0 dessine un trait écrasé.
   */
  readonly facing: number;
}

const cache = new Map<number, readonly ShapeFace[]>();

/**
 * Les faces VISIBLES du dé à `sides` faces, projetées dans une boîte de
 * 0 à 100. Un solide convexe n'a pas de faces visibles qui se recouvrent :
 * aucun tri n'est nécessaire.
 */
export function dieShape(sides: number): readonly ShapeFace[] {
  const hit = cache.get(sides);
  if (hit) return hit;
  const shape = project(sides, VIEW[sides] ?? VIEW[20]!);
  cache.set(sides, shape);
  return shape;
}

/** Le solide vu sous un angle donné — `dieShape` en garde un par type. */
export function project(
  sides: number,
  view: { yaw: number; pitch: number }
): ShapeFace[] {
  const [cy, sy] = [Math.cos(deg(view.yaw)), Math.sin(deg(view.yaw))];
  const [cp, sp] = [Math.cos(deg(view.pitch)), Math.sin(deg(view.pitch))];
  const turn = (v: Vec3): Vec3 => {
    const x = v[0] * cy + v[2] * sy;
    const z = -v[0] * sy + v[2] * cy;
    return [x, v[1] * cp - z * sp, v[1] * sp + z * cp];
  };

  const vs = vertices(sides);
  const faces = hullFaces(vs);
  const turned = vs.map(turn);
  // Une perspective douce : ce qui est devant grandit un peu.
  const flat = turned.map(([x, y, z]) => {
    const k = CAMERA / (CAMERA - z);
    return [x * k, -y * k] as const;
  });

  const xs = flat.map(p => p[0]);
  const ys = flat.map(p => p[1]);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const pad = 5;
  const scale = (100 - 2 * pad) / Math.max(maxX - minX, maxY - minY);
  const ox = (100 - (maxX - minX) * scale) / 2;
  const oy = (100 - (maxY - minY) * scale) / 2;
  const at = (i: number) => {
    const [x, y] = flat[i]!;
    return `${((x - minX) * scale + ox).toFixed(1)} ${((y - minY) * scale + oy).toFixed(1)}`;
  };

  return faces.flatMap(face => {
    const n = turn(face.normal);
    if (n[2] <= EPS) return [];
    return [
      {
        d: `M${face.vertices.map(at).join('L')}Z`,
        light: Math.max(0, dot(n, LIGHT)),
        facing: n[2],
      },
    ];
  });
}
