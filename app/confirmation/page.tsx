'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ReturnButton from '@/components/ReturnButton';
import InvitationLogin from '@/components/InvitationLogin';
import RSVPFormFirebase from '@/components/RSVPFormFirebase';
import Link from 'next/link';

export default function Page() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const [inviteData, setInviteData] = useState<any>(null);

  const handleLoginSuccess = (data: any) => {
    setInviteData(data);
  };

  // Si un code est dans l'URL, essayer de l'utiliser directement
  useEffect(() => {
    if (codeFromUrl && !inviteData) {
      // Simuler une connexion automatique avec le code URL
      setInviteData({ code: codeFromUrl });
    }
  }, [codeFromUrl, inviteData]);

  // Configuration : quels codes ont besoin de suggestions d'hébergement
  const codesAvecHebergement = [
    'LSGCUE',
    'FIPEMX', // Lamaud Cousins
    'XJZSML',
    'LOSIUX',
    'AMSOIF',
    'AMOFIX', // Famille proche et amis proches
  ];

  // Configuration : codes invités uniquement au vin d'honneur
  const codesVinHonneur = ['VJAUKO'];

  const afficherHebergement =
    inviteData && codesAvecHebergement.includes(inviteData.code);
  const isVinHonneurOnly =
    inviteData && codesVinHonneur.includes(inviteData.code);

  if (!inviteData) {
    return <InvitationLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="pt-16 md:pt-4">
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <ReturnButton label="Retour à l'accueil" href="/" />
      <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
        Confirmer sa présence
      </h2>
      <p className="text-center text-[var(--dark)] mb-4">
        Bonjour <strong>{inviteData.code}</strong> 👋
      </p>
      <p className="text-center text-[var(--dark)] max-w-2xl mx-auto mb-8">
        Merci de remplir ce formulaire avant le{' '}
        <strong>31 décembre 2025</strong>
      </p>

      {/* Badges d'invitation */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        {isVinHonneurOnly ? (
          <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
            <p className="text-center text-purple-800 flex items-center justify-center gap-2">
              <span className="material-icons">local_bar</span>
              <strong>
                Invitation l'après-midi du samedi : Cérémonie & Vin d'Honneur
              </strong>
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 p-4 rounded-lg">
            <p className="text-center text-pink-800 flex items-center justify-center gap-2">
              <span className="material-icons">celebration</span>
              <strong>Invitation sur le week-end</strong>
            </p>
          </div>
        )}
      </div>

      {/* Lien vers les hébergements si applicable */}
      {afficherHebergement && (
        <div className="max-w-3xl mx-auto mb-8 px-4">
          <Link
            href={`/hebergement?code=${inviteData.code}`}
            className="block bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="material-icons text-3xl">home</span>
              <h3 className="text-4xl font-wedding">Où dormir ?</h3>
            </div>
            <p className="text-sm opacity-90">
              Découvrez nos suggestions d'hébergement personnalisées
            </p>
          </Link>
        </div>
      )}

      {/* Formulaires RSVP */}
      {['LSGCUE', 'FIPEMX'].includes(inviteData.code) && (
        <RSVPFormFirebase
          inviteData={inviteData}
          isVinHonneurOnly={isVinHonneurOnly}
        />
      )}
      {['XJZSML', 'LOSIUX', 'AMSOIF', 'AMOFIX', 'VJAUKO'].includes(
        inviteData.code
      ) && (
        <RSVPFormFirebase
          inviteData={inviteData}
          isVinHonneurOnly={isVinHonneurOnly}
        />
      )}
    </div>
  );
}
