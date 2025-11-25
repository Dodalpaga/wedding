'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Hebergement from '@/components/Hebergement';
import ReturnButton from '@/components/ReturnButton';

export default function Page() {
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
    <div className="pt-4 md:pt-4">
      <ReturnButton
        label="Retour à la confirmation"
        href={`/confirmation?code=${code}`}
      />
      <Hebergement code={code} />
    </div>
  );
}
