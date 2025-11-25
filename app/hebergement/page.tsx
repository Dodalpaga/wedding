'use client';

import Header from '@/components/Header';
import Hebergement from '@/components/Hebergement';
import ReturnButton from '@/components/ReturnButton';

export default function Page() {
  return (
    <div className="pt-16 md:pt-4">
      <Header />
      <ReturnButton />
      <Hebergement />
    </div>
  );
}
