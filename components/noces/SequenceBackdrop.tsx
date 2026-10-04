'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FRAME_SEQUENCE, frameUrl } from './frame-sequence';
import { createSolarRays } from './solar-rays';
import { JourneyFrameBuffer } from './frame-buffer';

gsap.registerPlugin(ScrollTrigger);

// Keep original pixels and endpoints; sample according to the scroll runway.
export const sequenceIndices = (count: number) => Array.from({ length: count }, (_, i) =>
  Math.round(i * (FRAME_SEQUENCE.count - 1) / (count - 1)));

export function preloadOrder(count: number) {
  const order = [0, count - 1], queue = [[0, count - 1]];
  while (queue.length) {
    const [from, to] = queue.shift()!;
    if (to - from < 2) continue;
    const middle = Math.floor((from + to) / 2);
    order.push(middle); queue.push([from, middle], [middle, to]);
  }
  return order;
}

export default function SequenceBackdrop({ sectionRef }: { sectionRef: RefObject<HTMLElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null), raysRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const section = sectionRef.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!section || !canvas || !ctx) return;
    const mobile = matchMedia('(max-width: 1023px), (pointer: coarse)').matches;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const sceneCount = section.querySelectorAll('[data-scene]').length;
    const runway = Math.max(1, sceneCount - 1) * 1.2 * canvas.getBoundingClientRect().height;
    const indices = sequenceIndices(Math.min(FRAME_SEQUENCE.count, Math.max(2, Math.ceil(runway / 16) + 1)));
    const requests = indices.map(() => {
      let resolve!: (blob: Blob) => void, reject!: (error: unknown) => void;
      const promise = new Promise<Blob>((yes, no) => { resolve = yes; reject = no; });
      void promise.catch(() => {});
      return { promise, resolve, reject };
    });
    const downloads = new AbortController();
    const queue = preloadOrder(indices.length);
    const rays = raysRef.current ? createSolarRays(raysRef.current, mobile) : null;
    let mask: ImageBitmap | HTMLImageElement | null = null;
    let maskStarted = false;
    const maskRequest = new AbortController();
    let disposed = false, raf = 0, inFlight = 0;
    let width = 1, height = 1, drawn = -1, resized = true;
    let tween: gsap.core.Tween | undefined;
    const playhead = { frame: 0 };
    let wanted = 0, direction = 1, lastSeek = performance.now(), loadedCount = 0;
    const buffer = new JourneyFrameBuffer<ImageBitmap | HTMLImageElement>({
      settings: { ...FRAME_SEQUENCE[mobile ? 'mobile' : 'desktop'], decodeConcurrency: 4,
        cacheSize: mobile ? 16 : 24, decodeAhead: mobile ? 9 : 15 }, frameCount: indices.length,
      reducedMotion: motion.matches, fetchFrame: index => requests[index].promise,
      decode: async blob => {
        if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
        const image = new Image(), url = URL.createObjectURL(blob); image.src = url;
        try { await image.decode(); return image; } finally { URL.revokeObjectURL(url); }
      },
      release: image => { if ('close' in image) image.close(); else image.src = ''; }, onReady: schedule,
    });
    function seek() {
      const next = motion.matches ? 0 : Math.round(playhead.frame), now = performance.now();
      if (next !== wanted) {
        const nextDirection = next > wanted ? 1 : -1;
        if (nextDirection !== direction) drawn = -1;
        direction = nextDirection;
        const queued = queue.indexOf(next);
        if (queued >= 0) { queue.splice(queued, 1); queue.unshift(next); pump(); }
        buffer.seek(next, direction, Math.min(1200, Math.abs(next - wanted) * 1000 / Math.max(8, now - lastSeek)));
        wanted = next; lastSeek = now;
      }
      // ScrollTrigger already runs on the display tick. A second rAF would
      // present the previous scroll position for another frame.
      cancelAnimationFrame(raf); raf = 0; paint();
    }

    function schedule() {
      if (!disposed && !document.hidden && !raf) raf = requestAnimationFrame(paint);
    }
    function paint() {
      raf = 0;
      if (disposed || document.hidden) return;
      const available = buffer.presentation(wanted, direction);
      if (!available) return;
      const { index: nearest, frame: image } = available;
      if (!resized && (nearest === drawn || drawn >= 0 && (nearest - drawn) * direction < 0)) return;
      const iw = 'naturalWidth' in image ? image.naturalWidth : image.width;
      const ih = 'naturalHeight' in image ? image.naturalHeight : image.height;
      const scale = Math.max(width / iw, height / ih);
      ctx!.drawImage(image, (width - iw * scale) / 2, (height - ih * scale) / 2, iw * scale, ih * scale);
      const sourceIndex = indices[nearest];
      if (!motion.matches && mask) rays?.paint(image, mask, sourceIndex, sourceIndex / (FRAME_SEQUENCE.count - 1));
      else rays?.clear();
      drawn = nearest; resized = false;
      buffer.markPresented(nearest);
      canvas!.dataset.sourceFrame = String(sourceIndex);
      canvas!.dataset.sourceWidth = String(iw);
      canvas!.style.opacity = '1';
    }
    function pump() {
      if (disposed || document.hidden) return;
      while (inFlight < 4 && queue.length) {
        const index = queue.shift()!;
        if (motion.matches && index !== 0) { queue.unshift(index); break; }
        inFlight++;
        void fetch(frameUrl(indices[index]), { signal: downloads.signal })
          .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
          .then(blob => {
            requests[index].resolve(blob); loadedCount++;
            if (loadedCount === indices.length) canvas!.dataset.sequenceLoaded = 'true';
          }).catch(requests[index].reject).finally(() => { inFlight--; pump(); });
      }
    }
    function configure() {
      tween?.scrollTrigger?.kill(); tween?.kill(); tween = undefined;
      buffer.setReducedMotion(motion.matches);
      if (!motion.matches) {
        loadMask();
        tween = gsap.to(playhead, { frame: indices.length - 1, ease: 'none', onUpdate: seek,
          scrollTrigger: { trigger: section, start: 'top top',
            end: () => `+=${Math.max(1, section!.offsetHeight - height)}`,
            scrub: true, invalidateOnRefresh: true } });
      } else { playhead.frame = 0; wanted = 0; rays?.clear(); }
      resized = true; pump(); buffer.seek(wanted, direction); schedule();
    }
    function measure() {
      const rect = canvas!.getBoundingClientRect(); width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2, 1280 / Math.max(width, height));
      const w = Math.max(1, Math.round(width * dpr)), h = Math.max(1, Math.round(height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w; canvas!.height = h; resized = true;
      }
      ctx!.setTransform(w / width, 0, 0, h / height, 0, 0);
      if (rays?.resize(width, height)) resized = true;
      paint(); ScrollTrigger.refresh();
    }
    function visibility() {
      buffer.setVisible(!document.hidden);
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else { pump(); ScrollTrigger.refresh(); schedule(); }
    }
    function loadMask() {
      if (motion.matches || maskStarted || disposed) return;
      maskStarted = true;
      void fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/noces-solar-mask.webp`, { signal: maskRequest.signal })
        .then(response => { if (!response.ok) throw new Error('Mask unavailable'); return response.blob(); })
        .then(async blob => {
          if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
          const image = new Image(), url = URL.createObjectURL(blob); image.src = url;
          try { await image.decode(); return image; } finally { URL.revokeObjectURL(url); }
        }).then(image => {
          if (disposed) { if ('close' in image) image.close(); else image.src = ''; return; }
          mask = image; resized = true; schedule();
        }).catch(() => {});
    }
    measure(); configure();
    const observer = new ResizeObserver(measure); observer.observe(canvas); observer.observe(section);
    motion.addEventListener('change', configure); document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      tween?.scrollTrigger?.kill(); tween?.kill();
      motion.removeEventListener('change', configure); document.removeEventListener('visibilitychange', visibility);
      maskRequest.abort(); downloads.abort(); buffer.dispose();
      if (mask) { if ('close' in mask) mask.close(); else mask.src = ''; }
    };
  }, [sectionRef]);
  return <div className="noces-stage" aria-hidden="true">
    <img className="noces-poster" src={frameUrl(0)} alt="" fetchPriority="high" style={{ objectFit: 'cover' }} />
    <canvas ref={canvasRef} className="noces-canvas" />
    <canvas ref={raysRef} className="noces-solar-rays" />
    <div className="noces-hero-overlay" />
  </div>;
}
