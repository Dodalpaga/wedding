'use client';

export default function InfoSection() {
  return (
    <>
      {/* Section Informations */}
      <section id="infos" className="py-20 bg-[var(--accent)]">
        <div className="container mx-auto px-4">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-16">
            Informations pratiques
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Le Lieu */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 hover:border-[var(--secondary)] transition-all">
              <div className="text-center mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-[var(--secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-6xl font-wedding text-[var(--primary)] mb-4 text-center">
                Le Domaine d'en Naudet
              </h3>
              <div className="space-y-2 text-[var(--dark)] text-justify">
                <p>
                  Le domaine d’en Naudet, situé à quelques kilomètres de Lavaur
                  (à 40 mintues de Toulouse), offre un cadre verdoyant et
                  paisible, idéal pour célébrer un mariage en toute intimité.
                </p>
                <img src="/images/domaine.png" alt="" />
              </div>
            </div>

            {/* Parking */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-[var(--secondary)]/20 hover:border-[var(--secondary)] transition-all">
              <div className="text-center mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-[var(--secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-6xl font-wedding text-[var(--primary)] mb-4 text-center">
                Parking
              </h3>
              <div className="space-y-2 text-[var(--dark)]">
                <p>
                  Un parking gratuit est disponible sur place au domaine. Il y
                  aura de la place pour tout le monde !
                </p>
                <img src="/images/dessus-domaine.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Programme */}
      <section id="programme" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)] via-[var(--primary)]/5 to-[var(--accent)]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-16">
            Programme de la journée
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  time: '14:00',
                  event: 'Cocktail de bienvenue',
                  description: '',
                },
                {
                  time: '15:30',
                  event: 'Cérémonie Laïque',
                  description: '',
                },
                {
                  time: '17:00',
                  event: "Vin d'honneur et photos",
                  description: '',
                },
                {
                  time: '20:00',
                  event: 'Dîner de gala',
                  description: '',
                },
                {
                  time: '00:00',
                  event: "Débuts d'une nuit de folies",
                  description: '',
                },
                { time: '05:00', event: 'Fin de la soirée', description: '' },
              ].map((item, index) => (
                <div key={index} className="flex items-start group">
                  <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--dark)] text-white rounded-full w-16 h-16 flex items-center justify-center font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    {item.time}
                  </div>
                  <div className="ml-6 bg-white p-4 rounded-lg shadow-md flex-grow border-2 border-[var(--secondary)]/20 group-hover:border-[var(--secondary)] transition-all">
                    <h3 className="font-semibold text-lg text-[var(--primary)]">
                      {item.event}
                    </h3>
                    {item.description && (
                      <p className="text-[var(--dark)] text-sm mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 bg-[var(--accent)]">
        <div className="container mx-auto px-4">
          <h2 className="text-9xl font-wedding text-center text-[var(--primary)] mb-16">
            Nous contacter
          </h2>

          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-[var(--dark)] mb-8">
              Pour toute question ou information complémentaire, n'hésitez pas à
              nous contacter :
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <svg
                  className="w-6 h-6 text-[var(--secondary)]"
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
                <p className="text-[var(--primary)] font-medium">Solenne :</p>
                <a
                  href="tel:+33689710193"
                  className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors font-medium"
                >
                  06 89 71 01 93
                </a>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <svg
                  className="w-6 h-6 text-[var(--secondary)]"
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
                <p className="text-[var(--primary)] font-medium">Dorian :</p>
                <a
                  href="tel:+33627860206"
                  className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors font-medium"
                >
                  06 27 86 02 06
                </a>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-[var(--primary)] to-[var(--dark)] text-white p-6 rounded-lg shadow-lg">
              <p className="font-semibold text-lg mb-2">
                Merci de confirmer votre présence avant le 31 décembre 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
