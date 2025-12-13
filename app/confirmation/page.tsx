'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReturnHomeButton from '@/components/HomeButton';
import RSVPFormFirebase from '@/components/RSVPFormFirebase';
import Link from 'next/link';
import Signature from '@/components/Signature';
import {
  getCodesAvecHebergement,
  getCodesVinHonneur,
  getCodesRSVP,
} from '@/config/codes';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromUrl = searchParams.get('code');

  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInviteData = async () => {
      if (!codeFromUrl) {
        setError(
          "Aucun code fourni. Veuillez retourner à l'accueil et entrer votre code."
        );
        setLoading(false);
        return;
      }

      try {
        const codeRef = doc(db, 'codes_invitation', codeFromUrl.toUpperCase());
        const codeDoc = await getDoc(codeRef);

        if (!codeDoc.exists()) {
          setError("Code d'invitation invalide. Veuillez vérifier votre code.");
          setLoading(false);
          return;
        }

        const data = codeDoc.data();
        setInviteData({
          code: codeFromUrl.toUpperCase(),
          ...data,
        });
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError(
          'Une erreur est survenue lors de la récupération de vos informations.'
        );
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [codeFromUrl]);

  // Récupération des codes depuis les variables d'environnement
  const codesAvecHebergement = getCodesAvecHebergement();
  const codesVinHonneur = getCodesVinHonneur();
  const codesRSVP = getCodesRSVP();

  const afficherHebergement =
    inviteData && codesAvecHebergement.includes(inviteData.code);
  const isVinHonneurOnly =
    inviteData && codesVinHonneur.includes(inviteData.code);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4"></div>
          <p className="text-[var(--dark)]">Vérification de votre code...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-300 rounded-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-red-800 mb-3">Oups !</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </button>
          <div className="mt-6 pt-6 border-t border-red-200">
            <p className="text-sm text-red-700">
              <strong>Besoin d'aide ?</strong>
              <br />
              Contactez-nous au 06 89 71 01 93 ou 06 27 86 02 06
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage du formulaire si tout est OK
  return (
    <div>
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)] mb-4">
        Confirmer ma présence
      </h2>
      {/* <p className="text-center text-[var(--dark)] mb-4">
        Bonjour <strong>{inviteData.code}</strong> 👋
      </p> */}
      <p className="max-w-6xl mx-auto px-6 text-[var(--dark)] whitespace-pre-line text-justify">
        {inviteData.message}
      </p>
      {/* <div
        className="max-w-6xl mx-auto px-4 text-center text-[var(--dark)] mb-4"
        dangerouslySetInnerHTML={{
          __html: inviteData.message.replace(/\n/g, '<br/>'),
        }}
      /> */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-4 flex justify-end">
        <div className="w-full max-w-[200px]">
          <Signature theme="dark" />
        </div>
      </div>

      {/* Badges d'invitation */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        {isVinHonneurOnly ? (
          <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
            <p className="text-center text-purple-800 flex items-center justify-center gap-2">
              <span className="material-icons">local_bar</span>
              <strong>Invitation : Cérémonie & Vin d'Honneur</strong>
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 p-4 rounded-lg">
            <p className="text-center text-pink-800 flex items-center justify-center gap-2">
              <span className="material-icons">celebration</span>
              <strong>Invitation sur l'ensemble du week-end</strong>
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

      {/* Formulaire RSVP */}
      {codesRSVP.includes(inviteData.code) && (
        <RSVPFormFirebase
          inviteData={inviteData}
          isVinHonneurOnly={isVinHonneurOnly}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className="pt-4 md:pt-4">
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <ReturnHomeButton />
      <Suspense
        fallback={
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4"></div>
            <p className="text-[var(--dark)]">Chargement...</p>
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
