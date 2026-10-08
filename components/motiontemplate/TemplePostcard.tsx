'use client';
import { useEffect, useRef, type MutableRefObject, type PointerEvent, type KeyboardEvent } from 'react';
import SceneCanvas from './SceneCanvas';
import type { GlobePreparation } from './globe-preload';

export default function TemplePostcard({ progressRef, onPreparation, interactive = true }: {
  progressRef: MutableRefObject<number>;
  onPreparation: (status: GlobePreparation) => void;
  interactive?: boolean;
}) {
  const parallaxRef = useRef<[number, number]>([0, 0]);
  const reducedRef = useRef(false);
  const update = (x: number, y: number) => {
    if (reducedRef.current) x = y = 0;
    parallaxRef.current = [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))];
    window.dispatchEvent(new Event('motionpostcardupdate'));
  };
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { reducedRef.current = media.matches; update(0, 0); };
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const pointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    update((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1);
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const [x, y] = parallaxRef.current;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'Escape') update(0, 0);
    else update(x + (event.key === 'ArrowLeft' ? -.2 : event.key === 'ArrowRight' ? .2 : 0), y + (event.key === 'ArrowUp' ? -.2 : event.key === 'ArrowDown' ? .2 : 0));
  };
  return <section className="motion-temple-section" aria-labelledby="motion-culture-heading">
    <figure className="motion-postcard-figure">
      <div className="motion-postcard" tabIndex={interactive ? 0 : -1} role="group" aria-label="Carte du Kinkakuji : survolez-la ou utilisez les flèches pour changer le point de vue"
        onPointerMove={pointer} onPointerLeave={() => update(0, 0)} onBlur={() => update(0, 0)} onKeyDown={keyboard}>
        <div className="motion-scene-placeholder" aria-hidden="true"><span>寺</span><p>Une carte du Japon.</p></div>
        <SceneCanvas kind="temple" progressRef={progressRef} parallaxRef={parallaxRef} onPreparation={onPreparation} />
      </div>
      <figcaption><span>金閣寺 · Kinkakuji</span><span className="motion-hover-hint">Survolez la carte ↗</span></figcaption>
    </figure>
    <div className="motion-culture-copy"><p className="motion-kicker">03 — La culture</p><h2 id="motion-culture-heading">Découvrir<br />un autre monde.</h2><p>Des temples et des jardins, des traditions et des histoires. Un voyage pour regarder, apprendre et s’émerveiller ensemble.</p><p className="motion-itinerary-note">Nos escales restent à imaginer.</p></div>
  </section>;
}
