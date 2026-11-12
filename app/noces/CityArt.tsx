'use client';

/* Illustrations peintes de la page Noces : logo tracé au pinceau, néons de Tokyo,
 * cerf de Nara à l'encre et lanternes d'Osaka.
 * Chaque trait peint est révélé par un masque « coup de pinceau » : un tracé épais
 * (pathLength 100) dont le --paint (0 → 1) fait avancer le pointillé. */

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type Pt = readonly [number, number];

/** Courbe lisse (Catmull-Rom → Bézier) passant par tous les points. */
function spline(points: readonly Pt[]) {
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Générateur pseudo-aléatoire déterministe : même dessin côté serveur et navigateur. */
function random(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Un trait peint : `children` n'apparaît que sous le passage du pinceau `brush`. */
function Painted({ id, brush, width, at, span, children }: {
  id: string; brush: string; width: number; at: number; span: number; children: ReactNode;
}) {
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse">
        <path d={brush} pathLength={100} strokeWidth={width} className="fx-brush"
          style={{ '--a': at, '--s': span } as CSSProperties} />
      </mask>
      <g mask={`url(#${id})`}>{children}</g>
    </>
  );
}

/* ---------- Logo : le monogramme tracé en quatre coups de pinceau ---------- */

/** Coups de pinceau du monogramme (viewBox 1080) dans l'ordre d'écriture : ligne médiane,
 * profil d'épaisseur (position 0 → 1, largeur) relevé sur le logo, départ et durée. */
const LOGO_STROKES: { points: Pt[]; widths: Pt[]; delay: number; duration: number; seed: number }[] = [
  // Anneau gauche : délié en haut, plein sur la gauche, s'affine vers le bas.
  {
    points: [[458, 60], [370, 84], [290, 124], [220, 180], [165, 245], [120, 330], [95, 430], [90, 540], [100, 650], [130, 750], [180, 840], [260, 920], [360, 975], [455, 992], [515, 978]],
    widths: [[0, 5], [0.12, 16], [0.28, 55], [0.45, 86], [0.6, 80], [0.75, 56], [0.9, 34], [1, 16]],
    delay: 0.3, duration: 1.2, seed: 3,
  },
  // Le S, qui naît de l'anneau et revient le rejoindre en bas.
  {
    points: [[300, 120], [262, 190], [248, 262], [258, 340], [300, 420], [380, 490], [470, 560], [550, 630], [610, 700], [630, 780], [615, 860], [570, 930], [495, 978]],
    widths: [[0, 22], [0.15, 66], [0.35, 92], [0.55, 98], [0.75, 84], [0.9, 50], [1, 20]],
    delay: 1.4, duration: 1, seed: 17,
  },
  // Le fût du D, coupé en biais.
  {
    points: [[540, 52], [540, 260], [540, 470], [574, 528]],
    widths: [[0, 88], [0.08, 96], [0.82, 94], [1, 26]],
    delay: 2.35, duration: 0.5, seed: 29,
  },
  // La panse du D : plein à droite, délié jusqu'au bas.
  {
    points: [[592, 62], [710, 95], [840, 180], [925, 295], [975, 425], [988, 560], [970, 700], [920, 815], [840, 910], [720, 985], [590, 1020], [470, 1025]],
    widths: [[0, 8], [0.1, 22], [0.25, 50], [0.4, 80], [0.52, 88], [0.65, 78], [0.78, 52], [0.9, 24], [1, 4]],
    delay: 2.8, duration: 1.2, seed: 41,
  },
];

/** Points d'une courbe lisse (même découpage que `spline`), échantillonnés finement. */
function sample(points: readonly Pt[], steps = 14): Pt[] {
  const out: Pt[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 1; k <= steps; k++) {
      const t = k / steps, u = 1 - t;
      const at = (j: 0 | 1) => u * u * u * p1[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p2[j];
      out.push([at(0), at(1)]);
    }
  }
  return out;
}

/** Épaisseur interpolée le long du trait (position 0 → 1). */
function profile(widths: readonly Pt[]) {
  return (s: number) => {
    let i = 1;
    while (i < widths.length - 1 && widths[i][0] < s) i++;
    const [s0, w0] = widths[i - 1];
    const [s1, w1] = widths[i];
    const t = Math.min(1, Math.max(0, (s - s0) / (s1 - s0)));
    return w0 + (w1 - w0) * (t * t * (3 - 2 * t));
  };
}

const round = (list: Pt[]) => list.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as Pt);

/** Un coup de pinceau poil par poil. Chaque poil suit la ligne médiane à sa place dans la
 * largeur (qui varie avec la pression) ; les poils du bord s'assèchent plus tôt et se
 * cassent en stries, ce qui laisse apparaître le papier (« pinceau volant »). Dessous, un
 * lavis léger figure l'encre qui diffuse dans le papier. */
function paintBrush(points: readonly Pt[], widths: readonly Pt[], seed: number, hairs = 22) {
  const pts = sample(points, 5);
  const rand = random(seed);
  const phase = Array.from({ length: 6 }, () => rand() * Math.PI * 2);
  const widthAt = profile(widths);
  const maxWidth = Math.max(...widths.map(([, w]) => w));
  const lengths = [0];
  for (let i = 1; i < pts.length; i++) lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = lengths[lengths.length - 1];

  const frame = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const s = lengths[i] / total;
    const pressure = 1 + 0.08 * Math.sin(s * 9 + phase[0]) + 0.05 * Math.sin(s * 23 + phase[1]);
    return { p, nx: -(b[1] - a[1]) / len, ny: (b[0] - a[0]) / len, s, half: (widthAt(s) * pressure) / 2 };
  });
  const offset = (u: (s: number) => number) => frame.map(({ p, nx, ny, s, half }) => [p[0] + nx * u(s) * half, p[1] + ny * u(s) * half] as Pt);

  // Lavis : contour un peu plus large que les poils, bords irréguliers.
  const left = offset((s) => 1.06 + 0.05 * Math.sin(s * 53 + phase[2]));
  const right = offset((s) => -1.06 - 0.05 * Math.sin(s * 47 + phase[3])).reverse();
  const wash = `M${round([...left, ...right]).map(([x, y]) => `${x} ${y}`).join(' L')} Z`;

  const hairWidth = (maxWidth / hairs) * 1.7;
  const bristles = Array.from({ length: hairs }, (_, j) => {
    const u = -1 + (2 * (j + 0.5)) / hairs + (rand() - 0.5) * (0.7 / hairs);
    const wander = rand() * Math.PI * 2;
    const edge = Math.abs(u);
    // Le poil s'écarte un peu de sa place, comme une touffe qui s'ouvre.
    const line = offset((s) => u * (1 + 0.04 * Math.sin(s * 17 + wander)));
    // Où il commence à manquer d'encre, et où il quitte le papier.
    const dry = edge > 0.62 ? 0.35 + 0.5 * rand() : 0.7 + 0.45 * rand();
    const stop = edge > 0.7 && rand() < 0.55 ? 0.8 + 0.2 * rand() : 1.02;
    const dash: number[] = [];
    let pos = Math.min(dry, stop) * total;
    dash.push(Math.round(pos));
    while (pos < stop * total) {
      const t = pos / total;
      const gap = (3 + 20 * rand()) * (0.5 + t);
      const ink = (30 + 110 * rand()) * (1.3 - 0.7 * t);
      dash.push(Math.round(gap), Math.round(ink));
      pos += gap + ink;
    }
    dash.push(Math.round(total * 2));
    return {
      d: spline(round(line)),
      width: Math.round(hairWidth * (0.8 + 0.4 * rand()) * 10) / 10,
      opacity: Math.round((0.5 + 0.45 * rand()) * 100) / 100,
      dash: dash.length % 2 ? [...dash, 0].join(' ') : dash.join(' '),
    };
  });
  return { wash, bristles, length: Math.ceil(total) + 4 };
}

/** Géométrie calculée dans le navigateur : environ 90 tracés qui alourdiraient le HTML statique. */
function buildLogo() {
  return LOGO_STROKES.map((stroke) => ({
    ...stroke,
    centre: spline(stroke.points),
    reach: Math.max(...stroke.widths.map(([, w]) => w)) + 80,
    ...paintBrush(stroke.points, stroke.widths, stroke.seed),
  }));
}

/** Le monogramme peint sous nos yeux, comme l'ensō d'origine : chaque coup de pinceau est
 * découvert progressivement le long de sa ligne médiane. */
export function PaintedLogo() {
  const [strokes, setStrokes] = useState<ReturnType<typeof buildLogo>>([]);
  useEffect(() => setStrokes(buildLogo()), []);
  return (
    <svg className="fx-logo-paint" viewBox="0 0 1080 1080" role="img" aria-label="Monogramme de Solenne et Dorian, peint au pinceau">
      <defs>
        {/* Bords qui tremblent légèrement et encre qui boit le papier. */}
        <filter id="fx-logo-ink" filterUnits="userSpaceOnUse" x="-60" y="-60" width="1200" height="1200">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" />
        </filter>
        <filter id="fx-logo-bleed" filterUnits="userSpaceOnUse" x="-60" y="-60" width="1200" height="1200">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="21" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" result="d" />
          <feGaussianBlur in="d" stdDeviation="3.5" />
        </filter>
        <filter id="fx-logo-reveal" filterUnits="userSpaceOnUse" x="-60" y="-60" width="1200" height="1200">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="40" />
        </filter>
        {strokes.map((stroke, i) => (
          <mask key={i} id={`fx-logo-m${i}`} maskUnits="userSpaceOnUse" x="-60" y="-60" width="1200" height="1200">
            <path d={stroke.centre} className="fx-logo-brush" filter="url(#fx-logo-reveal)" strokeWidth={stroke.reach}
              style={{ '--len': `${stroke.length}px`, animationDelay: `${stroke.delay}s`, animationDuration: `${stroke.duration}s` } as CSSProperties} />
          </mask>
        ))}
      </defs>
      {strokes.map((stroke, i) => (
        <g key={i} mask={`url(#fx-logo-m${i})`}>
          <path d={stroke.wash} className="fx-logo-wash" filter="url(#fx-logo-bleed)" />
          <g className="fx-logo-hairs" filter="url(#fx-logo-ink)">
            {stroke.bristles.map((hair, j) => (
              <path key={j} d={hair.d} strokeWidth={hair.width} strokeOpacity={hair.opacity} strokeDasharray={hair.dash} />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Nara : un cerf sika à l'encre, devant la pagode du Kōfuku-ji ---------- */

const DEER_BODY = 'M40 84 Q38 76 48 70 L64 58 Q72 51 82 51 Q92 53 96 62 C102 80 110 96 126 104 C152 109 182 102 208 105 C224 107 234 117 235 131 C236 147 228 160 220 166 C198 173 160 171 136 168 C120 166 108 160 104 150 C100 134 97 116 90 104 C84 95 72 91 60 91 Q48 91 40 84 Z';

const DEER_LEGS = [
  { d: 'M108 154 C112 175 116 190 113 202 L110 238 L117 240 L120 202 C124 188 126 172 128 160 Z', brush: 'M118 150 L116 200 L113 242', far: false, at: 0.42 },
  { d: 'M124 160 C128 178 134 192 132 204 L136 236 L142 236 L139 203 C142 188 142 172 140 162 Z', brush: 'M132 156 L136 204 L139 240', far: true, at: 0.48 },
  { d: 'M200 138 C218 140 230 150 227 168 C225 180 219 190 217 198 L213 238 L206 238 L208 200 C204 188 196 178 190 168 Z', brush: 'M210 140 L214 172 L212 200 L209 242', far: false, at: 0.52 },
  { d: 'M178 160 C186 172 194 184 196 196 L192 236 L186 236 L188 198 C182 186 174 176 170 166 Z', brush: 'M176 158 L192 194 L189 240', far: true, at: 0.58 },
];

/** Hauteur de chaque toit de la pagode, du sommet vers le sol. */
const PAGODA_ROOFS = [56, 90, 124, 158, 194];

const DEER_SPOTS: Pt[] = [[140, 116], [156, 120], [172, 113], [188, 118], [203, 113], [162, 132], [180, 129], [196, 131], [214, 123], [148, 130]];

export function NaraDeer() {
  return (
    <svg className="fx-deer" viewBox="0 0 320 280" role="img" aria-label="Un cerf sika peint à l'encre, devant une pagode">
      <defs>
        <filter id="fx-wet" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" result="d" />
          <feGaussianBlur in="d" stdDeviation=".9" />
        </filter>
        <filter id="fx-dry" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency=".015 .45" numOctaves="2" seed="9" result="s" />
          <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.75" result="sa" />
          <feComposite in="d" in2="sa" operator="in" />
        </filter>
        <filter id="fx-soft"><feGaussianBlur stdDeviation="2.5" /></filter>
      </defs>

      {/* Soleil et pagode, en lavis léger */}
      <circle cx="262" cy="52" r="26" className="fx-deer-sun" filter="url(#fx-soft)" />
      <g className="fx-deer-pagoda" filter="url(#fx-wet)">
        {/* Étages : murs clairs, puis avant-toits sombres aux pointes relevées. */}
        {PAGODA_ROOFS.map((y, i) => {
          const half = 22 + i * 3.4;
          const next = PAGODA_ROOFS[i + 1] ?? 236;
          return <rect key={`w${y}`} x={272 - half * 0.5} y={y} width={half} height={next - y} className="fx-deer-pagoda-wall" />;
        })}
        {PAGODA_ROOFS.map((y, i) => {
          const half = 22 + i * 3.4;
          return (
            <path key={y} className="fx-deer-pagoda-roof"
              d={`M${272 - half - 3} ${y - 4} Q${272 - half * 0.6} ${y - 1} 272 ${y - 7} Q${272 + half * 0.6} ${y - 1} ${272 + half + 3} ${y - 4} Q${272 + half * 0.7} ${y + 4} 272 ${y + 1} Q${272 - half * 0.7} ${y + 4} ${272 - half - 3} ${y - 4} Z`} />
          );
        })}
        <path d="M271.2 8 h1.6 v45 h-1.6 Z M267 20 h10 v1.6 h-10 Z M267 27 h10 v1.6 h-10 Z M267 34 h10 v1.6 h-10 Z M267 41 h10 v1.6 h-10 Z" className="fx-deer-pagoda-roof" />
      </g>

      {/* Le cerf : lavis du corps, puis traits secs */}
      <Painted id="fx-deer-wash" brush="M52 76 L96 96 L112 136 L170 138 L226 136" width={72} at={0.18} span={0.3}>
        <path d={DEER_BODY} className="fx-deer-wash" filter="url(#fx-wet)" />
      </Painted>
      <g filter="url(#fx-dry)">
        <Painted id="fx-deer-back" brush="M96 62 C102 80 110 96 126 104 C152 109 182 102 208 105 C224 107 234 117 235 131 C236 146 229 158 221 165" width={16} at={0} span={0.22}>
          <path d="M96 62 C102 80 110 96 126 104 C152 109 182 102 208 105 C224 107 234 117 235 131 C236 146 229 158 221 165" className="fx-deer-ink" strokeWidth={8} />
        </Painted>
        <Painted id="fx-deer-head" brush="M98 60 Q90 50 80 50 Q70 51 62 58 L46 70 Q38 78 42 86" width={14} at={0.12} span={0.12}>
          <path d="M40 84 Q38 76 48 70 L64 58 Q72 51 82 51 Q92 53 96 62" className="fx-deer-ink" strokeWidth={5} />
          <path d="M40 84 Q38 76 48 70 L62 60 Q58 72 60 80 Q52 84 40 84 Z" className="fx-deer-solid" />
        </Painted>
        <Painted id="fx-deer-belly" brush="M42 86 Q60 91 84 104 C96 124 102 144 112 160 C140 170 190 172 222 166" width={10} at={0.3} span={0.16}>
          <path d="M42 86 Q50 91 60 91 C72 91 84 95 90 104 C97 116 100 134 104 150 C108 160 120 166 136 168 C160 171 198 173 220 166" className="fx-deer-ink" strokeWidth={3} strokeOpacity={0.7} />
        </Painted>
        {DEER_LEGS.map((leg, i) => (
          <Painted key={i} id={`fx-deer-leg${i}`} brush={leg.brush} width={30} at={leg.at} span={0.1}>
            <path d={leg.d} className="fx-deer-solid" fillOpacity={leg.far ? 0.55 : 1} />
          </Painted>
        ))}
        <Painted id="fx-deer-ear" brush="M94 60 L120 47" width={22} at={0.62} span={0.06}>
          <path d="M92 58 Q106 46 120 47 Q110 60 97 66 Z" className="fx-deer-solid" />
        </Painted>
        <Painted id="fx-deer-tail" brush="M231 120 L244 116" width={18} at={0.64} span={0.05}>
          <path d="M233 115 Q246 110 242 128 Q237 122 232 124 Z" className="fx-deer-solid" />
        </Painted>
        <Painted id="fx-deer-antler" brush="M84 50 C86 34 92 20 104 6" width={10} at={0.68} span={0.08}>
          <path d="M84 50 C86 34 92 20 104 6 M88 30 C82 22 78 16 76 8 M96 18 C100 14 106 14 112 12" className="fx-deer-ink" strokeWidth={5} />
        </Painted>
        <Painted id="fx-deer-antler2" brush="M88 32 L74 6 M96 18 L114 10" width={14} at={0.74} span={0.05}>
          <path d="M88 30 C82 22 78 16 76 8 M96 18 C100 14 106 14 112 12" className="fx-deer-ink" strokeWidth={5} />
        </Painted>
        <Painted id="fx-deer-antler3" brush="M78 52 C74 36 70 24 62 12 M72 30 L52 16" width={12} at={0.78} span={0.06}>
          <path d="M78 52 C74 36 70 24 62 12 M72 30 C64 28 58 22 54 18" className="fx-deer-ink" strokeWidth={4} strokeOpacity={0.55} />
        </Painted>
        <Painted id="fx-deer-ground" brush="M14 242 C80 236 160 244 306 238" width={12} at={0.84} span={0.12}>
          <path d="M14 242 C80 236 160 244 306 238" className="fx-deer-ink" strokeWidth={3} strokeOpacity={0.6} />
          <path d="M40 240 q4 -10 10 -14 M46 241 q0 -8 -4 -12 M262 238 q3 -9 9 -12 M268 238 q-1 -7 -5 -11" className="fx-deer-ink" strokeWidth={2} strokeOpacity={0.55} />
        </Painted>
      </g>
      <g className="fx-deer-spots">
        {DEER_SPOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i > 4 ? 2.2 : 2.6} />)}
      </g>
      <g className="fx-deer-eye">
        <circle cx="68" cy="66" r="2.6" />
        <circle cx="68.6" cy="65.4" r=".8" className="fx-deer-glint" />
      </g>
      {/* Sceau rouge du peintre */}
      <g className="fx-deer-seal" transform="translate(290 196) rotate(3)">
        <rect x="-11" y="-14" width="22" height="28" rx="2" />
        <text x="0" y="5" textAnchor="middle" lang="ja">鹿</text>
      </g>
    </svg>
  );
}

/* ---------- Tokyo : la Skytree peinte à la gouache claire sur la nuit ---------- */

/** Bord gauche du fût entre la base (y = 1000) et la première plateforme (y = 430) : la base
 * en trépied s'affine jusqu'au cylindre. Le bord droit est symétrique (axe x = 120). */
const shaftLeft = (y: number) => {
  const t = (1000 - y) / 570;
  return 72 + 34 * (1 - (1 - t) ** 2.2);
};

/** Croisillons de la structure, tracés à main levée : chaque diagonale est un petit trait
 * légèrement courbe, qui ne touche pas toujours exactement les bords. */
const LATTICE = (() => {
  const rand = random(57);
  const jitter = (v: number, a: number) => v + (rand() - 0.5) * a;
  const parts: string[] = [];
  for (let y = 996; y > 446; y -= 30) {
    const y2 = y - 30;
    for (const flip of [false, true]) {
      const x1 = flip ? 240 - shaftLeft(y) : shaftLeft(y);
      const x2 = flip ? shaftLeft(y2) : 240 - shaftLeft(y2);
      const a: Pt = [jitter(x1, 3), jitter(y, 4)];
      const b: Pt = [jitter(x2, 3), jitter(y2, 4)];
      const c: Pt = [(a[0] + b[0]) / 2 + (rand() - 0.5) * 6, (a[1] + b[1]) / 2 + (rand() - 0.5) * 4];
      parts.push(`M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
    }
  }
  return parts.join(' ');
})();

/** Taches de lumière de la ville au pied de la tour, posées à l'aquarelle. */
const CITY_LIGHTS = (() => {
  const rand = random(71);
  const colours = ['#ffe6b8', '#ffc98a', '#a8e6e0', '#8fd3a8', '#f2a7a0'];
  return Array.from({ length: 30 }, () => ({
    x: Math.round(-110 + rand() * 460),
    y: Math.round(950 + rand() * 50),
    r: Math.round((2.5 + rand() * 5) * 10) / 10,
    c: colours[Math.floor(rand() * colours.length)],
  }));
})();

const SKYTREE_LEFT: Pt[] = [[72, 1000], [80, 900], [89, 800], [96, 700], [102, 600], [105, 500], [106, 430], [108, 382], [110, 300], [111, 215], [114, 196], [114, 120]];

/** Coups de pinceau de la tour, dans l'ordre où ils sont peints (--paint de 0 à 1). */
const SKYTREE_STROKES: { id: string; points: Pt[]; widths: Pt[]; tone: string; at: number; span: number; hairs: number; seed: number }[] = [
  { id: 'city1', points: [[-110, 986], [40, 978], [200, 987], [350, 980]], widths: [[0, 5], [0.5, 15], [1, 6]], tone: 'teal', at: 0, span: 0.2, hairs: 9, seed: 5 },
  { id: 'city2', points: [[-80, 1002], [120, 996], [330, 1003]], widths: [[0, 4], [0.5, 11], [1, 5]], tone: 'dim', at: 0.06, span: 0.18, hairs: 8, seed: 6 },
  { id: 'left', points: SKYTREE_LEFT, widths: [[0, 17], [0.45, 10], [0.85, 6.5], [1, 4]], tone: 'pale', at: 0.12, span: 0.32, hairs: 5, seed: 11 },
  { id: 'right', points: SKYTREE_LEFT.map(([x, y]) => [240 - x, y] as Pt), widths: [[0, 17], [0.45, 10], [0.85, 6.5], [1, 4]], tone: 'pale', at: 0.2, span: 0.32, hairs: 5, seed: 12 },
  { id: 'centre', points: [[120, 1000], [120, 700], [120, 430]], widths: [[0, 8], [1, 4]], tone: 'dim', at: 0.3, span: 0.2, hairs: 3, seed: 13 },
  { id: 'deck1', points: [[90, 399], [120, 396], [150, 400]], widths: [[0, 9], [0.2, 17], [0.8, 16], [1, 7]], tone: 'warm', at: 0.55, span: 0.08, hairs: 4, seed: 21 },
  { id: 'deck1top', points: [[93, 384], [147, 381]], widths: [[0, 3], [0.5, 6], [1, 3]], tone: 'pale', at: 0.6, span: 0.05, hairs: 4, seed: 22 },
  { id: 'deck1low', points: [[95, 429], [146, 431]], widths: [[0, 3], [0.5, 6], [1, 3]], tone: 'cool', at: 0.63, span: 0.05, hairs: 4, seed: 23 },
  { id: 'shaft', points: [[120, 380], [120, 300], [120, 215]], widths: [[0, 3], [1, 2]], tone: 'dim', at: 0.66, span: 0.06, hairs: 3, seed: 24 },
  { id: 'deck2', points: [[100, 205], [120, 203], [140, 206]], widths: [[0, 7], [0.2, 13], [0.8, 12], [1, 5]], tone: 'warm', at: 0.7, span: 0.07, hairs: 4, seed: 31 },
  { id: 'mast', points: [[120, 196], [120, 120], [120, 60], [120, 8]], widths: [[0, 8], [0.4, 6], [0.75, 4], [1, 1.5]], tone: 'pale', at: 0.76, span: 0.12, hairs: 3, seed: 41 },
];

function buildSkytree() {
  return SKYTREE_STROKES.map((stroke) => ({
    ...stroke,
    brush: spline(stroke.points),
    reach: Math.max(...stroke.widths.map(([, w]) => w)) + 18,
    ...paintBrush(stroke.points, stroke.widths, stroke.seed, stroke.hairs),
  }));
}

export function TokyoSkytree() {
  // Pinceau calculé dans le navigateur (une centaine de tracés), comme pour le logo.
  const [strokes, setStrokes] = useState<ReturnType<typeof buildSkytree>>([]);
  useEffect(() => setStrokes(buildSkytree()), []);
  const ys = [1000, 900, 800, 700, 600, 500, 430];
  const left = ys.map((y) => `${shaftLeft(y).toFixed(1)} ${y}`);
  const right = [...ys].reverse().map((y) => `${(240 - shaftLeft(y)).toFixed(1)} ${y}`);
  const body = `M${left.join(' L')} L108 382 L111 215 L114 196 L114 120 L117 30 L123 30 L126 120 L126 196 L129 215 L132 382 L${right.join(' L')} Z`;
  return (
    <div className="fx-skytree" aria-hidden="true">
      <svg viewBox="0 0 240 1000" preserveAspectRatio="xMidYMax meet">
        <defs>
          <filter id="fx-tk-wet" filterUnits="userSpaceOnUse" x="-200" y="-40" width="640" height="1100">
            <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="8" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="6" result="d" />
            <feGaussianBlur in="d" stdDeviation="1.4" />
          </filter>
          <filter id="fx-tk-grain" filterUnits="userSpaceOnUse" x="-200" y="-40" width="640" height="1100">
            <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="15" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="11" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="3" seed="27" result="g" />
            <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="ga" />
            <feComposite in="d" in2="ga" operator="in" result="c" />
            <feGaussianBlur in="c" stdDeviation=".7" />
          </filter>
          <filter id="fx-tk-dry" filterUnits="userSpaceOnUse" x="-200" y="-40" width="640" height="1100">
            <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
          <filter id="fx-tk-halo" filterUnits="userSpaceOnUse" x="-200" y="-40" width="640" height="1100">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Halo de lumière, posé au lavis mouillé */}
        <g className="fx-tk-halo" filter="url(#fx-tk-halo)">
          <ellipse cx="120" cy="400" rx="62" ry="44" />
          <ellipse cx="120" cy="205" rx="40" ry="26" />
          <ellipse cx="120" cy="720" rx="46" ry="300" className="fx-tk-halo-soft" />
        </g>

        {/* Silhouette : lavis sombre, comme le corps du cerf */}
        <Painted id="fx-tk-body" brush="M120 1004 V20" width={120} at={0.04} span={0.4}>
          <path d={body} className="fx-tk-body" filter="url(#fx-tk-grain)" />
        </Painted>

        <g className="fx-tk-city" filter="url(#fx-tk-wet)">
          {CITY_LIGHTS.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={l.c} />)}
        </g>

        <Painted id="fx-tk-lattice" brush="M120 1004 V426" width={130} at={0.36} span={0.24}>
          <path d={LATTICE} className="fx-tk-lattice" filter="url(#fx-tk-dry)" />
        </Painted>

        <g filter="url(#fx-tk-dry)">
          {strokes.map((stroke) => (
            <Painted key={stroke.id} id={`fx-tk-${stroke.id}`} brush={stroke.brush} width={stroke.reach} at={stroke.at} span={stroke.span}>
              <g className={`fx-tk-stroke fx-tk-${stroke.tone}`}>
                <path d={stroke.wash} className="fx-tk-wash" />
                {stroke.bristles.map((hair, j) => (
                  <path key={j} d={hair.d} strokeWidth={hair.width} strokeOpacity={hair.opacity} strokeDasharray={hair.dash} />
                ))}
              </g>
            </Painted>
          ))}
        </g>

        {/* Feu de balisage et sceau du peintre, au vermillon */}
        <g className="fx-tk-beacon"><circle cx="120" cy="8" r="4" filter="url(#fx-tk-wet)" /></g>
        <g className="fx-tk-seal" transform="translate(206 948) rotate(-3)">
          <rect x="-10" y="-13" width="20" height="26" rx="2" />
          <text x="0" y="5" textAnchor="middle" lang="ja">塔</text>
        </g>
      </svg>
    </div>
  );
}

/* ---------- Osaka : guirlande de lanternes rouges au-dessus du canal ---------- */

const LANTERNS = [
  { x: 60, kanji: '食', drop: 26 },
  { x: 132, kanji: '酒', drop: 58 },
  { x: 204, kanji: '祭', drop: 30 },
  { x: 276, kanji: '串', drop: 66 },
  { x: 348, kanji: '蛸', drop: 22 },
];

export function OsakaLanterns() {
  const wire = (x: number) => 24 + 80 * (x / 400) * (1 - x / 400);
  return (
    <div className="fx-lanterns" aria-hidden="true">
      <svg viewBox="0 0 400 230">
        <defs>
          <radialGradient id="fx-lantern-glow" cx="50%" cy="48%" r="60%">
            <stop offset="0" stopColor="#ffe7a3" />
            <stop offset=".35" stopColor="#ff9a4a" />
            <stop offset=".8" stopColor="#d8402a" />
            <stop offset="1" stopColor="#8f1f17" />
          </radialGradient>
        </defs>
        <path d="M0 24 Q200 104 400 24" className="fx-lantern-wire" />
        {LANTERNS.map(({ x, kanji, drop }, i) => {
          const top = wire(x);
          const cy = top + drop + 36;
          return (
            <g key={kanji} className="fx-lantern" style={{ transformOrigin: `${x}px ${top}px`, animationDelay: `${-i * 0.7}s` } as CSSProperties}>
              <path d={`M${x} ${top} V${top + drop}`} className="fx-lantern-wire" />
              <rect x={x - 11} y={top + drop} width={22} height={7} rx={1.5} className="fx-lantern-cap" />
              <ellipse cx={x} cy={cy} rx={25} ry={31} fill="url(#fx-lantern-glow)" className="fx-lantern-body" />
              {[-20, -10, 0, 10, 20].map((dy) => (
                <path key={dy} d={`M${x - Math.sqrt(1 - (dy / 31) ** 2) * 25} ${cy + dy} Q${x} ${cy + dy + 4} ${x + Math.sqrt(1 - (dy / 31) ** 2) * 25} ${cy + dy}`} className="fx-lantern-rib" />
              ))}
              <text x={x} y={cy + 8} textAnchor="middle" className="fx-lantern-kanji" lang="ja">{kanji}</text>
              <rect x={x - 11} y={cy + 29} width={22} height={7} rx={1.5} className="fx-lantern-cap" />
              <path d={`M${x} ${cy + 36} V${cy + 50}`} className="fx-lantern-tassel" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
