'use client';
import type { MutableRefObject } from 'react';
import SceneCanvas from './SceneCanvas';
import type { GlobePreparation } from './globe-preload';

type Props = {
  progressRef: MutableRefObject<number>;
  onTokyo: (status: GlobePreparation) => void;
  onRestaurant: (status: GlobePreparation) => void;
};

export default function JapaneseExperiences({ progressRef, onTokyo, onRestaurant }: Props) {
  return <div className="motion-experiences">
    <article className="motion-experience motion-experience-tokyo" aria-labelledby="motion-tokyo-heading">
      <div className="motion-model-panel">
        <div className="motion-scene-placeholder" aria-hidden="true"><span>東京</span><p>Au rythme de la ville.</p></div>
        <SceneCanvas kind="tokyo" progressRef={progressRef} onPreparation={onTokyo} />
      </div>
      <div className="motion-experience-copy">
        <p className="motion-kicker">01 — Les villes</p>
        <h2 id="motion-tokyo-heading">Explorer <br />les villes.</h2>
        <p>Se perdre dans les ruelles, suivre les petits trains et découvrir un Japon plein de vie.</p>
        <span className="motion-scene-detail">Littlest Tokyo</span>
      </div>
    </article>
    <article className="motion-experience motion-experience-restaurant" aria-labelledby="motion-restaurant-heading">
      <div className="motion-model-panel">
        <div className="motion-scene-placeholder" aria-hidden="true"><span>食</span><p>Une pause à savourer.</p></div>
        <SceneCanvas kind="restaurant" progressRef={progressRef} onPreparation={onRestaurant} />
      </div>
      <div className="motion-experience-copy">
        <p className="motion-kicker">02 — Les saveurs</p>
        <div data-restaurant-copy="finding"><h2 id="motion-restaurant-heading">Trouver les bonnes <br />izakayas.</h2><p>Pousser une porte, s’installer au comptoir et laisser la curiosité nous guider.</p></div>
        <div data-restaurant-copy="food"><h2>Goûter aux <br />spécialités.</h2><p>Découvrir de nouvelles saveurs, partager quelques plats et prendre le temps de les savourer.</p></div>
        <div data-restaurant-copy="kitchen"><h2>Voir les chefs <br />cuisiner.</h2><p>Observer les gestes, les ustensiles et le savoir-faire derrière chaque assiette.</p></div>
        <span className="motion-scene-detail">Restaurant Inakaya</span>
      </div>
    </article>
  </div>;
}
