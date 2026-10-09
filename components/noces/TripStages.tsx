import { Image as ImageIcon } from 'lucide-react';
import type { TripStep } from './types';
import StepDrawer from './StepDrawer';

export default function TripStages({ steps }: { steps: TripStep[] }) {
  return (
    <>
      <section
        data-scene
        data-label="Nos envies d’escales"
        tabIndex={-1}
        id="itineraire"
        aria-labelledby="itinerary-title"
        className="noces-scene noces-itinerary-overview"
      >
        <div className="honeymoon-container noces-scene-layout">
          <div className="noces-story-panel">
            <p className="noces-label">Un itinéraire qui se dessine</p>
            <h2 id="itinerary-title" className="font-wedding">
              Nos envies d’escales
            </h2>
            <p>
              Nous ajustons encore les villes, l’ordre des étapes et le temps
              passé sur place. Rien n’est figé : ces escales donnent un premier
              aperçu du voyage dont nous rêvons.
            </p>
          </div>
          <figure className="noces-trip-map">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/noces/trip-overview.webp`}
              alt="Carte du Japon avec le parcours envisagé et ses escales."
              width={1760}
              height={2404}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>
      {steps.map((step, index) => (
        <article
          data-scene
          data-label={`${step.city} · ${String(index + 1).padStart(2, '0')} / 05`}
          key={step.city}
          id={`escale-${index + 1}`}
          tabIndex={-1}
          aria-labelledby={`city-${index}`}
          className="noces-scene noces-trip-stage"
        >
          <div className="honeymoon-container noces-scene-layout">
            {index === 0 && (
              <span id="escales" tabIndex={-1} className="noces-anchor" />
            )}
            <div className="noces-destination-card">
              <div className="noces-step-visual" aria-hidden="true">
                {step.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${step.image}`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={1600}
                    height={1067}
                  />
                ) : (
                  <div className="noces-placeholder">
                    <ImageIcon size={36} strokeWidth={1} />
                    <p className="noces-label">
                      Carnet de voyage · {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="font-wedding">{step.city}</p>
                    <p>Nos photos viendront raconter la suite</p>
                  </div>
                )}
              </div>
              <div className="noces-story-panel">
                <div className="noces-step-heading">
                  <p className="noces-label">
                    Escale envisagée · {String(index + 1).padStart(2, '0')}{' '}
                    <span className="noces-step-total">
                      / {String(steps.length).padStart(2, '0')}
                    </span>
                  </p>
                  <h3 id={`city-${index}`} className="font-wedding">
                    {step.city}
                  </h3>
                </div>
                <StepDrawer city={step.city} number={String(index + 1).padStart(2, '0')}>
                  <p className="noces-step-title">{step.title}</p>
                  <p>{step.description}</p>
                  <ul
                    aria-label={`Nos envies à ${step.city}`}
                    className="noces-highlights"
                  >
                    {step.highlights.map((highlight) => (
                      <li key={highlight} className="noces-highlight">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </StepDrawer>
              </div>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
