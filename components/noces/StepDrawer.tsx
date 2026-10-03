'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

// Native disclosure: keyboard/touch and no-JS access without scroll-time state.
export default function StepDrawer({ children, city, number }: {
  children: ReactNode;
  city: string;
  number: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const compact = window.matchMedia('(max-width: 767px), (max-height: 600px)');
    function configure() {
      details!.dataset.compact = String(compact.matches);
      details!.open = !compact.matches;
      const content = details!.querySelector<HTMLElement>('.noces-step-content');
      if (content) content.tabIndex = compact.matches ? 0 : -1;
    }
    configure();
    compact.addEventListener('change', configure);
    return () => compact.removeEventListener('change', configure);
  }, []);

  return <details ref={ref} className="noces-step-drawer">
    <summary aria-label={`Détails de l’escale : ${city}`}>
      <span className="noces-drawer-number">{number}</span>
      <span className="noces-drawer-city font-wedding">{city}</span>
      <ChevronDown size={18} aria-hidden="true" />
    </summary>
    <div className="noces-step-content" tabIndex={0}>{children}</div>
  </details>;
}
