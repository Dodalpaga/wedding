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

// Define the Category type
interface Category {
  id: string;
  title: string;
  cover: string;
  description: string;
  photos: string[];
}

const categoriesData: Category[] = [
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

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const getImgSrc = (src: string): string => {
    return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${src}`;
  };

  function ReturnHomeButton() {
    return (
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 text-white bg-[#003b4e] hover:bg-[#137e41] rounded-full transition-colors shadow-lg hover:shadow-xl"
      >
        ← Accueil
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef9f3] to-white">
      <Header />

      {/* --- VUE 1 : LISTE DES ALBUMS --- */}
      {!selectedCategory && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif text-[#003b4e] mb-4">
              Nos Albums
            </h1>
            <p className="text-lg text-gray-600">
              Choisissez un moment du week-end pour découvrir les photos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
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
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-serif mb-1">{cat.title}</h3>
                  <p className="text-sm opacity-90">
                    {cat.photos.length} Photos
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <ReturnHomeButton />
          </div>
        </div>
      )}

      {/* --- VUE 2 : DÉTAIL (MASONRY AUTO) --- */}
      {selectedCategory && (
        <div className="container mx-auto px-4 py-16">
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-8 group flex items-center gap-2 text-[#003b4e] hover:text-[#137e41] transition-colors px-4 py-2 rounded-full border border-[#003b4e]/10 hover:border-[#137e41]/30 bg-white"
          >
            ← Retour aux albums
          </button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif text-[#003b4e] mb-4">
              {selectedCategory.title}
            </h1>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {selectedCategory.photos.map((photoSrc: string, i: number) => (
              <div
                key={i}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={getImgSrc(photoSrc)}
                  alt={`${selectedCategory.title} - Photo ${i + 1}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-auto rounded-lg shadow-md group-hover:shadow-2xl transition-shadow duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- LIGHTBOX --- */}
      {selectedCategory && (
        <Lightbox
          slides={selectedCategory.photos.map((src: string) => ({
            src: getImgSrc(src),
            downloadUrl: getImgSrc(src),
          }))}
          index={lightboxIndex}
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
