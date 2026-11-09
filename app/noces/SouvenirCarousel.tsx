'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MutableRefObject, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  RESTAURANT_END,
  SOUVENIR_END,
  SOUVENIR_START,
} from '@/components/noces/experience-state';

const souvenirs = [
  {
    title: 'Un couteau santoku',
    description: 'Un bel outil japonais qui trouverait sa place dans notre cuisine.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/180mm_Ashi_Ginga_Carbon_Steel_Santoku_%282026%29-104A8749.jpg/960px-180mm_Ashi_Ginga_Carbon_Steel_Santoku_%282026%29-104A8749.jpg',
    alt: 'Couteau santoku japonais à lame argentée, posé sur une pierre claire',
    credit: 'Frank Schulenburg',
    source: 'https://commons.wikimedia.org/wiki/File:180mm_Ashi_Ginga_Carbon_Steel_Santoku_(2026)-104A8749.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    title: 'Des baguettes à nos noms',
    description: 'Deux paires personnalisées, pour faire durer le souvenir jusque chez nous.',
    image: 'https://m.media-amazon.com/images/I/81GjRGKlbVL.jpg',
    alt: 'Baguettes japonaises personnalisées',
    credit: 'Amazon',
    source: 'https://m.media-amazon.com/images/I/81GjRGKlbVL.jpg',
    license: 'Image produit',
    licenseUrl: 'https://www.amazon.fr/',
  },
  {
    title: 'Le carnet des étapes',
    description: 'Les sceaux des temples et les tampons des gares, page après page.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Emma_H._Leonhart%27s_Goshuinch%C5%8D_70.jpg/960px-Emma_H._Leonhart%27s_Goshuinch%C5%8D_70.jpg',
    alt: 'Carnet goshuin ouvert, rempli de calligraphies et de sceaux rouges',
    credit: 'Immanuelle',
    source: 'https://commons.wikimedia.org/wiki/File:Emma_H._Leonhart%27s_Goshuinch%C5%8D_70.jpg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  {
    title: 'Deux bols en céramique',
    description: 'Des pièces choisies ensemble, pour les repas du quotidien.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Japanese_rice_bowl_chawan.JPG/960px-Japanese_rice_bowl_chawan.JPG',
    alt: 'Bol japonais en céramique pour le riz',
    credit: 'サフィル',
    source: 'https://commons.wikimedia.org/wiki/File:Japanese_rice_bowl_chawan.JPG',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    title: 'Les petites trouvailles',
    description: 'Un pochon, un porte-bonheur ou une jolie papeterie : les coups de cœur imprévus.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Red_stamp_book_drawstring_bag.jpg/960px-Red_stamp_book_drawstring_bag.jpg',
    alt: 'Pochon rouge japonais pour ranger un carnet de tampons',
    credit: 'Haziq Faruqi',
    source: 'https://commons.wikimedia.org/wiki/File:Red_stamp_book_drawstring_bag.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
];

type DragState = {
  pointerId: number;
  startX: number;
  startScroll: number;
};

export default function SouvenirCarousel({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = useCallback(() => {
    frameRef.current = 0;
    const carousel = carouselRef.current;
    if (!carousel) return;

    const slides = Array.from(
      carousel.querySelectorAll<HTMLElement>('[data-souvenir-slide]'),
    );
    const firstOffset = slides[0]?.offsetLeft ?? 0;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - firstOffset - carousel.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveIndex(nearestIndex);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const scheduleUpdate = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(updateIndex);
    };
    const syncToJourney = () => {
      const slides = carousel.querySelectorAll<HTMLElement>('[data-souvenir-slide]');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const section = carousel.closest<HTMLElement>('.motion-souvenir-section');
      if (section) section.dataset.active = String(
        reducedMotion || progressRef.current >= RESTAURANT_END,
      );
      if (slides.length < 2) return;
      const progress = Math.max(
        0,
        Math.min(
          1,
          reducedMotion
            ? 0
            : (progressRef.current - SOUVENIR_START) / (SOUVENIR_END - SOUVENIR_START),
        ),
      );
      const scaledIndex = progress * (slides.length - 1);
      const lowerIndex = Math.floor(scaledIndex);
      const upperIndex = Math.min(slides.length - 1, lowerIndex + 1);
      const firstOffset = slides[0].offsetLeft;
      const lowerOffset = slides[lowerIndex].offsetLeft - firstOffset;
      const upperOffset = slides[upperIndex].offsetLeft - firstOffset;
      carousel.scrollLeft = lowerOffset + (upperOffset - lowerOffset) * (scaledIndex - lowerIndex);
      scheduleUpdate();
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(carousel);
    carousel.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('motionjourneyupdate', syncToJourney);
    syncToJourney();
    scheduleUpdate();
    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      carousel.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('motionjourneyupdate', syncToJourney);
    };
  }, [progressRef, updateIndex]);

  const goTo = (index: number) => {
    const carousel = carouselRef.current;
    const slides = carousel?.querySelectorAll<HTMLElement>('[data-souvenir-slide]');
    const slide = slides?.[index];
    if (!carousel || !slide || !slides[0]) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const journey = carousel.closest<HTMLElement>('.motion-journey');
    const stage = journey?.querySelector<HTMLElement>('.motion-stage');
    if (!reducedMotion && journey && stage) {
      const progress = SOUVENIR_START
        + (SOUVENIR_END - SOUVENIR_START) * index / (souvenirs.length - 1);
      const travel = Math.max(1, journey.offsetHeight - stage.offsetHeight);
      window.scrollTo({
        top: window.scrollY + (progress - progressRef.current) * travel,
        behavior: 'smooth',
      });
      return;
    }

    carousel.scrollTo({
      left: slide.offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight' && activeIndex < souvenirs.length - 1) {
      event.preventDefault();
      goTo(activeIndex + 1);
    } else if (event.key === 'ArrowLeft' && activeIndex > 0) {
      event.preventDefault();
      goTo(activeIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(souvenirs.length - 1);
    }
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const carousel = carouselRef.current;
    if (!carousel) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: carousel.scrollLeft,
    };
    carousel.setPointerCapture(event.pointerId);
    carousel.classList.add('is-dragging');
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    const carousel = carouselRef.current;
    if (!state || !carousel || state.pointerId !== event.pointerId) return;
    event.preventDefault();
    carousel.scrollLeft = state.startScroll - (event.clientX - state.startX);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = null;
    carousel?.classList.remove('is-dragging');
  };

  return (
    <section
      className="motion-souvenir-section"
      role="region"
      aria-labelledby="motion-souvenir-heading"
      aria-roledescription="carrousel"
    >
      <span className="motion-souvenir-count" aria-hidden="true">
        05 <i>/ 06</i>
      </span>
      <div className="motion-souvenir-heading">
        <div>
          <p className="motion-kicker">Les souvenirs, avant même le départ</p>
          <h2 id="motion-souvenir-heading">Ce qu’on a envie<br />de ramener.</h2>
        </div>
        <p className="motion-souvenir-intro">
          Pas une liste à cocher : quelques envies, et la place pour toutes les
          surprises du voyage.
        </p>
      </div>

      <div
        ref={carouselRef}
        className="motion-souvenir-carousel"
        role="group"
        aria-label="Souvenirs à rapporter"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        {souvenirs.map((souvenir, index) => (
          <article
            key={souvenir.title}
            className={`motion-souvenir-card motion-souvenir-card-${index + 1}`}
            data-souvenir-slide
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${index + 1} sur ${souvenirs.length}`}
          >
            <div className="motion-souvenir-image">
              <img src={souvenir.image} alt={souvenir.alt} loading="lazy" decoding="async" />
            </div>
            <div className="motion-souvenir-card-copy">
              <span className="motion-souvenir-number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{souvenir.title}</h3>
              <p>{souvenir.description}</p>
              <small className="motion-souvenir-credit">
                Photo : <a href={souvenir.source} target="_blank" rel="noreferrer">{souvenir.credit}</a>
                {' · '}
                <a href={souvenir.licenseUrl} target="_blank" rel="noreferrer">{souvenir.license}</a>
              </small>
            </div>
          </article>
        ))}
      </div>

      <div className="motion-souvenir-controls">
        <p aria-live="polite">
          {String(activeIndex + 1).padStart(2, '0')} <span>/</span>{' '}
          {String(souvenirs.length).padStart(2, '0')}
        </p>
        <span className="motion-souvenir-hint">Glisser pour parcourir</span>
        <div>
          <button
            type="button"
            aria-label="Souvenir précédent"
            onClick={() => goTo(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Souvenir suivant"
            onClick={() => goTo(Math.min(souvenirs.length - 1, activeIndex + 1))}
            disabled={activeIndex === souvenirs.length - 1}
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
