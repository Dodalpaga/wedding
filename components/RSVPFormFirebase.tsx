'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { serverTimestamp } from 'firebase/firestore';
// 1. MODIFIER L'INTERFACE Membre
interface Membre {
  nom: string;
  email: string;
  statut?: 'accepte' | 'refuse' | 'en_attente';
  commentaires?: string;
  vendredi_soir?: boolean;
  samedi_midi?: boolean;
  samedi_soir?: boolean;
  dimanche_brunch?: boolean;
}

interface RSVPFormFirebaseProps {
  inviteData: any;
  isVinHonneurOnly?: boolean;
}

export default function RSVPFormFirebase({
  inviteData,
  isVinHonneurOnly = false,
}: RSVPFormFirebaseProps) {
  const [formData, setFormData] = useState({
    email: '',
    commentaires: '',
    statut: 'accepte' as 'accepte' | 'refuse',
    vendredi_soir: false,
    samedi_midi: false,
    samedi_soir: false,
    dimanche_brunch: false,
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

          const statutsRef = collection(db, 'statuts');
          unsubscribeStatuts = onSnapshot(statutsRef, (snapshot) => {
            const statutsMap = new Map();
            snapshot.docs.forEach((doc) => {
              statutsMap.set(doc.id, doc.data());
            });

            const membresAvecStatut: Membre[] = membresData.map(
              (nom: string) => {
                const statutData = statutsMap.get(nom);

                if (statutData) {
                  return {
                    nom,
                    email: statutData.email || '',
                    statut: statutData.statut || 'en_attente',
                    commentaires: statutData.commentaires || '',
                    vendredi_soir: statutData.vendredi_soir || false,
                    samedi_midi: statutData.samedi_midi || false,
                    samedi_soir: statutData.samedi_soir || false,
                    dimanche_brunch: statutData.dimanche_brunch || false,
                  };
                }

                return {
                  nom,
                  email: '',
                  statut: 'en_attente' as const,
                  commentaires: '',
                  vendredi_soir: false,
                  samedi_midi: false,
                  samedi_soir: false,
                  dimanche_brunch: false,
                };
              }
            );

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

    return () => {
      if (unsubscribeStatuts) {
        unsubscribeStatuts();
      }
    };
  }, [inviteData.code]);

  // Charger les données du membre sélectionné
  // Charger les données du membre sélectionné → CORRIGÉ
  useEffect(() => {
    if (membreSelectionne) {
      const membre = membres.find((m) => m.nom === membreSelectionne);
      if (membre) {
        setFormData({
          email: membre.email || '',
          commentaires: membre.commentaires || '',
          statut: membre.statut === 'refuse' ? 'refuse' : 'accepte',
          vendredi_soir: Boolean(membre.vendredi_soir),
          samedi_midi: Boolean(membre.samedi_midi),
          samedi_soir: Boolean(membre.samedi_soir),
          dimanche_brunch: Boolean(membre.dimanche_brunch),
        });
      } else {
        // Si le membre n'a jamais répondu → tout à false sauf samedi_soir (souvent obligatoire)
        setFormData((prev) => ({
          ...prev,
          vendredi_soir: false,
          samedi_midi: false,
          samedi_soir: false,
          dimanche_brunch: false,
        }));
      }
    }
  }, [membreSelectionne, membres]); // ← "membres" est crucial ici !

  const handleSubmit = async () => {
    if (!membreSelectionne) {
      alert('Veuillez sélectionner un membre');
      return;
    }

    // Validation : si accepte et que c'est pas vin d'honneur uniquement,
    // il faut au moins un événement coché
    if (formData.statut === 'accepte' && !isVinHonneurOnly) {
      if (
        !formData.vendredi_soir &&
        !formData.samedi_midi &&
        !formData.samedi_soir &&
        !formData.dimanche_brunch
      ) {
        alert(
          'Veuillez sélectionner au moins un événement auquel vous participerez.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const statutRef = doc(db, 'statuts', membreSelectionne);
      await setDoc(statutRef, {
        code_invitation: inviteData.code,
        nom_membre: membreSelectionne,
        statut: formData.statut,
        email: formData.email,
        commentaires: formData.commentaires,
        vendredi_soir: formData.vendredi_soir,
        samedi_midi: formData.samedi_midi,
        samedi_soir: formData.samedi_soir,
        dimanche_brunch: formData.dimanche_brunch,
        date_modification: serverTimestamp(),
      });

      const codeRef = doc(db, 'codes_invitation', inviteData.code);
      await updateDoc(codeRef, {
        date_utilisation: serverTimestamp(),
      });

      setSubmitStatus('success');

      setTimeout(() => {
        setMembreSelectionne('');
        setSubmitStatus('idle');
        setFormData({
          email: '',
          commentaires: '',
          statut: 'accepte',
          vendredi_soir: false,
          samedi_midi: false,
          samedi_soir: false,
          dimanche_brunch: false,
        });
      }, 6000);
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
              <span className="material-icons text-green-500 text-6xl">
                check_circle
              </span>
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
                    <br />• Statut : ✅ Confirmé
                    {!isVinHonneurOnly && (
                      <>
                        <br />• Vendredi soir :{' '}
                        {formData.vendredi_soir ? '✅ Oui' : '❌ Non'}
                        <br />• Samedi midi :{' '}
                        {formData.samedi_midi ? '✅ Oui' : '❌ Non'}
                        <br />• Samedi après-midi / soir (mariage) :{' '}
                        {formData.samedi_soir ? '✅ Oui' : '❌ Non'}
                        <br />• Dimanche brunch :{' '}
                        {formData.dimanche_brunch ? '✅ Oui' : '❌ Non'}
                      </>
                    )}
                  </>
                )}
                {formData.statut === 'refuse' && (
                  <>
                    <br />• Statut : ❌ Ne vient pas
                  </>
                )}
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
    <section className="py-5 bg-gradient-to-b from-[var(--accent)] via-white to-[var(--accent)]">
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <div className="container mx-auto px-4">
        {/* Liste des membres du cercle */}
        {isLoading ? (
          <div className="text-center mb-8">
            <p className="text-[var(--dark)]">Chargement...</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20">
              <div className="grid md:grid-cols-2 gap-4">
                {membres.map((membre) => (
                  <button
                    key={membre.nom}
                    onClick={() => {
                      setMembreSelectionne(membre.nom);
                      setTimeout(() => {
                        formulaireRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 100);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md cursor-pointer ${
                      membre.statut === 'accepte'
                        ? 'bg-green-50 border-green-300 hover:border-green-400'
                        : membre.statut === 'refuse'
                        ? 'bg-red-50 border-red-300 hover:border-red-400'
                        : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--dark)] mb-1">
                          {membre.nom}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          {membre.statut === 'accepte' && (
                            <>
                              <span
                                className="material-icons text-green-600"
                                style={{ fontSize: '16px' }}
                              >
                                check_circle
                              </span>
                              Confirmé
                            </>
                          )}
                          {membre.statut === 'refuse' && (
                            <>
                              <span
                                className="material-icons text-red-600"
                                style={{ fontSize: '16px' }}
                              >
                                cancel
                              </span>
                              Ne vient pas
                            </>
                          )}
                          {membre.statut === 'en_attente' && (
                            <>
                              <span
                                className="material-icons text-gray-600"
                                style={{ fontSize: '16px' }}
                              >
                                schedule
                              </span>
                              En attente
                            </>
                          )}
                        </p>
                        {membre.statut === 'accepte' && !isVinHonneurOnly && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 flex-wrap">
                            {membre.vendredi_soir && <span>🌙 Ven</span>}
                            {membre.samedi_midi && <span>🍽️ Sam midi</span>}
                            {membre.samedi_soir && <span>💒 Mariage</span>}
                            {membre.dimanche_brunch && <span>🥞 Brunch</span>}
                          </p>
                        )}
                      </div>
                      <span className="material-icons text-[var(--secondary)] flex-shrink-0 ml-2">
                        chevron_right
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!membreSelectionne && (
          <div className="max-w-3xl mx-auto bg-blue-50 border-2 border-blue-300 p-6 rounded-lg text-center mb-8">
            <p className="text-[var(--dark)] flex items-center justify-center gap-2">
              <span className="material-icons">touch_app</span>
              Cliquez sur un membre ci-dessus pour confirmer sa présence
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
                <span className="material-icons">close</span>
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
                    <span className="material-icons text-4xl mb-2 text-green-600">
                      check_circle
                    </span>
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
                    <span className="material-icons text-4xl mb-2 text-red-600">
                      cancel
                    </span>
                    <p className="font-semibold">Je ne peux pas venir</p>
                  </div>
                </button>
              </div>
            </div>

            <>
              <div className="mb-8">
                <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                  Informations
                </h3>

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--dark)] mb-2 flex items-center gap-2"
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>
                    email
                  </span>
                  Quelle est ton adresse mail pour te donner toutes les news sur
                  notre évènement ? (Optionnel)
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

              {/* Champs cachés pour vin d'honneur uniquement */}
              {!isVinHonneurOnly && formData.statut === 'accepte' && (
                <div className="mb-8">
                  <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                    Événements
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sélectionnez les événements auxquels vous participerez *
                  </p>

                  <div className="space-y-4">
                    {/* Vendredi soir */}
                    <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[var(--primary)] hover:bg-blue-50">
                      <input
                        type="checkbox"
                        checked={formData.vendredi_soir}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendredi_soir: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-icons text-[var(--primary)]">
                            nightlight
                          </span>
                          <span className="font-semibold text-[var(--dark)]">
                            Vendredi soir
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Petit repas tranquille avant le jour J
                        </p>
                      </div>
                    </label>

                    {/* Samedi midi */}
                    <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[var(--primary)] hover:bg-blue-50">
                      <input
                        type="checkbox"
                        checked={formData.samedi_midi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            samedi_midi: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-icons text-[var(--primary)]">
                            lunch_dining
                          </span>
                          <span className="font-semibold text-[var(--dark)]">
                            Samedi midi
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Repas simple, picorages et buffet de grignotage
                        </p>
                      </div>
                    </label>

                    {/* Samedi soir - Mariage */}
                    <label className="flex items-start gap-4 p-4 border-2 border-pink-300 rounded-lg cursor-pointer transition-all hover:border-pink-500 hover:bg-pink-50 bg-pink-50/30">
                      <input
                        type="checkbox"
                        checked={formData.samedi_soir}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            samedi_soir: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-pink-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-icons text-pink-600">
                            favorite
                          </span>
                          <span className="font-semibold text-[var(--dark)]">
                            Samedi soir - Repas de mariage
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Le grand événement ! 🎉
                        </p>
                      </div>
                    </label>

                    {/* Dimanche brunch */}
                    <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[var(--primary)] hover:bg-blue-50">
                      <input
                        type="checkbox"
                        checked={formData.dimanche_brunch}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimanche_brunch: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-icons text-[var(--primary)]">
                            brunch_dining
                          </span>
                          <span className="font-semibold text-[var(--dark)]">
                            Dimanche midi - Brunch
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Brunch du lendemain pour prolonger le plaisir
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Commentaires */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[var(--dark)] mb-2 flex items-center gap-2">
                  <span className="material-icons" style={{ fontSize: '18px' }}>
                    comment
                  </span>
                  Commentaires ou besoins particuliers (Optionnel)
                </label>
                <textarea
                  value={formData.commentaires}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commentaires: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                  placeholder={
                    "Allergies alimentaires, régime spécial, besoin d'un siège bébé..."
                  }
                />
              </div>
            </>

            {/* Bouton de soumission */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (formData.statut === 'accepte' &&
                    !(
                      formData.vendredi_soir ||
                      formData.samedi_midi ||
                      formData.samedi_soir ||
                      formData.dimanche_brunch
                    ))
                }
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <span className="material-icons">send</span>
                {isSubmitting ? 'Envoi en cours...' : 'Confirmer ma réponse'}
              </button>
            </div>

            {submitStatus === 'error' && (
              <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg text-center flex items-center justify-center gap-2">
                <span className="material-icons">error</span>
                Une erreur s'est produite. Veuillez réessayer.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
