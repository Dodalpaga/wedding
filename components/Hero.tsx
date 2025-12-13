'use client';

import { useEffect, useState, useMemo } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, ISourceOptions } from '@tsparticles/engine';
import Aurora from '@/components/Aurora/Aurora';
import Signature from '@/components/Signature';

// Composant WeddingBackground pour l'effet aurore boréale
function WeddingBackground() {
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
    <div className="absolute inset-0 z-0">
      <Particles
        id="wedding-particles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default function Hero() {
  const [auroraColors, setAuroraColors] = useState([
    '#003b4e',
    '#1c7743',
    '#003b4e',
  ]);

  useEffect(() => {
    const updateColors = () => {
      if (window.innerWidth < 1000) {
        setAuroraColors(['#1c7743', '#003b4e']);
      } else {
        setAuroraColors(['#003b4e', '#1c7743', '#003b4e']);
      }
    };

    updateColors();
    window.addEventListener('resize', updateColors);
    return () => window.removeEventListener('resize', updateColors);
  }, []);

  return (
    <section
      id="accueil"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Fond aurores boréales */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#064134] via-[#052430] to-[#032430]"></div>
      {/* https://reactbits.dev/backgrounds/aurora */}
      <Aurora
        colorStops={auroraColors}
        blend={0.4}
        amplitude={0.7}
        speed={0.2}
      />
      {/* Effet de particules aurore boréale */}
      <WeddingBackground />
      <div className="container mx-auto px-4 text-center relative z-10">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/SD Logo white.svg`}
          alt="Logo"
          className="h-48 w-48 mx-auto mb-8 object-contain drop-shadow-2xl"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />

        {/* Conteneur avec contraintes de taille pour la signature */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <Signature theme="light" />
        </div>

        <p className="text-xl md:text-2xl text-[var(--accent)] mb-8 font-light">
          Nous nous marions !
        </p>
        <div className="text-2xl md:text-3xl font-light text-[var(--accent)] mb-12">
          17 Juillet 2027
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <svg
          className="w-6 h-6 text-[var(--accent)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
