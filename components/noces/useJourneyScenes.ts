'use client';

import { useEffect, type RefObject } from 'react';

// The content stays in normal flow until JS enhancement is ready. Reduced motion
// and no-JS visitors keep that readable layout instead of a long empty runway.
export default function useJourneyScenes(sectionRef: RefObject<HTMLElement>, statusRef: RefObject<HTMLSpanElement>) {
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
    const foreground = root.querySelector<HTMLElement>('.noces-foreground')!;
    const previous = root.querySelector<HTMLButtonElement>('[data-previous]')!;
    const next = root.querySelector<HTMLButtonElement>('[data-next]')!;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let start = 0;
    let distance = 1;
    let raf = 0;
    let anchorRaf = 0;
    let active = -1;
    let lastOpacity = -1;
    let pendingFocus: { index: number; element: HTMLElement } | null = null;

    const fadeOpacity = (gap: number) => {
      const t = Math.max(0, Math.min(1, (gap - .25) / .22));
      return 1 - t * t * (3 - 2 * t);
    };
    function render() {
      raf = 0;
      if (motion.matches || !root!.hasAttribute('data-enhanced')) return;
      const position = Math.max(0, Math.min(1, (window.scrollY - start) / distance)) * (scenes.length - 1);
      const index = Math.round(position);
      const opacity = fadeOpacity(Math.abs(position - index));
      if (index !== active) {
        const focusWasInside = active >= 0 && scenes[active].contains(document.activeElement);
        if (active >= 0) {
          scenes[active].style.opacity = '0';
          scenes[active].style.visibility = 'hidden';
          scenes[active].inert = true;
          scenes[active].setAttribute('aria-hidden', 'true');
        }
        active = index;
        lastOpacity = -1;
        scenes[index].style.visibility = 'visible';
        scenes[index].removeAttribute('aria-hidden');
        scenes[index].inert = false;
        previous.disabled = index === 0;
        next.disabled = index === scenes.length - 1;
        if (statusRef.current) statusRef.current.textContent = scenes[index].dataset.label || '';
        if (focusWasInside && !pendingFocus) scenes[index].focus({ preventScroll: true });
      }
      if (opacity !== lastOpacity) {
        scenes[index].style.opacity = String(opacity);
        scenes[index].style.pointerEvents = opacity > .1 ? 'auto' : 'none';
        scenes[index].inert = opacity <= .1;
        if (opacity <= .01) scenes[index].setAttribute('aria-hidden', 'true');
        else scenes[index].removeAttribute('aria-hidden');
        lastOpacity = opacity;
      }
      if (pendingFocus && pendingFocus.index === index && opacity > .75) {
        pendingFocus.element.focus({ preventScroll: true });
        pendingFocus = null;
      }
    }
    function schedule() { if (!raf && !motion.matches) raf = requestAnimationFrame(render); }
    function measure() {
      if (motion.matches) return;
      start = root!.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, root!.offsetHeight - foreground.clientHeight);
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
      cancelAnimationFrame(raf);
      raf = 0;
      pendingFocus = null;
      active = -1;
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
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(foreground);
    window.addEventListener('scroll', schedule, { passive: true });
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
      cancelAnimationFrame(raf);
      cancelAnimationFrame(anchorRaf);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
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
