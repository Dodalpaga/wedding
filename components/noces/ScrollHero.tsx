'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { TripStep } from '@/app/noces/page';
import SequenceBackdrop from './SequenceBackdrop';
import TripStages from './TripStages';
import GiftSection from './GiftSection';
import useJourneyScenes from './useJourneyScenes';

export default function ScrollHero({ steps }: { steps: TripStep[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  useJourneyScenes(sectionRef, statusRef);
  return (
    <section
      ref={sectionRef}
      className="noces-journey"
      aria-label="Notre voyage de noces au Japon"
    >
      <SequenceBackdrop sectionRef={sectionRef} />
      <div className="noces-foreground">
        <header
          data-scene
          data-label="Notre voyage de noces"
          tabIndex={-1}
          className="noces-scene"
        >
          <div className="honeymoon-container noces-introduction">
            <Link href="/" className="noces-back">
              <ArrowLeft size={16} aria-hidden="true" /> Accueil
            </Link>
            <div className="noces-intro-copy">
              <p className="noces-label">Notre voyage de noces</p>
              <h1 className="font-wedding">Un mois au Japon</h1>
              <p className="noces-intro">
                Un roadtrip à deux, des villes qui fourmillent, des pauses au
                vert et du temps pour nous. Voici les premières pistes de notre
                aventure.
              </p>
              <div className="noces-hero-actions">
                <a href="#itineraire" className="noces-pill">
                  DÉCOUVRIR NOS ENVIES <span aria-hidden="true">→</span>
                </a>
                <a href="#cadeau" className="noces-pill">
                  NOTRE CADEAU <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <a className="noces-scroll-hint noces-label" href="#itineraire">
              DÉFILER POUR EXPLORER <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>
        <TripStages steps={steps} />
        <GiftSection />
        <div
          className="noces-scene-controls"
          role="group"
          aria-label="Explorer le voyage"
        >
          <span
            ref={statusRef}
            className="noces-scene-status noces-label"
            aria-live="polite"
          >
            Notre voyage de noces
          </span>
          <button type="button" data-previous aria-label="Écran précédent">
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <button type="button" data-next aria-label="Écran suivant">
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
