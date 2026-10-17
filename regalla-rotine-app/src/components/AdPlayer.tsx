import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, SkipForward, X } from 'lucide-react';
import type { AdCampaign, CyberState } from '../lib/cyber';

type Updater = (u: (x: CyberState) => CyberState) => void;

/**
 * In-house campaign player. Runs the operator's own image or video ads with a
 * user-respecting skip timer and an optional hard close, so nobody is trapped.
 */
export function AdPlayer({ s, setS }: { s: CyberState; setS: Updater }) {
  const pool = useMemo(
    () => (s.ads.customOn ? (s.ads.campaigns ?? []).filter((c) => c.active && c.media) : []),
    [s.ads.customOn, s.ads.campaigns],
  );
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const counted = useRef<string | null>(null);

  const visible = pool.filter((c) => !dismissed.includes(c.id));
  const ad: AdCampaign | undefined = visible[idx % Math.max(1, visible.length)];

  // skip countdown
  useEffect(() => {
    if (!ad) return;
    setElapsed(0);
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [ad?.id]);

  // impression tracking — once per campaign mount
  useEffect(() => {
    if (!ad || counted.current === ad.id) return;
    counted.current = ad.id;
    setS((x) => ({
      ...x,
      ads: { ...x.ads, campaigns: (x.ads.campaigns ?? []).map((c) => (c.id === ad.id ? { ...c, impressions: c.impressions + 1 } : c)) },
    }));
  }, [ad?.id]);

  if (!ad) return null;

  const canSkip = elapsed >= (ad.skipAfter ?? 5);
  const remain = Math.max(0, (ad.skipAfter ?? 5) - elapsed);

  const skip = () => {
    setS((x) => ({
      ...x,
      ads: { ...x.ads, campaigns: (x.ads.campaigns ?? []).map((c) => (c.id === ad.id ? { ...c, skips: c.skips + 1 } : c)) },
    }));
    counted.current = null;
    setIdx((i) => i + 1);
  };

  const close = () => {
    setDismissed((d) => [...d, ad.id]);
    counted.current = null;
  };

  const click = () => {
    setS((x) => ({
      ...x,
      ads: { ...x.ads, campaigns: (x.ads.campaigns ?? []).map((c) => (c.id === ad.id ? { ...c, clicks: c.clicks + 1 } : c)) },
    }));
    if (ad.link) window.open(ad.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={ad.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-amber-500/[0.05]"
      >
        <div className="flex items-center justify-between border-b border-amber-500/20 px-3 py-2">
          <span className="flex items-center gap-2 font-monox text-[8px] font-bold uppercase tracking-[0.2em] text-amber-600">
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-neutral-950">AD</span>
            {ad.name}
          </span>
          <div className="flex items-center gap-1.5">
            {canSkip ? (
              <button onClick={skip} className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-neutral-950/50 px-2.5 py-1 font-monox text-[9px] font-bold uppercase tracking-[0.1em] text-amber-500 transition-colors hover:bg-amber-500/15">
                <SkipForward size={11} /> Skip ad
              </button>
            ) : (
              <span className="rounded-lg border border-neutral-700 px-2.5 py-1 font-monox text-[9px] font-bold uppercase tracking-[0.1em] cy-muted">
                Skip in {remain}s
              </span>
            )}
            {ad.closable && (
              <button onClick={close} aria-label="Close this ad" className="grid h-6 w-6 place-items-center rounded-lg border border-neutral-700 cy-muted transition-colors hover:border-red-700 hover:text-red-500">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <button onClick={click} className="block w-full text-left">
          {ad.kind === 'video' ? (
            <video src={ad.media} autoPlay muted loop playsInline className="max-h-[260px] w-full object-cover" />
          ) : (
            <img src={ad.media} alt={ad.name} className="max-h-[260px] w-full object-cover" />
          )}
          {ad.caption && (
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
              <span className="text-[12.5px] font-semibold leading-snug cy-title">{ad.caption}</span>
              {ad.link && <ExternalLink size={13} className="flex-none text-amber-500" />}
            </div>
          )}
        </button>

        {!canSkip && (
          <div className="h-1 w-full bg-neutral-900">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-yellow-400"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, (elapsed / Math.max(1, ad.skipAfter ?? 5)) * 100)}%` }}
              transition={{ duration: 0.9 }}
            />
          </div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
