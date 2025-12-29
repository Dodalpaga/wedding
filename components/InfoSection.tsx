'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import VillaIcon from '@mui/icons-material/Villa';
import EmailIcon from '@mui/icons-material/Email';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import LocationOn from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Event from '@mui/icons-material/Event';
import QrCode from '@mui/icons-material/QrCode';
import PeopleIcon from '@mui/icons-material/People';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Composant pour l'animation du compteur
const AnimatedCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    });

    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <span>{displayValue}</span>;
};

// Composant pour les décorations florales
const FloralDecoration = ({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) => {
  const positionStyles = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const rotations = {
    'top-left': 0,
    'top-right': 0,
    'bottom-left': 0,
    'bottom-right': 0,
  };

  return (
    <motion.div
      className={`absolute ${positionStyles[position]} pointer-events-none z-10`}
      initial={{ opacity: 0, scale: 0, rotate: rotations[position] }}
      animate={{ opacity: 1, scale: 3, rotate: rotations[position] }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Feuille principale */}
        <motion.path
          d="M10 25 Q15 10, 25 5 Q30 10, 25 20 Q20 25, 10 25 Z"
          fill="var(--secondary)"
          opacity="0.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Petite feuille secondaire */}
        <motion.path
          d="M25 20 Q30 15, 35 12 Q38 16, 34 22 Q30 24, 25 20 Z"
          fill="var(--secondary)"
          opacity="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeInOut' }}
        />

        {/* Fleur - pétales */}
        <motion.circle
          cx="20"
          cy="15"
          r="4"
          fill="var(--primary)"
          opacity="0.6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        />
        <motion.circle
          cx="16"
          cy="19"
          r="3.5"
          fill="var(--primary)"
          opacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        />
        <motion.circle
          cx="24"
          cy="19"
          r="3.5"
          fill="var(--primary)"
          opacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
        <motion.circle
          cx="20"
          cy="23"
          r="3.5"
          fill="var(--primary)"
          opacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        />

        {/* Centre de la fleur */}
        <motion.circle
          cx="20"
          cy="19"
          r="3"
          fill="var(--accent)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />

        {/* Petites étincelles */}
        <motion.circle
          cx="30"
          cy="8"
          r="1.5"
          fill="var(--secondary)"
          opacity="0.6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.6] }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="1"
          fill="var(--primary)"
          opacity="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 0.7, 0.5] }}
          transition={{ duration: 0.6, delay: 0.65 }}
        />
      </svg>
    </motion.div>
  );
};

// Composant FAQ Item avec expander
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md border-2 border-[var(--secondary)]/20 overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[var(--primary)]/5 transition-colors"
      >
        <span className="text-lg font-semibold text-[var(--primary)] pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-5 pt-2 text-[var(--dark)] leading-relaxed border-t border-[var(--secondary)]/10">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Composant carte avec animations
const AnimatedCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 transition-all relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'visible' }}
    >
      <AnimatePresence>
        {isHovered && (
          <>
            <FloralDecoration position="top-left" />
            {/* <FloralDecoration position="top-right" /> */}
            {/* <FloralDecoration position="bottom-left" /> */}
            {/* <FloralDecoration position="bottom-right" /> */}
          </>
        )}
      </AnimatePresence>
      <div className="relative z-0">{children}</div>
    </motion.div>
  );
};

export default function InfoSection() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  // Charger le nombre de participants
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        // Charger les codes d'invitation
        const codesSnapshot = await getDocs(collection(db, 'codes_invitation'));
        const codesMap = new Map<string, any>();

        codesSnapshot.docs.forEach((codeDoc) => {
          const code = codeDoc.id;
          const data = codeDoc.data();
          if (
            code.length === 6 &&
            data.membres &&
            Array.isArray(data.membres)
          ) {
            codesMap.set(code, {
              id: code,
              membres: data.membres,
            });
          }
        });

        // Charger les statuts
        const statutsSnapshot = await getDocs(collection(db, 'statuts'));
        const statuts = statutsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as any)
        );

        // Construire la liste des membres
        const allMembres: any[] = [];
        codesMap.forEach((codeData) => {
          (codeData.membres || []).forEach((nom: string) => {
            const statut = statuts.find((s) => s.nom_membre === nom) || {};
            allMembres.push({
              nom,
              statut: statut.statut || 'en_attente',
            });
          });
        });

        // Compter les participants confirmés
        const confirmes = allMembres.filter(
          (m) => m.statut === 'accepte'
        ).length;
        setTotalParticipants(confirmes);
        setIsLoadingParticipants(false);
      } catch (err) {
        console.error('Erreur chargement participants:', err);
        setIsLoadingParticipants(false);
      }
    };

    loadParticipants();
  }, []);

  const handleSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!code.trim()) {
      setError('Veuillez entrer votre code');
      return;
    }

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
      const codeRef = doc(db, 'codes_invitation', code.trim());
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
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
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-8 max-sm:text-8xl">
            Informations pratiques
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
            {/* Colonne 1 : Le Lieu */}
            <AnimatedCard className="flex flex-col">
              <div className="p-8">
                <div className="text-center mb-6">
                  <VillaIcon sx={{ fontSize: 60, color: 'var(--secondary)' }} />
                </div>
                <h3 className="text-7xl font-wedding text-[var(--primary)] mb-4 text-center max-sm:text-6xl">
                  Le Domaine d'en Naudet
                </h3>
                <p className="text-[var(--dark)] text-justify leading-relaxed">
                  Niché entre <strong>forêts de chênes centenaires</strong> et
                  courbes douces des collines Tarnaises, le Domaine d'en Naudet
                  est un véritable <strong>havre de paix</strong> où le charme
                  de la campagne rencontre l'élégance d'un lieu{' '}
                  <strong>authentique</strong>.
                  <br />
                  <br />
                  En arrivant, vous emprunterez une{' '}
                  <strong>longue allée bordée d'arbres majestueux</strong> avant
                  de découvrir une cour chaleureuse, une{' '}
                  <strong>grange aux pierres dorées</strong> et des espaces
                  extérieurs <strong>baignés de lumière</strong>.
                  <br />
                  <br />
                  C'est un endroit qui respire la <em>tranquillité</em>, le{' '}
                  <em>partage</em> et les <em>moments suspendus</em> — l'écrin
                  parfait pour accueillir une journée dont nous espérons qu'elle
                  restera <strong>gravée dans les mémoires</strong>.
                </p>
              </div>
              <img
                src={`${
                  process.env.NEXT_PUBLIC_BASE_PATH || ''
                }/images/domaine.svg`}
                alt="Domaine d'en Naudet"
                className="w-full rounded-b-lg object-cover min-h-[500px]"
              />
            </AnimatedCard>

            {/* Colonne 2 : Grille 2x2 */}
            <div className="grid grid-cols-2 gap-4 max-[525px]:grid-cols-3 auto-rows-min">
              {/* Planning */}
              <AnimatedCard className="p-6 col-span-2 max-[525px]:col-span-3">
                <div className="text-center mb-4">
                  <Event sx={{ fontSize: 50, color: 'var(--secondary)' }} />
                </div>

                <h3 className="text-7xl font-wedding text-[var(--primary)] mb-3 text-center max-sm:text-6xl">
                  Planning
                </h3>

                <table className="w-full text-[var(--dark)] text-m mb-4 border-collapse">
                  <tbody>
                    <tr className="items-center">
                      <td className="w-1/6 pr-4 text-right">
                        <span className="font-wedding text-[var(--primary)] text-6xl max-sm:text-5xl">
                          Vendredi
                        </span>
                      </td>
                      <td className="text-justify">
                        Accueil des <strong>voyageurs de loin</strong> autour
                        d'un repas improvisé — l'occasion de se retrouver{' '}
                        <em>tranquillement</em> après la route, de poser les
                        valises et de <strong>commencer les festivités</strong>{' '}
                        en douceur.
                      </td>
                    </tr>

                    <tr className="items-center">
                      <td className="pt-3 pr-4 text-right">
                        <span className="font-wedding text-[var(--primary)] text-6xl max-sm:text-5xl">
                          Samedi
                        </span>
                      </td>
                      <td className="text-justify pt-3">
                        Le <strong>cœur des festivités</strong> : cérémonie
                        laïque sous le ciel Tarnais, vin d'honneur, photos,
                        jeux, repas puis <em>soirée dansante</em> jusqu'au{' '}
                        <strong>bout de la nuit</strong> — ou jusqu'à ce que vos
                        pieds demandent grâce.
                      </td>
                    </tr>

                    <tr className="items-center">
                      <td className="pt-3 pr-4 text-right">
                        <span className="font-wedding text-[var(--primary)] text-6xl max-sm:text-5xl">
                          Dimanche
                        </span>
                      </td>
                      <td className="text-justify pt-3">
                        Brunch convivial pour{' '}
                        <em>prolonger ces beaux moments</em>, échanger quelques{' '}
                        <strong>derniers rires</strong> et se quitter avec la
                        promesse de se revoir bientôt.
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-[var(--secondary)] tracking-wider mb-4">
                  <strong>Note</strong> : Le programme détaillé est en cours de
                  construction. Nous vous tiendrons informés par mail des mises
                  à jour
                </div>

                <div className="text-center">
                  <span className="text-[var(--secondary)] font-semibold uppercase tracking-wider">
                    Cérémonie en extérieur prévue
                  </span>
                </div>
              </AnimatedCard>

              {/* Parking */}
              <AnimatedCard className="p-6 max-[525px]:col-span-3">
                <div className="text-center mb-4">
                  <DirectionsCar
                    sx={{ fontSize: 50, color: 'var(--secondary)' }}
                  />
                </div>
                <h3 className="text-7xl font-wedding text-[var(--primary)] mb-3 text-center">
                  Accessibilité
                </h3>
                <p className="text-[var(--dark)] text-sm text-justify leading-relaxed">
                  Si vous avez des difficultés à organiser votre transport
                  contactez nous, nous vous mettrons en relation avec des
                  personnes pouvant proposer du covoiturage.
                </p>
                <div className="text-l mt-6 pb-6 underline text-center">
                  <a
                    href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x12ae7c9aacde77c7:0x2fc264a84876dbee?sa=X&ved=1t:8290&ictx=111"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
                  >
                    <LocationOn sx={{ fontSize: 20 }} />
                    <span>2365 route de Pratviel, 81220 Teyssode</span>
                  </a>
                </div>
                <p className="text-[var(--dark)] text-sm text-justify leading-relaxed">
                  Un <strong>parking privé</strong> est disponible directement
                  sur le domaine, avec <strong>plus de 100 places</strong>. Vous
                  pourrez donc arriver en toute sérénité.
                </p>
              </AnimatedCard>

              {/* Météo */}
              <AnimatedCard className="p-6 max-[525px]:col-span-3">
                <div className="text-center mb-4">
                  <WbSunnyIcon
                    sx={{ fontSize: 50, color: 'var(--secondary)' }}
                  />
                </div>
                <h3 className="text-7xl font-wedding text-[var(--primary)] mb-3 text-center">
                  Côté Météo
                </h3>
                <p className="text-[var(--dark)] text-sm text-justify leading-relaxed">
                  Le mois de juillet dans le Tarn est synonyme de{' '}
                  <strong>ciel bleu</strong>, de chaleur douce en soirée et de{' '}
                  <strong>belles journées lumineuses</strong>. Les après-midi
                  tournent souvent autour de <strong>35°C</strong>, mais le
                  domaine offre de <strong>nombreux coins d'ombre</strong>, des
                  tonnelles naturelles et une <em>brise légère</em> venue des
                  collines.
                  <br />
                  <br />
                  La cérémonie et une partie des festivités auront lieu en
                  extérieur : n'oubliez pas d'apporter votre{' '}
                  <strong>crème solaire</strong>, vos <strong>lunettes</strong>{' '}
                  et pourquoi pas un
                  <strong> éventail</strong> pour ajouter une petite touche{' '}
                  <em>bohème chic</em> !
                </p>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* Section Confirmation et Galerie */}
      <section id="confirmation" className="py-20 bg-[var(--primary)]">
        <div className="container mx-auto px-4">
          <h2 className="text-9xl font-wedding text-center text-[var(--accent)] mb-8 max-sm:text-8xl">
            Votre espace personnel
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-[var(--secondary)]/20">
              <div className="text-center mb-8">
                <QrCode sx={{ fontSize: 60, color: 'var(--secondary)' }} />
              </div>

              <p className="text-lg text-[var(--dark)] text-center">
                Chaque invitation contient un <strong>code</strong> qui vous
                permet de confirmer votre présence, accéder à la galerie photos,
                et nous indiquer vos préférences (allergies, régimes
                particuliers, etc...).
              </p>

              {/* Compteur de participants */}
              <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-lg p-4">
                <div className="flex items-center justify-center flex-col">
                  <PeopleIcon
                    sx={{ fontSize: 30, color: 'var(--secondary)' }}
                  />
                  <div className="text-center">
                    {isLoadingParticipants ? (
                      <div className="flex items-center gap-2 text-[var(--secondary)]">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <svg
                            className="w-5 h-5"
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
                        </motion.div>
                        <span className="text-sm">Chargement...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                          <AnimatedCounter value={totalParticipants} />
                        </p>
                        <p className="text-sm text-[var(--dark)]">
                          {totalParticipants === 0
                            ? 'Soyez le premier à confirmer !'
                            : totalParticipants === 1
                            ? 'participant confirmé 🎉'
                            : 'participants confirmés 🎉'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Entrez votre code"
                    className="w-full px-4 py-3 border-2 border-[var(--secondary)]/30 rounded-lg focus:border-[var(--secondary)] focus:outline-none text-center text-lg uppercase tracking-wider"
                  />
                  {error && (
                    <p className="text-red-500 text-m mt-2 text-center">
                      {error}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
                  >
                    Confirmer sa présence
                  </button>
                  <button
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
              </div>

              <div className="mt-6 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-lg p-4">
                <p className="text-m text-[var(--dark)] text-center">
                  Vous ne retrouvez pas votre code ?{' '}
                  <a
                    href="mailto:solenne.lamaud@gmail.com,dorian.voydie@gmail.com"
                    className="font-bold underline text-[var(--primary)]
                  hover:text-[var(--secondary)] transition-colors"
                  >
                    Contactez-nous
                  </a>
                </p>
              </div>

              <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 p-4 rounded-lg">
                <p className="text-m text-[var(--dark)] text-center">
                  📅 <strong>Date limite :</strong> Pour des raisons
                  d'organisation, merci de bien vouloir remplir ce formulaire le
                  plus tôt possible et avant le <strong>17 juillet 2026</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="py-20 bg-gradient-to-b from-[var(--primary)]/5 to-[var(--accent)]"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-8 max-sm:text-8xl">
            Questions fréquentes
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: 'Les animaux sont-ils acceptés dans le domaine ?',
                answer:
                  "Nous adorons nos amis à quatre pattes, mais pour des raisons pratiques et pour garantir le confort de tous nos invités, le domaine a fait le choix de ne pas accueillir d'animaux lors des mariages. Nous espérons que vous comprendrez cette décision et que vous pourrez confier vos compagnons à des proches pour ce week-end. Merci de votre compréhension ! 🐾",
              },
              {
                question: 'Y a-t-il un code vestimentaire ?',
                answer:
                  "Nous souhaitons que vous vous sentiez à l'aise et élégants ! L'événement sera en extérieur avec une ambiance chic et champêtre. Pour les dames, pensez à des chaussures adaptées au terrain (les talons aiguilles et l'herbe ne font pas toujours bon ménage 😉). Côté couleurs, laissez libre cours à votre créativité — évitez simplement le blanc intégral, tradition oblige !",
              },
              {
                question:
                  "Que faire si j'ai des allergies ou un régime alimentaire particulier ?",
                answer:
                  "Nous prenons cela très au sérieux ! Lors de votre confirmation de présence, un champ est prévu pour nous indiquer vos allergies, intolérances ou régimes particuliers (végétarien, végétalien, sans gluten, etc.). Notre traiteur s'adaptera pour que chacun puisse profiter pleinement du repas.",
              },
            ].map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)] via-[var(--primary)]/5 to-[var(--accent)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-8 max-sm:text-8xl">
            Nous contacter
          </h2>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-[var(--dark)] mb-8">
              Vous avez une question à 2h du matin parce que vous hésitez entre
              la robe verte et la robe jaune, entre un noeud papillon et une
              cravate ? On est là !
            </p>

            <a
              href="mailto:solenne.lamaud@gmail.com,dorian.voydie@gmail.com"
              className="flex flex-col items-center gap-3 bg-white px-8 py-5 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-[1.02] font-medium text-[var(--primary)]"
            >
              <div className="flex flex-row items-center">
                <EmailIcon className="w-7 h-7 text-[var(--secondary)]" />
                <div style={{ marginLeft: '10px' }}>
                  Écrivez-nous en cliquant ici !
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
