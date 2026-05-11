import React from "react";

export const KitsuneLogo = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fox-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="fox-dark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g stroke="var(--bg-card)" strokeWidth="1" strokeLinejoin="round">
        {/* Left Ear */}
        <polygon points="25,15 40,38 20,40" fill="url(#fox-gradient)" />
        <polygon points="25,15 32,32 25,32" fill="var(--bg-app)" opacity="0.4" />
        
        {/* Right Ear */}
        <polygon points="75,15 60,38 80,40" fill="url(#fox-gradient)" />
        <polygon points="75,15 68,32 75,32" fill="var(--bg-app)" opacity="0.4" />

        {/* Forehead */}
        <polygon points="20,40 50,25 80,40 50,55" fill="url(#fox-gradient)" />
        
        {/* Left cheek */}
        <polygon points="10,48 20,40 50,55 50,85 28,68" fill="url(#fox-dark)" />
        <polygon points="10,48 28,68 15,62" fill="var(--bg-card)" opacity="0.5" />

        {/* Right cheek */}
        <polygon points="90,48 80,40 50,55 50,85 72,68" fill="url(#fox-gradient)" />
        <polygon points="90,48 72,68 85,62" fill="var(--bg-card)" opacity="0.5" />

        {/* Lower snouts / white parts */}
        <polygon points="28,68 50,85 45,95 32,78" fill="var(--bg-app)" />
        <polygon points="72,68 50,85 55,95 68,78" fill="var(--bg-app)" />

        {/* Nose + Chin */}
        <polygon points="45,95 55,95 50,85" fill="var(--primary)" opacity="0.9" />

        {/* Left Eye */}
        <polygon points="28,52 42,58 35,48" fill="var(--bg-card)" />
        {/* Right Eye */}
        <polygon points="72,52 58,58 65,48" fill="var(--bg-card)" />
      </g>
    </svg>
  );
};
