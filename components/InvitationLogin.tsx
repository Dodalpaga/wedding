'use client';

import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface InvitationLoginProps {
  onSuccess: (data: any) => void;
}

export default function InvitationLogin({ onSuccess }: InvitationLoginProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Important : empêche le rechargement de la page

    if (!code.trim()) return; // Sécurité supplémentaire

    setLoading(true);
    setError('');

    try {
      const codeRef = doc(db, 'codes_invitation', code.toUpperCase());
      const codeDoc = await getDoc(codeRef);

      if (!codeDoc.exists()) {
        setError("Code d'invitation invalide. Vérifiez votre code.");
        setLoading(false);
        return;
      }

      const inviteData = codeDoc.data();

      onSuccess({
        code: code.toUpperCase(),
        ...inviteData,
      });
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fond aurores boréales */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003b4e] via-[#034861] to-[#137e41]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#003b4e]/30 to-[#034861]/50"></div>

      {/* Effet de lumières */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#137e41]/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#003b4e]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#137e41]/20">
          {/* Bouton retour */}
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

          {/* Logo + titre */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-[#003b4e] to-[#137e41] p-4 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-wedding text-[#003b4e] mb-2">
              Solenne & Dorian
            </h1>
            <p className="text-gray-600">17 Juillet 2027</p>
          </div>

          {/* === FORMULAIRE avec onSubmit === */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code d'invitation
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: FAM-DUPONT-2027"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#137e41] focus:outline-none transition-colors text-center text-lg font-mono uppercase"
                required
                disabled={loading}
                autoFocus // bonus : focus automatique au chargement
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Entrez le code reçu dans votre invitation
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 mr-2"
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
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Le bouton peut maintenant avoir type="submit" */}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-[#003b4e] to-[#137e41] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Vérification...
                </span>
              ) : (
                'Accéder au formulaire'
              )}
            </button>
          </form>

          {/* Info contact */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Code introuvable ?</strong>
                  <br />
                  Contactez-nous au 06 89 71 01 93 ou 06 27 86 02 06
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
