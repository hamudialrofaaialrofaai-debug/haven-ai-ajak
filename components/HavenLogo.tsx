import React from 'react';

interface HavenLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const HavenLogo: React.FC<HavenLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* 3D Gold H Gemstone Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Master Gold Radial Glow */}
            <radialGradient id="gemInnerGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="1" />
            </radialGradient>

            {/* Facet Light Refraction */}
            <linearGradient id="goldLightSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#b45309" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#451a03" stopOpacity="1" />
            </linearGradient>

            {/* Deep Gem Shadow Facet */}
            <linearGradient id="gemFacetDark" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#291203" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Gem Edge Highlight */}
            <linearGradient id="goldTrim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Outer Aura Glow Filter */}
            <filter id="gemBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Brilliant Cut Outer Gem Outline */}
          <polygon
            points="50,4 88,24 88,76 50,96 12,76 12,24"
            fill="url(#gemFacetDark)"
            stroke="url(#goldTrim)"
            strokeWidth="2"
            filter="url(#gemBloom)"
          />

          {/* Crown Facets (Top, Sides, Bottom) */}
          <polygon points="50,4 88,24 72,36 50,18" fill="url(#goldLightSheen)" opacity="0.85" />
          <polygon points="12,24 50,4 50,18 28,36" fill="#fef3c7" opacity="0.75" />
          <polygon points="12,24 28,36 28,64 12,76" fill="url(#gemFacetDark)" opacity="0.9" />
          <polygon points="88,24 88,76 72,64 72,36" fill="url(#gemFacetDark)" opacity="0.75" />
          <polygon points="12,76 28,64 50,82 50,96" fill="#78350f" opacity="0.95" />
          <polygon points="88,76 50,96 50,82 72,64" fill="url(#goldLightSheen)" opacity="0.8" />

          {/* Table (Central Facet Tabletop) */}
          <polygon
            points="50,18 72,36 72,64 50,82 28,64 28,36"
            fill="url(#gemInnerGlow)"
            stroke="#fde68a"
            strokeWidth="1.2"
          />

          {/* Specular Shimmer Prism */}
          <polygon
            points="50,22 68,36 52,50 36,36"
            fill="#ffffff"
            opacity="0.25"
          />

          {/* The Gold "H" Monogram Inscription */}
          <g transform="translate(0, 0)" filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.85))">
            {/* Left Column */}
            <path
              d="M38 34 L43 34 L43 66 L38 66 Z"
              fill="url(#goldTrim)"
              stroke="#fffbeb"
              strokeWidth="0.8"
            />
            {/* Right Column */}
            <path
              d="M57 34 L62 34 L62 66 L57 66 Z"
              fill="url(#goldTrim)"
              stroke="#fffbeb"
              strokeWidth="0.8"
            />
            {/* Center Bridge with Diamond Notch */}
            <path
              d="M43 47.5 L57 47.5 L57 52.5 L43 52.5 Z"
              fill="#fffbeb"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            {/* Center Gem Sparkle Star */}
            <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Haven
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
              VIP
            </span>
          </span>
          <span className="text-[10px] tracking-wide text-neutral-400 font-mono mt-0.5">
            Creative & Cognitive AI
          </span>
        </div>
      )}
    </div>
  );
};

export default HavenLogo;
