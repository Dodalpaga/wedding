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
import {
  experienceState,
  HERO_SCROLL_END,
  HERO_SCROLL_START,
  RESTAURANT_REVEAL_END,
  RESTAURANT_REVEAL_START,
  RESTAURANT_END,
  SOUVENIR_START,
  journeyProgress,
} from '@/components/noces/experience-state';
import SouvenirCarousel from './SouvenirCarousel';
import { ArrowDown, Home } from 'lucide-react';
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
type ResourceKind = 'map' | 'restaurant' | 'temple';

export default function NocesJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const flightProgressRef = useRef(0);
  const resourcesRef = useRef<Record<ResourceKind, GlobePreparation>>({
    map: { state: 'loading', progress: 0 },
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

  const startJourney = () => {
    const section = sectionRef.current;
    if (!section) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) {
      section.querySelector('.motion-static-summary')?.scrollIntoView();
      return;
    }
    const travel = Math.max(
      1,
      section.offsetHeight - (stageRef.current?.offsetHeight ?? window.innerHeight),
    );
    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.scrollY +
        travel * HERO_SCROLL_END,
      behavior: 'smooth',
    });
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
      const rawProgress = reduced.matches
        ? 1
        : allowed
          ? clamp(-section.getBoundingClientRect().top / travel)
          : progressRef.current;
      const heroProgress = phase(rawProgress, HERO_SCROLL_START, HERO_SCROLL_END);
      const p = reduced.matches
        ? 1
        : journeyProgress(rawProgress);
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
        `${(1 - heroProgress) * 110 - phase(state.clouds, 0.22, 0.78) * 110}%`,
      );
      stage.style.setProperty('--hero-y', `${-heroProgress * 110}%`);
      stage.style.setProperty('--intro-opacity', String(1 - heroProgress));
      // Keep the interlude between the globe and restaurant intentionally empty.
      stage.style.setProperty(
        '--restaurant-y',
        `${(1 - phase(p, RESTAURANT_REVEAL_START, RESTAURANT_REVEAL_END)) * 110 - phase(p, RESTAURANT_END, SOUVENIR_START) * 110}%`,
      );
      stage.style.setProperty(
        '--souvenir-y',
        `${(1 - phase(p, RESTAURANT_END, SOUVENIR_START)) * 110}%`,
      );
      stage.dataset.restaurantChapter = experience.restaurantChapter;
      stage.dataset.step = rawProgress < HERO_SCROLL_START
        ? '1'
        : p >= RESTAURANT_END
          ? '5'
          : experience.visible
            ? p < RESTAURANT_REVEAL_END
              ? '3'
              : '4'
            : '2';
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
        aria-label="Voyage de noces au Japon"
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
            <span className="motion-wordmark">Carnet de voyage <i>·</i> Japon 2027</span>
            <span className="motion-chapter-count" aria-hidden="true">
              <span className="motion-step-one">01 <i>/ 06</i></span>
              <span className="motion-step-two">02 <i>/ 06</i></span>
              <span className="motion-step-three">03 <i>/ 06</i></span>
              <span className="motion-step-four">04 <i>/ 06</i></span>
              <span className="motion-step-five">05 <i>/ 06</i></span>
            </span>
          </header>
          <div className="motion-hero">
            <div className="motion-intro">
              <div className="motion-intro-copy">
                <p className="motion-eyebrow">Notre voyage de noces · Japon · 2027</p>
                <h1>À deux,<br />ailleurs.</h1>
              </div>
              <div className="motion-intro-invitation">
                <p>
                  De Toulouse à Tokyo, suivons le fil d’un voyage encore à
                  inventer.
                </p>
                <p className="motion-intro-prompt">
                  Une traversée immersive, chapitre après chapitre.
                </p>
                <button
                  className="motion-start-button"
                  type="button"
                  onClick={startJourney}
                >
                  <span>Faire défiler pour commencer</span>
                  <i aria-hidden="true"><ArrowDown size={18} /></i>
                </button>
              </div>
            </div>
          </div>
          <div className="motion-static-summary">
            <p className="motion-eyebrow">Un voyage à deux · 2027</p>
            <h2>Toulouse <span aria-hidden="true">→</span> Tokyo</h2>
            <p>La destination est choisie ; les étapes se dessineront au fil de nos envies.</p>
          </div>
          <SouvenirCarousel progressRef={progressRef} />
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
