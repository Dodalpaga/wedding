'use client';

export default function Hero() {
  return (
    <section
      id="accueil"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Fond aurores boréales */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003b4e] via-[#034861] to-[#137e41]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#003b4e]/30 to-[#034861]/50"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/SD Logo.svg`}
          alt="Logo"
          className="h-24 w-24 mx-auto mb-8 object-contain drop-shadow-2xl brightness-0 invert"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />

        <h2 className="text-7xl md:text-9xl font-wedding text-[var(--accent)] mb-6 drop-shadow-lg">
          Solenne & Dorian
        </h2>
        <p className="text-xl md:text-2xl text-[var(--accent)] mb-8 font-light">
          Nous nous marions !
        </p>
        <div className="text-2xl md:text-3xl font-light text-[var(--accent)] mb-12">
          <p className="font-semibold">17 Juillet 2027</p>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-[var(--accent)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
