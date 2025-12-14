'use client';

import { useEffect, useState } from 'react';
import Aurora from '@/components/Aurora/Aurora';
import Signature from '@/components/Signature';

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
