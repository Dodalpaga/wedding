'use client';

import { useState } from 'react';
import ReturnButton from '@/components/ReturnButton';
import InvitationLogin from '@/components/InvitationLogin';
import RSVPFormFirebase from '@/components/RSVPFormFirebase';

export default function Page() {
  const [inviteData, setInviteData] = useState<any>(null);

  const handleLoginSuccess = (data: any) => {
    setInviteData(data);
  };

  if (!inviteData) {
    return <InvitationLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="pt-16 md:pt-4">
      <ReturnButton />
      <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
        Confirmer sa présence
      </h2>
      <p className="text-center text-[var(--dark)] mb-4">
        Bonjour <strong>{inviteData.code}</strong> 👋
      </p>
      <p className="text-center text-[var(--dark)] max-w-2xl mx-auto">
        Merci de remplir ce formulaire avant le{' '}
        <strong>31 décembre 2025</strong>
      </p>
      {/* Lamaud Cousins */}
      {['LSGCUE'].includes(inviteData.code) && (
        <>
          <RSVPFormFirebase inviteData={inviteData} />
        </>
      )}
      {['FIPEMX'].includes(inviteData.code) && (
        <>
          <RSVPFormFirebase inviteData={inviteData} />
        </>
      )}
      {/* Les gens qui dorment sur place : Famille proche et amis proches */}
      {['XJZSML', 'LOSIUX', 'AMSOIF', 'AMOFIX'].includes(inviteData.code) && (
        <>
          <RSVPFormFirebase inviteData={inviteData} />
        </>
      )}
    </div>
  );
}
