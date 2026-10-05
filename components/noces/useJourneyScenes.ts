'use client';

import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneBlend } from './scene-blend';

// The content stays in normal flow until JS enhancement is ready. Reduced motion
// and no-JS visitors keep that readable layout instead of a long empty runway.
export default function useJourneyScenes(sectionRef: RefObject<HTMLElement>, statusRef: RefObject<HTMLSpanElement>) {
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
    const foreground = root.querySelector<HTMLElement>('.noces-foreground')!;
    const backdrop = root.querySelector<HTMLElement>('.noces-stage')!;
    const previous = root.querySelector<HTMLButtonElement>('[data-previous]')!;
    const next = root.querySelector<HTMLButtonElement>('[data-next]')!;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preparePhotos = window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches;
    let start = 0;
    let distance = 1;
    let raf = 0;
    let anchorRaf = 0;
    let active = -1;
    const opacities = scenes.map(() => -1);
    let trigger: ScrollTrigger | undefined;
    let disposed = false;
    let preparedImages = false;
    let pendingFocus: { index: number; element: HTMLElement } | null = null;

    function render() {
      raf = 0;
      if (motion.matches || !root!.hasAttribute('data-enhanced')) return;
      const position = Math.max(0, Math.min(1, (window.scrollY - start) / distance)) * (scenes.length - 1);
      const index = Math.round(position);
      const { from, to, weight } = sceneBlend(position, scenes.length);
      if (index !== active) {
        const focusWasInside = active >= 0 && scenes[active].contains(document.activeElement);
        if (active >= 0) {
          scenes[active].style.pointerEvents = 'none';
          scenes[active].inert = true;
          scenes[active].setAttribute('aria-hidden', 'true');
        }
        active = index;
        scenes[index].removeAttribute('aria-hidden');
        scenes[index].inert = false;
        scenes[index].style.pointerEvents = 'auto';
        previous.disabled = index === 0;
        next.disabled = index === scenes.length - 1;
        if (statusRef.current) statusRef.current.textContent = scenes[index].dataset.label || '';
        if (focusWasInside && !pendingFocus) scenes[index].focus({ preventScroll: true });
      }
      scenes.forEach((scene, i) => {
        const opacity = from === to && i === from ? 1 : i === from ? 1 - weight : i === to ? weight : 0;
        if (opacity === opacities[i]) return;
        scene.style.opacity = String(opacity);
        scene.style.visibility = opacity > 0 ? 'visible' : 'hidden';
        opacities[i] = opacity;
      });
      if (pendingFocus && pendingFocus.index === index && opacities[index] > .75) {
        pendingFocus.element.focus({ preventScroll: true });
        pendingFocus = null;
      }
    }
    function schedule() { if (!raf && !motion.matches) raf = requestAnimationFrame(render); }
    async function prepareImages() {
      if (preparedImages || motion.matches || !preparePhotos) return;
      preparedImages = true;
      // Invisible scenes don't trigger native lazy loading soon enough. Decode
      // their original photos before the first fade, one at a time to avoid
      // competing with the sequence's decoder pool.
      const images = Array.from(root!.querySelectorAll<HTMLImageElement>('[data-scene] img'));
      for (const image of images) {
        if (disposed) return;
        image.loading = 'eager';
        try { await image.decode(); } catch { /* The original img keeps its fallback. */ }
      }
    }
    function measure() {
      if (motion.matches) return;
      start = root!.getBoundingClientRect().top + window.scrollY;
      // The journey reserves the full lvh backdrop, even while dvh is stale
      // during a touch gesture. Use that same stable range for scene targets.
      distance = Math.max(1, root!.offsetHeight - backdrop.clientHeight);
      schedule();
    }
    function goTo(index: number, focus = scenes[index], behavior: ScrollBehavior = 'smooth') {
      if (index < 0 || index >= scenes.length || motion.matches) return;
      pendingFocus = { index, element: focus };
      focus.tabIndex = -1;
      window.scrollTo({ top: start + distance * index / (scenes.length - 1), behavior });
      schedule();
    }
    function hashTarget() {
      if (!window.location.hash) return null;
      try { return document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
      catch { return null; }
    }
    function onClick(event: MouseEvent) {
      if (motion.matches || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link) return;
      const id = link.getAttribute('href')!.slice(1);
      const target = document.getElementById(id);
      if (!target || !root!.contains(target)) return;
      const scene = target.closest<HTMLElement>('[data-scene]');
      const index = scene ? scenes.indexOf(scene) : -1;
      if (index < 0) return;
      event.preventDefault();
      window.history.replaceState(null, '', `#${id}`);
      goTo(index, target);
    }
    function onHashChange() {
      const target = hashTarget();
      const scene = target?.closest<HTMLElement>('[data-scene]');
      if (target && scene) goTo(scenes.indexOf(scene), target, 'instant');
    }
    // Next/browser anchor restoration can run after hydration. Reapply the
    // initial hash once layout has settled, using the scene's scroll position.
    function restoreInitialHash() {
      if (!window.location.hash || motion.matches) return;
      cancelAnimationFrame(anchorRaf);
      anchorRaf = requestAnimationFrame(() => {
        anchorRaf = requestAnimationFrame(() => {
          anchorRaf = 0;
          measure();
          onHashChange();
        });
      });
    }
    function backwards() { goTo(active - 1); }
    function forwards() { goTo(active + 1); }
    function configure() {
      trigger?.kill(); trigger = undefined;
      cancelAnimationFrame(raf);
      raf = 0;
      pendingFocus = null;
      active = -1;
      opacities.fill(-1);
      scenes.forEach(scene => {
        scene.style.removeProperty('opacity');
        scene.style.removeProperty('visibility');
        scene.style.removeProperty('pointer-events');
        scene.removeAttribute('aria-hidden');
        scene.inert = false;
      });
      if (motion.matches) { root!.removeAttribute('data-enhanced'); return; }
      root!.style.setProperty('--scene-count', String(scenes.length));
      root!.setAttribute('data-enhanced', '');
      scenes.forEach(scene => {
        scene.style.opacity = '0';
        scene.style.visibility = 'hidden';
        scene.inert = true;
        scene.setAttribute('aria-hidden', 'true');
      });
      measure();
      const target = hashTarget();
      const scene = target?.closest<HTMLElement>('[data-scene]');
      if (target && scene && scenes.includes(scene)) goTo(scenes.indexOf(scene), target, 'instant');
      cancelAnimationFrame(raf);
      raf = 0;
      render();
      trigger = ScrollTrigger.create({ trigger: root, start: 'top top',
        end: () => `+=${distance}`, onUpdate: () => {
          cancelAnimationFrame(raf); raf = 0; render();
        } });
      void prepareImages();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(foreground);
    window.addEventListener('resize', measure);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('load', restoreInitialHash, { once: true });
    document.addEventListener('click', onClick);
    previous.addEventListener('click', backwards);
    next.addEventListener('click', forwards);
    motion.addEventListener('change', configure);
    configure();
    restoreInitialHash();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(anchorRaf);
      observer.disconnect();
      trigger?.kill();
      window.removeEventListener('resize', measure);
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('load', restoreInitialHash);
      document.removeEventListener('click', onClick);
      previous.removeEventListener('click', backwards);
      next.removeEventListener('click', forwards);
      motion.removeEventListener('change', configure);
    };
  }, [sectionRef, statusRef]);
}
