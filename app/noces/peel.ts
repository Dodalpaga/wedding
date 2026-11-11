/* Décollage d'un autocollant à partir de son coin supérieur droit.
 * Le coin C, tiré jusqu'au point Q, se replie le long de la médiatrice de [CQ] :
 * la partie du côté de C est retirée de la page et réapparaît, réfléchie, comme le rabat (dos de l'autocollant). */

export type Pt = { x: number; y: number };
export type Peel = { keep: Pt[]; flap: Pt[]; fold: Pt; corner: Pt };

/** Découpe d'un polygone convexe par un demi-plan (Sutherland–Hodgman). */
function clip(points: Pt[], inside: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const da = inside(a), db = inside(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

/** w, h : taille de l'autocollant ; q : position du coin supérieur droit une fois tiré. */
export function peel(w: number, h: number, q: Pt): Peel {
  const c = { x: w, y: 0 };
  const rect = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
  const dx = q.x - c.x, dy = q.y - c.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return { keep: rect, flap: [], fold: c, corner: c };
  const n = { x: dx / len, y: dy / len };
  const m = { x: (c.x + q.x) / 2, y: (c.y + q.y) / 2 };
  const side = (p: Pt) => (p.x - m.x) * n.x + (p.y - m.y) * n.y;
  const keep = clip(rect, side);
  const lifted = clip(rect, (p) => -side(p));
  const flap = lifted.map((p) => {
    const s = side(p);
    return { x: p.x - 2 * s * n.x, y: p.y - 2 * s * n.y };
  });
  return { keep, flap, fold: m, corner: q };
}
