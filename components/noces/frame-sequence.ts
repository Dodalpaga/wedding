export type FrameBufferSettings = {
  maxDimension: number;
  cacheSize: number;
  decodeAhead: number;
  downloadAhead: number;
  downloadMaxAhead: number;
  downloadBehind: number;
  fetchConcurrency: number;
  decodeConcurrency: number;
  blobCacheBytes: number;
  preloadAll: boolean;
};

export const FRAME_SEQUENCE = {
  pattern: '/assets/torii-better-fps-frames/frame-{frame}.webp',
  count: 597,
  padding: 6,
  mobile: {
    maxDimension: 1280, cacheSize: 24, decodeAhead: 17,
    downloadAhead: 64, downloadMaxAhead: 128, downloadBehind: 24,
    fetchConcurrency: 6, decodeConcurrency: 2, blobCacheBytes: 48 * 1024 * 1024, preloadAll: false,
  },
  desktop: {
    maxDimension: 1280, cacheSize: 40, decodeAhead: 29,
    downloadAhead: 96, downloadMaxAhead: 192, downloadBehind: 48,
    fetchConcurrency: 8, decodeConcurrency: 2, blobCacheBytes: 96 * 1024 * 1024, preloadAll: true,
  },
} as const;

export function frameUrl(index: number) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${FRAME_SEQUENCE.pattern
    .replace('{frame}', String(index + 1).padStart(FRAME_SEQUENCE.padding, '0'))}`;
}
