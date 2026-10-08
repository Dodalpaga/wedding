export const TOULOUSE: [number, number] = [1.4442, 43.6045];
export const TOKYO: [number, number] = [139.6503, 35.6762];
export const COUNTRY_BOUNDS = {
  france: [-5.15, 41.33, 9.65, 51.12],
  japan: [122.9, 24, 145.85, 45.6],
} as const;
export const ORBIT_ZOOM = 0.85;

export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const phase = (p: number, start: number, end: number) => ease((p - start) / (end - start));

// Great-circle interpolation. Coordinates remain shared by camera, trail and aircraft.
export function flightPoint(t: number): [number, number] {
  const vector = ([lon, lat]: [number, number]) => {
    const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
    return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)];
  };
  const a = vector(TOULOUSE), b = vector(TOKYO);
  const angle = Math.acos(a.reduce((sum, v, i) => sum + v * b[i], 0));
  const wa = Math.sin((1 - t) * angle) / Math.sin(angle);
  const wb = Math.sin(t * angle) / Math.sin(angle);
  const v = a.map((value, i) => value * wa + b[i] * wb);
  return [Math.atan2(v[2], v[0]) * 180 / Math.PI, Math.asin(v[1]) * 180 / Math.PI];
}

export function journeyState(p: number, orbitZoom = ORBIT_ZOOM, departureZoom = 4.3, arrivalZoom = 3.4) {
  const flight = phase(p, 0.18, 0.5);
  const zoom = departureZoom + (orbitZoom - departureZoom) * phase(p, 0.035, 0.19)
    + (arrivalZoom - orbitZoom) * phase(p, 0.48, 0.64);
  const clouds = phase(p, 0.69, 0.87);
  return { flight, zoom, clouds, center: flightPoint(flight) };
}

export function globeCamera(p: number, width: number, height: number) {
  const orbitZoom = Math.log2(Math.min(width, height) * 0.8 / 512);
  const departure = countryCamera(COUNTRY_BOUNDS.france, width, height);
  const arrival = countryCamera(COUNTRY_BOUNDS.japan, width, height);
  const { center: flightCenter, zoom } = journeyState(p, orbitZoom, departure.zoom, arrival.zoom);
  const out = phase(p, 0.035, 0.19), into = phase(p, 0.48, 0.64);
  const center = flightCenter.map((value, i) =>
    value + (departure.center[i] - TOULOUSE[i]) * (1 - out) + (arrival.center[i] - TOKYO[i]) * into,
  ) as [number, number];
  return { center, zoom, bearing: 0, pitch: 0 };
}

// Conservative Mercator envelope, also containing the globe projection at these
// country scales. Leave room for the heading/captions and the coastal islands.
export const mercatorY = (latitude: number) => (1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2;
export function countryCamera(bounds: readonly number[], width: number, height: number) {
  const [west, south, east, north] = bounds;
  const northY = mercatorY(north), southY = mercatorY(south);
  const center: [number, number] = [(west + east) / 2,
    Math.atan(Math.sinh(Math.PI * (1 - northY - southY))) * 180 / Math.PI];
  const zoom = Math.log2(Math.min(Math.max(1, width) * 0.76 / ((east - west) / 360 * 512),
    Math.max(1, height) * 0.61 / ((southY - northY) * 512)));
  return { center, zoom };
}
