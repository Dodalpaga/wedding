'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { serverTimestamp } from 'firebase/firestore';

interface Membre {
  nom: string;
  email: string;
  statut?: 'accepte' | 'refuse' | 'en_attente';
  arrivee?: string;
  commentaires?: string;
}

interface RSVPFormFirebaseProps {
  inviteData: any;
}

export default function RSVPFormFirebase({
  inviteData,
}: RSVPFormFirebaseProps) {
  const [formData, setFormData] = useState({
    arrivee: '',
    email: '',
    commentaires: '',
    statut: 'accepte' as 'accepte' | 'refuse',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [membres, setMembres] = useState<Membre[]>([]);
  const [membreSelectionne, setMembreSelectionne] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const formulaireRef = useRef<HTMLDivElement>(null);

  // Charger les membres du cercle et leurs statuts en temps réel
  useEffect(() => {
    let unsubscribeStatuts: (() => void) | null = null;

    const loadMembres = async () => {
      try {
        const codeRef = doc(db, 'codes_invitation', inviteData.code);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists()) {
          const data = codeSnap.data();
          const membresData = data.membres || [];

          // Écouter les changements de statuts en temps réel
          const statutsRef = collection(db, 'statuts');
          unsubscribeStatuts = onSnapshot(statutsRef, (snapshot) => {
            const statutsMap = new Map();
            snapshot.docs.forEach((doc) => {
              statutsMap.set(doc.id, doc.data());
            });

            const membresAvecStatut = membresData.map((nom: string) => {
              const statutData = statutsMap.get(nom);

              if (statutData) {
                return {
                  nom,
                  statut: statutData.statut || 'en_attente',
                  arrivee: statutData.arrivee || '',
                  commentaires: statutData.commentaires || '',
                };
              }

              return {
                nom,
                statut: 'en_attente' as const,
                arrivee: '',
                commentaires: '',
              };
            });

            setMembres(membresAvecStatut);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('Erreur chargement membres:', error);
        setIsLoading(false);
      }
    };

    loadMembres();

    // Cleanup: arrêter l'écoute lors du démontage
    return () => {
      if (unsubscribeStatuts) {
        unsubscribeStatuts();
      }
    };
  }, [inviteData.code]);

  // Charger les données du membre sélectionné
  useEffect(() => {
    if (membreSelectionne) {
      const membre = membres.find((m) => m.nom === membreSelectionne);
      if (membre) {
        setFormData({
          arrivee: membre.arrivee || '',
          email: membre.email || '',
          commentaires: membre.commentaires || '',
          statut: (membre.statut === 'refuse' ? 'refuse' : 'accepte') as
            | 'accepte'
            | 'refuse',
        });
      }
    }
  }, [membreSelectionne, membres]);

  const handleSubmit = async () => {
    if (!membreSelectionne) {
      alert('Veuillez sélectionner un membre');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Sauvegarder le statut dans la collection "statuts"
      const statutRef = doc(db, 'statuts', membreSelectionne);
      await setDoc(statutRef, {
        code_invitation: inviteData.code,
        nom_membre: membreSelectionne,
        statut: formData.statut,
        arrivee: formData.arrivee,
        email: formData.email,
        commentaires: formData.commentaires,
        date_modification: serverTimestamp(),
      });

      // Marquer le code comme utilisé
      const codeRef = doc(db, 'codes_invitation', inviteData.code);
      await updateDoc(codeRef, {
        date_utilisation: serverTimestamp(),
      });

      setSubmitStatus('success');

      // Réinitialiser après 2 secondes
      setTimeout(() => {
        setMembreSelectionne('');
        setSubmitStatus('idle');
        setFormData({
          arrivee: '',
          email: '',
          commentaires: '',
          statut: 'accepte',
        });
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--accent)] via-white to-[var(--accent)] p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-2xl border-2 border-green-400">
          <div className="text-center">
            <div className="inline-block bg-green-100 p-6 rounded-full mb-6">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-5xl font-wedding text-[var(--primary)] mb-4">
              Merci pour ta confirmation !
            </h2>
            <p className="text-lg text-[var(--dark)] mb-6">
              La présence de <strong>{membreSelectionne}</strong> a bien été
              enregistrée.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded text-left">
              <p className="text-[var(--dark)]">
                <strong>Récapitulatif :</strong>
                <br />• Membre : {membreSelectionne}
                {formData.statut === 'accepte' && (
                  <>
                    <br />• Arrivée : {formData.arrivee}
                  </>
                )}
                <br />• Statut :{' '}
                {formData.statut === 'accepte'
                  ? '✅ Confirmé'
                  : '❌ Ne vient pas'}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Nous avons hâte de vous voir le 17 juillet 2027 ! 💕
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--accent)] via-white to-[var(--accent)]">
      <div className="container mx-auto px-4">
        {/* Liste des membres du cercle */}
        {isLoading ? (
          <div className="text-center mb-8">
            <p className="text-[var(--dark)]">Chargement...</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20">
              <h3 className="text-6xl font-wedding text-[var(--primary)] mb-4 text-center">
                Membres du cercle
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {membres.map((membre) => (
                  <div
                    key={membre.nom}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      membre.statut === 'accepte'
                        ? 'bg-green-50 border-green-300'
                        : membre.statut === 'refuse'
                        ? 'bg-red-50 border-red-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-[var(--dark)]">
                          {membre.nom}
                        </p>
                        <p className="text-sm text-gray-600">
                          {membre.statut === 'accepte' && '✅ Confirmé'}
                          {membre.statut === 'refuse' && '❌ Ne vient pas'}
                          {membre.statut === 'en_attente' && '⏳ En attente'}
                        </p>
                        {membre.statut === 'accepte' && membre.arrivee && (
                          <p className="text-xs text-gray-500 mt-1">
                            Arrivée: {membre.arrivee}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setMembreSelectionne(membre.nom);
                          setTimeout(() => {
                            formulaireRef.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                          }, 100);
                        }}
                        className="text-[var(--primary)] hover:text-[var(--secondary)] text-sm underline"
                      >
                        {membre.statut === 'en_attente'
                          ? 'Répondre'
                          : 'Modifier'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!membreSelectionne && (
          <div className="max-w-3xl mx-auto bg-blue-50 border-2 border-blue-300 p-6 rounded-lg text-center mb-8">
            <p className="text-[var(--dark)]">
              👆 Sélectionnez un membre ci-dessus pour confirmer sa présence
            </p>
          </div>
        )}

        {membreSelectionne && (
          <div
            ref={formulaireRef}
            className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-6xl font-wedding text-[var(--primary)]">
                Confirmation pour {membreSelectionne}
              </h3>
              <button
                onClick={() => setMembreSelectionne('')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Statut de présence */}
            <div className="mb-8">
              <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                Réponse
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setFormData({ ...formData, statut: 'accepte' })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.statut === 'accepte'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-semibold">J'accepte avec plaisir</p>
                  </div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, statut: 'refuse' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.statut === 'refuse'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <p className="font-semibold">Je ne peux pas venir</p>
                  </div>
                </button>
              </div>
            </div>

            {formData.statut === 'accepte' && (
              <>
                <div className="mb-8">
                  <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                    Informations
                  </h3>

                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--dark)] mb-2"
                  >
                    Quelle est ton adresse mail (pour te donner toutes les news
                    sur notre évènement) ?
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jean.dupont@gmail.com"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg 
               focus:border-[var(--secondary)] focus:outline-none 
               transition-colors"
                    autoComplete="email"
                  />
                </div>
                {/* Moment d'arrivée */}
                <div className="mb-8">
                  <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                    Arrivée
                  </h3>
                  <label className="block text-sm font-medium text-[var(--dark)] mb-2">
                    Quand prévois-tu d'arriver ? *
                  </label>
                  <select
                    required
                    value={formData.arrivee}
                    onChange={(e) =>
                      setFormData({ ...formData, arrivee: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                  >
                    <option value="">Sélectionnez un moment</option>
                    <option value="Vendredi soir">Vendredi soir</option>
                    <option value="Samedi midi">Samedi pour le midi</option>
                    <option value="Samedi après-midi">Samedi après-midi</option>
                  </select>
                </div>
                {/* Commentaires */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[var(--dark)] mb-2">
                    Commentaires ou besoins particuliers (optionnel)
                  </label>
                  <textarea
                    value={formData.commentaires}
                    onChange={(e) =>
                      setFormData({ ...formData, commentaires: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                    placeholder={
                      "Allergies alimentaires, régime spécial, besoin d'un siège bébé..."
                    }
                  />
                </div>
              </>
            )}

            {/* Bouton de soumission */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (formData.statut === 'accepte' && !formData.arrivee)
                }
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Confirmer ma réponse'}
              </button>
            </div>

            {submitStatus === 'error' && (
              <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg text-center">
                ❌ Une erreur s'est produite. Veuillez réessayer.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
