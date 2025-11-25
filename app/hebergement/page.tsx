'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Hebergement from '@/components/Hebergement';
import ReturnButton from '@/components/ReturnButton';

function HebergementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  // Rediriger si pas de code
  useEffect(() => {
    if (!code) {
      router.push('/');
    }
  }, [code, router]);

  // Ne rien afficher pendant la redirection
  if (!code) {
    return null;
  }

  return (
    <div>
      <ReturnButton
        label="Retour à la confirmation"
        href={`/confirmation?code=${code}`}
      />
      <Hebergement code={code} />
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
