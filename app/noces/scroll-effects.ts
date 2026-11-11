'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Writes the scroll progress (0 → 1) of each `[data-progress]` descendant into `--p`.
 * `data-progress="pin"`: progress through a tall section with a sticky child.
 * `data-progress="view"`: progress from entering to leaving the viewport.
 */
export function useScrollProgress(rootRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-progress]'));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        const p = el.dataset.progress === 'pin'
          ? -rect.top / Math.max(1, rect.height - vh)
          : (vh - rect.top) / (vh + rect.height);
        el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [rootRef]);
}

/** Sets `data-in="true"` on `[data-reveal]` descendants once they enter the viewport. */
export function useReveal(rootRef: RefObject<HTMLElement>, threshold = 0.25) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-in', 'true');
        io.unobserve(entry.target);
      }
    }, { threshold });
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, threshold]);
}
