import React from 'react';

export function ShoVLogo({ className = "h-7", isWhite = false }) {
  const textColor = isWhite ? 'text-white' : 'text-[#151616]';

  return (
    <div className={`inline-flex items-center space-x-1.5 ${textColor} ${className}`}>
      {/* 3-Peak Slanted Mountain SVG matching the exact reference image */}
      <svg
        className="h-5 sm:h-6 w-auto flex-shrink-0"
        viewBox="0 0 140 75"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Peak 1 (Leftmost small peak) */}
        <path d="M 5 62 L 32 40 L 48 62 L 40 62 L 32 48 L 18 62 Z" />
        {/* Peak 2 (Center main tall peak) */}
        <path d="M 24 62 L 62 16 L 85 62 L 74 62 L 62 28 L 42 62 Z" />
        {/* Peak 3 (Right peak) */}
        <path d="M 58 62 L 98 32 L 128 62 L 115 62 L 98 44 L 78 62 Z" />
      </svg>

      {/* Official High-Contrast Serif SHO.V Wordmark */}
      <span
        className="font-serif text-xl sm:text-2xl tracking-[0.14em] uppercase font-normal leading-none select-none"
        style={{ fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', Georgia, serif" }}
      >
        S<span className="inline-block scale-x-95">H</span>O<span className="text-current text-lg sm:text-xl font-sans tracking-normal">.</span>V
      </span>
    </div>
  );
}
