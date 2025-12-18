import { useState } from 'react';

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
  image: string;
}

export default function HebergementPersonnalise() {
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);

  // Pour la démo, on affiche toujours les hébergements
  const afficherHebergements = true;

  // Configuration des hébergements disponibles avec images
  const tousLesHebergements: Hebergement[] = [
    {
      type: 'Gîte',
      name: 'Les Gîtes Sainte Catherine',
      address: '81500',
      distance: 'Moins de 5 minutes',
      phone: '05 63 70 52 25',
      website:
        'http://www.vacances-dans-la-campagne-toulousaine.com/nos-gites/',
      price: '€ - €€€',
      capacity: 11,
      description: 'Gîtes à la ferme avec plusieurs options',
      features: [
        'Anciennes écuries (11 pers)',
        'Maréchalerie (6 pers)',
        'Cadre champêtre',
        'Plusieurs gammes de prix',
      ],
      image: '/hebergements/sainte_catherine.jpg',
    },
    {
      type: 'Gîte',
      name: "Gîte de l'Héritier",
      address: '323 Métairie Basse, 81500 Marzens',
      distance: 'Moins de 10 minutes',
      phone: '06 08 74 08 77',
      website: 'https://heritier-location.fr/informations/',
      price: '€€€',
      capacity: 10,
      description: 'Idéal pour les familles',
      features: [
        'Piscine extérieure chauffée',
        "Cuisine d'été avec plancha",
        'Adapté aux familles',
      ],
      image: '/hebergements/l_heritier.jpg',
    },
    {
      type: 'Gîte',
      name: 'Gîte de Ségur',
      address: '564 Combaleran, 81500 Marzens',
      distance: 'Moins de 10 minutes',
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
      image: '/hebergements/segur.jpg',
    },
    {
      type: "Chambres d'hôtes",
      name: 'Le Mas de Marie',
      address: 'Dominici, 81500 Lavaur',
      distance: 'Moins de 10 minutes',
      phone: '06 84 35 17 42',
      website: 'https://www.lemasdemarie.fr/',
      price: '€€',
      capacity: 10,
      description: "Chambres d'hôtes avec piscine et activités",
      features: [
        'Piscine privée',
        'Massages bien-être',
        'Tennis de table',
        'Bar et terrasse',
        'Réservation à la chambre',
      ],
      image: '/hebergements/mas_de_marie.jpg',
    },
    {
      type: 'Maison',
      name: "Les Chevaux d'En Belaval",
      address: 'Belaval, 81500 Pratviel',
      distance: 'Moins de 5 minutes',
      phone: '07 81 24 12 77',
      website: 'https://www.leschevauxdenbelaval81.com/about-1',
      price: '€',
      capacity: 10,
      description: "Maison de campagne vintage à 50m d'une ferme équestre",
      features: [
        'Cheminée',
        'Cuisine équipée',
        '2 espaces extérieurs',
        'Au calme avec les chevaux',
      ],
      image: '/hebergements/chevaux_en_belaval.jpg',
    },
    {
      type: 'Domaine',
      name: 'Domaine Nature et Cocagne',
      address: 'Al Roc, 81500 Pratviel',
      distance: 'Moins de 5 minutes',
      phone: '05 63 41 39 51',
      website:
        'https://www.lepaysdecocagne.fr/hebergement-locatif/domaine-nature-et-cocagne/',
      price: '€€',
      capacity: 14,
      description: 'Ancien relais de poste du XVIIIe rénové',
      features: [
        'Piscine',
        "300m² d'espace",
        'Pierre, brique et bois',
        'Grand jardin',
      ],
      image: '/hebergements/nature_et_cocagne.jpg',
    },
    {
      type: 'Gîte',
      name: 'Domaine du Léou',
      address: 'En Casse, 6647 route des Coteaux, 81500 Fiac',
      distance: 'Moins de 10 minutes',
      phone: '06 07 12 75 04',
      website: 'https://domaine-du-leou.fr/',
      price: '€€',
      capacity: 8,
      description:
        'Bâtisses en pierre avec piscine (minimum 4 nuits en juillet)',
      features: [
        'Grande piscine sécurisée',
        'Boulodrome',
        'WiFi haut débit',
        'Grand espace vert',
      ],
      image: '/hebergements/le_leou.jpg',
    },
    {
      type: 'Maison',
      name: 'La Maison Vermeille',
      address: '15 impasse du Haut des Vignes, 81500 Lavaur',
      distance: '15 minutes à Lavaur',
      phone: '06 43 08 52 93',
      website:
        'https://www.booking.com/hotel/fr/la-maison-vermeil-grande-maison-moderne-a-lavaur-lavaur.fr.html',
      price: '€',
      capacity: 6,
      description: 'Maison neuve et moderne',
      features: [
        'Plain-pied',
        'Terrasse et jardin clos',
        'Parking privé',
        'WiFi gratuit',
        'Excentré',
      ],
      image: '/hebergements/maison_vermeille.jpg',
    },
    {
      type: 'Gîte',
      name: "L'Impasse du Boeuf",
      address: 'Lavaur 81500',
      distance: '15 minutes à Lavaur',
      phone: '07 71 11 61 92',
      website:
        'https://www.tourisme-tarn.com/hebergement-locatif/gite-limpasse-du-boeuf/',
      price: '€',
      capacity: 6,
      description: 'Gîte confortable pour petits groupes',
      features: ['3 chambres', 'Cadre calme', 'Centre ville'],
      image: '/hebergements/impasse_boeuf.jpg',
    },
  ];

  const getPriceColor = (price: string) => {
    if (price.includes('€€€')) return 'text-amber-600';
    if (price.includes('€€')) return 'text-amber-500';
    return 'text-green-600';
  };

  const hebergementsFilteres = tousLesHebergements.filter((acc) => {
    // Filtre prix
    if (priceFilter && !acc.price.includes(priceFilter)) {
      return false;
    }

    // Filtre capacité
    if (capacityFilter !== null && acc.capacity < capacityFilter) {
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setPriceFilter('');
    setCapacityFilter(null);
  };

  // Si le code n'a pas accès aux hébergements, ne rien afficher
  if (!afficherHebergements) {
    return null;
  }

  return (
    <section id="hebergement" className="bg-[var(--accent)] mb-6">
      <div className="container mx-auto px-4">
        <h2 className="text-6xl md:text-8xl font-wedding text-center text-[var(--primary)]">
          Où dormir ?
        </h2>

        {/* Message personnalisé avec badge code */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <p className="text-[var(--dark)] text-lg">
            Nous avons sélectionné quelques suggestions d'hébergement à
            proximité du lieu de réception.
          </p>
          <p className="text-[var(--dark)] text-sm mt-2">
            N'hésitez pas à réserver tôt pour garantir votre place !
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-6xl mx-auto border-2 border-[var(--secondary)]/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[var(--primary)]">
              Filtrer les hébergements
            </h3>
            {(priceFilter || capacityFilter !== null) && (
              <button
                onClick={resetFilters}
                className="text-sm text-[var(--secondary)] hover:text-[var(--primary)] underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Filtre Prix */}
            <div>
              <label className="block font-semibold text-[var(--dark)] mb-2 text-sm">
                Gamme de prix
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[var(--secondary)]/20 rounded-md text-sm focus:ring-2 focus:ring-[var(--secondary)] focus:border-[var(--secondary)] bg-white"
              >
                <option value="">Tous les prix</option>
                <option value="€">€ - Économique</option>
                <option value="€€">€€ - Modéré</option>
                <option value="€€€">€€€ - Premium</option>
              </select>
            </div>

            {/* Filtre Capacité */}
            <div>
              <label className="block font-semibold text-[var(--dark)] mb-2 text-sm">
                Capacité minimum
              </label>
              <select
                value={capacityFilter || ''}
                onChange={(e) =>
                  setCapacityFilter(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border-2 border-[var(--secondary)]/20 rounded-md text-sm focus:ring-2 focus:ring-[var(--secondary)] focus:border-[var(--secondary)] bg-white"
              >
                <option value="">Toutes</option>
                <option value="6">6+ personnes</option>
                <option value="10">10+ personnes</option>
                <option value="14">14+ personnes</option>
                <option value="20">20+ personnes</option>
              </select>
            </div>
          </div>

          {/* Compteur de résultats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-[var(--dark)]">
              {hebergementsFilteres.length} hébergement
              {hebergementsFilteres.length > 1 ? 's' : ''} trouvé
              {hebergementsFilteres.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Liste des hébergements */}
        {hebergementsFilteres.length === 0 ? (
          <div className="text-center py-12 max-w-3xl mx-auto">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-[var(--secondary)]/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg text-[var(--dark)] mb-4">
              Aucun hébergement ne correspond à vos critères.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-[var(--secondary)] text-white rounded-full hover:bg-[var(--primary)] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {hebergementsFilteres.map((acc, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 hover:border-[var(--secondary)] transition-all hover:shadow-xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={acc.image}
                    alt={acc.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 bg-[var(--secondary)]/90 text-white px-3 py-1 rounded-full text-sm font-semibold bg-[var(--primary)]">
                    {acc.type}
                  </span>
                  <span
                    className={`absolute top-4 right-4 text-xl font-bold ${getPriceColor(
                      acc.price
                    )} bg-white/90 px-3 py-1 rounded-full backdrop-blur-sm`}
                  >
                    {acc.price}
                  </span>
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    {acc.website ? (
                      <a
                        href={acc.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-block"
                      >
                        <h3 className="text-5xl font-wedding text-[var(--primary)] group-hover:text-[var(--secondary)] transition-colors inline-flex items-center gap-2">
                          {acc.name}
                          <svg
                            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </h3>
                      </a>
                    ) : (
                      <h3 className="text-5xl font-wedding text-[var(--primary)]">
                        {acc.name}
                      </h3>
                    )}

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
                      <p className="text-sm text-[var(--dark)]">
                        {acc.address}
                      </p>
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
              </div>
            ))}
          </div>
        )}

        {/* Notes importantes */}
        <div className="mt-12 max-w-3xl mx-auto space-y-4">
          <div className="bg-[var(--secondary)]/10 border-l-4 border-[var(--secondary)] p-6 rounded bg-white">
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
                  💡 Conseil de réservation
                </p>
                <p className="text-sm text-[var(--dark)]">
                  Nous vous recommandons de réserver votre hébergement dès que
                  possible pour le week-end du mariage (17 juillet 2027). Les
                  places sont limitées, surtout pour les gîtes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
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
              <div>
                <p className="font-semibold text-amber-800 mb-1">
                  ⚠️ Important
                </p>
                <p className="text-sm text-amber-900">
                  Le <strong>Domaine du Léou</strong> nécessite un minimum de 4
                  nuits en juillet. Les tarifs indiqués sont approximatifs et
                  peuvent varier selon la saison.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
