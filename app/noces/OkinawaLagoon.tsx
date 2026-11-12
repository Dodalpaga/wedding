'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Wave from 'react-wavify';
import { GodRays, Water } from '@paper-design/shaders-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Ligne de rivage ondulée, de droite à gauche, à une trentaine de pixels du bas. */
function shoreline(w: number, h: number) {
  const humps = Math.max(3, Math.round(w / 260));
  const step = w / humps;
  const base = h - 34;
  let curve = '';
  for (let i = 0; i < humps; i++) {
    const x0 = w - i * step;
    const x1 = x0 - step;
    const lift = (i % 2 ? 1 : -1) * 13 * (0.7 + 0.3 * Math.sin(i * 1.7));
    curve += `Q ${(x0 + x1) / 2} ${base + lift} ${x1} ${base} `;
  }
  return { start: base, curve: curve.trim() };
}

/**
 * Haut du chapitre Okinawa : la surface du lagon.
 *
 * - Deux vagues d'arrière-plan (react-wavify) ondulent derrière la surface.
 * - La vague de premier plan est invisible : elle ne sert que de forme. Son tracé, recopié à
 *   chaque image, découpe le calque « eau » (clip-path), qui forme donc d'un seul tenant la
 *   vague et l'eau dessous : même dégradé, et rien ne déborde au-dessus de la crête.
 * - Dans l'eau : une photo de récif déformée par des caustiques (shader Water), une teinte lagon
 *   et des rayons de soleil (shader GodRays),
 *   animés avec du bruit (@paper-design/shaders-react), puis le contenu passé en enfants.
 * Les shaders se mettent en pause hors écran ; tout est figé avec la réduction des mouvements.
 */
export default function OkinawaLagoon({ children }: { children?: ReactNode }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const foamRef = useRef<SVGPathElement>(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Animation des vagues seulement à l'écran (les shaders gèrent leur propre pause).
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setReduced(true); return; }
    const io = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // La forme de la vague de premier plan découpe le haut de l'eau, à chaque image ; le bas suit
  // une ligne de rivage ondulée, soulignée d'écume, où l'eau rejoint le sable.
  useEffect(() => {
    const path = surfaceRef.current?.querySelector<SVGPathElement>('.fx-lagoon-front path');
    const foam = foamRef.current;
    const water = waterRef.current;
    if (!path || !water) return;
    const sync = () => {
      const d = path.getAttribute('d');
      if (!d) return;
      const w = water.clientWidth, h = water.clientHeight;
      const shore = shoreline(w, h);
      // Le tracé de react-wavify se termine par « L w h L 0 h Z » : on le remplace par le rivage.
      water.style.clipPath = `path('${d.replace(/\s*L[^LZ]*L[^LZ]*Z\s*$/, '')} L ${w} ${shore.start} ${shore.curve} Z')`;
      foam?.setAttribute('d', `M ${w} ${shore.start} ${shore.curve}`);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(path, { attributes: true, attributeFilter: ['d'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={surfaceRef} className="fx-lagoon" aria-hidden="true">
      <Wave
        className="fx-lagoon-wave"
        fill="#2a9d98"
        opacity={0.85}
        paused={!playing}
        options={{ height: 30, amplitude: 26, speed: 0.11, points: 4 }}
      />
      <Wave
        className="fx-lagoon-wave"
        fill="#4cbcb0"
        opacity={0.9}
        paused={!playing}
        options={{ height: 48, amplitude: 24, speed: 0.16, points: 5 }}
      />
      {/* Forme seule (invisible), sur toute la hauteur : sert de découpe à l'eau. */}
      <Wave
        className="fx-lagoon-front"
        fill="transparent"
        paused={!playing}
        options={{ height: 70, amplitude: 22, speed: 0.22, points: 3 }}
      />
      <div ref={waterRef} className="fx-lagoon-water">
        {/* Fond marin photographié, déformé par les caustiques : l'effet trouble vu depuis la surface. */}
        <Water
          className="fx-lagoon-shader fx-lagoon-seabed"
          image={`${basePath}/images/noces/okinawa-recif.webp`}
          fit="cover"
          scale={1.1}
          colorBack="#00000000"
          colorHighlight="#fffff0"
          highlights={0}
          layering={0.55}
          edges={0}
          caustic={0.1}
          waves={0.18}
          size={0.9}
          speed={reduced ? 0 : 0.45}
          maxPixelCount={1280 * 720}
        />
        <div className="fx-lagoon-tint" />
        {/* Reflets blancs de la surface (caustiques seules, sans image), nets au-dessus du fond flou. */}
        <Water
          className="fx-lagoon-shader"
          colorBack="#00000000"
          colorHighlight="#fffff0"
          highlights={0.22}
          layering={0.6}
          edges={0}
          caustic={0}
          waves={0.35}
          size={0.9}
          speed={reduced ? 0 : 0.45}
          maxPixelCount={1600 * 900}
        />
        <GodRays
          className="fx-lagoon-shader fx-lagoon-rays"
          colorBack="#00000000"
          colorBloom="#fffff0"
          colors={['#fffff2d0', '#e9fff6a0', '#fff7d6b8']}
          density={0.32}
          spotty={0.55}
          intensity={0.45}
          bloom={0.25}
          midSize={0}
          midIntensity={0}
          offsetY={-1.15}
          scale={1.6}
          speed={reduced ? 0 : 0.35}
          maxPixelCount={1600 * 900}
        />
        {children}
      </div>
      <svg className="fx-lagoon-foam"><path ref={foamRef} d="" /></svg>
    </div>
  );
}
