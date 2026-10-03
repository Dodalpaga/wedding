export const FRAME_SEQUENCE = {
  pattern: '/assets/torii-better-fps-frames/frame-{frame}.webp',
  count: 597,
  padding: 6,
  mobile: { maxDimension: 1280, cacheSize: 16, radius: 6, blobCacheBytes: 12 * 1024 * 1024 },
  desktop: { maxDimension: 1280, cacheSize: 24, radius: 9, blobCacheBytes: 24 * 1024 * 1024 },
} as const;

export function frameUrl(index: number) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${FRAME_SEQUENCE.pattern
    .replace('{frame}', String(index + 1).padStart(FRAME_SEQUENCE.padding, '0'))}`;
}
