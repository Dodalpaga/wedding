'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { FRAME_SEQUENCE, frameUrl } from './frame-sequence';
import { createSolarRays } from './solar-rays';
import { JourneyFrameBuffer } from './frame-buffer';

type DecodedFrame = ImageBitmap | HTMLImageElement;
const release = (frame: DecodedFrame) => {
  if ('close' in frame) frame.close();
  else frame.src = '';
};

async function decode(blob: Blob): Promise<DecodedFrame> {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(blob); } catch { /* Image.decode fallback. */ }
  }
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try { await img.decode(); return img; }
  finally { URL.revokeObjectURL(url); }
}

export default function SequenceBackdrop({ sectionRef }: { sectionRef: RefObject<HTMLElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raysRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!section || !canvas || !ctx) return;
    // Select once: avoid reloading a whole variant on mobile toolbar/orientation changes.
    const variant = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number });
    const economical = connection.connection?.saveData === true || /(^|-)2g$/.test(connection.connection?.effectiveType || '');
    const lowMemory = (connection.deviceMemory ?? 8) <= 4;
    const settings = {
      ...FRAME_SEQUENCE[variant],
      ...(lowMemory ? { cacheSize: 16, decodeAhead: 11, blobCacheBytes: 32 * 1024 * 1024, preloadAll: false } : {}),
      ...(economical ? {
        fetchConcurrency: 2, downloadAhead: 16, downloadMaxAhead: 32, downloadBehind: 8, preloadAll: false,
      } : {}),
    };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rays = raysRef.current ? createSolarRays(raysRef.current, variant === 'mobile') : null;
    let disposed = false;
    let raf = 0;
    let target = 0;
    let eased = 0;
    let wanted = 0;
    let drawn = -1;
    let resized = true;
    let start = 0;
    let distance = 1;
    let width = 1;
    let height = 1;
    let lastPaint = -Infinity;
    let direction = 1;
    let speed = 0;
    let lastScroll = performance.now();
    const buffer = new JourneyFrameBuffer<DecodedFrame>({
      settings,
      frameCount: FRAME_SEQUENCE.count,
      reducedMotion: motion.matches,
      decode,
      release,
      onReady: schedule,
      fetchFrame: async (index, signal) => {
        const response = await fetch(frameUrl(index), { signal });
        if (!response.ok) throw new Error('Frame unavailable');
        return response.blob();
      },
    });

    function schedule() {
      if (!disposed && !document.hidden && !raf) raf = requestAnimationFrame(tick);
    }
    function paint() {
      const loaded = buffer.nearest(wanted);
      if (!loaded || (loaded.index === drawn && !resized)) return;
      const { index: nearest, frame } = loaded;
      const w = 'naturalWidth' in frame ? frame.naturalWidth : frame.width;
      const h = 'naturalHeight' in frame ? frame.naturalHeight : frame.height;
      const scale = Math.max(width / w, height / h);
      ctx!.drawImage(frame, (width - w * scale) / 2, (height - h * scale) / 2, w * scale, h * scale);
      if (motion.matches) rays?.clear();
      else rays?.paint(frame, nearest / (FRAME_SEQUENCE.count - 1));
      drawn = nearest;
      resized = false;
      if (canvas!.style.opacity !== '1') canvas!.style.opacity = '1';
    }
    function tick(now: number) {
      raf = 0;
      if (disposed || document.hidden) return;
      // At most 60 canvas updates/second; idle pages have no running rAF loop.
      if (now - lastPaint < 1000 / 60) { schedule(); return; }
      lastPaint = now;
      eased = motion.matches ? 0 : eased + (target - eased) * .18;
      if (Math.abs(target - eased) < .015 && !motion.matches) eased = target;
      const next = Math.round(eased);
      if (next !== wanted) { wanted = next; buffer.seek(wanted, direction, speed, target); }
      paint();
      if (!motion.matches && eased !== target) schedule();
    }
    function onScroll() {
      const next = motion.matches ? 0 : Math.max(0, Math.min(1, (window.scrollY - start) / distance)) * (FRAME_SEQUENCE.count - 1);
      if (next !== target) {
        const now = performance.now();
        direction = next > target ? 1 : -1;
        speed = Math.min(240, Math.abs(next - target) * 1000 / Math.max(16, now - lastScroll));
        lastScroll = now;
        target = next;
        schedule();
      }
    }
    function measure() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2, settings.maxDimension / Math.max(rect.width, rect.height));
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));
      width = rect.width;
      height = rect.height;
      // Strict Mode/Fast Refresh can recreate the renderer while retaining the
      // DOM canvas sizes. Initialise its private mask/crop independently.
      if (rays?.resize(width, height)) resized = true;
      if (canvas!.width !== nextWidth || canvas!.height !== nextHeight) {
        canvas!.width = nextWidth;
        canvas!.height = nextHeight;
        ctx!.setTransform(nextWidth / width, 0, 0, nextHeight / height, 0, 0);
        resized = true;
      }
      paint(); // Restore synchronously, avoiding a blank resize frame.
      start = section!.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, section!.offsetHeight - height);
      onScroll();
      schedule();
    }
    function motionChanged() {
      resized = true;
      if (motion.matches) {
        rays?.clear();
        target = eased = wanted = 0;
      }
      buffer.setReducedMotion(motion.matches);
      onScroll();
      buffer.seek(wanted, direction, speed, target);
      schedule();
    }
    function visibilityChanged() {
      buffer.setVisible(!document.hidden);
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else { onScroll(); buffer.seek(wanted, direction, speed, target); schedule(); }
    }
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    motion.addEventListener('change', motionChanged);
    document.addEventListener('visibilitychange', visibilityChanged);
    measure();
    buffer.setVisible(!document.hidden);
    buffer.seek(wanted, direction, speed, target);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      motion.removeEventListener('change', motionChanged);
      document.removeEventListener('visibilitychange', visibilityChanged);
      buffer.dispose();
    };
  }, [sectionRef]);

  return <div className="noces-stage" aria-hidden="true">
    <picture className="noces-poster">
      <img src={frameUrl(0)} alt="" fetchPriority="high" />
    </picture>
    <canvas ref={canvasRef} className="noces-canvas" />
    <canvas ref={raysRef} className="noces-solar-rays" />
    <div className="noces-hero-overlay" />
  </div>;
}
