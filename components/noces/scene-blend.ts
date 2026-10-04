// A complementary fade keeps the foreground present at every scroll position.
export function sceneBlend(position: number, count: number) {
  const bounded = Math.max(0, Math.min(count - 1, position));
  const from = Math.floor(bounded);
  const to = Math.min(count - 1, from + 1);
  const t = Math.max(0, Math.min(1, (bounded - from - .25) / .5));
  const weight = t * t * (3 - 2 * t);
  return { from, to, weight };
}
