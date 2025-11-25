'use client';

import Link from 'next/link';

export default function ReturnButton() {
  return (
    <div className="absolute top-4 left-4">
      <Link
        href="/"
        className="text-sm text-[#003b4e] hover:text-[#137e41] hover:underline transition-colors flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour à l’accueil
      </Link>
    </div>
  );
}
