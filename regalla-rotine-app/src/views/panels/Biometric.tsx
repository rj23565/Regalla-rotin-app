import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Award,
  Camera,
  Check,
  Dumbbell as DumbbellIcon,
  Layers,
  ShieldCheck as ShieldCheckIcon,
  TrendingUp as TrendingUpIcon,
  Dumbbell,
  Flame,
  Loader2,
  Ruler,
  ScanLine,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import type { CyberState } from '../../lib/cyber';
import {
  HYBRID_VARIANTS,
  LIMIT_TESTS,
  PhysiqueScan,
  SOMATOTYPES,
  SOMATOTYPE_CARDS,
  cmToImperial,
  detectPlateau,
  imperialToCm,
  placeTier,
  safeVolume,
  scanPhysique,
} from '../../lib/cyber';

type Updater = (u: (x: CyberState) => CyberState) => void;

/** Premium Lucide asset map for the four somatotypes. */
const SOMATOTYPE_ICONS: Record<string, typeof Layers> = {
  ectomorph: TrendingUpIcon,
  mesomorph: DumbbellIcon,
  endomorph: ShieldCheckIcon,
  hybrid: Layers,
};

/* ═══════════ BIOMETRIC ONBOARDING & SOMATOTYPE AI HUB ═══════════ */

export function BiometricHub({ s, setS }: { s: CyberState; setS: Updater }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState<PhysiqueScan | null>(null);
  const imperial = cmToImperial(s.heightCm);
  // Local editable buffers so imperial boxes never lock against the baseline.
  const [cmValue, setCmValue] = useState(s.heightCm > 0 ? String(s.heightCm) : '');
  const [ftValue, setFtValue] = useState(imperial.feet > 0 ? String(imperial.feet) : '');
  const [inValue, setInValue] = useState(imperial.inches > 0 ? String(imperial.inches) : '');
  const [wtValue, setWtValue] = useState(s.weightKg > 0 ? String(s.weightUnit === 'lbs' ? Math.round(s.weightKg * 2.20462 * 10) / 10 : s.weightKg) : '');

  const runScan = (f: File | null | undefined) => {
    if (!f) return;
    setScanning(true);
    setScan(null);
    setTimeout(() => {
      const res = scanPhysique(f.name, f.size, s.heightCm, s.weightKg);
      setScan(res);
      setS((x) => ({ ...x, somatotype: res.type }));
      setScanning(false);
    }, 1900);
  };

  const active = SOMATOTYPES.find((x) => x.id === s.somatotype);

  return (
    <section className="ry-plate p-5 md:p-6">
      <div className="ry-kicker"><Ruler size={13} className="text-amber-500" /> Biometric onboarding &amp; body-type AI</div>

      {/* unit inputs */}
      <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Height</span>
            <div className="flex overflow-hidden rounded-lg border border-amber-500/30">
              {(['cm', 'ft'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    setS((x) => ({ ...x, heightUnit: u }));
                    // Sync local editable buffers on unit switch so nothing locks.
                    if (u === 'cm') {
                      setCmValue(s.heightCm > 0 ? String(s.heightCm) : '');
                    } else {
                      const imp = cmToImperial(s.heightCm);
                      setFtValue(imp.feet > 0 ? String(imp.feet) : '');
                      setInValue(imp.inches > 0 ? String(imp.inches) : '');
                    }
                  }}
                  className={`px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${(s.heightUnit ?? 'cm') === u ? 'bg-amber-500 text-neutral-950' : 'cy-muted'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {(s.heightUnit ?? 'cm') === 'cm' ? (
            <input
              type="text"
              inputMode="decimal"
              value={cmValue}
              placeholder="170"
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, '');
                setCmValue(raw);
                if (raw === '') {
                  setS((x) => ({ ...x, heightCm: 0 }));
                  return;
                }
                const parsed = parseFloat(raw);
                if (!isNaN(parsed)) setS((x) => ({ ...x, heightCm: Math.min(230, Math.max(0, Math.round(parsed * 10) / 10)) }));
              }}
              className="ry-input mt-1.5 !px-3 !py-2"
            />
          ) : (
            <div className="mt-1.5 flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={ftValue}
                  placeholder="5"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setFtValue(raw);
                    if (raw === '') return;
                    const parsed = parseFloat(raw);
                    if (!isNaN(parsed)) setS((x) => ({ ...x, heightCm: imperialToCm(parsed, cmToImperial(x.heightCm).inches) }));
                  }}
                  className="ry-input !px-2 !py-2 text-center"
                />
              </div>
              <span className="self-center font-monox text-[10px] font-bold cy-muted">ft</span>
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={inValue}
                  placeholder="7"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setInValue(raw);
                    if (raw === '') return;
                    const parsed = parseFloat(raw);
                    if (!isNaN(parsed)) setS((x) => ({ ...x, heightCm: imperialToCm(cmToImperial(x.heightCm).feet, parsed) }));
                  }}
                  className="ry-input !px-2 !py-2 text-center"
                />
              </div>
              <span className="self-center font-monox text-[10px] font-bold cy-muted">in</span>
            </div>
          )}
          <div className="mt-1 font-monox text-[8px] font-bold uppercase tracking-[0.12em] cy-muted">
            {(s.heightUnit ?? 'cm') === 'cm'
              ? s.heightCm > 0
                ? `${cmToImperial(s.heightCm).feet}′ ${cmToImperial(s.heightCm).inches}″ equivalent`
                : 'Enter cm height'
              : `${s.heightCm.toFixed(1)} cm equivalent`}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Weight</span>
            <div className="flex overflow-hidden rounded-lg border border-amber-500/30">
              {(['kg', 'lbs'] as const).map((u) => (
                <button key={u} onClick={() => setS((x) => ({ ...x, weightUnit: u }))} className={`px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${s.weightUnit === u ? 'bg-amber-500 text-neutral-950' : 'cy-muted'}`}>{u}</button>
              ))}
            </div>
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={wtValue}
            placeholder={s.weightUnit === 'lbs' ? '160' : '72'}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, '');
              setWtValue(raw);
              if (raw === '') {
                setS((x) => ({ ...x, weightKg: 0 }));
                return;
              }
              const parsed = parseFloat(raw);
              if (!isNaN(parsed)) setS((x) => ({ ...x, weightKg: s.weightUnit === 'lbs' ? Math.round((parsed / 2.20462) * 10) / 10 : parsed }));
            }}
            className="ry-input mt-1.5 !px-3 !py-2"
          />
          <div className="mt-1 font-monox text-[8px] font-bold uppercase tracking-[0.12em] cy-muted">
            {(s.weightKg * (s.weightUnit === 'lbs' ? 1 : 2.20462)).toFixed(1)} {s.weightUnit === 'lbs' ? 'lbs' : 'kg'} equivalent
          </div>
        </div>
      </div>

      {/* somatotype selector — four definite types, royal cards */}
      <div className="mt-4">
        <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Body type · pick your baseline</span>
        <div className="mt-2 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {SOMATOTYPE_CARDS.map((card) => {
            const detail = SOMATOTYPES.find((st) => st.id === card.id)!;
            const on = s.somatotype === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setS((x) => ({ ...x, somatotype: card.id }))}
                className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-neutral-600 ${
                  on
                    ? 'border-amber-500 bg-gradient-to-br from-amber-500/[0.09] to-neutral-900 shadow-[0_0_34px_-10px_rgba(245,158,11,0.75)] hover:border-amber-400'
                    : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900/70'
                }`}
              >
                {on && <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}
                <span className="flex items-start justify-between gap-2">
                  {(() => {
                    const IconCmp = SOMATOTYPE_ICONS[card.id];
                    return (
                      <span
                        className={`grid h-9 w-9 flex-none place-items-center rounded-lg border p-2 transition-colors duration-300 ${
                          on ? 'text-amber-500 bg-neutral-900/60 border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.4)]' : 'text-slate-400 bg-neutral-900/60 border-neutral-800'
                        } ${card.id === 'endomorph' && on ? 'text-red-500 bg-red-950/30 border-red-700/50' : ''}`}
                      >
                        <IconCmp size={17} strokeWidth={2.4} />
                      </span>
                    );
                  })()}
                  {on ? (
                    <span className="grid h-5 w-5 flex-none place-items-center rounded-full border border-amber-500/60 bg-transparent">
                      <Check size={11} strokeWidth={3} className="text-amber-500" />
                    </span>
                  ) : (
                    <span className="h-5 w-5 flex-none rounded-full border border-neutral-800 bg-transparent" />
                  )}
                </span>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className={`font-display text-[15.5px] font-bold leading-tight ${on ? 'text-slate-100' : 'text-slate-200'}`}>{detail.label}</span>
                  <span className="font-monox text-[7px] font-bold uppercase tracking-[0.14em]" style={{ color: card.accent }}>{detail.epithet}</span>
                </div>
                <p className={`mt-1 text-[11.5px] font-medium leading-snug ${on ? 'text-slate-300' : 'text-slate-400'}`}>{card.subtitle}</p>
                <p className={`mt-1.5 text-[11px] font-medium leading-snug ${on ? 'text-slate-300' : 'text-slate-400'}`}>{card.body}</p>
                <div className={`mt-3 rounded-lg border px-2 py-1.5 ${on ? 'border-amber-500/40 bg-amber-500/10' : 'border-neutral-800 bg-neutral-950/60'}`}>
                  <div className="font-monox text-[7px] font-bold uppercase tracking-[0.16em] cy-muted">Macro strategy</div>
                  <div className={`mt-0.5 text-[10.5px] font-bold leading-snug ${on ? 'text-amber-400' : 'text-slate-300'}`}>{card.macro}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* physique scanner */}
      <div className="mt-4">
        <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Don&apos;t know your type? Scan a full-body photo</span>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); void runScan(e.dataTransfer.files?.[0]); }}
          className="mt-2 cursor-pointer rounded-xl border-2 border-dashed border-amber-500/35 cy-shell px-4 py-6 text-center transition-colors hover:border-amber-500"
        >
          {scanning ? (
            <div>
              <Loader2 size={22} className="mx-auto animate-spin text-amber-500" />
              <p className="mt-2 font-display text-[14px] font-bold cy-title">Mapping body proportions…</p>
              <p className="mt-0.5 font-monox text-[9px] font-bold uppercase tracking-[0.16em] cy-muted">analysing limb length · frame width · mass distribution</p>
            </div>
          ) : (
            <div>
              <Camera size={22} className="mx-auto text-amber-500" />
              <p className="mt-2 text-[13px] font-bold cy-title">Drop a full-body photo or click to upload</p>
              <p className="mt-0.5 text-[11.5px] font-medium cy-muted">The AI names your somatotype and locks your profile</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void runScan(e.target.files?.[0]); e.target.value = ''; }} />
        <AnimatePresence>
          {scan && !scanning && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border-2 border-amber-500/50 bg-amber-500/[0.07] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-display text-[15px] font-bold text-amber-500">
                  <ScanLine size={15} /> {SOMATOTYPES.find((x) => x.id === scan.type)?.label}
                  {scan.variant && <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-amber-600">· {HYBRID_VARIANTS.find((v) => v.id === scan.variant)?.label}</span>}
                </span>
                <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-amber-600">{Math.round(scan.confidence * 100)}% confidence</span>
              </div>
              <p className="mt-1.5 text-[12.5px] font-medium leading-snug cy-soft">{scan.rationale}</p>
              <div className="mt-2.5 space-y-1.5">
                {scan.breakdown.map((b) => (
                  <div key={b} className="flex items-start gap-2 rounded-lg cy-shell border border-amber-500/20 px-2.5 py-2">
                    <Activity size={11} className="mt-0.5 flex-none text-amber-500" />
                    <span className="text-[11.5px] font-medium leading-snug cy-soft">{b}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 rounded-lg border border-emerald-700/40 bg-emerald-950/20 px-3 py-2 text-[12px] font-semibold italic leading-snug text-emerald-300">{scan.encouragement}</p>
              <p className="mt-2 flex items-center gap-1.5 font-monox text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-400"><Check size={11} /> Profile locked · nutrition and training plan updated instantly</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* frustration-free plan */}
      <div className="mt-4 rounded-xl border-2 border-amber-500/25 bg-amber-500/[0.04] p-3.5">
        <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-amber-600"><Sparkles size={12} /> Agentic plan synthesis</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {[
            ['Body type', active?.label ?? '—'],
            ['Safe volume', safeVolume(s.tier, s.lifestyle ?? 'normal')],
            ['Injury limits', (s.injuries ?? []).length === 0 ? 'None — full pool' : `${(s.injuries ?? []).length} flagged`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg cy-shell border border-amber-500/20 px-2.5 py-2">
              <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] cy-muted">{k}</div>
              <div className="mt-0.5 text-[11.5px] font-bold cy-title">{v}</div>
            </div>
          ))}
        </div>
        {active && (
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg cy-shell border border-amber-500/20 px-2.5 py-2">
              <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] text-amber-600">Nutrition strategy</div>
              <div className="mt-0.5 text-[11px] font-medium leading-snug cy-soft">{active.nutrition}</div>
            </div>
            <div className="rounded-lg cy-shell border border-amber-500/20 px-2.5 py-2">
              <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] text-amber-600">Training strategy</div>
              <div className="mt-0.5 text-[11px] font-medium leading-snug cy-soft">{active.training}</div>
            </div>
          </div>
        )}
        <p className="mt-2 text-[11px] font-medium leading-snug cy-muted">
          Combined with your injury flags and lifestyle into one sustainable volume — beginners are never handed impossible loads, so motivation stays high.
        </p>
      </div>
    </section>
  );
}

/* ═══════════ LIMIT-BREAK THRESHOLD TESTER ═══════════ */

export function LimitTester({ s, setS }: { s: CyberState; setS: Updater }) {
  const [open, setOpen] = useState(false);
  const scores = s.limitScores ?? {};
  const placement = placeTier(scores);
  const plateau = detectPlateau(s.prHistory ?? []);

  const submit = () => {
    setS((x) => {
      const nextScores = { ...(x.limitScores ?? {}) };
      const stamped = Date.now();
      const history = [...(x.prHistory ?? [])];
      Object.entries(nextScores).forEach(([id, v]) => {
        if (v > 0) history.push({ id: `pr_${id}_${stamped}`, at: stamped, value: v });
      });
      return { ...x, limitScores: nextScores, prHistory: history.slice(-30), tier: Math.max(x.tier, placement.tier) as CyberState['tier'] };
    });
    setOpen(false);
  };

  return (
    <section className="ry-plate p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="ry-kicker"><Dumbbell size={13} className="text-amber-500" /> Limit-break threshold tester</div>
        <button onClick={() => setOpen(true)} className="ry-btn !py-2"><Flame size={13} /> Test your limits</button>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {LIMIT_TESTS.map((t) => {
          const val = scores[t.id] ?? 0;
          const ok = val >= t.target;
          const relevant = t.tier <= s.tier;
          return (
            <div key={t.id} className={`rounded-xl border-2 px-3 py-2.5 ${ok ? 'border-amber-500/50 bg-amber-500/[0.06]' : relevant ? 'border-amber-500/25 cy-shell' : 'cy-hair cy-shell opacity-60'}`}>
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-monox text-[7px] font-bold uppercase tracking-[0.12em] cy-muted">Tier {t.tier}</span>
                {ok && <Check size={11} className="text-amber-500" />}
              </div>
              <div className="mt-0.5 text-[11px] font-bold leading-tight cy-title">{t.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`ry-num text-[17px] ${ok ? 'text-amber-500' : 'cy-title'}`}>{val}</span>
                <span className="font-monox text-[8.5px] font-bold cy-muted">/ {t.target} {t.unit === 'reps' ? 'reps' : 's'}</span>
              </div>
              <div className="ry-bar mt-1.5 !h-1"><div style={{ width: `${Math.min(100, (val / t.target) * 100)}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 rounded-xl border-2 border-amber-500/30 bg-amber-500/[0.05] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12.5px] font-bold cy-title"><Award size={14} className="text-amber-500" /> Algorithmic placement · Tier {placement.tier}</span>
          <span className="font-monox text-[9px] font-bold uppercase tracking-[0.12em] cy-muted">{placement.passed.length}/{LIMIT_TESTS.length} tests cleared</span>
        </div>
        <p className="mt-1.5 text-[12px] font-medium leading-snug cy-muted">
          {placement.tier === 3
            ? 'Elite Execution unlocked — all six threshold tests cleared. Maintain skill density and deload every fourth week.'
            : placement.tier === 2
              ? 'Solid Foundation reached. Clear the three Tier 2 tests to unlock Elite Execution.'
              : 'Ground Zero placement — joint resilience first. Pass the three Tier 1 tests to advance.'}
        </p>
      </div>

      {/* plateau tracker */}
      <div className={`mt-3 rounded-xl border-2 p-3.5 ${plateau.stalled ? 'border-red-700/50 bg-red-950/20' : 'border-emerald-700/40 bg-emerald-950/15'}`}>
        <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.16em]">
          {plateau.stalled ? <TriangleAlert size={12} className="text-red-400" /> : <TrendingUp size={12} className="text-emerald-400" />}
          <span className={plateau.stalled ? 'text-red-400' : 'text-emerald-400'}>Limit-breaker PR tracker</span>
        </div>
        <p className="mt-1.5 text-[12px] font-medium leading-snug cy-soft">{plateau.note}</p>
        {plateau.scheme && (
          <div className="mt-2 rounded-lg border border-red-700/40 bg-neutral-950/50 px-3 py-2.5">
            <div className="font-monox text-[8.5px] font-bold uppercase tracking-[0.14em] text-red-400">Injected breakthrough scheme</div>
            <p className="mt-1 text-[12px] font-semibold leading-snug cy-soft">{plateau.scheme}</p>
            <p className="mt-1 font-monox text-[8px] font-bold uppercase tracking-[0.12em] cy-muted">Added to this week&apos;s calendar automatically</p>
          </div>
        )}
        {(s.prHistory ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...(s.prHistory ?? [])].slice(-6).map((r) => (
              <span key={r.id} className="rounded-md border border-amber-500/25 px-1.5 py-0.5 font-monox text-[8px] font-bold text-amber-600">
                {new Date(r.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {r.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* test modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-neutral-950/85" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(560px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto">
              <div className="ry-frame">
                <div className="px-5 py-5 md:px-6">
                  <div className="flex items-center justify-between">
                    <span className="ry-kicker">Max-effort AMRAP &amp; timed holds</span>
                    <button onClick={() => setOpen(false)} className="ry-ghost !px-2 !py-1"><X size={12} /></button>
                  </div>
                  <p className="mt-2 text-[12.5px] font-medium leading-relaxed cy-muted">
                    Run each test fresh, not after training. Enter your absolute best — the engine places your tier from these numbers and logs a personal record.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {LIMIT_TESTS.map((t) => (
                      <div key={t.id} className="rounded-xl border-2 border-amber-500/25 cy-shell p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[12.5px] font-bold cy-title">{t.name}</span>
                          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-monox text-[8px] font-bold uppercase text-amber-600">target {t.target} {t.unit === 'reps' ? 'reps' : 's'}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium leading-snug cy-muted">{t.cue}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={scores[t.id] ?? 0}
                            onChange={(e) => setS((x) => ({ ...x, limitScores: { ...(x.limitScores ?? {}), [t.id]: Math.max(0, Number(e.target.value)) } }))}
                            className="ry-input !w-24 !pl-3 !py-1.5 text-center"
                          />
                          <span className="font-monox text-[9px] font-bold uppercase cy-muted">{t.unit === 'reps' ? 'reps' : 'seconds'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={submit} className="ry-btn mt-4 w-full"><Trophy size={13} /> Submit tests &amp; place tier</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

export const _icons = [Activity, ArrowRight, Upload, Sparkles];
