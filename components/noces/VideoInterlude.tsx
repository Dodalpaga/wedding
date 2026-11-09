'use client';

import { useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { videoInterludeActive } from './experience-state';

const VIDEO_ID = 'ChxDEAN8EtY';
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const YOUTUBE_EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

export default function VideoInterlude({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const playerVisible = active || (reducedMotion && manualPlay);
  const playerSrc = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      loop: '1',
      modestbranding: '1',
      mute: '1',
      playsinline: '1',
      playlist: VIDEO_ID,
      rel: '0',
      origin: typeof window === 'undefined' ? '' : window.location.origin,
    });
    return `${YOUTUBE_EMBED_ORIGIN}/embed/${VIDEO_ID}?${params}`;
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      setActive(!preference.matches && videoInterludeActive(progressRef.current));
    };
    update();
    window.addEventListener('motionjourneyupdate', update);
    preference.addEventListener('change', update);
    return () => {
      window.removeEventListener('motionjourneyupdate', update);
      preference.removeEventListener('change', update);
    };
  }, [progressRef]);

  useEffect(() => {
    if (!playerVisible) {
      setPlayerError(false);
    }
  }, [playerVisible]);

  return (
    <div
      className="motion-video-interlude"
      data-active={playerVisible}
      aria-label="JAPAN | Sony FX30, par Jun Chew"
    >
      {playerVisible && (
        <iframe
          className="motion-video-player"
          src={playerSrc}
          title="JAPAN | Sony FX30 — Jun Chew"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={0}
          onError={() => setPlayerError(true)}
        />
      )}
      <div className="motion-video-shade" aria-hidden="true" />
      <div className="motion-video-card">
        <p className="motion-video-kicker">02 · Le grand départ</p>
        <h2>Avant de tracer notre route.</h2>
        <p>
          Quelques images du Japon pour ouvrir le voyage. Notre itinéraire,
          lui, reste à inventer.
        </p>
      </div>
      <div className="motion-video-actions">
        {!playerVisible && reducedMotion ? (
          <button
            type="button"
            className="motion-video-opt-in"
            onClick={() => setManualPlay(true)}
          >
            <Play size={15} aria-hidden="true" />
            Lire la vidéo sans son
          </button>
        ) : null}
        {playerError && <span role="status">Lecture YouTube indisponible.</span>}
        <a href={YOUTUBE_URL} target="_blank" rel="noreferrer">
          <span>JAPAN | Sony FX30 · Jun Chew</span>
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
