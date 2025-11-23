'use client';

import { useState } from 'react';
import Link from 'next/link';
import InvitationLogin from '@/components/InvitationLogin';
import RSVPFormFirebase from '@/components/RSVPFormFirebase';

export default function Page() {
  const [inviteData, setInviteData] = useState<any>(null);

  const handleLoginSuccess = (data: any) => {
    setInviteData(data);
  };

  function ReturnButton() {
    return (
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="text-sm text-[#003b4e] hover:text-[#137e41] hover:underline transition-colors flex items-center gap-1"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  if (!inviteData) {
    return <InvitationLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="pt-16 md:pt-4">
      {/* Lamaud Cousins */}
      {['LSGCUE'].includes(inviteData.code) && (
        <>
          <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
            Confirmer sa présence
          </h2>
          <ReturnButton />
          <p className="text-center text-[var(--dark)] mb-4">
            Bonjour <strong>{inviteData.code}</strong> 👋
          </p>
          <p className="text-center text-[var(--dark)] mb-12 max-w-2xl mx-auto">
            Merci de remplir ce formulaire avant le{' '}
            <strong>31 décembre 2025</strong>
          </p>
          <RSVPFormFirebase inviteData={inviteData} />
        </>
      )}
      {/* Voydie Cousins */}
      {['FIPEMX'].includes(inviteData.code) && (
        <>
          <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
            Confirmer sa présence
          </h2>
          <ReturnButton />
          <p className="text-center text-[var(--dark)] mb-4">
            Bonjour <strong>{inviteData.code}</strong> 👋
          </p>
          <p className="text-center text-[var(--dark)] mb-12 max-w-2xl mx-auto">
            Merci de remplir ce formulaire avant le{' '}
            <strong>31 décembre 2025</strong>
          </p>
          <RSVPFormFirebase inviteData={inviteData} />
        </>
      )}
      {/* Les gens qui dorment sur place : Famille proche et amis proches */}
      {['XJZSML', 'LOSIUX', 'AMSOIF', 'AMOFIX'].includes(inviteData.code) && (
        <>
          <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
            Confirmer sa présence
          </h2>
          <ReturnButton />
          <p className="text-center text-[var(--dark)] mb-4">
            Bonjour <strong>{inviteData.code}</strong> 👋
          </p>
          <p className="text-center text-[var(--dark)] max-w-2xl mx-auto">
            Merci de remplir ce formulaire avant le{' '}
            <strong>31 décembre 2025</strong>
          </p>
          <RSVPFormFirebase inviteData={inviteData} />
        </>
      )}
    </div>
  );
}
