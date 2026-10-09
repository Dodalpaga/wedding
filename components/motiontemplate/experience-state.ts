import { clamp, phase } from './journey';

export const FLIGHT_END = 0.32;
export const INTRO_FADE_END = 0.05;
export const EXPERIENCE_START = 0.28;
export const RESTAURANT_START = 0.45;

export function experienceState(progress: number) {
  const p = clamp(progress);
  const restaurant = clamp((p - RESTAURANT_START) / (1 - RESTAURANT_START));
  return {
    // Keep the departure view still until the title has fully faded.
    flight: clamp((p - INTRO_FADE_END) / (FLIGHT_END - INTRO_FADE_END)),
    visible: p >= EXPERIENCE_START,
    model: p < RESTAURANT_START ? 'tokyo' as const : 'restaurant' as const,
    train: clamp((p - EXPERIENCE_START) / (RESTAURANT_START - EXPERIENCE_START)),
    restaurant,
    restaurantChapter: restaurant < 0.29 ? 'finding' as const : restaurant < 0.58 ? 'food' as const : 'kitchen' as const,
  };
}

type Vector = readonly [number, number, number];
export type RestaurantPose = { position: Vector; target: Vector };

// Coordinates are in the supplied Inakaya model's original world units.
// A level eye-height passage through the entrance precedes two broad interior
// views. Avoid the creator's close-up food annotation and its low-resolution
// textures. Retrace the doorway on exit before returning to the outside view.
export const RESTAURANT_POSES: readonly (RestaurantPose & { at: number })[] = [
  { at: 0, position: [11, 7.4, 14], target: [-1.4, 2.1, 0] },
  { at: .24, position: [.75, 1.1, 4.88], target: [.5, 1.05, -1.5] },
  { at: .28, position: [.75, 1.1, 4.88], target: [.5, 1.05, -1.5] },
  { at: .36, position: [.75, 1.1, 1.7], target: [.5, 1.05, -1.5] },
  { at: .46, position: [.75, 1.4, .8], target: [-1.3, .85, -1.6] },
  { at: .52, position: [.75, 1.4, .8], target: [-1.3, .85, -1.6] },
  { at: .67, position: [.75, 1.55, .8], target: [-1.4, 1.2, -2.3] },
  { at: .78, position: [.75, 1.55, .8], target: [-1.4, 1.2, -2.3] },
  { at: .84, position: [.75, 1.1, 1.7], target: [.5, 1.05, -1.5] },
  { at: .9, position: [.75, 1.1, 4.88], target: [.5, 1.05, -1.5] },
  { at: 1, position: [11, 7.4, 14], target: [-1.4, 2.1, 0] },
];

export function restaurantPose(progress: number): RestaurantPose {
  const p = clamp(progress);
  const index = RESTAURANT_POSES.findIndex((pose, i) => i > 0 && p <= pose.at);
  const right = RESTAURANT_POSES[index < 0 ? RESTAURANT_POSES.length - 1 : index];
  const left = RESTAURANT_POSES[Math.max(0, (index < 0 ? RESTAURANT_POSES.length - 1 : index) - 1)];
  const t = phase(p, left.at, right.at);
  const mix = (a: Vector, b: Vector) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];
  return { position: mix(left.position, right.position), target: mix(left.target, right.target) };
}
