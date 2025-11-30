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

interface Membre {
  nom: string;
  email: string;
  statut?: 'accepte' | 'refuse' | 'en_attente';
  arrivee?: string;
  commentaires?: string;
  brunch?: 'oui' | 'non';
  chanson?: string;
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
    arrivee: '',
    email: '',
    commentaires: '',
    statut: 'accepte' as 'accepte' | 'refuse',
    brunch: '' as 'oui' | 'non' | '',
    chanson: '',
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
                    arrivee: statutData.arrivee || '',
                    commentaires: statutData.commentaires || '',
                    brunch: statutData.brunch || '',
                    chanson: statutData.chanson || '',
                  };
                }

                return {
                  nom,
                  email: '',
                  statut: 'en_attente' as const,
                  arrivee: '',
                  commentaires: '',
                  brunch: '',
                  chanson: '',
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
  useEffect(() => {
    if (membreSelectionne) {
      const membre = membres.find((m) => m.nom === membreSelectionne);
      if (membre) {
        setFormData({
          arrivee: membre.arrivee || '',
          email: membre.email || '',
          commentaires: membre.commentaires || '',
          brunch: (membre.brunch || '') as 'oui' | 'non' | '',
          chanson: membre.chanson || '',
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

    // Validation selon le type d'invitation
    if (formData.statut === 'accepte' && !isVinHonneurOnly) {
      if (!formData.arrivee) {
        alert("Veuillez indiquer le moment d'arrivée.");
        return;
      }
      if (!formData.brunch) {
        alert(
          'Veuillez confirmer si vous participez ou non au Brunch du Dimanche.'
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
        arrivee: formData.arrivee,
        email: formData.email,
        commentaires: formData.commentaires,
        brunch: formData.brunch,
        chanson: formData.chanson,
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
          arrivee: '',
          email: '',
          commentaires: '',
          statut: 'accepte',
          brunch: '',
          chanson: '',
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
                    {!isVinHonneurOnly && formData.arrivee && (
                      <>
                        <br />• Arrivée : {formData.arrivee}
                      </>
                    )}
                    {!isVinHonneurOnly && formData.brunch && (
                      <>
                        <br />• Brunch du Dimanche :{' '}
                        {formData.brunch === 'oui' ? '✅ Oui' : '❌ Non'}
                      </>
                    )}
                    {!isVinHonneurOnly && formData.chanson && (
                      <>
                        <br />• Chanson : {formData.chanson}
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
                        {membre.statut === 'accepte' &&
                          membre.arrivee &&
                          !isVinHonneurOnly && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <span
                                className="material-icons"
                                style={{ fontSize: '12px' }}
                              >
                                schedule
                              </span>
                              Arrivée: {membre.arrivee}
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
                <>
                  {/* Moment d'arrivée */}
                  <div className="mb-8">
                    <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                      Arrivée
                    </h3>
                    <label className="block text-sm font-medium text-[var(--dark)] mb-2 flex items-center gap-2">
                      <span
                        className="material-icons"
                        style={{ fontSize: '18px' }}
                      >
                        schedule
                      </span>
                      Quand prévois-tu d'arriver ? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          setFormData({ ...formData, arrivee: 'Vendredi' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.arrivee === 'Vendredi'
                            ? 'border-[var(--primary)] bg-blue-50'
                            : 'border-gray-300 hover:border-[var(--primary)]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="material-icons text-3xl text-[var(--primary)] flex-shrink-0">
                            nightlight
                          </span>
                          <div>
                            <p className="font-semibold text-[var(--dark)] mb-1">
                              Vendredi
                            </p>
                            <p className="text-xs text-gray-600">
                              Un repas simple pour se retrouver tous ensemble
                              avant la grande journée de samedi
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          setFormData({ ...formData, arrivee: 'Samedi' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.arrivee === 'Samedi'
                            ? 'border-[var(--primary)] bg-blue-50'
                            : 'border-gray-300 hover:border-[var(--primary)]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="material-icons text-3xl text-[var(--primary)] flex-shrink-0">
                            wb_sunny
                          </span>
                          <div>
                            <p className="font-semibold text-[var(--dark)] mb-1">
                              Samedi
                            </p>
                            <p className="text-xs text-gray-600">
                              Programme encore à définir, plus d'infos à venir
                              prochainement
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Brunch du Dimanche */}
                  <div className="mb-8">
                    <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                      Brunch
                    </h3>
                    <label className="block text-sm font-medium text-[var(--dark)] mb-2 flex items-center gap-2">
                      <span
                        className="material-icons"
                        style={{ fontSize: '18px' }}
                      >
                        brunch_dining
                      </span>
                      Participeras-tu au Brunch du Dimanche matin ? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          setFormData({ ...formData, brunch: 'oui' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.brunch === 'oui'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
                        <div className="text-center">
                          <span className="material-icons text-4xl mb-2">
                            bakery_dining
                          </span>
                          <p className="font-semibold">Oui, avec plaisir !</p>
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          setFormData({ ...formData, brunch: 'non' })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.brunch === 'non'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <div className="text-center">
                          <span className="material-icons text-4xl mb-2">
                            coffee
                          </span>
                          <p className="font-semibold">Non, je pars avant</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Suggestion musicale */}
                  <div className="mb-8">
                    <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
                      Ambiance
                    </h3>
                    <label className="block text-sm font-medium text-[var(--dark)] mb-2 flex items-center gap-2">
                      <span
                        className="material-icons"
                        style={{ fontSize: '18px' }}
                      >
                        music_note
                      </span>
                      Une suggestion de chanson pour la soirée dansante ?
                      (Optionnel)
                    </label>
                    <input
                      type="text"
                      id="chanson"
                      name="chanson"
                      value={formData.chanson}
                      onChange={(e) =>
                        setFormData({ ...formData, chanson: e.target.value })
                      }
                      placeholder="Titre et artiste qui vous feront danser !"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg 
              focus:border-[var(--secondary)] focus:outline-none 
              transition-colors"
                    />
                  </div>
                </>
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
                    !isVinHonneurOnly &&
                    (!formData.arrivee || !formData.brunch))
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
