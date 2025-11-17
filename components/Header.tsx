'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-[var(--accent)] shadow-lg z-50 border-b border-white/20">
      {' '}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/SD Logo.svg`}
                alt="Logo"
                className={`absolute inset-0 h-10 w-10 object-contain transition-opacity duration-300 `}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <h1 className="text-2xl font-wedding text-[var(--primary)]">
              Solenne & Dorian
            </h1>
          </div>

          {/* Menu desktop */}
          <ul className="hidden md:flex gap-8">
            <li>
              <Link
                href="/#accueil"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href="/#infos"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Information
              </Link>
            </li>
            <li>
              <Link
                href="/#programme"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Programme
              </Link>
            </li>
            <li>
              <Link
                href="/#contact"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/confirmation/"
                className="text-[var(--primary)] underline font-semibold hover:opacity-80 transition-opacity"
              >
                Confirmer
              </Link>
            </li>
          </ul>

          {/* Burger menu mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[var(--primary)]"
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
          <ul className="md:hidden mt-4 space-y-2 pb-2">
            <li>
              <Link
                href="/#accueil"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href="/#infos"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Information
              </Link>
            </li>
            <li>
              <Link
                href="/#programme"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Programme
              </Link>
            </li>
            <li>
              <Link
                href="/#contact"
                className="text-[var(--primary)] font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/confirmation/"
                className="text-[var(--primary)] underline font-semibold hover:opacity-80 transition-opacity"
                onClick={() => setMenuOpen(false)}
              >
                Confirmer
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
