'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SceneKind } from './scenes';

type Props = {
  kind: SceneKind;
  label: string;
  chapter: string;
  theme: 'light' | 'dark';
  credit: ReactNode;
  /** Contenu du fond de départ (rideau pour le train, papier pour le torii). */
  cover?: ReactNode;
  /** Chapitre révélé par la transition. */
  reveal?: ReactNode;
};

/** Progression figée quand les animations sont réduites : le chapitre révélé est affiché directement. */
const STILL: Record<SceneKind, number> = { train: 1, torii: 1 };

/**
 * Transition épinglée entre deux sections : un objet 3D (fond transparent) se superpose
 * aux deux fonds de page et pilote le passage de l'un à l'autre.
 * Three.js et les modèles ne sont chargés qu'à l'approche ; le rendu s'arrête hors écran.
 */
export default function Scene3D({ kind, label, chapter, theme, credit, cover, reveal }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let disposed = false;
    let started = false;
    let visible = false;
    let frame = 0;
    let shown = -1;
    let last = 0;
    let teardown: (() => void) | undefined;
    let draw: ((p: number) => void) | undefined;
    let animated = false;
    let resize: (() => void) | undefined;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      return Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
    };

    const loop = (now: number) => {
      frame = 0;
      if (!visible || !draw) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const target = progress();
      // Lissage exponentiel : les crans de molette deviennent un mouvement continu.
      const next = shown < 0 ? target : shown + (target - shown) * (1 - Math.exp(-dt * 8));
      if (animated || Math.abs(next - shown) > 0.00002) { shown = next; draw(shown); }
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduced && !frame && visible && draw) { last = 0; frame = requestAnimationFrame(loop); }
    };

    const boot = async () => {
      started = true;
      setState('loading');
      try {
        const { createScene } = await import('./scenes');
        if (disposed) return;
        const scene = await createScene(kind, canvas, section, { mobile: window.innerWidth <= 700 });
        if (disposed) { scene.dispose(); return; }
        draw = scene.render;
        animated = !!scene.animated;
        resize = scene.resize;
        teardown = scene.dispose;
        resize();
        shown = reduced ? STILL[kind] : progress();
        draw(shown);
        setState('ready');
        start();
      } catch (error) {
        console.error(error);
        if (!disposed) setState('error');
      }
    };

    const near = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) { void boot(); near.disconnect(); }
    }, { rootMargin: '200% 0px' });
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    near.observe(section);
    onScreen.observe(section);
    const onResize = () => { resize?.(); if (draw && shown >= 0) draw(shown); };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      near.disconnect();
      onScreen.disconnect();
      window.removeEventListener('resize', onResize);
      teardown?.();
    };
  }, [kind]);

  return (
    <section
      ref={sectionRef}
      className={`fx-pass fx-pass-${kind}`}
      data-progress="pin"
      data-chapter={chapter}
      data-theme={theme}
      data-state={state}
      aria-label={label}
    >
      <div className="fx-pass-pin">
        {kind === 'train' ? (
          <>
            <div className="fx-pass-to">{reveal}</div>
            <div className="fx-pass-from fx-sticker"><div className="fx-sticker-cover">{cover}</div></div>
            <svg className="fx-peel" aria-hidden="true">
              <defs>
                <linearGradient id="fx-flap-grad" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#bfb39a" />
                  <stop offset="0.06" stopColor="#e9e0c9" />
                  <stop offset="0.45" stopColor="#fbf7ec" />
                  <stop offset="1" stopColor="#e6dcc3" />
                </linearGradient>
                <filter id="fx-flap-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.32" />
                </filter>
              </defs>
              <polygon className="fx-flap" points="" fill="url(#fx-flap-grad)" filter="url(#fx-flap-shadow)" />
              <path className="fx-peel-cord" d="" />
              <circle className="fx-peel-ring" r="7" cx="-20" cy="-20" />
            </svg>
            <canvas ref={canvasRef} className="fx-pass-canvas" aria-hidden="true" />
          </>
        ) : (
          <>
            <div className="fx-pass-from fx-washi"><div className="fx-pass-cover">{cover}</div></div>
            <div className="fx-pass-to">{reveal}</div>
            <canvas ref={canvasRef} className="fx-pass-canvas" aria-hidden="true" />
          </>
        )}
        <p className="fx-pass-credit">{credit}</p>
      </div>
    </section>
  );
}
