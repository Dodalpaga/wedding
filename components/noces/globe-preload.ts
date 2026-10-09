import type { Map as GlobeMap, VectorTileSource } from 'maplibre-gl';
import { globeCamera } from './journey';

export type GlobePreparation = {
  state: 'loading' | 'ready' | 'error' | 'disabled';
  progress: number;
};

// Retain decoded tiles, glyph atlases and GPU buffers throughout this visit.
export const GLOBE_TILE_CACHE_SIZE = 2048;
export const GLOBE_CACHE_ZOOM_LEVELS = 512;
export const GLOBE_PRELOAD_MARGIN = 256;
const SAMPLE_COUNT = 768;

function waitForGlobe(map: GlobeMap, signal: AbortSignal, settle: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const page = typeof document === 'undefined' ? undefined : document;
    let remaining = 45000, startedAt = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const event = settle ? 'idle' : 'render';
    const cleanup = () => {
      clearTimeout(timeout);
      map.off(event, onReady);
      map.off('error', onError);
      signal.removeEventListener('abort', onAbort);
      page?.removeEventListener('visibilitychange', onVisibility);
    };
    const onReady = () => {
      if (!settle && (!map.isStyleLoaded() || !map.areTilesLoaded())) return;
      cleanup();
      resolve();
    };
    const onError = () => { cleanup(); reject(new Error('Globe resource failed')); };
    const onAbort = () => { cleanup(); reject(new DOMException('Preparation cancelled', 'AbortError')); };
    const onVisibility = () => {
      if (page?.hidden) {
        if (timeout !== undefined) {
          clearTimeout(timeout);
          timeout = undefined;
          remaining -= performance.now() - startedAt;
        }
      } else if (timeout === undefined) {
        startedAt = performance.now();
        timeout = setTimeout(() => { cleanup(); reject(new Error('Globe preparation timed out')); }, Math.max(0, remaining));
        map.triggerRepaint();
      }
    };
    map.on(event, onReady);
    map.on('error', onError);
    signal.addEventListener('abort', onAbort, { once: true });
    page?.addEventListener('visibilitychange', onVisibility);
    if (signal.aborted) onAbort();
    else onVisibility();
  });
}

/** Initial/final views wait for tile data, placement and a settled render. */
export const waitForGlobeIdle = (map: GlobeMap, signal: AbortSignal) => waitForGlobe(map, signal, true);

/** Hidden views need decoded tiles and a GPU upload, without waiting for idle animation. */
export const waitForGlobeView = (map: GlobeMap, signal: AbortSignal) => waitForGlobe(map, signal, false);

/** Cover the whole flight with a small set of overlapping views. */
export function globePreloadViews(map: GlobeMap, width: number, height: number) {
  const sources = Object.entries(map.getStyle().sources)
    .filter(([, source]) => source.type === 'vector')
    .map(([id]) => ({ id, source: map.getSource(id) as VectorTileSource }));
  if (!sources.length) throw new Error('Globe vector source unavailable');
  const seen = new Set<string>();
  const candidates: { p: number; keys: string[] }[] = [];
  const signatures = new Set<string>();
  const endpoints: string[][] = [];
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const p = i / SAMPLE_COUNT * 0.64;
    map.jumpTo(globeCamera(p, width, height));
    const keys: string[] = [];
    for (const { id, source } of sources) {
      const tiles = map.coveringTiles({ tileSize: source.tileSize, minzoom: source.minzoom, maxzoom: source.maxzoom });
      for (const tile of tiles) {
        const key = `${id}/${tile.overscaledZ}/${tile.canonical.z}/${tile.canonical.x}/${tile.canonical.y}`;
        seen.add(key);
        keys.push(key);
      }
    }
    if (i === 0 || i === SAMPLE_COUNT) endpoints.push(keys);
    const signature = keys.sort().join('|');
    if (!signatures.has(signature)) {
      signatures.add(signature);
      candidates.push({ p, keys });
    }
  }
  if (seen.size >= GLOBE_TILE_CACHE_SIZE) throw new Error('Globe coverage exceeds the retained cache');
  const remaining = new Set(seen);
  const views = [0, 0.64];
  endpoints.forEach(keys => keys.forEach(key => remaining.delete(key)));
  while (remaining.size) {
    let best = candidates[0], bestCount = 0;
    for (const candidate of candidates) {
      const count = candidate.keys.reduce((total, key) => total + Number(remaining.has(key)), 0);
      if (count > bestCount) { best = candidate; bestCount = count; }
    }
    if (!bestCount) throw new Error('Globe coverage could not be prepared');
    views.push(best.p);
    best.keys.forEach(key => remaining.delete(key));
  }
  views.sort((a, b) => a - b);
  return { views, tiles: seen.size };
}

export async function prepareGlobe(
  map: GlobeMap,
  container: HTMLDivElement,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
) {
  signal.throwIfAborted();
  const parent = container.parentElement!;
  const width = parent.clientWidth, height = parent.clientHeight;
  const original = { width: container.style.width, height: container.style.height, left: container.style.left, top: container.style.top };
  const restoreViewport = (resize = true) => {
    Object.assign(container.style, original);
    if (resize) map.resize();
  };
  try {
    // Overscan protects intermediate camera positions and tile boundaries.
    container.style.width = `${width + GLOBE_PRELOAD_MARGIN * 2}px`;
    container.style.height = `${height + GLOBE_PRELOAD_MARGIN * 2}px`;
    container.style.left = `${-GLOBE_PRELOAD_MARGIN}px`;
    container.style.top = `${-GLOBE_PRELOAD_MARGIN}px`;
    map.resize();
    const plan = globePreloadViews(map, width, height);
    container.dataset.preloadViews = String(plan.views.length);
    container.dataset.preloadTiles = String(plan.tiles);
    onProgress(0.05);
    for (let i = 0; i < plan.views.length; i++) {
      signal.throwIfAborted();
      map.jumpTo(globeCamera(plan.views[i], width, height));
      // Globe projection also refines its GPU latitude correction after drawing.
      // Wait for that camera to settle, so its final tile coverage is retained.
      await waitForGlobeIdle(map, signal);
      onProgress(0.05 + 0.6 * (i + 1) / plan.views.length);
    }
    restoreViewport();
    // Perspective tile LOD changes with canvas dimensions. The overscan cache
    // alone can miss a parent tile used by the actual (especially DPR 2) view.
    // Validate the visible-size route too, with settled cameras and shared cache.
    const visiblePlan = globePreloadViews(map, width, height);
    container.dataset.preloadViews = String(plan.views.length + visiblePlan.views.length);
    for (let i = 0; i < visiblePlan.views.length; i++) {
      signal.throwIfAborted();
      map.jumpTo(globeCamera(visiblePlan.views[i], width, height));
      await waitForGlobeIdle(map, signal);
      onProgress(0.65 + 0.3 * (i + 1) / visiblePlan.views.length);
    }
    map.jumpTo(globeCamera(0, width, height));
    await waitForGlobeIdle(map, signal);
    onProgress(1);
  } finally {
    // An aborted owner may have removed the map already; still restore the DOM.
    restoreViewport(!signal.aborted);
  }
}

