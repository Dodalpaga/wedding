/* Illustrations SVG de la page Noces : icônes néon et tampons. */

export type NeonKind = 'neon' | 'food' | 'rail' | 'zen' | 'takoyaki' | 'canal' | 'drink' | 'okonomi' | 'dive' | 'coral' | 'turtle' | 'sunset';

export function NeonIcon({ kind }: { kind: NeonKind }) {
  switch (kind) {
    case 'neon':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={30 + i * 30} y={40 + (i % 2) * 30} width="18" height={120 - (i % 3) * 25} rx="9"
              className="fx-glow" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </svg>
      );
    case 'zen':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {[20, 40, 60, 80].map((r, i) => <circle key={r} cx="100" cy="100" r={r} className="fx-line fx-ripple" style={{ animationDelay: `${i * 0.5}s` }} />)}
          <circle cx="100" cy="100" r="10" className="fx-fill" />
        </svg>
      );
    case 'food':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <path d="M35 100 h130 a65 65 0 0 1 -130 0z" className="fx-fill" />
          <path d="M120 30 L80 95 M140 35 L95 95" className="fx-line" />
          <path d="M60 85 q20 -12 40 0 t40 0" className="fx-line" />
          {[80, 100, 120].map((x, i) => (
            <path key={x} d={`M${x} 70 q-8 -10 0 -20 q8 -10 0 -20`} className="fx-line fx-steam" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
        </svg>
      );
    case 'rail':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <path d="M10 130 H190" className="fx-line" />
          <path d="M30 125 V105 Q30 80 70 78 H165 Q180 80 180 105 V125 Z" className="fx-fill fx-rocking" />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={-40 + i * 70} y1="150" x2={i * 70} y2="150" className="fx-line fx-speed" />)}
        </svg>
      );
    case 'takoyaki':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <path d="M30 120 L170 120 L150 150 L50 150 Z" className="fx-fill" />
          {[65, 100, 135].map((x, i) => <circle key={x} cx={x} cy="104" r="16" className="fx-glow fx-bob" style={{ animationDelay: `${i * 0.3}s` }} />)}
          <path d="M150 40 L120 104" className="fx-line" />
          {[80, 120].map((x, i) => (
            <path key={x} d={`M${x} 78 q-8 -10 0 -20 q8 -10 0 -20`} className="fx-line fx-steam" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </svg>
      );
    case 'canal':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {[0, 1, 2].map((i) => <rect key={i} x={40 + i * 45} y={30 + i * 10} width="26" height={70 - i * 10} rx="4" className="fx-glow" style={{ animationDelay: `${i * 0.7}s` }} />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M20 ${130 + i * 16} q20 -8 40 0 t40 0 t40 0 t40 0`} className="fx-line fx-wave" style={{ animationDelay: `${i * 0.4}s` }} />)}
        </svg>
      );
    case 'drink':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <path d="M60 50 H140 L130 160 H70 Z" className="fx-fill" />
          <path d="M140 75 q28 0 28 25 t-28 25" className="fx-line" />
          <path d="M62 66 H138" className="fx-glow" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={80 + i * 13} cy="140" r="4" className="fx-line fx-bubble" style={{ animationDelay: `${i * 0.45}s` }} />)}
        </svg>
      );
    case 'okonomi':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <ellipse cx="100" cy="115" rx="70" ry="34" className="fx-fill" />
          <path d="M50 108 L70 98 L90 112 L110 98 L130 112 L150 100" className="fx-glow fx-draw" />
          <path d="M60 125 L80 115 L100 128 L120 115 L140 126" className="fx-line fx-draw" style={{ animationDelay: '.6s' }} />
          {/* Baguettes posées en travers de l'assiette */}
          <path d="M128 36 L96 104 M150 42 L112 106" className="fx-line" />
        </svg>
      );
    case 'dive':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {/* Masque de plongée et tuba, bulles qui remontent */}
          <path d="M48 92 Q48 70 72 70 H128 Q152 70 152 92 Q152 116 128 116 H116 Q106 116 100 106 Q94 116 84 116 H72 Q48 116 48 92 Z" className="fx-fill" />
          <path d="M60 88 Q60 80 70 80 H90 Q96 80 96 88 V96 Q96 104 88 104 H70 Q60 104 60 96 Z M104 88 Q104 80 110 80 H130 Q140 80 140 88 V96 Q140 104 130 104 H112 Q104 104 104 96 Z" className="fx-glow" />
          <path d="M156 96 V48 Q156 38 166 38" className="fx-line" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={166 + (i % 2) * 6} cy={30} r={3 + i} className="fx-line fx-bubble" style={{ animationDelay: `${i * 0.55}s` }} />)}
          <path d="M20 150 q20 -8 40 0 t40 0 t40 0 t40 0" className="fx-line fx-wave" />
        </svg>
      );
    case 'coral':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {/* Branches de corail et petits poissons */}
          <path d="M100 160 V112 M100 128 Q78 118 76 92 M76 104 Q62 98 60 80 M100 120 Q124 110 128 84 M128 98 Q144 92 146 74 M100 112 Q98 90 104 72" className="fx-glow" />
          <path d="M60 160 H140" className="fx-line" />
          {[0, 1].map((i) => (
            <path key={i} d={`M${40 + i * 92} ${60 + i * 14} q10 -8 20 0 q-10 8 -20 0 l-8 -6 v12 z`} className="fx-fill fx-wave" style={{ animationDelay: `${i * 0.8}s` }} />
          ))}
        </svg>
      );
    case 'turtle':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {/* Tortue de mer qui nage doucement */}
          <g className="fx-bob">
            <ellipse cx="100" cy="100" rx="42" ry="30" className="fx-fill" />
            <path d="M78 88 L100 78 L122 88 L122 112 L100 122 L78 112 Z M100 78 V122 M78 88 L122 112 M122 88 L78 112" className="fx-glow" />
            <ellipse cx="150" cy="96" rx="12" ry="9" className="fx-line" />
            <path d="M74 76 Q60 56 44 58 Q58 72 70 82 M74 124 Q60 144 44 142 Q58 128 70 118 M126 76 Q136 64 148 66 M126 124 Q136 136 148 134 M58 100 L44 104" className="fx-line" />
          </g>
          {[0, 1, 2].map((i) => <circle key={i} cx={164 + i * 4} cy={86 - i * 14} r={2 + i} className="fx-line fx-bubble" style={{ animationDelay: `${i * 0.7}s` }} />)}
        </svg>
      );
    case 'sunset':
      return (
        <svg viewBox="0 0 200 200" aria-hidden="true">
          {/* Soleil couchant sur la mer, reflets */}
          <path d="M52 112 A48 48 0 0 1 148 112 Z" className="fx-fill" />
          <path d="M40 112 H160" className="fx-glow" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${70 + i * 6} ${128 + i * 14} H${130 - i * 6}`} className="fx-line fx-wave" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          <path d="M150 56 q8 -6 16 0 M162 44 q6 -4 12 0" className="fx-line" />
        </svg>
      );
  }
}

export type StampKind = 'mer' | 'montagne' | 'torii' | 'onsen' | 'bambou' | 'lanterne' | 'cerf' | 'repas';

export function StampArt({ kind }: { kind: StampKind }) {
  switch (kind) {
    case 'mer':
      return (
        <g>
          {[0, 1, 2].map((row) => [0, 1, 2].map((col) => (
            <g key={`${row}-${col}`} transform={`translate(${28 + col * 22 - (row % 2) * 11} ${46 + row * 12})`}>
              <path d="M-11 0 a11 11 0 0 1 22 0" /><path d="M-7 0 a7 7 0 0 1 14 0" /><path d="M-3 0 a3 3 0 0 1 6 0" />
            </g>
          )))}
        </g>
      );
    case 'montagne':
      return <g><path d="M14 74 L40 34 Q50 26 60 34 L86 74 Z" /><path d="M40 34 L46 44 L52 38 L58 44 L60 34" /><circle cx="74" cy="26" r="6" /></g>;
    case 'torii':
      return <g><path d="M18 34 Q50 26 82 34" /><path d="M24 44 H76" /><path d="M32 34 V80 M68 34 V80" /><path d="M50 36 V44" /></g>;
    case 'onsen':
      return <g><path d="M20 66 Q50 92 80 66" /><path d="M34 60 q-8 -10 0 -20 q8 -10 0 -20" /><path d="M50 60 q-8 -10 0 -20 q8 -10 0 -20" /><path d="M66 60 q-8 -10 0 -20 q8 -10 0 -20" /></g>;
    case 'bambou':
      return <g><path d="M34 84 V16 M50 84 V22 M66 84 V12" /><path d="M30 42 H38 M30 64 H38 M46 36 H54 M46 60 H54 M62 30 H70 M62 56 H70" /><path d="M66 30 q12 -6 18 -2 M50 36 q-12 -6 -18 -2" /></g>;
    case 'lanterne':
      return <g><path d="M50 12 V20" /><path d="M38 20 H62" /><path d="M38 80 H62" /><ellipse cx="50" cy="50" rx="22" ry="30" /><path d="M29 40 H71 M28 50 H72 M29 60 H71" /><path d="M50 80 V88" /></g>;
    case 'cerf':
      return (
        <g>
          <path d="M38 40 Q50 34 62 40 L58 66 Q50 76 42 66 Z" />
          <path d="M40 38 L30 18 M34 26 L22 24 M60 38 L70 18 M66 26 L78 24" />
          <path d="M38 44 L26 46 M62 44 L74 46" />
          <circle cx="45" cy="52" r="1.5" /><circle cx="55" cy="52" r="1.5" />
          <path d="M46 84 Q50 78 54 84" />
        </g>
      );
    case 'repas':
      return (
        <g>
          <path d="M16 50 H84 Q82 82 50 84 Q18 82 16 50 Z" />
          <path d="M28 58 q11 -6 22 0 t22 0" />
          <path d="M62 14 L44 46 M74 18 L54 46" />
          <path d="M34 40 q-4 -6 0 -12 M50 40 q-4 -6 0 -12" />
        </g>
      );
  }
}
