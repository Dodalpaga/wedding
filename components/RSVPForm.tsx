'use client';

import { useState } from 'react';

export default function RSVPForm() {
  const [participants, setParticipants] = useState([
    { nom: '', prenom: '', age: '' },
  ]);
  const [formData, setFormData] = useState({
    nomInvite: '',
    prenomInvite: '',
    email: '',
    telephone: '',
    arrivee: '',
    commentaires: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const addParticipant = () => {
    setParticipants([...participants, { nom: '', prenom: '', age: '' }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Préparer le corps de l'email
      const emailBody = `
Nouvelle confirmation de présence pour le mariage de Solenne & Dorian

--- INFORMATIONS DE L'INVITE ---
Nom: ${formData.nomInvite}
Prénom: ${formData.prenomInvite}
Email: ${formData.email}
Téléphone: ${formData.telephone}

--- ARRIVÉE ---
${formData.arrivee}

--- PARTICIPANTS (${participants.length} personne${
        participants.length > 1 ? 's' : ''
      }) ---
${participants
  .map(
    (p, i) => `${i + 1}. ${p.prenom} ${p.nom} ${p.age ? `(${p.age} ans)` : ''}`
  )
  .join('\n')}

--- COMMENTAIRES ---
${formData.commentaires || 'Aucun commentaire'}
      `.trim();

      // Créer le mailto link
      const subject = encodeURIComponent(
        'Confirmation de présence - Mariage Solenne & Dorian'
      );
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:dorian.voydie@gmail.com,solenne.lamaud@gmail.com?subject=${subject}&body=${body}`;

      // Ouvrir le client email
      window.location.href = mailtoLink;

      setSubmitStatus('success');

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setFormData({
          nomInvite: '',
          prenomInvite: '',
          email: '',
          telephone: '',
          arrivee: '',
          commentaires: '',
        });
        setParticipants([{ nom: '', prenom: '', age: '' }]);
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="confirmation"
      className="py-20 bg-gradient-to-b from-[var(--accent)] via-white to-[var(--accent)]"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)] mb-8">
          Confirmer votre présence
        </h2>
        <p className="text-center text-[var(--dark)] mb-12 max-w-2xl mx-auto">
          Merci de remplir ce formulaire avant le{' '}
          <strong>31 décembre 2025</strong> pour nous confirmer votre présence.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20"
        >
          {/* Informations de l'invité */}
          <div className="mb-8">
            <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
              Vos informations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--dark)] mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomInvite}
                  onChange={(e) =>
                    setFormData({ ...formData, nomInvite: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dark)] mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prenomInvite}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prenomInvite: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dark)] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dark)] mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Moment d'arrivée */}
          <div className="mb-8">
            <h3 className="text-5xl font-wedding text-[var(--primary)] mb-4">
              Votre arrivée
            </h3>
            <label className="block text-sm font-medium text-[var(--dark)] mb-2">
              Quand prévoyez-vous d'arriver ? *
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

          {/* Liste des participants */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-5xl font-wedding text-[var(--primary)]">
                Participants ({participants.length})
              </h3>
              <button
                type="button"
                onClick={addParticipant}
                className="bg-[var(--secondary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)] transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Ajouter une personne
              </button>
            </div>

            <div className="space-y-4">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="p-4 bg-[var(--accent)] rounded-lg border-2 border-[var(--secondary)]/20"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-[var(--primary)]">
                      Participant {index + 1}
                    </h4>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--dark)] mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={participant.prenom}
                        onChange={(e) =>
                          updateParticipant(index, 'prenom', e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--dark)] mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={participant.nom}
                        onChange={(e) =>
                          updateParticipant(index, 'nom', e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--dark)] mb-1">
                        Âge (optionnel)
                      </label>
                      <input
                        type="number"
                        value={participant.age}
                        onChange={(e) =>
                          updateParticipant(index, 'age', e.target.value)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none transition-colors"
                        placeholder="Ex: 25"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              placeholder="Allergies alimentaires, régime spécial, besoin d'un siège bébé..."
            />
          </div>

          {/* Bouton de soumission */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Confirmer ma présence'}
            </button>
          </div>

          {/* Messages de statut */}
          {submitStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg text-center">
              ✅ Merci ! Votre client email va s'ouvrir. Envoyez simplement le
              message !
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg text-center">
              ❌ Une erreur s'est produite. Veuillez réessayer.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
