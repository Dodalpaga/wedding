'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { FRAME_SEQUENCE, frameUrl } from './frame-sequence';
import { createSolarRays } from './solar-rays';
import { FrameBlobCache } from './frame-blob-cache';

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
    const settings = FRAME_SEQUENCE[variant];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rays = raysRef.current ? createSolarRays(raysRef.current, variant === 'mobile') : null;
    const bitmaps = new Map<number, DecodedFrame>();
    // Keep recent compressed frames for reverse scrolling without accumulating
    // the entire video. Older frames may still be available in the HTTP cache.
    const blobs = new FrameBlobCache(settings.blobCacheBytes);
    const pending = new Map<number, AbortController>();
    const failed = new Set<number>();
    let disposed = false;
    let raf = 0;
    let target = 0;
    let eased = 0;
    let wanted = 0;
    let drawn = -1;
    let resized = true;
    let firstSettled = false;
    let start = 0;
    let distance = 1;
    let width = 1;
    let height = 1;
    let lastPaint = -Infinity;

    function schedule() {
      if (!disposed && !document.hidden && !raf) raf = requestAnimationFrame(tick);
    }
    function prune() {
      while (bitmaps.size > settings.cacheSize) {
        let farthest = -1;
        let farthestDistance = -1;
        bitmaps.forEach((_, index) => {
          if (index !== wanted && Math.abs(index - wanted) > farthestDistance) {
            farthest = index;
            farthestDistance = Math.abs(index - wanted);
          }
        });
        const frame = bitmaps.get(farthest);
        if (!frame) break;
        release(frame);
        bitmaps.delete(farthest);
      }
    }
    async function load(index: number) {
      const controller = new AbortController();
      pending.set(index, controller);
      try {
        let blob = blobs.get(index);
        if (!blob) {
          const response = await fetch(frameUrl(index), { signal: controller.signal });
          if (!response.ok) throw new Error('Frame unavailable');
          blob = await response.blob();
          if (!disposed && !controller.signal.aborted) blobs.set(index, blob);
        }
        if (disposed || controller.signal.aborted) return;
        const frame = await decode(blob);
        if (disposed || controller.signal.aborted) { release(frame); return; }
        bitmaps.set(index, frame);
        prune();
        schedule();
      } catch {
        if (!disposed && !controller.signal.aborted) failed.add(index);
      } finally {
        if (pending.get(index) === controller) pending.delete(index);
        if (index === 0 && !controller.signal.aborted) firstSettled = true;
        pump();
      }
    }
    function pump() {
      if (disposed || document.hidden) return;
      if (motion.matches) {
        if (!bitmaps.has(0) && !pending.has(0) && !failed.has(0)) void load(0);
        return;
      }
      if (!firstSettled) {
        if (!pending.has(0)) void load(0);
        return;
      }
      // Drop stale network/decode work after a large jump through the page.
      pending.forEach((controller, index) => {
        if (Math.abs(index - wanted) > settings.radius + 3) controller.abort();
      });
      const direction = target >= eased ? 1 : -1;
      const priorities = [wanted];
      for (let delta = 1; delta <= settings.radius; delta++) {
        priorities.push(wanted + delta * direction, wanted - delta * direction);
      }
      const limit = variant === 'mobile' ? 2 : 3;
      for (const index of priorities) {
        if (pending.size >= limit) break;
        if (index < 0 || index >= FRAME_SEQUENCE.count || bitmaps.has(index) || pending.has(index) || failed.has(index)) continue;
        void load(index);
      }
    }
    function paint() {
      let nearest = -1;
      let nearestDistance = Infinity;
      bitmaps.forEach((_, index) => {
        const gap = Math.abs(index - wanted);
        if (gap < nearestDistance) { nearest = index; nearestDistance = gap; }
      });
      if (nearest < 0 || (nearest === drawn && !resized)) return;
      const frame = bitmaps.get(nearest)!;
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
      if (next !== wanted) { wanted = next; pump(); }
      paint();
      if (!motion.matches && eased !== target) schedule();
    }
    function onScroll() {
      const next = motion.matches ? 0 : Math.max(0, Math.min(1, (window.scrollY - start) / distance)) * (FRAME_SEQUENCE.count - 1);
      if (next !== target) { target = next; schedule(); }
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
        blobs.clear();
        target = eased = wanted = 0;
        pending.forEach((controller, index) => { if (index !== 0) controller.abort(); });
        bitmaps.forEach((frame, index) => { if (index !== 0) { release(frame); bitmaps.delete(index); } });
      }
      onScroll();
      pump();
      schedule();
    }
    function visibilityChanged() {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else { onScroll(); pump(); schedule(); }
    }
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    motion.addEventListener('change', motionChanged);
    document.addEventListener('visibilitychange', visibilityChanged);
    measure();
    pump();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      motion.removeEventListener('change', motionChanged);
      document.removeEventListener('visibilitychange', visibilityChanged);
      pending.forEach(controller => controller.abort());
      bitmaps.forEach(release);
      bitmaps.clear();
      blobs.clear();
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
