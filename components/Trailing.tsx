'use client';
import { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';

// Composant WeddingBackground pour l'effet aurore boréale
export default function Trailing() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: 'push',
          },
        },
        modes: {
          push: {
            quantity: 15,
          },
        },
      },
      particles: {
        color: {
          value: ['#D4AF37', '#F1E5AC', '#ffffff', '#E6D4A0', '#C9A961'],
        },
        life: {
          duration: {
            sync: false,
            value: 3,
          },
          count: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          straight: false,
          outModes: {
            default: 'destroy',
          },
          attract: {
            enable: true,
            distance: 200,
            rotate: {
              x: 600,
              y: 600,
            },
          },
        },
        number: {
          value: 0,
        },
        opacity: {
          value: { min: 0, max: 0.7 },
          animation: {
            enable: true,
            speed: 0.8,
            mode: 'auto',
            startValue: 'max',
            destroy: 'min',
          },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 15 },
          animation: {
            enable: true,
            speed: 10,
            mode: 'auto',
            startValue: 'min',
            destroy: 'max',
          },
        },
        shadow: {
          enable: true,
          blur: 25,
          color: {
            value: '#D4AF37',
          },
          offset: {
            x: 0,
            y: 0,
          },
        },
        wobble: {
          enable: true,
          distance: 20,
          speed: {
            min: 8,
            max: 15,
          },
        },
        rotate: {
          value: 0,
          random: true,
          direction: 'random',
          animation: {
            enable: true,
            speed: 10,
            sync: false,
          },
        },
      },
      detectRetina: true,
      background: {
        color: 'transparent',
      },
    }),
    []
  );

  if (!init) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Particles
        id="wedding-particles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
