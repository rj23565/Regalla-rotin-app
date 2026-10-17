import { useId } from 'react';

/**
 * Regalia emblem — pure geometry and typography.
 * No animals, no photographs, no icon glyphs: only a faceted crest,
 * concentric royal rings and the serif monogram.
 */
export function RegaliaMark({ size = 40 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  const gold = `rg-gold-${uid}`;
  const crimson = `rg-crim-${uid}`;
  const sheen = `rg-sheen-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Regalia emblem">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="42%" stopColor="#f59e0b" />
          <stop offset="62%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={crimson} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#b91c1c" />
          <stop offset="55%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* outer crest shield */}
      <path
        d="M32 2 L58 11 V33 C58 47 47 57 32 62 C17 57 6 47 6 33 V11 Z"
        fill={`url(#${crimson})`}
        stroke={`url(#${gold})`}
        strokeWidth="2.4"
      />
      {/* faceted inner panel */}
      <path d="M32 9 L51 16 V33 C51 43 43 50.5 32 55 C21 50.5 13 43 13 33 V16 Z" fill="none" stroke={`url(#${gold})`} strokeWidth="1.1" opacity="0.75" />
      {/* upper chevron */}
      <path d="M22 20 L32 14 L42 20" fill="none" stroke={`url(#${gold})`} strokeWidth="1.6" strokeLinecap="round" />
      {/* monogram */}
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="21"
        fontWeight={700}
        fill={`url(#${gold})`}
      >
        R
      </text>
      {/* lower chevron */}
      <path d="M23 47 L32 52 L41 47" fill="none" stroke={`url(#${gold})`} strokeWidth="1.6" strokeLinecap="round" />
      {/* sheen */}
      <path d="M32 2 L58 11 V26 L6 26 V11 Z" fill={`url(#${sheen})`} />
    </svg>
  );
}

/** Full lockup: emblem + letterspaced wordmark with hairline rules. */
export function RegaliaLogo({ size = 76, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <span className="inline-flex flex-col items-center gap-2.5">
      <RegaliaMark size={size} />
      {showWord && (
        <span className="flex flex-col items-center gap-1.5">
          <span className="ry-gold font-display text-[19px] font-bold tracking-[0.4em]">REGALIA</span>
          <span className="flex items-center gap-2">
            <span className="ry-rule w-10" />
            <span className="h-1 w-1 rotate-45 bg-amber-500" />
            <span className="ry-rule w-10" />
          </span>
          <span className="font-monox text-[7.5px] font-bold uppercase tracking-[0.32em] text-slate-500">
            Routine Tracker
          </span>
        </span>
      )}
    </span>
  );
}
