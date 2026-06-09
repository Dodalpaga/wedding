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

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date('2027-07-17T15:00:00').getTime();
      const now = new Date().getTime();
      const difference = weddingDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
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
          className="w-[50%] max-w-[240px] aspect-square mx-auto drop-shadow-2xl"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />

        {/* Conteneur avec contraintes de taille pour la signature */}
        <div className="w-full max-w-2xl mx-auto">
          <Signature theme="light" />
        </div>

        <p className="text-xl md:text-2xl text-[var(--accent)] mb-8 font-light">
          Nous nous marions !
        </p>
        <div className="text-2xl md:text-3xl font-bold text-[var(--accent)] mb-8">
          17 Juillet 2027
        </div>

        {/* Compte à rebours */}
        <div className="flex justify-center gap-4 md:gap-8 mb-8 text-[var(--accent)]">
          {[
            { value: timeLeft.days, label: 'Jours' },
            { value: timeLeft.hours, label: 'Heures' },
            { value: timeLeft.minutes, label: 'Minutes' },
            { value: timeLeft.seconds, label: 'Secondes' },
          ].map((item, index) => (
            <div
              key={index}
              className="backdrop-blur-sm bg-white/10 rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-white/20 shadow-lg"
            >
              <div className="text-2xl md:text-4xl font-bold mb-1">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-xs md:text-sm font-light">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Indicateur de scroll */}
        <div className="animate-bounce mb-16">
          <svg
            className="w-6 h-6 text-[var(--accent)] mx-auto"
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
      </div>
    </section>
  );
}
