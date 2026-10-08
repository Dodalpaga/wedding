'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import type { Map as GlobeMap, GeoJSONSource } from 'maplibre-gl';
import { flightPoint, globeCamera, journeyState, TOULOUSE, TOKYO, clamp } from './journey';
import { GLOBE_TILE_CACHE_SIZE, GLOBE_CACHE_ZOOM_LEVELS, prepareGlobe, waitForGlobeIdle, type GlobePreparation } from './globe-preload';
import { createGlobeResourceCache } from './globe-resources';

type Props = {
  progressRef: MutableRefObject<number>;
  onPreparation: (status: GlobePreparation) => void;
};

export default function FlightGlobe({ progressRef, onPreparation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const viewport = container?.parentElement;
    if (!container || !viewport) return;
    let disposed = false;
    let map: GlobeMap | undefined;
    let resources: ReturnType<typeof createGlobeResourceCache> | undefined;
    let loaded = false;
    let initializing = false;
    let preparing = false;
    let preparation = new AbortController();
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let observer: ResizeObserver | undefined;
    let viewportWidth = viewport.clientWidth, viewportHeight = viewport.clientHeight;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const arc = Array.from({ length: 97 }, (_, i) => flightPoint(i / 96));
    const notify = (state: GlobePreparation['state'], progress = 0) => {
      if (!disposed) {
        viewport.toggleAttribute('inert', state !== 'ready');
        onPreparation({ state, progress });
      }
    };
    const position = (element: HTMLDivElement | null, coordinate: [number, number], visible: boolean) => {
      if (!element || !map) return;
      const point = map.project(coordinate);
      element.style.transform = `translate(${point.x}px, ${point.y}px)`;
      element.hidden = !visible;
    };
    const update = () => {
      if (!map || !loaded || preparing || reduced.matches) return;
      const p = progressRef.current;
      if (p > 0.87) return;
      const state = journeyState(p);
      const camera = globeCamera(p, viewport.clientWidth, viewport.clientHeight);
      map.jumpTo(camera);
      const point = map.project(state.center);
      const ahead = map.project(flightPoint(clamp(state.flight + 0.002)));
      const behind = map.project(flightPoint(clamp(state.flight - 0.002)));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI + 90;
      if (planeRef.current) {
        planeRef.current.hidden = p < 0.13 || p > 0.655;
        planeRef.current.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg)`;
      }
      position(departureRef.current, TOULOUSE, state.flight < 0.22);
      position(arrivalRef.current, TOKYO, state.flight > 0.78);
      const trail = map.getSource('flight-trail') as GeoJSONSource | undefined;
      if (trail) {
        const coordinates = [...arc.slice(0, Math.max(1, Math.floor(state.flight * 96) + 1)), state.center];
        trail.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } });
      }
      container.dataset.zoom = camera.zoom.toFixed(3);
      container.dataset.flight = state.flight.toFixed(3);
    };
    const runPreparation = async () => {
      if (!map || preparing || disposed || reduced.matches) return;
      preparing = true;
      loaded = false;
      const currentMap = map;
      const controller = preparation;
      container.dataset.map = 'preparing';
      notify('loading');
      try {
        // If the screen changes while preparing, cover its new dimensions before release.
        do {
          viewportWidth = viewport.clientWidth;
          viewportHeight = viewport.clientHeight;
          await prepareGlobe(currentMap, container, controller.signal, progress => notify('loading', progress));
        } while (viewportWidth !== viewport.clientWidth || viewportHeight !== viewport.clientHeight);
        controller.signal.throwIfAborted();
        loaded = true;
        preparing = false;
        container.dataset.map = 'ready';
        update();
        notify('ready', 1);
      } catch (error) {
        if (!controller.signal.aborted && !disposed) {
          container.dataset.map = 'unavailable';
          notify('error');
        }
      } finally {
        // A preference change may already have started a new map instance.
        if (currentMap === map) preparing = false;
      }
    };
    const initialize = async () => {
      if (map || initializing || reduced.matches || disposed) return;
      initializing = true;
      notify('loading');
      try {
        const { Map } = await import('maplibre-gl');
        if (disposed || reduced.matches) return;
        preparation = new AbortController();
        const controller = preparation;
        resources = createGlobeResourceCache();
        const currentMap = map = new Map({
          container,
          // Same vector basemap and globe projection as PortfolioV2's COG viewer.
          style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          ...globeCamera(0, viewport.clientWidth, viewport.clientHeight),
          interactive: false, attributionControl: { compact: true },
          canvasContextAttributes: { antialias: true },
          fadeDuration: 0, renderWorldCopies: false, trackResize: false,
          maxTileCacheSize: GLOBE_TILE_CACHE_SIZE,
          maxTileCacheZoomLevels: GLOBE_CACHE_ZOOM_LEVELS,
          refreshExpiredTiles: false,
          cancelPendingTileRequestsWhileZooming: false,
          transformRequest: resources.transformRequest,
        });
        await waitForGlobeIdle(currentMap, controller.signal);
        currentMap.setProjection({ type: 'globe' });
        currentMap.setSky({ 'sky-color': '#103b2c', 'horizon-color': '#9ab695', 'fog-color': '#103b2c', 'atmosphere-blend': 0.8 });
        for (const layer of currentMap.getStyle().layers) {
          if (layer.type === 'background') currentMap.setPaintProperty(layer.id, 'background-color', '#eeeadd');
          if (layer.type === 'fill') {
            const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : '';
            const fill = sourceLayer === 'water' ? '#a9c0b3' : sourceLayer === 'landcover' || sourceLayer === 'park' ? '#b7c9ad' : '#d8d9c4';
            try { currentMap.setPaintProperty(layer.id, 'fill-color', fill); } catch { /* style layer may not expose a fill color */ }
          }
          if (layer.id === 'waterway' && layer.type === 'line') currentMap.setPaintProperty(layer.id, 'line-color', '#bac9ae');
          if (layer.type === 'line') {
            try { currentMap.setPaintProperty(layer.id, 'line-color', '#b9b99f'); } catch { /* decorative layers can omit this property */ }
          }
          if (layer.type === 'symbol') currentMap.setLayerZoomRange(layer.id, Math.max(2, layer.minzoom ?? 0), layer.maxzoom ?? 24);
        }
        currentMap.addSource('flight-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: arc } } });
        currentMap.addSource('flight-trail', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [TOULOUSE, TOULOUSE] } } });
        currentMap.addLayer({ id: 'route-guide', type: 'line', source: 'flight-route', paint: { 'line-color': '#527653', 'line-width': 1.5, 'line-dasharray': [2, 4] } });
        currentMap.addLayer({ id: 'route-trail', type: 'line', source: 'flight-trail', paint: { 'line-color': '#bf7848', 'line-width': 3 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
        await waitForGlobeIdle(currentMap, controller.signal);
        observer = new ResizeObserver(() => {
          if (disposed || reduced.matches || !map) return;
          if (viewportWidth === viewport.clientWidth && viewportHeight === viewport.clientHeight) return;
          loaded = false;
          container.dataset.map = 'preparing';
          notify('loading');
          clearTimeout(resizeTimer);
          if (!preparing) resizeTimer = setTimeout(() => { void runPreparation(); }, 180);
        });
        observer.observe(viewport);
        await runPreparation();
      } catch (error) {
        if (!disposed && !preparation.signal.aborted) {
          container.dataset.map = 'unavailable';
          notify('error');
        }
      } finally { initializing = false; }
    };
    const onMotionChange = () => {
      if (reduced.matches) {
        preparation.abort();
        observer?.disconnect();
        clearTimeout(resizeTimer);
        loaded = false;
        preparing = false;
        map?.remove();
        map = undefined;
        resources?.dispose();
        resources = undefined;
        container.dataset.map = 'disabled';
        notify('disabled', 1);
      } else { void initialize(); }
    };
    if (reduced.matches) notify('disabled', 1);
    else void initialize();
    reduced.addEventListener('change', onMotionChange);
    window.addEventListener('motionjourneyupdate', update);
    return () => {
      disposed = true;
      preparation.abort();
      clearTimeout(resizeTimer);
      window.removeEventListener('motionjourneyupdate', update);
      reduced.removeEventListener('change', onMotionChange);
      observer?.disconnect();
      map?.remove();
      resources?.dispose();
    };
  }, [progressRef, onPreparation]);

  return (
    <div className="motion-globe-layer">
      <div className="motion-map-fallback" aria-hidden="true"><div className="motion-fallback-sphere" /><span>Toulouse → Tokyo</span></div>
      <div ref={containerRef} className="motion-map" role="img" aria-label="Globe cartographique : France entière au départ de Toulouse, vol vers Tokyo, puis Japon entier à l’arrivée" />
      <div className="motion-map-markers" aria-hidden="true">
        <div ref={departureRef} className="motion-city-marker"><i /><span>Toulouse<small>43.60° N · 1.44° E</small></span></div>
        <div ref={arrivalRef} className="motion-city-marker" hidden><i /><span>Tokyo<small>35.68° N · 139.65° E</small></span></div>
        <div ref={planeRef} className="motion-aircraft" hidden>
          <svg viewBox="0 0 64 64" fill="none"><path d="M30 7Q32 2 34 7L37 25L57 38V43L37 36L36 50L43 55V59L32 56L21 59V55L28 50L27 36L7 43V38L27 25Z" fill="#fff9eb" stroke="#85562f" strokeWidth="1.5" /><path d="M32 10V51M28 23H36" stroke="#b6c7cd" strokeWidth="2" /></svg>
        </div>
      </div>
    </div>
  );
}

