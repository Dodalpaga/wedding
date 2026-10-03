'use client';

import ScrollHero from '@/components/noces/ScrollHero';
import './noces.css';

export type TripStep = { city: string; title: string; description: string; highlights: string[]; image?: string };

// Pistes provisoires : modifier ici les villes, descriptions et envies.
// Pour remplacer un visuel, ajouter image: '/images/nom-du-fichier.jpg'.
const tripSteps: TripStep[] = [
  {
    city: 'Tokyo', title: 'Les premiers pas dans un autre monde',
    description: 'Nous imaginons commencer notre aventure au rythme de Tokyo : nous perdre dans ses quartiers, passer des rues animées aux petits temples et découvrir nos premières adresses gourmandes. Quelques jours pour prendre nos marques et savourer le début du voyage à deux.',
    highlights: ['Balades en ville', 'Petites adresses', 'Premières découvertes'],
    image: '/images/noces/tokyo.webp',
  },
  {
    city: 'Hakone & Mont Fuji', title: 'Une parenthèse au grand air',
    description: 'Après la ville, nous aimerions ralentir un peu. Une nuit dans un hébergement traditionnel, un bain chaud et des paysages de montagne : une étape pour profiter du calme et, avec un peu de chance, apercevoir le mont Fuji.',
    highlights: ['Nature', 'Onsen', 'Nuit en ryokan'],
    image: '/images/noces/hakone.webp',
  },
  {
    city: 'Kyoto', title: 'Prendre le temps de flâner',
    description: 'Kyoto fait partie de nos envies : des jardins, des temples et des ruelles à découvrir sans trop se presser. Nous nous voyons déjà alterner les visites et les pauses, avec du temps pour les détours et les découvertes imprévues.',
    highlights: ['Jardins & temples', 'Ruelles', 'Promenades à deux'],
    image: '/images/noces/kyoto.webp',
  },
  {
    city: 'Nara & Osaka', title: 'Des rencontres et des saveurs',
    description: 'Nous envisageons une escapade à Nara, puis une halte à Osaka pour découvrir une autre ambiance. L’idée : se promener, goûter plein de choses et laisser une place aux bonnes surprises plutôt que de remplir chaque minute du programme.',
    highlights: ['Escapades', 'Cuisine locale', 'Soirées en ville'],
    image: '/images/noces/osaka.webp',
  },
  {
    city: 'Okinawa / Ishigaki', title: 'Finir les pieds dans l’eau',
    description: 'Pour les derniers jours, nous rêvons d’une pause près de la mer. Quelques baignades, de longues conversations et le plaisir de ne rien prévoir : une façon de prolonger cette bulle à deux avant de rentrer avec nos souvenirs.',
    highlights: ['Mer', 'Repos', 'Derniers souvenirs'],
    image: '/images/noces/ishigaki.webp',
  },
];

export default function HoneymoonPage() {
  return <div className="honeymoon-page noces-v2">
    <a href="#itineraire" className="noces-skip">Aller aux escales</a>
    <main id="noces-main">
      <ScrollHero steps={tripSteps} />
    </main>
  </div>;
}
