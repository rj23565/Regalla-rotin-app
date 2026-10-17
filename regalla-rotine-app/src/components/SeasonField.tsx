// ─── Seasonal atmospheric field — snow drift / ember rise, CSS-driven ────────
import { useEffect, useState } from 'react';
import { useRegalia } from '../store';
import { resolveSeason } from '../lib/season';

interface Limn {
  x: number;
  y: number;
  s: number;
  d: number;
  o: number;
  t: number;
}

export default function SeasonField() {
  const setting = useRegalia((s) => s.season);
  const theme = useRegalia((s) => s.settings.theme);
  const [tick, setTick] = useState(0);

  const season = resolveSeason(setting);
  const isSnow = season === 'winter';

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 260);
    return () => clearInterval(iv);
  }, []);

  // 24 drifting motes — deterministic drift derived from tick + index
  const motes: Limn[] = Array.from({ length: 24 }, (_, i) => {
    const seed = i * 2654435761;
    const t = (tick * 0.5 + i * 7) % 100;
    return {
      x: ((seed % 97) + (isSnow ? 0 : -((tick * 0.15 + i) % 10))) + (isSnow ? 0 : 2),
      y: isSnow ? t : 100 - t,
      s: 2 + (seed % 3),
      d: 6 + (seed % 10) * 1.4,
      o: isSnow ? 0.25 + (seed % 4) * 0.1 : 0.12 + (seed % 3) * 0.08,
      t: (seed % 360) + tick * (isSnow ? 6 : -4) * (i % 2 ? 1 : -1),
    };
  });

  const dark = theme === 'obsidian';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {/* atmosphere wash */}
      <div
        className="absolute inset-0 opacity-90 transition-opacity duration-1000"
        style={{
          background: isSnow
            ? dark
              ? 'radial-gradient(120% 80% at 50% -10%, rgba(140,180,230,0.14), transparent 60%)'
              : 'radial-gradient(120% 80% at 50% -10%, rgba(150,190,235,0.22), transparent 60%)'
            : dark
              ? 'radial-gradient(120% 80% at 50% -10%, rgba(255,140,70,0.10), transparent 60%)'
              : 'radial-gradient(120% 80% at 50% -10%, rgba(255,160,90,0.16), transparent 60%)',
        }}
      />
      {/* drifting motes */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${((m.x % 96) + 96) % 96 + 2}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            opacity: m.o,
            background: isSnow ? (dark ? '#cfe0f4' : '#ffffff') : dark ? '#ffb066' : '#e0763a',
            filter: `blur(0.4px)`,
            transform: `translateX(${Math.sin((m.d + tick) * 0.6) * 8}px) rotate(${m.t}deg)`,
            boxShadow: isSnow ? '0 0 4px rgba(255,255,255,0.8)' : '0 0 6px rgba(255,120,50,0.6)',
            animation: `season-drift ${m.d}s linear infinite`,
            willChange: 'transform',
          }}
        />
      ))}
      <style>{`
        @keyframes season-drift {
          from { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(6px) rotate(14deg); }
          to { transform: translateX(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
