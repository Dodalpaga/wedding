'use client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { orientationQuaternion, relativeTilt, type Quaternion } from './postcard-tilt';

type TiltStatus = 'off' | 'permission' | 'waiting' | 'active' | 'denied' | 'unavailable';
type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

export function usePostcardTilt(cardRef: RefObject<HTMLDivElement>, update: (x: number, y: number) => void, interactive: boolean) {
  const [status, setStatus] = useState<TiltStatus>('off');
  const [granted, setGranted] = useState(false);
  const neutral = useRef<Quaternion | null>(null);
  const latest = useRef<Quaternion | null>(null);
  const output = useRef<[number, number]>([0, 0]);
  const mounted = useRef(false);
  const recenter = useCallback(() => { neutral.current = latest.current; output.current = [0, 0]; update(0, 0); }, [update]);

  const enable = async () => {
    const api = window.DeviceOrientationEvent as OrientationAPI;
    try {
      const result = await api.requestPermission?.();
      if (!mounted.current) return;
      if (result === 'denied') { setStatus('denied'); return; }
      setGranted(true);
    } catch { if (mounted.current) setStatus('denied'); }
  };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const touch = matchMedia('(pointer: coarse)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let stop: (() => void) | undefined;
    const configure = () => {
      stop?.(); stop = undefined;
      update(0, 0);
      output.current = [0, 0];
      if (!touch.matches || reduced.matches) { setStatus('off'); return; }
      if (!window.isSecureContext || !window.DeviceOrientationEvent || !card) { setStatus('unavailable'); return; }
      const api = window.DeviceOrientationEvent as OrientationAPI;
      if (api.requestPermission && !granted) { setStatus(interactive ? 'permission' : 'off'); return; }
      setStatus(interactive ? 'waiting' : 'off');
      let visible = false, frame = 0;
      let received = false;
      const screenAngle = () => window.screen.orientation?.angle ?? window.orientation ?? 0;
      const draw = () => {
        frame = 0;
        if (!interactive || !visible || document.hidden || !neutral.current || !latest.current) return;
        // Ignore tiny sensor noise without adding a perpetual render loop.
        const target = relativeTilt(neutral.current, latest.current, screenAngle())
          .map(value => Math.abs(value) < .02 ? 0 : Math.round(value * 200) / 200);
        const next = target.map((value, i) => {
          const eased = output.current[i] + (value - output.current[i]) * .25;
          return Math.abs(value - eased) < .002 ? value : eased;
        }) as [number, number];
        if (next.some((value, i) => Math.abs(value - output.current[i]) > .0001)) update(...next);
        output.current = next;
        if (target.some((value, i) => Math.abs(value - output.current[i]) >= .002)) frame = requestAnimationFrame(draw);
      };
      const schedule = () => { if (interactive && !frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
      const sensor = (event: DeviceOrientationEvent) => {
        const sample = orientationQuaternion(event);
        if (!sample) return;
        latest.current = sample;
        if (!neutral.current) neutral.current = sample;
        clearTimeout(timeout);
        if (!received) { received = true; if (interactive) setStatus('active'); }
        schedule();
      };
      const reset = () => { neutral.current = null; output.current = [0, 0]; update(0, 0); };
      const visibility = () => { if (document.hidden) cancelAnimationFrame(frame); frame = 0; schedule(); };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
        else { cancelAnimationFrame(frame); frame = 0; output.current = [0, 0]; update(0, 0); }
      });
      observer.observe(card);
      const timeout = window.setTimeout(() => { if (interactive) setStatus('unavailable'); }, 5000);
      window.addEventListener('deviceorientation', sensor);
      window.screen.orientation?.addEventListener('change', reset);
      window.addEventListener('orientationchange', reset);
      document.addEventListener('visibilitychange', visibility);
      stop = () => {
        clearTimeout(timeout); cancelAnimationFrame(frame); observer.disconnect();
        window.removeEventListener('deviceorientation', sensor);
        window.screen.orientation?.removeEventListener('change', reset);
        window.removeEventListener('orientationchange', reset);
        document.removeEventListener('visibilitychange', visibility);
      };
    };
    configure();
    touch.addEventListener('change', configure); reduced.addEventListener('change', configure);
    return () => { stop?.(); touch.removeEventListener('change', configure); reduced.removeEventListener('change', configure); };
  }, [cardRef, update, interactive, granted]);
  return { status, enable, recenter };
}
