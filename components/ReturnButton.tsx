'use client';

import Link from 'next/link';

interface ReturnButtonProps {
  label: string;
  href?: string; // facultatif : "/" par défaut
}

export default function ReturnButton({ label, href = '/' }: ReturnButtonProps) {
  return (
    <div className="container mx-auto px-4 mb-4">
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--secondary)] transition-colors group"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="font-semibold">{label}</span>
      </Link>
    </div>
  );
}
