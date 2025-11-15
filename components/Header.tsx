'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 w-full backdrop-blur-md shadow-lg z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 border-b border-[var(--primary)]/10'
          : 'bg-[var(--primary)]/98 border-b border-[var(--dark)]/20'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              {/* Logo blanc (visible sur fond aurore) */}
              <img
                src="/SD Logo.svg"
                alt="Logo"
                className={`absolute inset-0 h-10 w-10 object-contain brightness-0 invert transition-opacity duration-300 ${
                  scrolled ? 'opacity-0' : 'opacity-100'
                }`}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              {/* Logo bleu (visible sur fond blanc) */}
              <img
                src="/SD Logo.svg"
                alt="Logo"
                className={`absolute inset-0 h-10 w-10 object-contain transition-opacity duration-300 ${
                  scrolled ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(13%) sepia(48%) saturate(2084%) hue-rotate(165deg) brightness(95%) contrast(101%)',
                }}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <h1
              className={`text-2xl font-wedding transition-colors duration-300 ${
                scrolled ? 'text-[var(--primary)]' : 'text-[var(--accent)]'
              }`}
            >
              Solenne & Dorian
            </h1>
          </div>

          {/* Menu desktop */}
          <ul className="hidden md:flex gap-8">
            <li>
              <button
                onClick={() => scrollToSection('accueil')}
                className={`transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Accueil
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('infos')}
                className={`transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Informations
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('programme')}
                className={`transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Programme
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('contact')}
                className={`transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Contact
              </button>
            </li>
          </ul>

          {/* Burger menu mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden transition-colors duration-300 ${
              scrolled ? 'text-[var(--primary)]' : 'text-[var(--accent)]'
            }`}
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <ul className="md:hidden mt-4 space-y-2">
            <li>
              <button
                onClick={() => scrollToSection('accueil')}
                className={`block py-2 transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Accueil
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('infos')}
                className={`block py-2 transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Informations
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('programme')}
                className={`block py-2 transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Programme
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('contact')}
                className={`block py-2 transition-colors duration-300 ${
                  scrolled
                    ? 'text-[var(--primary)] hover:text-[var(--dark)]'
                    : 'text-[var(--accent)] hover:text-[var(--dark)]'
                }`}
              >
                Contact
              </button>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
