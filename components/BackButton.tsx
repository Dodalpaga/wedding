'use client';

import { useRouter } from 'next/navigation';

export default function ReturnBackButton() {
  const router = useRouter();

  return (
    <div className="mb-2 ml-4">
      <button
        onClick={() => router.back()}
        className="inline-flex text-sm font-medium text-[#003b4e] hover:text-[#137e41] transition-colors items-center gap-1 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-sm border border-gray-100"
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
        Retour
      </button>
    </div>
  );
}
