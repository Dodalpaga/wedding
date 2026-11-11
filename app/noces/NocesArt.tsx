/* Illustrations SVG de la page Noces : icônes néon et tampons. */

export type NeonKind = 'neon' | 'food' | 'rail' | 'zen' | 'takoyaki' | 'canal' | 'drink' | 'okonomi';

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
          <path d="M150 40 L170 60 L120 110" className="fx-line" />
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
