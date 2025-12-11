'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VillaIcon from '@mui/icons-material/Villa';
import EmailIcon from '@mui/icons-material/Email';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import QrCode from '@mui/icons-material/QrCode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function InfoSection() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Veuillez entrer votre code');
      return;
    }

    // Redirection vers la page de confirmation avec le code
    router.push(`/confirmation/?code=${encodeURIComponent(code.trim())}`);
  };

  const handleGalleryAccess = async () => {
    if (code.trim() === '') {
      setError('Veuillez entrer un code.');
      return;
    }

    setIsLoadingGallery(true);
    setError('');

    try {
      // Référence au document dans la collection 'codes_invitation'
      const codeRef = doc(db, 'codes_invitation', code.trim());

      // Récupération du document
      const codeSnap = await getDoc(codeRef);

      // Vérification de l'existence du code
      if (codeSnap.exists()) {
        // Accès accordé - redirection vers la galerie avec le code
        router.push(`/gallerie/?code=${encodeURIComponent(code.trim())}`);
      } else {
        setError("Code invalide. Veuillez vérifier votre code d'invitation.");
      }
    } catch (err) {
      console.error('Erreur de vérification Firebase:', err);
      setError('Erreur lors de la vérification du code. Veuillez réessayer.');
    } finally {
      setIsLoadingGallery(false);
    }
  };

  return (
    <>
      {/* Section Informations */}
      <section id="infos" className="py-20 bg-[var(--accent)]">
        <div className="container mx-auto px-4">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-16">
            Informations pratiques
          </h2>

          {/* Nouvelle disposition : 2 colonnes principales */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Colonne 1 : Le Lieu */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 transition-all overflow-hidden flex flex-col">
              <div className="p-8 flex-grow">
                <div className="text-center mb-6">
                  <VillaIcon sx={{ fontSize: 60, color: 'var(--secondary)' }} />
                </div>
                <h3 className="text-6xl font-wedding text-[var(--primary)] mb-4 text-center">
                  Le Domaine d'en Naudet
                </h3>
                <p className="text-[var(--dark)] text-justify">
                  Niché entre forêts de chênes et courbes douces des collines
                  tarnaises, le Domaine d’en Naudet est un véritable havre de
                  paix où le charme de la campagne rencontre l’élégance d’un
                  lieu de réception authentique. En arrivant, vous emprunterez
                  une longue allée bordée d’arbres centenaires avant de
                  découvrir une cour chaleureuse, une grange aux pierres dorées
                  et des espaces extérieurs baignés de lumière. C’est un endroit
                  qui respire la tranquillité, le partage et les moments
                  suspendus — parfait pour accueillir une journée dont nous
                  espérons qu’elle restera gravée dans les mémoires.
                </p>
              </div>
              <img
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ''
                }/images/domaine.svg`}
                alt="Domaine d'en Naudet"
                className="w-full"
              />
            </div>

            {/* Colonne 2 : Grille 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {/* Parking */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 transition-all">
                <div className="text-center mb-4">
                  <LocalParkingIcon
                    sx={{ fontSize: 50, color: 'var(--secondary)' }}
                  />
                </div>
                <h3 className="text-6xl font-wedding text-[var(--primary)] mb-3 text-center">
                  Parking
                </h3>
                <p className="text-[var(--dark)] text-sm text-center">
                  Un parking privé est disponible directement sur le domaine,
                  avec plus de 100 places. Vous pourrez donc arriver en toute
                  sérénité, sans avoir à marcher des kilomètres ni à chercher en
                  pleine campagne où poser votre voiture. Si vous souhaitez
                  organiser du covoiturage avec d’autres invités, n’hésitez pas
                  à nous le signaler : nous pourrons vous mettre en relation.
                </p>
              </div>

              {/* Météo */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 transition-all">
                <div className="text-center mb-4">
                  <WbSunnyIcon
                    sx={{ fontSize: 50, color: 'var(--secondary)' }}
                  />
                </div>
                <h3 className="text-6xl font-wedding text-[var(--primary)] mb-3 text-center">
                  Côté Météo
                </h3>
                <p className="text-[var(--dark)] text-sm text-center">
                  Le mois de juillet dans le Tarn est synonyme de ciel bleu, de
                  chaleur douce en soirée et de belles journées lumineuses. Les
                  après-midis tournent souvent autour de 30–35°C, mais le
                  domaine offre de nombreux coins d’ombre, des tonnelles
                  naturelles et une brise légère venue des collines. La
                  cérémonie et une partie des festivités auront lieu en
                  extérieur : pensez crème solaire, lunettes et pourquoi pas un
                  éventail pour ajouter une petite touche bohème chic !
                </p>
              </div>

              {/* Code Vestimentaire */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 transition-all col-span-2">
                <div className="text-center mb-4">
                  <CheckroomIcon
                    sx={{ fontSize: 50, color: 'var(--secondary)' }}
                  />
                </div>
                <h3 className="text-6xl font-wedding text-[var(--primary)] mb-3 text-center">
                  Code Vestimentaire
                </h3>
                <p className="text-[var(--dark)] text-sm text-center mb-4">
                  Nous avons imaginé une ambiance élégante mais décontractée, où
                  chacun puisse profiter pleinement de la journée tout en se
                  sentant à son avantage. Les robes fluides, les costumes
                  légers, les matières naturelles (lin, coton, mousseline) et
                  les couleurs douces s’y prêtent parfaitement. Les talons fins
                  peuvent être remplacés par des sandales confortables ou des
                  wedges : le domaine est grand, et l’herbe aussi ! Et pour la
                  soirée, un foulard, une veste légère ou un châle seront
                  parfaits lorsque le soleil commencera à descendre.
                </p>
                <div className="text-center">
                  <span className="text-[var(--secondary)] font-semibold uppercase tracking-wider">
                    Cérémonie en extérieur prévue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Confirmation et Galerie */}
      <section id="confirmation" className="py-20 bg-[var(--primary)]">
        <div className="container mx-auto px-4">
          <h2 className="text-9xl font-wedding text-center text-[var(--accent)] mb-16">
            Votre espace personnel
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-[var(--secondary)]/20">
              <div className="text-center mb-8">
                <QrCode sx={{ fontSize: 60, color: 'var(--secondary)' }} />
              </div>

              <p className="text-lg text-[var(--dark)] mb-6 text-center">
                Chaque invitation contient un <strong>code unique</strong> qui
                vous permet de confirmer votre présence, accéder à la galerie
                photos, et nous indiquer vos préférences (allergies, régimes
                particuliers, présence d'enfants). Vous pourrez modifier vos
                réponses autant de fois que vous voulez jusqu'au 17 juillet
                2026.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-[var(--primary)] font-semibold mb-2 text-center"
                  >
                    Votre code d'invitation
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                    }}
                    placeholder="Entrez votre code"
                    className="w-full px-4 py-3 border-2 border-[var(--secondary)]/30 rounded-lg focus:border-[var(--secondary)] focus:outline-none text-center text-lg uppercase tracking-wider"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      {error}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
                  >
                    Confirmer ma présence
                  </button>
                  <button
                    type="button"
                    onClick={handleGalleryAccess}
                    disabled={true}
                    className="relative w-full overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-amber-900 py-4 rounded-lg font-semibold text-lg shadow-[0_8px_30px_rgb(251,191,36,0.4)] transition-all hover:shadow-[0_12px_40px_rgb(251,191,36,0.6)] hover:scale-[1.02] disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-transparent before:opacity-60 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent_70%)] after:opacity-40"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoadingGallery ? (
                        'Vérification...'
                      ) : (
                        <>
                          ✨ Accéder à la galerie 📸 ✨<br /> (En développement)
                        </>
                      )}
                    </span>
                    <span className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></span>
                    <span className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse delay-150"></span>
                    <span className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-300"></span>
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-[var(--secondary)]/20">
                <p className="text-sm text-[var(--dark)] text-center">
                  <strong>Rassurez-vous !</strong> Toutes les informations sont
                  modifiables à tout moment. Vous pourrez mettre à jour votre
                  présence, vos préférences alimentaires et autres détails quand
                  vous le souhaitez.
                </p>
              </div>

              <div className="mt-6 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 p-4 rounded-lg">
                <p className="text-sm text-[var(--dark)] text-center">
                  📅 <strong>Date limite :</strong> Merci de confirmer votre
                  présence avant le <strong>17 juillet 2026</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)] via-[var(--primary)]/5 to-[var(--accent)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-16">
            Nous contacter
          </h2>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-[var(--dark)] mb-8">
              Vous avez une question à 2 h du matin parce que vous hésitez entre
              la robe verte ou la robe jaune ? On est là !
            </p>

            <a
              href="mailto:solenne.lamaud@gmail.com,dorian.voydie@gmail.com"
              className="flex flex-col items-center gap-3 bg-white px-8 py-5 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-[1.02] font-medium text-[var(--primary)]"
            >
              <div className="flex flex-row items-center">
                <EmailIcon className="w-7 h-7 text-[var(--secondary)]" />
                <div style={{ marginLeft: '10px' }}>
                  Écrivez-nous à toutes les deux en cliquant ici !
                </div>
              </div>
              <span> solenne.lamaud@gmail.com + dorian.voydie@gmail.com</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
