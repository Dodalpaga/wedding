'use client';
import { useCallback, useEffect, useRef, type MutableRefObject, type PointerEvent, type KeyboardEvent } from 'react';
import SceneCanvas from './SceneCanvas';
import type { GlobePreparation } from './globe-preload';
import { usePostcardTilt } from './usePostcardTilt';

export default function TemplePostcard({ progressRef, onPreparation, interactive = true }: {
  progressRef: MutableRefObject<number>;
  onPreparation: (status: GlobePreparation) => void;
  interactive?: boolean;
}) {
  const parallaxRef = useRef<[number, number]>([0, 0]);
  const reducedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const update = useCallback((x: number, y: number) => {
    if (reducedRef.current) x = y = 0;
    parallaxRef.current = [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))];
    window.dispatchEvent(new Event('motionpostcardupdate'));
  }, []);
  const tilt = usePostcardTilt(cardRef, update, interactive);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { reducedRef.current = media.matches; update(0, 0); };
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, [update]);
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
    if (event.key === 'Home' || event.key === 'Escape') tilt.recenter();
    else update(x + (event.key === 'ArrowLeft' ? -.2 : event.key === 'ArrowRight' ? .2 : 0), y + (event.key === 'ArrowUp' ? -.2 : event.key === 'ArrowDown' ? .2 : 0));
  };
  return <section id="motion-end" className="motion-temple-section" aria-labelledby="motion-culture-heading">
    <span className="motion-chapter-count motion-temple-count" aria-hidden="true">03 / 03</span>
    <figure className="motion-postcard-figure">
      <div ref={cardRef} className="motion-postcard" tabIndex={interactive ? 0 : -1} role="group" aria-label="Carte du Kinkakuji : survolez-la, inclinez votre téléphone ou utilisez les flèches pour changer le point de vue"
        onPointerMove={pointer} onPointerLeave={event => { if (event.pointerType !== 'touch') update(0, 0); }} onBlur={() => update(0, 0)} onKeyDown={keyboard}>
        <div className="motion-scene-placeholder" aria-hidden="true"><span>寺</span><p>Une carte du Japon.</p></div>
        <SceneCanvas kind="temple" progressRef={progressRef} parallaxRef={parallaxRef} onPreparation={onPreparation} />
      </div>
      <figcaption><span>金閣寺 · Kinkakuji</span><span className="motion-hover-hint">Survolez la carte ↗</span></figcaption>
      {tilt.status !== 'off' && <div className="motion-tilt-controls">
        <p aria-live="polite">{tilt.status === 'active' ? 'Inclinez votre téléphone pour explorer la carte.'
          : tilt.status === 'permission' ? 'Animez la carte en inclinant votre téléphone.'
          : tilt.status === 'waiting' ? 'Gardez votre téléphone dans une position confortable…'
          : tilt.status === 'denied' ? 'L’inclinaison n’est pas autorisée. Vous pouvez réessayer.'
          : 'L’inclinaison n’est pas disponible sur cet appareil.'}</p>
        {(tilt.status === 'permission' || tilt.status === 'denied') && <button type="button" onClick={tilt.enable}>Activer l’inclinaison</button>}
        {tilt.status === 'active' && <button type="button" onClick={tilt.recenter}>Recentrer</button>}
      </div>}
    </figure>
    <div className="motion-culture-copy">
      <p className="motion-kicker">03 — La culture</p>
      <h2 id="motion-culture-heading">Découvrir<br />un autre monde.</h2>
      <p>Des temples et des jardins, des traditions et des histoires. Un voyage pour regarder, apprendre et s’émerveiller ensemble.</p>
      <p className="motion-journey-ending">Le voyage ne fait que commencer.</p>
      <p className="motion-itinerary-note">Les escales se préciseront au fil de nos envies.</p>
      <p className="motion-source-credit">
        Modèles sous <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> :{' '}
        <a href="https://sketchfab.com/3d-models/littlest-tokyo-30c4a731fb8f4981bb9fdf0cfd986b70">Littlest Tokyo — Glen Fox / 3D Models Low Poly</a>
        {' '}·{' '}
        <a href="https://sketchfab.com/3d-models/japanese-restaurant-inakaya-97594e92c418491ab7f032ed2abbf596">Inakaya — Jellepostma</a>
        {' '}·{' '}
        <a href="https://sketchfab.com/3d-models/inubeko-ukiyo-kinkakuji-temple-3d146476840847ca9d46f3300aa4445d">Kinkakuji — Jellepostma</a>.
        {' '}Préparation et compression pour le web.
      </p>
    </div>
  </section>;
}
