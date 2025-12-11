import { getCodesParGroupe, estDansGroupe } from '@/config/codes';

interface Hebergement {
  type: string;
  name: string;
  address: string;
  distance: string;
  phone?: string;
  website?: string;
  price: string;
  capacity: number;
  description: string;
  features: string[];
}

interface HebergementPersonnaliseProps {
  code: string | null;
}

export default function HebergementPersonnalise({
  code,
}: HebergementPersonnaliseProps) {
  // Configuration des hébergements disponibles
  const tousLesHebergements: Hebergement[] = [
    {
      type: 'Gîte',
      name: "Gîte de l'Héritier",
      address: '323 Métairie Basse, 81500 Marzens',
      distance: '8 minutes en voiture',
      phone: '06 08 74 08 77',
      website: 'https://heritier-location.fr/informations/',
      price: '€ - €€',
      capacity: 12,
      description: 'Idéal pour les familles',
      features: [
        'Piscine extérieure chauffée',
        "Cuisine d'été avec plancha",
        'Adapté aux familles',
      ],
    },
    {
      type: 'Gîte',
      name: 'Gîte de Ségur',
      address: '564 Combaleran, 81500 Marzens',
      distance: '7 minutes en voiture',
      phone: '06 08 74 08 77',
      website: 'https://gitedesegur.fr/',
      price: '€€ - €€€',
      capacity: 26,
      description: 'Idéal pour les grandes familles',
      features: [
        'Grande table pour 18 personnes',
        'Hammam',
        'Jacuzzi',
        'Salle de fitness',
      ],
    },
    {
      type: 'Hôtel',
      name: 'Hôtel du Centre-Ville',
      address: 'Place de la Mairie, 81000 Albi',
      distance: '25 minutes en voiture',
      phone: '05 63 54 12 34',
      website: 'https://hotel-exemple.fr',
      price: '€€',
      capacity: 2,
      description: 'Confortable et bien situé',
      features: ['Parking gratuit', 'Petit-déjeuner inclus', 'WiFi'],
    },
  ];

  // Personnalisation des hébergements selon le groupe
  const getHebergementsPersonnalises = (): Hebergement[] => {
    if (!code) return tousLesHebergements;

    // Famille Voydie (18 personnes) - Grand gîte prioritaire
    // Gilles Laurence Thomas Amandine +1, Didier, Danielle et JF, Claire Maelle Simon, Les Momisson
    if (estDansGroupe(code, 'voydie')) {
      return [
        tousLesHebergements[1], // Gîte de Ségur (grand)
        tousLesHebergements[0], // Gîte de l'Héritier
      ];
    }

    // Cousins Lamaud (8 personnes) - Petit gîte
    if (estDansGroupe(code, 'lamaud')) {
      return [
        tousLesHebergements[0], // Gîte de l'Héritier
      ];
    }

    // Groupes de 4 à 6 personnes - AirBnB ou petit gîte
    // Maxime Jeanne Andreanne Théo (4 pers), Copains Théâtre (6 pers)
    if (estDansGroupe(code, 'airbnb')) {
      return [
        tousLesHebergements[0], // Gîte de l'Héritier
        tousLesHebergements[2], // Hôtel
      ];
    }

    // Couples - Hôtel
    // JF Barraud & Annette, Isabelle & Thierry Jolivets, Pierrette & Alain LEDUC,
    // Gilles & Amandine (parrain Dorian), Vincent & Justine, Zina, Frédérique tante Solenne
    if (estDansGroupe(code, 'couples')) {
      return [
        tousLesHebergements[2], // Hôtel
      ];
    }

    // Par défaut : tous les hébergements
    return tousLesHebergements;
  };

  const hebergements = getHebergementsPersonnalises();

  // Message personnalisé selon le groupe
  const getMessagePersonnalise = (): string => {
    if (!code) {
      return "Nous avons sélectionné quelques suggestions d'hébergement à proximité du lieu de réception.";
    }

    if (estDansGroupe(code, 'voydie')) {
      return 'Nous avons sélectionné des hébergements spacieux pour accueillir toute la famille Voydie !';
    }

    if (estDansGroupe(code, 'lamaud')) {
      return "Voici quelques suggestions d'hébergement à proximité du lieu de réception, parfaitement adaptées pour vous !";
    }

    if (estDansGroupe(code, 'airbnb')) {
      return "Voici des options d'hébergement idéales pour votre groupe !";
    }

    if (estDansGroupe(code, 'couples')) {
      return 'Nous avons sélectionné des hébergements confortables pour les couples.';
    }

    return "Nous avons sélectionné quelques suggestions d'hébergement à proximité du lieu de réception.";
  };

  const getPriceColor = (price: string) => {
    if (price.includes('€€€')) return 'text-amber-600';
    if (price.includes('€€')) return 'text-amber-500';
    return 'text-green-600';
  };

  return (
    <section id="hebergement" className="bg-[var(--accent)]">
      <div className="container mx-auto px-4">
        <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
          Où dormir ?
        </h2>

        {/* Message personnalisé avec badge code */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          {code && (
            <span className="inline-block bg-[var(--secondary)]/20 text-[var(--secondary)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Suggestions pour {code}
            </span>
          )}
          <p className="text-[var(--dark)] text-lg">
            {getMessagePersonnalise()}
          </p>
          <p className="text-[var(--dark)] text-sm mt-2">
            N'hésitez pas à réserver tôt pour garantir votre place !
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {hebergements.map((acc, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 hover:border-[var(--secondary)] transition-all hover:shadow-xl"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span className="inline-block bg-[var(--secondary)]/20 text-[var(--secondary)] px-3 py-1 rounded-full text-sm font-semibold mb-2">
                    {acc.type}
                  </span>
                  <h3 className="text-5xl font-wedding text-[var(--primary)]">
                    {acc.name}
                  </h3>

                  {/* Capacity with silhouettes */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(Math.min(acc.capacity, 10))].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-[var(--secondary)]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-[var(--dark)] font-medium">
                      Jusqu'à {acc.capacity} pers.
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xl font-bold ${getPriceColor(
                    acc.price
                  )} ml-4`}
                >
                  {acc.price}
                </span>
              </div>

              {/* Description */}
              <p className="text-[var(--dark)] mb-4 text-sm italic">
                {acc.description}
              </p>

              {/* Adresse */}
              <div className="flex items-start gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-[var(--secondary)] flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-[var(--dark)]">{acc.address}</p>
                  <p className="text-xs text-[var(--secondary)] font-semibold">
                    {acc.distance}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                {acc.phone && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--secondary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${acc.phone.replace(/\s/g, '')}`}
                      className="text-sm text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
                    >
                      {acc.phone}
                    </a>
                  </div>
                )}
                {acc.website && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--secondary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <a
                      href={acc.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--primary)] hover:text-[var(--secondary)] transition-colors hover:underline"
                    >
                      Voir le site web
                    </a>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {acc.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-[var(--accent)] text-[var(--dark)] px-3 py-1 rounded-full text-xs"
                  >
                    <svg
                      className="w-3 h-3 text-[var(--secondary)]"
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
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note importante */}
        <div className="m-12 max-w-3xl mx-auto bg-[var(--secondary)]/10 border-l-4 border-[var(--secondary)] p-6 rounded">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-[var(--secondary)] mt-0.5 mr-3 flex-shrink-0"
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
              <p className="font-semibold text-[var(--primary)] mb-1">
                💡 Conseil
              </p>
              <p className="text-sm text-[var(--dark)]">
                Nous vous recommandons de réserver votre hébergement dès que
                possible, surtout pour le week-end du mariage (17 juillet 2027).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
