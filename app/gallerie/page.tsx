'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Download from 'yet-another-react-lightbox/plugins/download';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// IMPORTS FIREBASE NÉCESSAIRES POUR LA VÉRIFICATION DU CODE
import { doc, getDoc } from 'firebase/firestore';
// Assurez-vous que le chemin est correct pour votre configuration
import { db } from '@/lib/firebase';

// --- Interface et Données restent inchangées ---
interface Category {
  id: string;
  title: string;
  cover: string;
  description: string;
  photos: string[];
}

const categoriesData: Category[] = [
  // ... vos données categoriesData ...
  {
    id: 'ceremonie',
    title: 'Cérémonie',
    cover: '/images/templates/v2.png',
    description: "Les vœux et l'échange des alliances.",
    photos: [
      '/images/templates/v2.png',
      '/images/templates/h1.png',
      '/images/templates/c1.png',
      '/images/templates/v1.png',
    ],
  },
  {
    id: 'vin-honneur',
    title: "Vin d'honneur",
    cover: '/images/templates/h2.png',
    description: 'Cocktails, petits fours et retrouvailles.',
    photos: [
      '/images/templates/h2.png',
      '/images/templates/c2.png',
      '/images/templates/h1.png',
    ],
  },
  {
    id: 'repas',
    title: 'Le Dîner',
    cover: '/images/templates/c2.png',
    description: 'Discours émouvants et gastronomie.',
    photos: [
      '/images/templates/c2.png',
      '/images/templates/v1.png',
      '/images/templates/c1.png',
    ],
  },
  {
    id: 'soiree',
    title: 'Soirée Dansante',
    cover: '/images/templates/v1.png',
    description: "Jusqu'au bout de la nuit !",
    photos: [
      '/images/templates/v1.png',
      '/images/templates/h2.png',
      '/images/templates/v2.png',
      '/images/templates/c2.png',
    ],
  },
  {
    id: 'brunch',
    title: 'Brunch du Dimanche',
    cover: '/images/templates/h1.png',
    description: 'Réveil en douceur et au revoir.',
    photos: ['/images/templates/h1.png', '/images/templates/c1.png'],
  },
];

// ----------------------------------------------------------------------
// 🚨 NOUVEAU COMPOSANT : Contrôle d'Accès par Code
// ----------------------------------------------------------------------

export default function GalleryPage() {
  const [code, setCode] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkCode = async () => {
    if (code.trim() === '') {
      setError('Veuillez entrer un code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Référence au document dans la collection 'codes_invitation'
      const codeRef = doc(db, 'codes_invitation', code.trim());

      // 2. Récupération du document
      const codeSnap = await getDoc(codeRef);

      // 3. Vérification de l'existence du code
      if (codeSnap.exists()) {
        setHasAccess(true); // Accès accordé
      } else {
        setError("Code invalide. Veuillez vérifier votre code d'invitation.");
      }
    } catch (err) {
      console.error('Erreur de vérification Firebase:', err);
      setError('Erreur lors de la vérification du code. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage de la galerie si l'accès est accordé
  if (hasAccess) {
    // RENDER LE CONTENU DE LA GALERIE
    return <GalleryContent />;
  }

  // Formulaire de saisie du code si l'accès est refusé
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fcfcfc] px-4">
      <Header />
      <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
        <h1 className="text-6xl md:text-8xl font-wedding text-[#003b4e] mb-6 text-center">
          Galerie Photos
        </h1>
        <p className="text-[#003b4e]/70 text-center mb-8">
          Veuillez entrer votre **code d'invitation** pour accéder aux albums
          photos.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Entrez votre code (ex: FAMILLE-DUPONT)"
          disabled={isLoading}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center 
                     focus:border-[#137e41] focus:outline-none transition-colors mb-4 
                     uppercase tracking-widest font-mono text-lg"
        />

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <button
          onClick={checkCode}
          disabled={isLoading}
          className="w-full bg-[#003b4e] text-white px-6 py-3 rounded-lg text-lg font-semibold 
                     hover:bg-[#137e41] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Vérification...' : 'Accéder à la galerie'}
        </button>
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[#003b4e]/70 hover:text-[#137e41] transition-colors"
          >
            Retour à la page d'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🖼️ COMPOSANT INTERNE : Contenu de la Galerie
// ----------------------------------------------------------------------

function GalleryContent() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const getImgSrc = (src: string) => {
    return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${src}`;
  };

  function ReturnHomeButton() {
    return (
      <div className="absolute top-4 left-4 z-30">
        <Link
          href="/"
          className="text-sm font-medium text-[#003b4e] hover:text-[#137e41] transition-colors flex items-center gap-1 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Accueil
        </Link>
      </div>
    );
  }

  // Contenu existant de GalleryPage renommé en GalleryContent
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      <ReturnHomeButton />

      {/* --- VUE 1 : LISTE DES ALBUMS --- */}
      {!selectedCategory && (
        <div className="pt-24 pb-20 container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-wedding text-[#003b4e] mb-6">
              Nos Albums
            </h1>
            <p className="text-[#003b4e]/70 max-w-2xl mx-auto font-light text-lg">
              Choisissez un moment du week-end pour découvrir les photos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categoriesData.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="group cursor-pointer relative aspect-[4/5] overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <Image
                  src={getImgSrc(cat.cover)}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#003b4e]/90 via-[#003b4e]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-wedding text-white mb-2 drop-shadow-md">
                    {cat.title}
                  </h3>
                  <p className="text-white/80 text-sm font-light tracking-wide uppercase">
                    {cat.photos.length} Photos
                  </p>
                  <div className="h-0.5 w-0 group-hover:w-16 bg-[#137e41] mt-4 transition-all duration-500 ease-out" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- VUE 2 : DÉTAIL (MASONRY AUTO) --- */}
      {selectedCategory && (
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 mb-12 flex flex-col items-center relative">
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-8 group flex items-center gap-2 text-[#003b4e] hover:text-[#137e41] transition-colors px-4 py-2 rounded-full border border-[#003b4e]/10 hover:border-[#137e41]/30 bg-white"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Retour aux albums</span>
            </button>

            <h2 className="text-5xl md:text-7xl font-wedding text-[#003b4e] text-center">
              {selectedCategory.title}
            </h2>
          </div>

          <div className="container mx-auto px-4">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {selectedCategory.photos.map((photoSrc, i) => (
                <div
                  key={i}
                  className="break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300"
                  onClick={() => setLightboxIndex(i)}
                >
                  <div className="absolute inset-0 bg-[#003b4e]/0 group-hover:bg-[#003b4e]/20 transition-colors duration-300 z-10 pointer-events-none" />

                  <Image
                    src={getImgSrc(photoSrc)}
                    alt="Souvenir de mariage"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX --- */}
      {selectedCategory && (
        <Lightbox
          index={lightboxIndex}
          slides={selectedCategory.photos.map((src) => ({
            src: getImgSrc(src),
            downloadUrl: getImgSrc(src),
          }))}
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          plugins={[Zoom, Download, Thumbnails]}
          styles={{
            container: { backgroundColor: 'rgba(0, 59, 78, 0.98)' },
            icon: { color: '#fff' },
          }}
          labels={{
            Next: 'Suivant',
            Previous: 'Précédent',
            Close: 'Fermer',
            Download: 'Télécharger',
            'Zoom in': 'Zoomer',
            'Zoom out': 'Dézoomer',
          }}
        />
      )}
    </div>
  );
}
