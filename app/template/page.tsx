'use client';

import ReturnButton from '@/components/ReturnButton';
import Header from '@/components/Header';

export default function Template() {
  return (
    <div className="pt-4 md:pt-4">
      <ReturnButton label="Retour à l'accueil" href="/" />
      <Header />
    </div>
  );
}
