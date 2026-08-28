import React from 'react';

export const NewListingsIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-28" }) => (
  <svg viewBox="0 0 200 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sky & Clouds */}
    <ellipse cx="60" cy="30" rx="18" ry="8" fill="white" fillOpacity="0.85" />
    <ellipse cx="140" cy="22" rx="14" ry="6" fill="white" fillOpacity="0.7" />
    <ellipse cx="152" cy="24" rx="10" ry="5" fill="white" fillOpacity="0.75" />
    
    {/* Background Trees */}
    <circle cx="82" cy="72" r="16" fill="#4d7c6f" />
    <circle cx="152" cy="70" r="18" fill="#4d7c6f" />
    <rect x="150" y="80" width="4" height="24" fill="#6d5345" />

    {/* Modern House */}
    <path d="M96 52 L144 38 L144 98 L96 98 Z" fill="#3c4c59" />
    <path d="M96 52 L68 70 L68 98 L96 98 Z" fill="#4a5c6b" />
    <path d="M64 70 L96 50 L146 36 L148 40 L96 54 L66 73 Z" fill="#2d3a45" />
    
    {/* House Door & Window */}
    <path d="M84 98 C84 84 94 84 94 98 Z" fill="#ffffff" />
    <rect x="110" y="52" width="10" height="10" rx="1" fill="#e2ecf0" />
    <rect x="125" y="52" width="10" height="10" rx="1" fill="#e2ecf0" />
    <rect x="110" y="68" width="10" height="10" rx="1" fill="#e2ecf0" />
    <rect x="125" y="68" width="10" height="10" rx="1" fill="#e2ecf0" />

    {/* Ground */}
    <path d="M10 102 C60 98 140 98 190 102 L190 114 L10 114 Z" fill="#c3d5da" />

    {/* For Sale Sign */}
    <rect x="36" y="76" width="30" height="15" rx="1.5" fill="white" stroke="#c0392b" strokeWidth="1.5" />
    <rect x="50" y="90" width="3" height="22" fill="#7f8c8d" />
    <text x="51" y="87" fill="#c0392b" fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">FOR SALE</text>

    {/* Real Estate Agent placing sign */}
    <circle cx="68" cy="62" r="4.5" fill="#f5d6ba" />
    <path d="M65 59 C65 57 71 57 71 59 L71 61 L65 61 Z" fill="#2c3e50" />
    <path d="M64 67 L72 67 L74 86 L62 86 Z" fill="#1b2a38" />
    <path d="M66 67 L68 76 L70 67 Z" fill="#3498db" />
    <path d="M67 69 L69 74 L67 76 Z" fill="#e74c3c" /> {/* Red Tie */}
    <path d="M63 68 L53 76 L55 79 L64 72 Z" fill="#1b2a38" /> {/* Arm */}
    <circle cx="52" cy="77" r="2" fill="#f5d6ba" />
    <path d="M65 86 L63 104 L60 104 L62 86" fill="#1b2a38" />
    <path d="M70 86 L73 103 L76 103 L73 86" fill="#1b2a38" />
    <ellipse cx="60" cy="104" rx="3.5" ry="1.5" fill="#2c3e50" />
    <ellipse cx="76" cy="103" rx="3.5" ry="1.5" fill="#2c3e50" />
  </svg>
);

export const PropertyViewingIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-28" }) => (
  <svg viewBox="0 0 200 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Clouds */}
    <ellipse cx="45" cy="24" rx="14" ry="6" fill="white" fillOpacity="0.8" />
    <ellipse cx="155" cy="28" rx="18" ry="7" fill="white" fillOpacity="0.85" />
    
    {/* Background Trees */}
    <circle cx="60" cy="65" r="15" fill="#4d7c6f" />
    <circle cx="145" cy="68" r="16" fill="#4d7c6f" />

    {/* House */}
    <path d="M102 44 L138 32 L138 88 L102 88 Z" fill="#3c4c59" />
    <path d="M102 44 L78 60 L78 88 L102 88 Z" fill="#4a5c6b" />
    <path d="M75 60 L102 42 L140 30 L142 34 L102 46 L76 62 Z" fill="#2d3a45" />
    <path d="M92 88 C92 76 100 76 100 88 Z" fill="#ffffff" />

    {/* Ground */}
    <path d="M10 94 C70 90 130 90 190 94 L190 114 L10 114 Z" fill="#c3d5da" />

    {/* Female Buyer (Left) */}
    <circle cx="62" cy="68" r="4" fill="#f5d6ba" />
    <path d="M59 65 C58 63 65 63 65 65 L66 70 L58 70 Z" fill="#2c3e50" />
    <path d="M58 72 L66 72 L68 88 L56 88 Z" fill="#3b7994" />
    <path d="M57 88 L57 104 L60 104 L60 88" fill="#f5d6ba" />
    <path d="M64 88 L64 104 L67 104 L67 88" fill="#f5d6ba" />
    <ellipse cx="58" cy="104" rx="3" ry="1.2" fill="#2c3e50" />
    <ellipse cx="66" cy="104" rx="3" ry="1.2" fill="#2c3e50" />

    {/* Real Estate Agent (Center) */}
    <circle cx="102" cy="64" r="4.5" fill="#f5d6ba" />
    <path d="M98 68 L106 68 L108 86 L96 86 Z" fill="#1b2a38" />
    <path d="M101 70 L103 76 L100 78 Z" fill="#e74c3c" /> {/* Red Tie blowing */}
    <path d="M105 70 L120 64 L122 67 L106 74 Z" fill="#1b2a38" /> {/* Pointing arm to house */}
    <circle cx="122" cy="65" r="1.8" fill="#f5d6ba" />
    <path d="M98 70 L86 74 L87 77 L98 75 Z" fill="#1b2a38" />
    <path d="M98 86 L97 104 L94 104 L95 86" fill="#1b2a38" />
    <path d="M104 86 L106 104 L109 104 L107 86" fill="#1b2a38" />
    <ellipse cx="95" cy="104" rx="3" ry="1.2" fill="#2c3e50" />
    <ellipse cx="108" cy="104" rx="3" ry="1.2" fill="#2c3e50" />

    {/* Male Buyer (Right) */}
    <circle cx="138" cy="68" r="4" fill="#f5d6ba" />
    <path d="M134 72 L142 72 L143 88 L133 88 Z" fill="#2c3e50" />
    <path d="M135 88 L135 104 L138 104 L138 88" fill="#1b2a38" />
    <path d="M140 88 L140 104 L143 104 L143 88" fill="#1b2a38" />
    <ellipse cx="136" cy="104" rx="3" ry="1.2" fill="#2c3e50" />
    <ellipse cx="142" cy="104" rx="3" ry="1.2" fill="#2c3e50" />
  </svg>
);

export const OfferToPurchaseIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-28" }) => (
  <svg viewBox="0 0 200 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background House */}
    <circle cx="160" cy="65" r="16" fill="#4d7c6f" />
    <path d="M142 46 L174 36 L174 88 L142 88 Z" fill="#3c4c59" />
    <path d="M142 46 L120 60 L120 88 L142 88 Z" fill="#4a5c6b" />
    <path d="M118 60 L142 44 L176 34 L178 38 L142 48 L119 62 Z" fill="#2d3a45" />
    
    {/* Windows & Door */}
    <path d="M132 88 C132 76 138 76 138 88 Z" fill="#ffffff" />
    <rect x="150" y="52" width="8" height="8" rx="1" fill="#e2ecf0" />
    <rect x="162" y="52" width="8" height="8" rx="1" fill="#e2ecf0" />

    {/* Ground */}
    <path d="M10 94 C70 90 130 90 190 94 L190 114 L10 114 Z" fill="#c3d5da" />

    {/* Big Arm Offering Money / Contract */}
    <path d="M0 64 L42 80 L36 98 L0 86 Z" fill="#204969" /> {/* Suit Sleeve */}
    <path d="M42 80 L52 84 L48 95 L36 98 Z" fill="#ffffff" /> {/* White Shirt Cuff */}
    
    {/* Hand */}
    <path d="M48 83 C54 80 66 82 74 85 C78 87 76 96 68 96 L48 94 Z" fill="#f5d6ba" />
    <circle cx="60" cy="85" r="4" fill="#f5d6ba" />
    <circle cx="68" cy="87" r="3.5" fill="#f5d6ba" />

    {/* Green Cash / Offer Document Stack */}
    <g transform="rotate(-8 82 80)">
      <rect x="66" y="66" width="38" height="24" rx="2.5" fill="#27ae60" stroke="#1e8449" strokeWidth="1.5" />
      <rect x="68" y="68" width="34" height="20" rx="1.5" fill="#2ecc71" />
      <circle cx="85" cy="78" r="5" fill="#27ae60" />
      <rect x="72" y="72" width="4" height="12" fill="#a9dfbf" />
      <rect x="94" y="72" width="4" height="12" fill="#a9dfbf" />
      
      {/* 2nd Stack Underneath */}
      <rect x="68" y="78" width="38" height="18" rx="2" fill="#1e8449" opacity="0.6" />
    </g>
  </svg>
);

export const AttorneyDocumentIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-28" }) => (
  <svg viewBox="0 0 200 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ground */}
    <path d="M10 102 C70 98 130 98 190 102 L190 114 L10 114 Z" fill="#c3d5da" />

    {/* Big Parchment Deed Scrolls */}
    <g transform="translate(18, 16)">
      {/* Scroll 1 */}
      <path d="M14 6 C28 0 46 0 54 8 L48 76 C40 68 22 68 8 76 Z" fill="#fdfefe" stroke="#d5dbdb" strokeWidth="1.5" />
      <line x1="18" y1="18" x2="44" y2="18" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="26" x2="42" y2="26" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="34" x2="45" y2="34" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="42" x2="38" y2="42" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="50" x2="43" y2="50" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />

      {/* Scroll 2 (Curled Front) */}
      <path d="M4 64 C18 56 36 56 46 64 L42 92 C32 84 14 84 0 92 Z" fill="#ffffff" stroke="#bdc3c7" strokeWidth="1.5" />
      <line x1="10" y1="72" x2="36" y2="72" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="79" x2="32" y2="79" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Attorney with Giant Red Pencil */}
    {/* Giant Pencil */}
    <g transform="rotate(-15 120 40)">
      <polygon points="56,38 152,38 152,48 56,48" fill="#d35400" />
      <polygon points="152,38 164,43 152,48" fill="#f5d6ba" />
      <polygon points="160,41 164,43 160,45" fill="#2c3e50" />
      <rect x="44" y="38" width="12" height="10" rx="1" fill="#e74c3c" /> {/* Eraser */}
      <rect x="53" y="38" width="3" height="10" fill="#bdc3c7" />
    </g>

    {/* Attorney Character */}
    <circle cx="140" cy="52" r="4.5" fill="#f5d6ba" />
    <path d="M136 49 C136 47 143 47 143 49 L144 53 L135 53 Z" fill="#2c3e50" />
    <path d="M135 56 L145 56 L147 78 L133 78 Z" fill="#1b2a38" />
    <path d="M138 58 L142 66 L139 68 Z" fill="#e74c3c" /> {/* Tie */}
    <path d="M135 58 L122 46 L125 43 L138 54 Z" fill="#1b2a38" /> {/* Left Arm holding pencil */}
    <path d="M143 58 L152 70 L149 72 L141 62 Z" fill="#1b2a38" /> {/* Right Arm */}
    
    {/* Briefcase in Hand */}
    <rect x="146" y="68" width="12" height="10" rx="1.5" fill="#5c4033" stroke="#3d2b1f" strokeWidth="1" />
    <path d="M150 68 L150 66 L154 66 L154 68" stroke="#3d2b1f" strokeWidth="1" fill="none" />

    {/* Legs */}
    <path d="M135 78 L134 102 L131 102 L132 78" fill="#1b2a38" />
    <path d="M143 78 L145 102 L148 102 L146 78" fill="#1b2a38" />
    <ellipse cx="132" cy="102" rx="3" ry="1.2" fill="#2c3e50" />
    <ellipse cx="147" cy="102" rx="3" ry="1.2" fill="#2c3e50" />
  </svg>
);

export const LodgementsIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-28" }) => (
  <svg viewBox="0 0 200 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ground */}
    <path d="M10 102 C70 98 130 98 190 102 L190 114 L10 114 Z" fill="#c3d5da" />

    {/* Massive Deeds Registration Parchment Document */}
    <path d="M72 18 C90 10 116 10 134 18 L126 94 C112 86 86 86 64 94 Z" fill="#fdfefe" stroke="#d5dbdb" strokeWidth="1.5" />
    <line x1="82" y1="30" x2="118" y2="30" stroke="#bdc3c7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="82" y1="38" x2="114" y2="38" stroke="#bdc3c7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="82" y1="46" x2="120" y2="46" stroke="#bdc3c7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="82" y1="54" x2="108" y2="54" stroke="#bdc3c7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="82" y1="62" x2="116" y2="62" stroke="#bdc3c7" strokeWidth="2.5" strokeLinecap="round" />

    {/* Official Red Deeds Wax Seal / Stamp */}
    <circle cx="106" cy="74" r="7" fill="#c0392b" />
    <circle cx="106" cy="74" r="5" fill="#e74c3c" />

    {/* Judicial / Registrar Gavel on Round Sounding Block */}
    {/* Base Sounding Block */}
    <ellipse cx="88" cy="88" rx="22" ry="7" fill="#4a2e18" stroke="#2c1a0c" strokeWidth="1.5" />
    <ellipse cx="88" cy="86" rx="20" ry="5.5" fill="#6d4726" />

    {/* Gavel Head & Handle */}
    <g transform="rotate(-28 76 66)">
      {/* Handle */}
      <rect x="72" y="62" width="46" height="5" rx="2.5" fill="#8c5835" stroke="#4a2e18" strokeWidth="1" />
      {/* Head */}
      <rect x="58" y="52" width="18" height="24" rx="3" fill="#6d4726" stroke="#3d2411" strokeWidth="1.5" />
      <rect x="56" y="50" width="22" height="4" rx="1.5" fill="#c0392b" />
      <rect x="56" y="74" width="22" height="4" rx="1.5" fill="#c0392b" />
    </g>

    {/* Attorney / Deeds Registrar Official with briefcase */}
    <circle cx="160" cy="54" r="4.5" fill="#f5d6ba" />
    <path d="M156 51 C156 49 163 49 163 51 L164 55 L155 55 Z" fill="#2c3e50" />
    <path d="M155 58 L165 58 L167 80 L153 80 Z" fill="#1b2a38" />
    <path d="M158 60 L162 68 L159 70 Z" fill="#e74c3c" /> {/* Tie */}
    <path d="M155 60 L144 54 L146 51 L158 58 Z" fill="#1b2a38" /> {/* Gesturing Hand */}
    <circle cx="143" cy="53" r="1.8" fill="#f5d6ba" />

    {/* Briefcase */}
    <rect x="166" y="70" width="12" height="10" rx="1.5" fill="#5c4033" stroke="#3d2b1f" strokeWidth="1" />
    <path d="M170 70 L170 68 L174 68 L174 70" stroke="#3d2b1f" strokeWidth="1" fill="none" />

    {/* Legs in dynamic walking pose */}
    <path d="M155 80 L150 102 L147 102 L152 80" fill="#1b2a38" />
    <path d="M163 80 L170 102 L173 102 L166 80" fill="#1b2a38" />
    <ellipse cx="148" cy="102" rx="3" ry="1.2" fill="#2c3e50" />
    <ellipse cx="172" cy="102" rx="3" ry="1.2" fill="#2c3e50" />
  </svg>
);
