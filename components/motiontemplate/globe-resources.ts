import type { RequestTransformFunction } from 'maplibre-gl';
import { GLOBE_TILE_CACHE_SIZE } from './globe-preload';

/** Keep already fetched vector data available if MapLibre recreates a tile. */
export function createGlobeResourceCache() {
  const requests = new Map<string, Promise<string>>();
  const urls = new Set<string>();
  const controller = new AbortController();
  let disposed = false;
  const transformRequest: RequestTransformFunction = async (url, resourceType) => {
    if (resourceType !== 'Tile' || !/^https:\/\/tiles(?:-[a-d])?\.basemaps\.cartocdn\.com\/vectortiles\//.test(url)) return { url };
    if (disposed) throw new DOMException('Globe disposed', 'AbortError');
    const address = new URL(url);
    // CARTO's subdomains serve the same versioned tile path.
    const key = address.pathname + address.search;
    let request = requests.get(key);
    if (!request) {
      if (requests.size >= GLOBE_TILE_CACHE_SIZE) throw new Error('Globe resource cache exceeded');
      request = (async () => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Globe tile resource failed');
        const blob = await response.blob();
        if (disposed) throw new DOMException('Globe disposed', 'AbortError');
        const localUrl = URL.createObjectURL(blob);
        urls.add(localUrl);
        return localUrl;
      })().catch(error => { requests.delete(key); throw error; });
      requests.set(key, request);
    }
    return { url: await request };
  };
  return {
    transformRequest,
    dispose() {
      disposed = true;
      controller.abort();
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
      requests.clear();
    },
  };
}
