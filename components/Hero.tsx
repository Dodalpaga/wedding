'use client';

import { useEffect, useState } from 'react';
import Aurora from '@/components/Aurora/Aurora';
import Signature from '@/components/Signature';

export default function Hero() {
  const [auroraColors, setAuroraColors] = useState(['#003b4e', '#1c7743', '#003b4e']);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const updateColors = () => setAuroraColors(window.innerWidth < 1000
      ? ['#1c7743', '#003b4e']
      : ['#003b4e', '#1c7743', '#003b4e']);
    updateColors();
    window.addEventListener('resize', updateColors);
    return () => window.removeEventListener('resize', updateColors);
  }, []);

  useEffect(() => {
    const update = () => setDaysLeft(Math.max(0, Math.ceil(
      (new Date('2027-07-17T15:00:00+02:00').getTime() - Date.now()) / 86400000,
    )));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header id="accueil" className="landing-hero">
      <Aurora colorStops={auroraColors} blend={0.4} amplitude={0.7} speed={0.2} />
      <div className="landing-container relative z-10 text-center">
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/SD Logo white.svg`}
          alt="Monogramme de Solenne et Dorian" width="240" height="240"
          className="mx-auto w-1/2 max-w-[240px] h-auto aspect-square drop-shadow-2xl" />
        <h1 className="mx-auto w-full max-w-2xl">
          <span className="sr-only">Solenne &amp; Dorian — Nous nous marions !</span>
          <span aria-hidden="true"><Signature theme="light" /></span>
        </h1>
        <p className="-mt-3 text-sm text-white/80">Nous nous marions !</p>
        <p className="mt-4 text-xl font-semibold sm:text-2xl">17 juillet 2027</p>
        <p className="mt-1 text-sm text-white/80">Domaine d’en Naudet · Teyssode, Tarn</p>
        <p className="mt-3 min-h-5 text-xs tracking-wide text-white/70">
          {daysLeft !== null && (daysLeft > 0 ? `Encore ${daysLeft} jours avant de se retrouver` : 'Le grand jour est arrivé !')}
        </p>
        <nav aria-label="Accès rapide" className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3">
          <a href="#confirmation" className="landing-button bg-[var(--accent)] text-[var(--primary)]">Confirmer ma présence</a>
          <a href="#infos" className="landing-button border border-white/40 text-white hover:bg-white/10">Les infos pratiques</a>
        </nav>
      </div>
      <a href="#confirmation" className="landing-hero-next relative z-10" aria-label="Découvrir votre invitation et les informations pratiques">
        <span>Votre invitation &amp; les infos pratiques</span>
        <span aria-hidden="true">↓</span>
      </a>
    </header>
  );
}
