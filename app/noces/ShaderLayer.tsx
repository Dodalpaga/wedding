'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GrainGradient, PaperTexture, Warp } from '@paper-design/shaders-react';

/**
 * Calque décoratif plein cadre qui ne monte son shader que près de l'écran.
 *
 * Chaque shader de @paper-design/shaders-react ouvre son propre contexte WebGL, et le navigateur
 * en limite le nombre. Le démonter hors écran libère le contexte (la lib le perd explicitement).
 */
function NearScreen({ className, margin = '400px', children }: { className: string; margin?: string; children: (reduced: boolean) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: `${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return <div ref={ref} className={`fx-shader ${className}`} aria-hidden="true">{near && children(reduced)}</div>;
}

const full = { width: '100%', height: '100%' };

/** Papier washi : fibres, grain et quelques plis, figé (une seule image calculée). */
export function WashiPaper({ className = '', seed = 4 }: { className?: string; seed?: number }) {
  return (
    <NearScreen className={`fx-shader-washi ${className}`}>
      {() => (
        <PaperTexture
          style={full}
          fit="cover"
          scale={1}
          speed={0}
          colorBack="#fff8df"
          colorPaper="#fff8df"
          colorShadow="#d6cba6"
          blending={1}
          distortion={0}
          angle={300}
          seed={seed}
          roughness={0.45}
          roughnessSize={0.35}
          roughnessRows={0}
          fiber={0.55}
          fiberSize={0.3}
          folds={0.15}
          foldSizeX={1}
          foldSizeY={1}
          wrinkles={0.12}
          wrinkleSize={0.6}
          crumples={0}
          drops={0.08}
          maxPixelCount={1920 * 1080}
        />
      )}
    </NearScreen>
  );
}

/** Feuille de la lettre : pliée en trois puis froissée, avec relief. */
export function LetterPaper() {
  return (
    <NearScreen className="fx-shader-letter">
      {() => (
        <PaperTexture
          style={full}
          fit="cover"
          scale={1}
          speed={0}
          colorBack="#fffdf4"
          colorPaper="#fffdf4"
          colorShadow="#cbc3a2"
          blending={1}
          distortion={0}
          angle={120}
          seed={11}
          roughness={0.35}
          roughnessSize={0.4}
          roughnessRows={0}
          fiber={0.35}
          fiberSize={0.35}
          folds={0.55}
          foldSizeX={1}
          foldSizeY={0.66}
          foldOffsetX={0}
          foldOffsetY={0}
          wrinkles={0.35}
          wrinkleSize={0.55}
          crumples={0.55}
          crumpleCount={5}
          drops={0}
          maxPixelCount={1400 * 1400}
        />
      )}
    </NearScreen>
  );
}

/** Reflets de néons sur l'eau du canal, en fond d'Osaka. */
export function CanalReflections() {
  return (
    <NearScreen className="fx-shader-canal">
      {(reduced) => (
        <Warp
          style={full}
          colors={['#032430', '#0b5b45', '#032430', '#0e4a63']}
          proportion={0.42}
          softness={1}
          shape="stripes"
          shapeScale={0.12}
          distortion={0.3}
          swirl={0.6}
          swirlIterations={8}
          rotation={-12}
          scale={1.4}
          speed={reduced ? 0 : 0.35}
          maxPixelCount={1600 * 900}
        />
      )}
    </NearScreen>
  );
}

/** Sable fin et chaud sous les cartes postales d'Okinawa. */
export function SandGrain() {
  return (
    <NearScreen className="fx-shader-sand">
      {() => (
        <GrainGradient
          style={full}
          colorBack="#f5ecd6"
          colors={['#efe1bf', '#f8f1df', '#e4cf9f', '#d7efe6']}
          softness={0.85}
          intensity={0.2}
          noise={0.5}
          shape="wave"
          speed={0}
          scale={1.2}
          maxPixelCount={1920 * 1080}
        />
      )}
    </NearScreen>
  );
}
