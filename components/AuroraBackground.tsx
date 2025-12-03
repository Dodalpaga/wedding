'use client';
import React, { ReactNode, useState, useEffect } from 'react';

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

// Robust mobile detection
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check user agent for mobile indicators
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(navigator.userAgent);

  // Check for mobile-specific APIs
  const hasOrientationAPI = 'orientation' in window;

  // Check device memory (mobile devices typically have less)
  const hasLowMemory = (navigator as any).deviceMemory
    ? (navigator as any).deviceMemory < 4
    : false;

  // Check hardware concurrency (mobile typically has fewer cores)
  const hasLowCores = navigator.hardwareConcurrency
    ? navigator.hardwareConcurrency <= 4
    : false;

  // Combine checks - must have touch AND (mobile UA OR orientation API OR low specs)
  return (
    hasTouch && (isMobileUA || hasOrientationAPI || hasLowMemory || hasLowCores)
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  return (
    <main>
      <div className={cn(className)} {...props}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              '--aurora': isMobile
                ? 'linear-gradient(100deg,#3b82f6_0%,#a5b4fc_50%,#93c5fd_100%)'
                : 'repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)',
              '--dark-gradient':
                'repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)',
              '--white-gradient':
                'repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)',
              '--blue-300': '#93c5fd',
              '--blue-400': '#60a5fa',
              '--blue-500': '#3b82f6',
              '--indigo-300': '#a5b4fc',
              '--violet-200': '#ddd6fe',
              '--black': '#000',
              '--white': '#fff',
              '--transparent': 'transparent',
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              'pointer-events-none absolute -inset-[10px] opacity-30 will-change-transform',
              // Mobile optimization: simpler gradients, no blur, no animations
              isMobile
                ? '[background-image:var(--aurora)] [background-size:200%] [background-position:50%_50%] invert filter dark:invert-0'
                : // Desktop: full effects
                  `after:animate-aurora [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] blur-[10px] invert filter [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
              showRadialGradient &&
                !isMobile &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
