'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Header from '@/components/Header';

// --- Données du voyage (A personnaliser) ---
const tripSteps = [
  {
    city: 'Tokyo',
    title: "L'effervescence Moderne",
    days: 'Jours 1-5',
    description:
      'Plongée immédiate dans la capitale. Entre les néons de Shinjuku, la traversée de Shibuya et la quiétude du temple Senso-ji. Nous goûterons nos premiers sushis authentiques !',
    imgPlaceholder: 'tokyo.jpg', // Nom de fichier imaginaire pour l'exemple
  },
  {
    city: 'Hakone & Mont Fuji',
    title: 'Nature et Onsens',
    days: 'Jours 6-8',
    description:
      'Une pause détente dans les montagnes. Au programme : bains thermaux traditionnels (Onsens), œufs noirs cuits dans le soufre et, si la météo le permet, la vue majestueuse sur le Mont Fuji.',
    imgPlaceholder: 'fuji.jpg',
  },
  {
    city: 'Kyoto',
    title: "L'âme du Japon",
    days: 'Jours 9-14',
    description:
      "Le cœur historique. Nous déambulerons dans les allées de bambous d'Arashiyama, visiterons le Pavillon d'Or et espérons croiser une Geisha dans le quartier de Gion.",
    imgPlaceholder: 'kyoto.jpg',
  },
  {
    city: 'Nara & Osaka',
    title: 'Cerfs sacrés et Gastronomie',
    days: 'Jours 15-18',
    description:
      "Saluer les cerfs en liberté à Nara, puis direction Osaka, la cuisine du Japon, pour goûter aux fameux Takoyakis et Okonomiyakis dans l'ambiance survoltée de Dotonbori.",
    imgPlaceholder: 'osaka.jpg',
  },
  {
    city: 'Okinawa / Ishigaki',
    title: 'Détente sous les tropiques',
    days: 'Jours 19-24',
    description:
      'Pour finir en beauté, cap au sud ! Plages de sable blanc, eaux turquoises et plongée sous-marine pour se remettre de toutes ces émotions avant le retour.',
    imgPlaceholder: 'okinawa.jpg',
  },
];

export default function HoneymoonPage() {
  const containerRef = useRef(null);

  // Hook pour récupérer la progression du scroll dans le container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // On lisse l'animation de l'avion pour qu'elle soit moins saccadée
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transforme la progression (0 à 1) en pourcentage pour la position CSS
  const airplaneY = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-[#fcfcfc] overflow-x-hidden">
      <Header />

      {/* Hero Section du Voyage */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Fond dégradé aux couleurs du thème */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003b4e] via-[#034861] to-[#137e41] opacity-90 z-0"></div>

        {/* Motif décoratif (optionnel) */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')]"></div>

        <div className="relative z-10 text-center px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-wedding text-white mb-4 drop-shadow-lg">
              Noces au Japon
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto">
              3 semaines de rêve entre tradition et modernité. Suivez notre
              itinéraire...
            </p>
          </motion.div>
        </div>
      </div>

      {/* Section Timeline avec l'Avion */}
      <div
        ref={containerRef}
        className="relative py-20 container mx-auto px-4 max-w-5xl"
      >
        {/* LA LIGNE ET L'AVION (Visible surtout sur Desktop/Tablette) */}
        <div className="absolute left-4 md:left-1/2 top-20 bottom-20 w-1 md:-translate-x-1/2 z-0">
          {/* Ligne pointillée statique */}
          <div className="h-full w-full border-l-2 border-dashed border-[#003b4e]/30"></div>

          {/* L'AVION QUI BOUGE */}
          <motion.div
            style={{ top: airplaneY }}
            className="absolute -left-[13px] top-0 z-10 text-[#137e41]"
          >
            <div className="bg-white p-1 rounded-full shadow-md rotate-180">
              {/* Icône Avion SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="transform"
              >
                <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* LES ÉTAPES */}
        <div className="space-y-24 relative z-10">
          {tripSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Bloc Texte */}
              <div
                className={`flex-1 ${
                  index % 2 === 0
                    ? 'md:text-right pl-12 md:pl-0'
                    : 'md:text-left pl-12 md:pl-0'
                }`}
              >
                <span className="inline-block py-1 px-3 rounded-full bg-[#137e41]/10 text-[#137e41] text-sm font-bold mb-2">
                  {step.days}
                </span>
                <h2 className="text-4xl md:text-5xl font-wedding text-[#003b4e] mb-4">
                  {step.city}
                </h2>
                <h3 className="text-xl font-semibold text-[#003b4e]/80 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-justify">
                  {step.description}
                </p>
              </div>

              {/* Point central sur la ligne (décoratif) */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#003b4e] rounded-full border-4 border-white shadow-sm"></div>

              {/* Bloc Image */}
              <div className="flex-1 w-full pl-12 md:pl-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl group border-2 border-white">
                  <div className="absolute inset-0 bg-[#003b4e]/10 group-hover:bg-transparent transition-all duration-500 z-10"></div>
                  {/* Remplacement Image Next.js standard */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/${
                      step.imgPlaceholder
                    }`}
                    alt={`Voyage à ${step.city}`}
                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    // Fallback si l'image n'existe pas encore
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/600x400/003b4e/FFF?text=${step.city}`;
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section Participation / Cadeau */}
      <section className="py-4 bg-[#003b4e] text-white mt-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-wedding mb-8">
              Participer à notre voyage
            </h2>
            <p className="text-lg mb-8 font-light">
              Si vous souhaitez nous aider à réaliser ce voyage inoubliable, une
              urne sera disponible le jour du mariage.
              <br />
              Votre présence est le plus beau des cadeaux, mais si vous
              souhaitez contribuer à nos souvenirs, c'est par ici que ça se
              passe !
            </p>

            {/* Exemple de bouton (optionnel) */}
            <div className="inline-block border rounded-lg p-6 backdrop-blur-sm">
              <p className="font-semibold">Merci du fond du cœur ❤️</p>
              <p className="text-sm mt-2 italic">Solenne & Dorian</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
