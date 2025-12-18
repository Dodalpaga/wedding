'use client';
import { Suspense } from 'react';
import HebergementPersonnalise from '@/components/Hebergement';
import ReturnBackButton from '@/components/BackButton';

function HebergementContent() {
  return (
    <div>
      <ReturnBackButton />
      <HebergementPersonnalise />
    </div>
  );
}

export default function Page() {
  return (
    <div className="pt-4 md:pt-4">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 text-center py-20">
            <p className="text-[var(--dark)]">Chargement...</p>
          </div>
        }
      >
        <HebergementContent />
      </Suspense>
    </div>
  );
}
