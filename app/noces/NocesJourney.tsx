'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import FlightGlobe from '@/components/noces/FlightGlobe';
import CloudTransition from '@/components/noces/CloudTransition';
import { experienceState, INTRO_FADE_END } from '@/components/noces/experience-state';
import { Home } from 'lucide-react';
import {
  clamp,
  journeyState,
  phase,
} from '@/components/noces/journey';
import type { GlobePreparation } from '@/components/noces/globe-preload';
import 'maplibre-gl/dist/maplibre-gl.css';
import './noces.css';

const JapaneseExperiences = dynamic(
  () => import('@/components/noces/JapaneseExperiences'),
  { ssr: false },
);
const TemplePostcard = dynamic(
  () => import('@/components/noces/TemplePostcard'),
  { ssr: false },
);
type ResourceKind = 'map' | 'tokyo' | 'restaurant' | 'temple';

export default function NocesJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const flightProgressRef = useRef(0);
  const resourcesRef = useRef<Record<ResourceKind, GlobePreparation>>({
    map: { state: 'loading', progress: 0 },
    tokyo: { state: 'loading', progress: 0 },
    restaurant: { state: 'loading', progress: 0 },
    temple: { state: 'loading', progress: 0 },
  });
  const preparationRef = useRef<GlobePreparation>({
    state: 'loading',
    progress: 0,
  });
  const bypassRef = useRef(false);
  const releaseScrollLockRef = useRef<(() => void) | null>(null);
  const [preparation, setPreparation] = useState(preparationRef.current);
  const [enhanced, setEnhanced] = useState(false);
  const [bypass, setBypass] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const onPreparation = useCallback((status: GlobePreparation) => {
    const stateChanged = preparationRef.current.state !== status.state;
    preparationRef.current = status;
    setPreparation(status);
    if (stateChanged) window.dispatchEvent(new Event('motionjourneyrefresh'));
  }, []);
  const onResource = useCallback(
    (kind: ResourceKind, status: GlobePreparation) => {
      resourcesRef.current[kind] = status;
      const resources = Object.values(resourcesRef.current);
      onPreparation({
        state: resources.some((resource) => resource.state === 'error')
          ? 'error'
          : resources.some((resource) => resource.state === 'loading')
            ? 'loading'
            : 'ready',
        progress:
          resources.reduce(
            (sum, resource) =>
              sum + (resource.state === 'disabled' ? 1 : resource.progress),
            0,
          ) / resources.length,
      });
    },
    [onPreparation],
  );
  const onMap = useCallback(
    (status: GlobePreparation) => onResource('map', status),
    [onResource],
  );
  const onTokyo = useCallback(
    (status: GlobePreparation) => onResource('tokyo', status),
    [onResource],
  );
  const onRestaurant = useCallback(
    (status: GlobePreparation) => onResource('restaurant', status),
    [onResource],
  );
  const onTemple = useCallback(
    (status: GlobePreparation) => onResource('temple', status),
    [onResource],
  );
  const retry = () => {
    Object.keys(resourcesRef.current).forEach((kind) => {
      resourcesRef.current[kind as ResourceKind] = {
        state: 'loading',
        progress: 0,
      };
    });
    onPreparation({ state: 'loading', progress: 0 });
    setAttempt((value) => value + 1);
  };
  const pending =
    preparation.state === 'loading' || preparation.state === 'error';

  useEffect(() => {
    if (!pending || bypass) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousPadding = html.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    if (scrollbarWidth)
      html.style.paddingRight = `${parseFloat(getComputedStyle(html).paddingRight) + scrollbarWidth}px`;
    html.style.overflow = 'hidden';
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      html.style.overflow = previousOverflow;
      html.style.paddingRight = previousPadding;
    };
    releaseScrollLockRef.current = release;
    return () => {
      release();
      if (releaseScrollLockRef.current === release)
        releaseScrollLockRef.current = null;
    };
  }, [pending, bypass]);

  const skipPreparation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!pending) return;
    event.preventDefault();
    bypassRef.current = true;
    setBypass(true);
    releaseScrollLockRef.current?.();
    requestAnimationFrame(() =>
      document.getElementById('motion-end')?.scrollIntoView(),
    );
  };

  useEffect(() => {
    const section = sectionRef.current,
      stage = stageRef.current;
    if (!section || !stage) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnhanced(true);
    let frame = 0;
    const update = () => {
      frame = 0;
      section.dataset.enhanced = 'true';
      section.dataset.reduced = String(reduced.matches);
      stage.dataset.reduced = String(reduced.matches);
      const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
      const allowed =
        preparationRef.current.state === 'ready' || bypassRef.current;
      const p = reduced.matches
        ? 1
        : allowed
          ? clamp(-section.getBoundingClientRect().top / travel)
          : progressRef.current;
      const pageTravel = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      progressTrackRef.current?.style.setProperty(
        '--progress',
        String(clamp(window.scrollY / pageTravel)),
      );
      progressRef.current = p;
      const experience = experienceState(p);
      flightProgressRef.current = experience.flight;
      const state = journeyState(experience.flight);
      stage.style.setProperty(
        '--globe-y',
        `${-phase(state.clouds, 0.22, 0.78) * 110}%`,
      );
      stage.style.setProperty('--intro-opacity', String(1 - phase(p, 0, INTRO_FADE_END)));
      // Tokyo is already present behind the globe/cloud bank, then rises into
      // view continuously; no visibility threshold or opacity/scale jump.
      stage.style.setProperty(
        '--tokyo-y',
        `${(1 - phase(p, 0.225, 0.3)) * 45 - phase(p, 0.425, 0.455) * 110}svh`,
      );
      stage.style.setProperty(
        '--restaurant-y',
        `${(1 - phase(p, 0.425, 0.455)) * 110}svh`,
      );
      stage.dataset.experience = experience.model;
      stage.dataset.restaurantChapter = experience.restaurantChapter;
      stage.dataset.step = experience.visible
        ? experience.model === 'tokyo'
          ? '2'
          : '3'
        : '1';
      window.dispatchEvent(new Event('motionjourneyupdate'));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('motionjourneyrefresh', schedule);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('motionjourneyrefresh', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <main className="noces-page">
      <div
        ref={progressTrackRef}
        className="motion-progress-track"
        aria-hidden="true"
      >
        <span />
      </div>
      <Link className="motion-home" href="/" aria-label="Retour à l’accueil">
        <Home size={18} aria-hidden="true" />
      </Link>
      <a className="motion-skip" href="#motion-end" onClick={skipPreparation}>
        Passer le voyage
      </a>
      <section
        id="top"
        ref={sectionRef}
        className="motion-journey"
        aria-label="De Toulouse au Japon : les villes et les saveurs"
      >
        <div
          ref={stageRef}
          className="motion-stage"
          data-step="1"
          data-preparation={preparation.state}
        >
          <JapaneseExperiences
            key={`experiences-${attempt}`}
            progressRef={progressRef}
            onTokyo={onTokyo}
            onRestaurant={onRestaurant}
          />
          <CloudTransition progressRef={flightProgressRef} />
          <FlightGlobe
            key={`globe-${attempt}`}
            progressRef={flightProgressRef}
            onPreparation={onMap}
          />
          {enhanced && pending && !bypass && (
            <div
              className="motion-loading-screen"
              aria-label="Préparation du voyage"
            >
              <div className="motion-loading-content">
                <p className="motion-kicker">
                  Toulouse <span aria-hidden="true">→</span> Tokyo
                </p>
                <h2>Préparation du voyage.</h2>
                <p role="status">
                  {preparation.state === 'error'
                    ? 'Le voyage n’a pas pu être préparé. Vous pouvez réessayer ou passer le voyage.'
                    : 'Le globe et les trois expériences se préparent pour un voyage sans interruption.'}
                </p>
                {preparation.state === 'loading' && (
                  <>
                    <div
                      className="motion-loading-track"
                      role="progressbar"
                      aria-label="Préparation du globe et des modèles"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(preparation.progress * 100)}
                    >
                      <span
                        style={{ transform: `scaleX(${preparation.progress})` }}
                      />
                    </div>
                    <span className="motion-loading-percent" aria-hidden="true">
                      {Math.round(preparation.progress * 100)} %
                    </span>
                  </>
                )}
                <div className="motion-loading-actions">
                  {preparation.state === 'error' && (
                    <button type="button" onClick={retry}>
                      Réessayer
                    </button>
                  )}
                  <a href="#motion-end" onClick={skipPreparation}>
                    Passer le voyage
                  </a>
                </div>
              </div>
            </div>
          )}
          <header className="motion-header">
            <span className="motion-chapter-count" aria-hidden="true">
              <span className="motion-step-two">01 / 03</span>
              <span className="motion-step-three">02 / 03</span>
            </span>
          </header>
          <div className="motion-intro">
            <p className="motion-eyebrow">Notre voyage de noces · 2027</p>
            <h1>Un mois au Japon</h1>
            <p>Le début d’une nouvelle aventure.</p>
          </div>
          <div className="motion-footer">
            <span className="motion-scroll-cue">
              <i aria-hidden="true">↓</i> Défiler pour voyager
            </span>
          </div>
          <div className="motion-static-summary">
            <p>
              Toulouse → Tokyo : la France au départ, un vol autour du globe et
              le Japon entier à l’arrivée.
            </p>
            <p>
              Puis : explorer les villes, découvrir les saveurs et s’émerveiller
              devant la culture du Japon.
            </p>
          </div>
        </div>
      </section>
      <TemplePostcard
        key={`temple-${attempt}`}
        progressRef={progressRef}
        onPreparation={onTemple}
        interactive={!pending || bypass}
      />
    </main>
  );
}
