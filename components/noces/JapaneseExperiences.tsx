'use client';
import type { MutableRefObject } from 'react';
import SceneCanvas from './SceneCanvas';
import VideoInterlude from './VideoInterlude';
import type { GlobePreparation } from './globe-preload';

type Props = {
  progressRef: MutableRefObject<number>;
  onRestaurant: (status: GlobePreparation) => void;
};

export default function JapaneseExperiences({ progressRef, onRestaurant }: Props) {
  return <div className="motion-experiences">
    <VideoInterlude progressRef={progressRef} />
    <article className="motion-experience motion-experience-restaurant" aria-labelledby="motion-restaurant-heading">
      <div className="motion-model-panel">
        <div className="motion-scene-placeholder" aria-hidden="true"><span>食</span><p>Faire durer l’instant.</p></div>
        <SceneCanvas kind="restaurant" progressRef={progressRef} onPreparation={onRestaurant} />
      </div>
      <div className="motion-experience-copy">
        <p className="motion-kicker">03 <span>— Les détours gourmands</span></p>
        <div data-restaurant-copy="finding"><h2 id="motion-restaurant-heading">S’asseoir<br />ailleurs.</h2><p>Une porte entrebâillée, un comptoir, et l’envie de goûter sans se presser.</p></div>
        <div data-restaurant-copy="food"><h2>Goûter<br />l’inattendu.</h2><p>Des saveurs nouvelles, partagées au fil des découvertes.</p></div>
        <div data-restaurant-copy="kitchen"><h2>Faire durer<br />l’instant.</h2><p>Regarder les gestes, s’attarder à table, savourer d’être là, ensemble.</p></div>
        <span className="motion-scene-detail">Inakaya · un détour à partager</span>
      </div>
    </article>
  </div>;
}
