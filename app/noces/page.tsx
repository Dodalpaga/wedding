'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowDown, Plane } from 'lucide-react';

type TripStep = { city: string; title: string; description: string; highlights: string[]; image?: string };

// Pistes provisoires : modifier ici les villes, descriptions et envies.
// Pour remplacer un visuel, ajouter image: '/images/nom-du-fichier.jpg'.
const tripSteps: TripStep[] = [
  {
    city: 'Tokyo', title: 'Les premiers pas dans un autre monde',
    description: 'Nous imaginons commencer notre aventure au rythme de Tokyo : nous perdre dans ses quartiers, passer des rues animées aux petits temples et découvrir nos premières adresses gourmandes. Quelques jours pour prendre nos marques et savourer le début du voyage à deux.',
    highlights: ['Balades en ville', 'Petites adresses', 'Premières découvertes'],
  },
  {
    city: 'Hakone & Mont Fuji', title: 'Une parenthèse au grand air',
    description: 'Après la ville, nous aimerions ralentir un peu. Une nuit dans un hébergement traditionnel, un bain chaud et des paysages de montagne : une étape pour profiter du calme et, avec un peu de chance, apercevoir le mont Fuji.',
    highlights: ['Nature', 'Onsen', 'Nuit en ryokan'],
  },
  {
    city: 'Kyoto', title: 'Prendre le temps de flâner',
    description: 'Kyoto fait partie de nos envies : des jardins, des temples et des ruelles à découvrir sans trop se presser. Nous nous voyons déjà alterner les visites et les pauses, avec du temps pour les détours et les découvertes imprévues.',
    highlights: ['Jardins & temples', 'Ruelles', 'Promenades à deux'],
  },
  {
    city: 'Nara & Osaka', title: 'Des rencontres et des saveurs',
    description: 'Nous envisageons une escapade à Nara, puis une halte à Osaka pour découvrir une autre ambiance. L’idée : se promener, goûter plein de choses et laisser une place aux bonnes surprises plutôt que de remplir chaque minute du programme.',
    highlights: ['Escapades', 'Cuisine locale', 'Soirées en ville'],
  },
  {
    city: 'Okinawa / Ishigaki', title: 'Finir les pieds dans l’eau',
    description: 'Pour les derniers jours, nous rêvons d’une pause près de la mer. Quelques baignades, de longues conversations et le plaisir de ne rien prévoir : une façon de prolonger cette bulle à deux avant de rentrer avec nos souvenirs.',
    highlights: ['Mer', 'Repos', 'Derniers souvenirs'],
  },
];

function StepVisual({ step, index }: { step: TripStep; index: number }) {
  return <div className="honeymoon-visual">
    {step.image ? <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${step.image}`} alt={step.city} className="h-full w-full object-cover" loading="lazy" /> : <>
      <svg aria-hidden="true" viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <circle cx={index % 2 === 0 ? 290 : 110} cy="74" r="40" fill="#e9b59f" opacity=".75" />
        <path d="M0 185 85 110 145 165 225 65 330 180 400 135V240H0Z" fill="#003b4e" opacity=".12" />
        <path d="m198 99 27-34 31 38-20-9-11 7-12-8Z" fill="#fff" opacity=".8" />
        <path d="M0 210Q90 160 200 205T400 190V240H0Z" fill="#137e41" opacity=".15" />
      </svg>
      <div className="relative z-10 px-5 text-center">
        <p className="mb-2 text-xs uppercase tracking-[.2em] text-[#003b4e]/60">Carnet de voyage · {String(index + 1).padStart(2, '0')}</p>
        <p className="font-wedding text-3xl text-[#003b4e] sm:text-4xl">{step.city}</p>
        <p className="mt-3 text-xs text-[#003b4e]/70">Nos photos viendront raconter la suite</p>
      </div>
    </>}
  </div>;
}

export default function HoneymoonPage() {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start center', 'end center'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const airplaneY = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  return <main className="honeymoon-page min-h-screen bg-[#fcfcfc] text-[#003b4e]">
    <header className="relative overflow-hidden bg-gradient-to-br from-[#003b4e] via-[#034861] to-[#137e41] text-white">
      <nav aria-label="Navigation" className="honeymoon-container relative z-10 pt-5">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10">
          <ArrowLeft size={16} aria-hidden="true" /> Accueil
        </Link>
      </nav>
      <motion.div initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="honeymoon-container relative z-10 py-10 text-center sm:py-14">
        <p className="mb-3 text-xs uppercase tracking-[.2em] text-white/75">Notre voyage de noces</p>
        <h1 className="font-wedding text-6xl sm:text-7xl lg:text-8xl">Un mois au Japon</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">Un roadtrip à deux, des villes qui fourmillent, des pauses au vert et du temps pour nous. Voici les premières pistes de notre aventure.</p>
        <a href="#itineraire" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10">Découvrir nos envies <ArrowDown size={16} aria-hidden="true" /></a>
      </motion.div>
    </header>

    <section id="itineraire" aria-labelledby="itinerary-title" className="honeymoon-container py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#137e41]">Un itinéraire qui se dessine</p>
        <h2 id="itinerary-title" className="mt-2 font-wedding text-4xl sm:text-5xl">Nos envies d’escales</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">Nous ajustons encore les villes, l’ordre des étapes et le temps passé sur place. Rien n’est figé : ces escales donnent un premier aperçu du voyage dont nous rêvons.</p>
      </div>
      <div ref={containerRef} className="relative">
        <div aria-hidden="true" className="honeymoon-route">
          <div className="h-full border-l-2 border-dashed border-[#003b4e]/20" />
          <motion.div style={{ top: reducedMotion ? '0%' : airplaneY }} className="absolute -left-[15px] -mt-4 rounded-full bg-white p-1.5 text-[#137e41] shadow-sm"><Plane size={20} className="rotate-90" /></motion.div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {tripSteps.map((step, index) => <motion.article key={step.city} initial={reducedMotion ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .6 }} className="honeymoon-step">
            <div className={index % 2 === 0 ? 'md:col-start-1 md:row-start-1' : 'md:col-start-2 md:row-start-1'}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-[#137e41]">Escale envisagée · {String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-wedding text-4xl sm:text-5xl">{step.city}</h3>
              <p className="mt-2 font-semibold">{step.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{step.description}</p>
              <ul aria-label={`Nos envies à ${step.city}`} className="mt-4 flex flex-wrap gap-2">{step.highlights.map(highlight => <li key={highlight} className="rounded-full bg-[#137e41]/[.07] px-3 py-1 text-xs text-[#137e41]">{highlight}</li>)}</ul>
            </div>
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-[#137e41] md:block" />
            <div className={index % 2 === 0 ? 'md:col-start-2 md:row-start-1' : 'md:col-start-1 md:row-start-1'}><StepVisual step={step} index={index} /></div>
          </motion.article>)}
        </div>
      </div>
    </section>

    <section aria-labelledby="gift-title" className="bg-[#003b4e] py-10 text-white sm:py-14">
      <div className="honeymoon-container max-w-2xl text-center">
        <h2 id="gift-title" className="font-wedding text-4xl sm:text-5xl">Un petit bout de notre aventure</h2>
        <p className="mt-5 text-sm leading-relaxed text-white/85 sm:text-base">Votre présence est notre plus beau cadeau. Si vous souhaitez participer à notre voyage de noces, une urne sera disponible le jour du mariage.</p>
        <p className="mt-5 font-semibold">Merci du fond du cœur ❤️</p>
        <p className="mt-2 text-sm text-white/75">Solenne &amp; Dorian</p>
      </div>
    </section>
  </main>;
}
