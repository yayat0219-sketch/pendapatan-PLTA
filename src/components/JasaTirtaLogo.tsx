import React from 'react';

interface JasaTirtaLogoProps {
  className?: string;
}

export function JasaTirtaLogo({ className = "h-8 w-auto" }: JasaTirtaLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 310 70" 
      className={className}
      id="jasa-tirta-vector-logo"
    >
      <defs>
        {/* Gradient for blue water droplet */}
        <linearGradient id="pjtDropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00b0ff" />
          <stop offset="100%" stopColor="#0051cb" />
        </linearGradient>
        
        {/* Gradient for red fire/energy accent */}
        <linearGradient id="pjtRedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff3a3a" />
          <stop offset="100%" stopColor="#c50000" />
        </linearGradient>

        {/* Gradient for bottom water ripples */}
        <linearGradient id="pjtRippleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>
      </defs>

      <g transform="translate(4, -2)">
        {/* WATER DROPLET ICON GROUP */}
        <g transform="translate(5, 10)">
          {/* Bottom Green Water Ripple arcs (Concentric semicircles) */}
          <path 
            d="M 2,42 A 25,12 0 0,0 52,42" 
            fill="none" 
            stroke="url(#pjtRippleGradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          <path 
            d="M 9,45 A 18,8 0 0,0 45,45" 
            fill="none" 
            stroke="url(#pjtRippleGradient)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />

          {/* Droplet outer body (Blue gradient) */}
          <path 
            d="M 27,2 C 38,15 46,24 46,32 A 19,19 0 0,1 8,32 C 8,24 16,15 27,2 Z" 
            fill="url(#pjtDropGradient)" 
          />

          {/* Swipe Red Ascent on the right curve */}
          <path 
            d="M 27,2 C 34,10 40,18 41,25 C 42,30 39,35 35,37 C 41,34 45,27 42,19 C 39,12 32,5 27,2 Z" 
            fill="url(#pjtRedGradient)" 
          />

          {/* Inner droplet (White space core) */}
          <path 
            d="M 27,12 C 32,19 36,24 36,29 A 9,9 0 0,1 18,29 C 18,24 22,19 27,12 Z" 
            fill="#ffffff" 
          />
        </g>

        {/* LOGO TEXT GROUP */}
        {/* "Jasa" in vibrant cyan/light-blue */}
        <text 
          x="72" 
          y="35" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="800" 
          fontSize="26" 
          letterSpacing="-0.3"
          fill="#00a3e0"
        >
          Jasa
        </text>

        {/* "Tirta II" in professional navy-blue */}
        <text 
          x="132" 
          y="35" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="26" 
          letterSpacing="-0.3"
          fill="#002d84"
        >
          Tirta II
        </text>

        {/* Tagline "Air Untuk Menghidupi Negeri" set in elegant serif italics */}
        <text 
          x="72" 
          y="55" 
          fontFamily="Georgia, 'Times New Roman', serif" 
          fontStyle="italic" 
          fontSize="13" 
          fontWeight="600"
          letterSpacing="0.1"
          fill="#1e293b"
        >
          Air Untuk Menghidupi Negeri
        </text>
      </g>
    </svg>
  );
}
