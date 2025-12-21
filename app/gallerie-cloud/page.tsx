'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReturnHomeButton from '@/components/HomeButton';

interface Category {
  id: string;
  title: string;
  cover: string;
  description: string;
  onedriveUrl: string;
  photoCount?: number;
}

const categoriesData: Category[] = [
  {
    id: 'demande',
    title: 'Demande',
    cover: '/images/templates/h1.png',
    description: 'La demande en mariage sous les aurores',
    onedriveUrl:
      'https://1drv.ms/a/c/101e280354b7261f/IgBXuHYzU1o2R6yJeccGOy2IAWN4f9TBEZM-0qfPSsZiRco?e=Q0hmFE',
    photoCount: 22,
  },
  {
    id: 'ceremonie',
    title: 'Cérémonie',
    cover: '/images/templates/v2.png',
    description: "Les vœux et l'échange des alliances.",
    onedriveUrl: 'VOTRE_LIEN_ONEDRIVE_ICI',
    photoCount: 45,
  },
  {
    id: 'vin-honneur',
    title: "Vin d'honneur",
    cover: '/images/templates/h2.png',
    description: 'Cocktails, petits fours et retrouvailles.',
    onedriveUrl: 'VOTRE_LIEN_ONEDRIVE_ICI',
    photoCount: 32,
  },
  {
    id: 'repas',
    title: 'Le Dîner',
    cover: '/images/templates/c2.png',
    description: 'Discours émouvants et gastronomie.',
    onedriveUrl: 'VOTRE_LIEN_ONEDRIVE_ICI',
    photoCount: 28,
  },
  {
    id: 'soiree',
    title: 'Soirée Dansante',
    cover: '/images/templates/v1.png',
    description: "Jusqu'au bout de la nuit !",
    onedriveUrl: 'VOTRE_LIEN_ONEDRIVE_ICI',
    photoCount: 67,
  },
  {
    id: 'brunch',
    title: 'Brunch du Dimanche',
    cover: '/images/templates/h1.png',
    description: 'Réveil en douceur et au revoir.',
    onedriveUrl: 'VOTRE_LIEN_ONEDRIVE_ICI',
    photoCount: 21,
  },
];

// Composant séparé qui utilise useSearchParams
function GalleryContent() {
  const searchParams = useSearchParams();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setHasAccess(true);
    }
  }, [searchParams]);

  const getImgSrc = (src: string) => {
    return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${src}`;
  };

  const handleCategoryClick = (category: Category) => {
    if (category.onedriveUrl && !category.onedriveUrl.includes('VOTRE_LIEN')) {
      // Ouvrir le lien OneDrive dans un nouvel onglet
      window.open(category.onedriveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!hasAccess) {
    return (
      <div className="pt-4 md:pt-4">
        <ReturnHomeButton />
        <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-2xl border border-gray-100 text-center">
          <h1 className="text-6xl md:text-8xl font-wedding text-[#003b4e] mb-6">
            Accès Refusé
          </h1>
          <p className="text-[#003b4e]/70 mb-8">
            Veuillez utiliser le formulaire sur la page d'accueil pour accéder à
            la galerie avec votre code d'invitation.
          </p>
          <Link
            href="/#confirmation"
            className="inline-block bg-[#003b4e] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#137e41] transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 md:pt-4">
      <ReturnHomeButton />

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
              onClick={() => handleCategoryClick(cat)}
              className={`group cursor-pointer relative aspect-[4/5] overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 ${
                cat.onedriveUrl.includes('VOTRE_LIEN')
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
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
                <p className="text-white/80 text-sm font-light tracking-wide uppercase mb-2">
                  {cat.photoCount ? `${cat.photoCount} Photos` : 'Album'}
                </p>
                {cat.onedriveUrl && !cat.onedriveUrl.includes('VOTRE_LIEN') ? (
                  <div className="flex items-center gap-2 text-white/90 text-xs">
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>Ouvrir dans OneDrive</span>
                  </div>
                ) : (
                  <div className="text-white/60 text-xs">
                    Lien non configuré
                  </div>
                )}
                <div className="h-0.5 w-0 group-hover:w-16 bg-[#137e41] mt-4 transition-all duration-500 ease-out" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant principal avec Suspense
export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
          <div className="text-center">
            <div className="text-6xl font-wedding text-[#003b4e] mb-4">
              Chargement...
            </div>
          </div>
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}
