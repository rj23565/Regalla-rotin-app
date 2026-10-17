import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Camera,
  Check,
  Droplets,
  Flame,
  Grid2x2,
  HeartPulse,
  ImagePlus,
  Scale,
  ScanLine,
  ShieldAlert,
  ShieldPlus,
  Trash2,
  TriangleAlert,
  Upload,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import type { CyberState } from '../../lib/cyber';
import {
  JOINT_SUPPORT,
  PROGRESS_SLOTS,
  SOMATOTYPES,
  bmi,
  calorieBudget,
  cmToImperial,
  dietBlueprint,
  imperialToCm,
  programTargets,
  scanLabel,
  scanMeal,
  waterTarget,
} from '../../lib/cyber';

/** Somatotype-adjusted carbohydrate target — Ectomorphs run high, Endomorphs low. */
function somaCarbs(s: CyberState): number {
  const base = programTargets(s).carb;
  const mult = s.somatotype === 'ectomorph' ? 1.18 : s.somatotype === 'endomorph' ? 0.74 : 1;
  return Math.round(base * mult);
}

type Updater = (u: (x: CyberState) => CyberState) => void;

function readFile(f: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.readAsDataURL(f);
  });
}

/* ═══════════ PANEL 3 · DIET, CALORIE & ALLERGY TRACKER ═══════════ */

export function DietPanel({ s, setS }: { s: CyberState; setS: Updater }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState(false);
  const budget = calorieBudget(s);
  const mass = bmi(s);
  const tgt = programTargets(s);
  const hazardMeal =  (s.meals ?? []).find((m) => m.blocked && m.hazard.length > 0);

  const imperial = cmToImperial(s.heightCm);
  // Local editable buffers so imperial boxes never lock against the baseline.
  const [cmValue, setCmValue] = useState(s.heightCm > 0 ? String(s.heightCm) : '');
  const [ftValue, setFtValue] = useState(imperial.feet > 0 ? String(imperial.feet) : '');
  const [inValue, setInValue] = useState(imperial.inches > 0 ? String(imperial.inches) : '');
  // Weight string-fallback buffer
  const [wtValue, setWtValue] = useState(s.weightKg > 0 ? String(s.weightUnit === 'lbs' ? Math.round(s.weightKg * 2.20462 * 10) / 10 : s.weightKg) : '');

  const ingest = async (f: File | null | undefined) => {
    if (!f) return;
    setScanning(true);
    const photo = await readFile(f);
    const log = scanMeal(f.name, f.size, s.allergies);
    // Allergy Shield Interceptor — hazard meals are blocked from the calorie ledger.
    const blocked = log.hazard.length > 0;
    setS((x) => ({ ...x, meals: [{ ...log, photo, blocked }, ...x.meals].slice(0, 24) }));
    setScanning(false);
    if (blocked) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1400);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Head kicker="Agentic AI nutrition" title="Diet, Calorie & Allergy Tracker" sub="Drop a meal photo — the engine names the dish, breaks down macros and screens it against your personal allergy list." />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          {/* dropzone */}
          <section
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); void ingest(e.dataTransfer.files?.[0]); }}
            className={`rounded-2xl border-2 border-dashed p-7 text-center transition-colors ${drag ? 'border-amber-500 bg-amber-500/10' : 'border-amber-500/35 cy-shell'}`}
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border-2 border-amber-500/40 bg-amber-500/10">
              {scanning ? <ScanLine size={22} className="animate-pulse text-amber-500" /> : <ImagePlus size={22} className="text-amber-500" />}
            </div>
            <p className="mt-3 font-display text-[16px] font-bold cy-title">{scanning ? 'Agentic AI scanning the frame…' : 'Drag & drop your meal photo'}</p>
            <p className="mt-1 text-[12.5px] font-medium cy-muted">Ingredient detection · dish naming · macro breakdown · allergy screen</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={() => fileRef.current?.click()} className="ry-btn !py-2.5"><Upload size={13} /> Browse device</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void ingest(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
          </section>

          {/* allergy guard */}
          <section className="ry-plate p-5">
            <div className="ry-kicker"><ShieldAlert size={13} className="text-amber-500" /> Smart allergy guard</div>
            <textarea
              value={s.allergies}
              onChange={(e) => setS((x) => ({ ...x, allergies: e.target.value }))}
              rows={2}
              placeholder="peanuts, shellfish, lactose, gluten…"
              className="ry-input mt-3 !pl-3.5"
            />
            <p className="mt-2 text-[12px] font-medium cy-muted">Comma separated. Every scanned meal is matched against this list automatically.</p>
          </section>

          {/* meal log */}
          <section className="ry-plate p-5">
            <div className="flex items-center justify-between">
              <div className="ry-kicker">Scanned meals</div>
              <span className="font-monox text-[9px] font-bold cy-muted">{ (s.meals ?? []).length} logged</span>
            </div>
            <ul className="mt-3.5 space-y-2.5">
              { (s.meals ?? []).length === 0 && <li className="rounded-xl border border-dashed cy-hair py-8 text-center font-display italic cy-muted">No meals scanned yet.</li>}
              { (s.meals ?? []).map((m) => (
                <li
                  key={m.id}
                  className={`ry-row ${m.blocked ? '!border-red-700/70 !bg-red-950/30' : ''}`}
                  style={m.blocked && flash ? { animation: 'hazard-flash 0.5s ease 2' } : undefined}
                >
                  {m.photo ? <img src={m.photo} alt={m.dish} className={`h-14 w-14 flex-none rounded-lg border object-cover ${m.blocked ? 'border-red-700/60 grayscale' : 'border-amber-500/30'}`} /> : <span className="h-14 w-14 flex-none rounded-lg border border-amber-500/30 cy-shell" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-display text-[14px] font-bold ${m.blocked ? 'text-red-300' : 'cy-title'}`}>{m.dish}</span>
                      {m.blocked && <Pill tone="danger">⚠ {m.hazard[0]}</Pill>}
                    </div>
                    <div className="mt-0.5 font-monox text-[10px] font-bold cy-muted">
                      {m.blocked ? <span className="text-red-400">BLOCKED · {m.kcal} kcal locked out</span> : <>{m.kcal} kcal · {m.protein}p / {m.carb}c / {m.fat}f</>}
                    </div>
                    <div className="mt-0.5 text-[11.5px] font-medium cy-muted">{m.ingredients.join(', ')}</div>
                  </div>
                  <button onClick={() => setS((x) => ({ ...x, meals: x.meals.filter((z) => z.id !== m.id) }))} className="text-slate-500 transition-colors hover:text-red-500" aria-label="Remove meal"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </section>

          {/* 📅 WORKOUT-SYNCED DIET BLUEPRINT */}
          <DietBlueprint s={s} />
        </div>

        <div className="space-y-5">
          {/* BMI + budget */}
          <section className="ry-plate p-5">
            <div className="ry-kicker"><Scale size={13} className="text-amber-500" /> BMI &amp; calorie gauge</div>
            <div className="mt-4 text-center">
              <span className="ry-num text-[46px] leading-none cy-title">{mass.value}</span>
              <span
                className="ml-2.5 rounded-lg border-2 px-2.5 py-1 font-monox text-[9.5px] font-bold uppercase tracking-[0.12em]"
                style={{ borderColor: `${mass.hex}88`, background: `${mass.hex}1a`, color: mass.hex }}
              >
                {mass.band}
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              {[['<18.5', 'Underweight', '#f59e0b'], ['18.5–24.9', 'Normal', '#10b981'], ['25.0–29.9', 'Overweight', '#dc2626'], ['≥30.0', 'Obese', '#7f1d1d']].map(([range, label, hex]) => {
                const active = mass.band === label || (label === 'Normal' && mass.band === 'Normal Weight');
                return (
                  <button
                    key={label}
                    onClick={() => setS((x) => ({ ...x }))}
                    className={`flex-1 rounded-lg border-2 py-1.5 text-center transition-all ${active ? 'shadow-[0_0_14px_-4px_currentColor]' : 'opacity-45'}`}
                    style={{ borderColor: `${hex}77`, background: active ? `${hex}22` : 'transparent' }}
                  >
                    <div className="font-monox text-[7px] font-bold uppercase tracking-[0.1em]" style={{ color: hex }}>{range}</div>
                    <div className="font-monox text-[6.5px] font-bold uppercase tracking-[0.08em] cy-muted">{label}</div>
                  </button>
                );
              })}
            </div>
            <div className="ry-bar mt-3"><div style={{ width: `${Math.min(100, (mass.value / 40) * 100)}%`, background: `linear-gradient(90deg, ${mass.hex}, ${mass.hex}cc)` }} /></div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Height</span>
                  <div className="flex overflow-hidden rounded-lg border border-amber-500/30">
                    {(['cm', 'ft'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          setS((x) => ({ ...x, heightUnit: u }));
                          if (u === 'cm') {
                            setCmValue(s.heightCm > 0 ? String(s.heightCm) : '');
                          } else {
                            const imp = cmToImperial(s.heightCm);
                            setFtValue(imp.feet > 0 ? String(imp.feet) : '');
                            setInValue(imp.inches > 0 ? String(imp.inches) : '');
                          }
                        }}
                        className={`px-2 py-0.5 font-monox text-[8px] font-bold uppercase transition-colors ${(s.heightUnit ?? 'cm') === u ? 'bg-amber-500 text-neutral-950' : 'cy-muted hover:text-amber-500'}`}
                      >
                        {u === 'cm' ? 'CM' : 'FT/IN'}
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
                      <button
                        key={u}
                        onClick={() => {
                          setS((x) => ({ ...x, weightUnit: u }));
                          setWtValue(s.weightKg > 0 ? String(u === 'lbs' ? Math.round(s.weightKg * 2.20462 * 10) / 10 : s.weightKg) : '');
                        }}
                        className={`px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${s.weightUnit === u ? 'bg-amber-500 text-neutral-950' : 'cy-muted'}`}
                      >
                        {u}
                      </button>
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
                  {s.weightKg > 0
                    ? `${(s.weightKg * (s.weightUnit === 'lbs' ? 1 : 2.20462)).toFixed(1)} ${s.weightUnit === 'lbs' ? 'lbs' : 'kg'} equivalent`
                    : 'Enter weight'}
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-500/25 cy-shell px-4 py-3 text-center">
              <div className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Calories remaining today</div>
              <div className={`ry-num mt-1 text-3xl ${budget.remaining >= 0 ? 'cy-title' : 'text-red-500'}`}>{budget.remaining.toLocaleString()}</div>
              <div className="font-monox text-[9px] font-bold cy-muted">{budget.eaten} eaten of {budget.target} target</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[['Protein', `${tgt.protein}g`], ['Carbs', `${somaCarbs(s)}g`], ['Fats', `${tgt.fat}g`]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-amber-500/20 cy-shell px-2 py-2.5 text-center">
                  <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] cy-muted">{k}</div>
                  <div className="ry-num mt-0.5 text-[15px] text-amber-500">{v}</div>
                </div>
              ))}
              <p className="col-span-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.05] px-3 py-2 text-left text-[11.5px] font-medium leading-snug cy-soft">
                <span className="font-bold text-amber-600">{SOMATOTYPES.find((x) => x.id === s.somatotype)?.label}</span> · {SOMATOTYPES.find((x) => x.id === s.somatotype)?.nutrition}
              </p>
            </div>
          </section>

          {/* 💧 HYDRO-LOGIC TRACKER */}
          <HydroLogic s={s} setS={setS} />

          {/* hazard banner · Allergy Shield Interceptor */}
          <AnimatePresence>
            {hazardMeal ? (
              <motion.section
                key={hazardMeal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: flash
                    ? ['0 0 0px rgba(220,38,38,0)', '0 0 44px rgba(220,38,38,0.85)', '0 0 0px rgba(220,38,38,0)']
                    : '0 0 0px rgba(220,38,38,0)',
                }}
                transition={{ duration: 1.2 }}
                className="rounded-2xl border-2 border-red-700 bg-red-950/40 p-5"
              >
                <div className="flex items-center gap-2 font-monox text-[9.5px] font-bold uppercase tracking-[0.2em] text-red-500">
                  <TriangleAlert size={14} className={flash ? 'animate-ping' : ''} /> Hazard Blocked
                </div>
                <p className="mt-2 text-[13.5px] font-semibold leading-relaxed text-slate-100">
                  Recipe contains <span className="font-bold text-red-400">{hazardMeal.hazard.join(', ')}</span>! Calories locked out — {hazardMeal.kcal} kcal excluded from today&apos;s ledger.
                </p>
                <button
                  onClick={() => setS((x) => ({ ...x, meals: x.meals.filter((z) => z.id !== hazardMeal.id) }))}
                  className="ry-btn ry-btn-crimson mt-3 !py-2"
                >
                  <Trash2 size={12} /> Discard blocked meal
                </button>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── 💧 HYDRO-LOGIC TRACKER ── */

function HydroLogic({ s, setS }: { s: CyberState; setS: Updater }) {
  const today = new Date().toISOString().slice(0, 10);
  const summer = s.arc === 'summer';
  const target = waterTarget(s.arc);
  const consumed =  (s.water ?? {})[today] ?? 0;
  const pct = Math.min(100, (consumed / target) * 100);

  const add = (litres: number) =>
    setS((x) => ({ ...x, water: { ...x.water, [today]: Math.max(0, Math.round(((x.water[today] ?? 0) + litres) * 100) / 100) } }));

  return (
    <section className={`rounded-2xl border-2 p-5 transition-colors ${summer ? 'border-amber-500/60 bg-amber-500/[0.07]' : 'border-sky-700/45 bg-sky-950/15'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Droplets size={15} className={summer ? 'text-amber-500' : 'text-sky-400'} />
          <span className={`font-monox text-[9.5px] font-bold uppercase tracking-[0.22em] ${summer ? 'text-amber-500' : 'text-sky-400'}`}>Hydro-Logic Tracker</span>
        </div>
        {summer && (
          <span className="flex items-center gap-1 rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.12em] text-amber-500">
            <Flame size={9} /> Summer Arc +1.5L
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-center gap-1.5">
        <span className={`ry-num text-[42px] leading-none ${summer ? 'text-amber-400' : 'text-sky-300'}`}>{consumed.toFixed(2)}</span>
        <span className="mb-1.5 font-monox text-[11px] font-bold cy-muted">L consumed of {target.toFixed(1)} L target</span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-neutral-800 bg-neutral-950">
        <motion.div
          className={`h-full rounded-full ${summer ? 'bg-gradient-to-r from-amber-600 to-yellow-400' : 'bg-gradient-to-r from-sky-600 to-cyan-400'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-1 flex justify-between font-monox text-[8px] font-bold uppercase tracking-[0.12em] cy-muted">
        <span>{Math.round(pct)}% of daily goal</span>
        <span>{Math.max(0, target - consumed).toFixed(2)} L remaining</span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {([['+250ml', 0.25], ['+500ml', 0.5], ['+1L', 1]] as const).map(([label, v]) => (
          <button
            key={label}
            onClick={() => add(v)}
            className={`rounded-xl border-2 py-2.5 font-monox text-[10px] font-bold uppercase tracking-[0.1em] transition-all hover:-translate-y-0.5 ${
              summer ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-500' : 'border-sky-700/40 bg-sky-950/30 text-sky-300 hover:border-sky-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button onClick={() => setS((x) => ({ ...x, water: { ...x.water, [today]: 0 } }))} className="ry-ghost mt-2 w-full justify-center !py-1.5">
        Reset today
      </button>
      <p className="mt-2.5 text-[11px] font-medium leading-snug cy-muted">
        {summer
          ? 'Summer Arc is live — your baseline requirement is automatically raised by 1.5 litres to offset heat loss.'
          : 'Baseline requirement active. Switching to Summer Arc in the Fitness panel adds 1.5 litres automatically.'}
      </p>
    </section>
  );
}

/* ── 📅 WORKOUT-SYNCED DIET BLUEPRINT ── */

function DietBlueprint({ s }: { s: CyberState }) {
  const plan = dietBlueprint(s, 0);

  return (
    <section className="ry-plate p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="ry-kicker"><CalendarDays size={13} className="text-amber-500" /> Workout-synced diet blueprint</div>
        <span className={`rounded-lg border px-2.5 py-1 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] ${plan.isRest ? 'border-sky-700/50 bg-sky-950/30 text-sky-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-500'}`}>
          {plan.day} · {plan.isRest ? 'Rest Day' : 'Training Day'}
        </span>
      </div>

      <div className={`mt-3.5 rounded-xl border-2 px-3.5 py-2.5 ${plan.isRest ? 'border-sky-700/45 bg-sky-950/20' : 'border-amber-500/45 bg-amber-500/[0.06]'}`}>
        <div className={`flex items-center gap-2 font-monox text-[9.5px] font-bold uppercase tracking-[0.18em] ${plan.isRest ? 'text-sky-300' : 'text-amber-500'}`}>
          {plan.isRest ? <Wind size={12} /> : <Zap size={12} />} {plan.heading}
        </div>
        <p className="mt-1 text-[11.5px] font-medium leading-snug cy-muted">{plan.focus}</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {plan.meals.map((m) => (
          <div key={m.name} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 transition-all hover:-translate-y-0.5 hover:border-amber-500/40">
            <div className="text-[13px] font-bold leading-tight cy-title">{m.name}</div>
            <div className="mt-1 font-monox text-[8px] font-bold uppercase tracking-[0.12em] text-amber-600">{m.timing}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {[[`${m.kcal}`, 'kcal'], [`${m.protein}`, 'P'], [`${m.carb}`, 'C'], [`${m.fat}`, 'F']].map(([v, k]) => (
                <span key={k} className="rounded-md border border-neutral-800 bg-neutral-950/60 px-1.5 py-0.5 font-monox text-[8.5px] font-bold text-slate-300">
                  {v}<span className="ml-0.5 text-slate-500">{k}</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-medium leading-snug text-slate-400">{m.note}</p>
          </div>
        ))}
      </div>

      {plan.jointSupport && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3.5 rounded-xl border-2 border-emerald-700/45 bg-emerald-950/20 p-3.5">
          <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-400">
            <ShieldPlus size={12} /> Injury-adaptive micro-nutrition · joint flags detected
          </div>
          <p className="mt-1.5 text-[11.5px] font-medium leading-snug cy-soft">
            Collagen-rich and omega-3 dense foods added to accelerate tendon and ligament recovery.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {JOINT_SUPPORT.map((j) => (
              <div key={j.name} className="rounded-lg border border-emerald-700/25 bg-neutral-950/50 px-2.5 py-2">
                <div className="text-[11.5px] font-bold text-emerald-300">{j.name}</div>
                <div className="mt-0.5 text-[10.5px] font-medium leading-snug text-slate-400">{j.benefit}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}

/* ═══════════ PANEL 4 · SKINCARE & COMPARISON LAB ═══════════ */

export function SkinPanel({ s, setS }: { s: CyberState; setS: Updater }) {
  const labelRef = useRef<HTMLInputElement>(null);
  const slotRef = useRef<HTMLInputElement>(null);
  const [slot, setSlot] = useState<string>('current');

  const scanProduct = async (f: File | null | undefined) => {
    if (!f) return;
    const photo = await readFile(f);
    const res = scanLabel(f.name, f.size);
    setS((x) => ({ ...x, skinScans: [{ ...res, photo }, ...x.skinScans].slice(0, 16) }));
  };

  const setShot = async (f: File | null | undefined) => {
    if (!f) return;
    const photo = await readFile(f);
    setS((x) => ({ ...x, progressShots: { ...x.progressShots, [slot]: photo } }));
  };

  const [a, b] = s.compare;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Head kicker="Agentic AI dermatology" title="Beauty, Skincare & Comparison Lab" sub="Scan product labels for safety verdicts, log multi-day progress shots and lock two frames side by side." />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <section className="ry-plate p-5">
            <div className="ry-kicker"><ScanLine size={13} className="text-amber-500" /> Product safety scanner</div>
            <div
              onClick={() => labelRef.current?.click()}
              className="mt-3.5 cursor-pointer rounded-xl border-2 border-dashed border-amber-500/35 cy-shell px-4 py-6 text-center transition-colors hover:border-amber-500"
            >
              <Camera size={20} className="mx-auto text-amber-500" />
              <p className="mt-2 text-[13px] font-bold cy-title">Upload a skincare label</p>
              <p className="mt-0.5 text-[11.5px] font-medium cy-muted">The AI reads the ingredient panel and issues a verdict</p>
            </div>
            <input ref={labelRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void scanProduct(e.target.files?.[0]); e.target.value = ''; }} />
            <ul className="mt-3.5 space-y-2.5">
              { (s.skinScans ?? []).length === 0 && <li className="rounded-xl border border-dashed cy-hair py-6 text-center font-display italic cy-muted">No labels scanned yet.</li>}
              { (s.skinScans ?? []).map((sc) => (
                <li key={sc.id} className="ry-row">
                  {sc.photo ? <img src={sc.photo} alt="label" className="h-14 w-14 flex-none rounded-lg border border-amber-500/30 object-cover" /> : <span className="h-14 w-14 flex-none rounded-lg cy-shell" />}
                  <div className="min-w-0 flex-1">
                    <div className={`font-display text-[13.5px] font-bold ${sc.verdict === 'warning' ? 'text-red-500' : 'text-amber-500'}`}>{sc.title}</div>
                    <div className="mt-0.5 text-[11.5px] font-medium cy-muted">{sc.ingredients.join(', ')}</div>
                    <div className="mt-0.5 text-[11.5px] font-medium leading-snug cy-soft">{sc.note}</div>
                  </div>
                  <button onClick={() => setS((x) => ({ ...x, skinScans: x.skinScans.filter((z) => z.id !== sc.id) }))} className="text-slate-500 hover:text-red-500" aria-label="Remove scan"><X size={13} /></button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-5">
          <section className="ry-plate p-5">
            <div className="flex items-center justify-between">
              <div className="ry-kicker"><Grid2x2 size={13} className="text-amber-500" /> Multi-day photo matrix</div>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} className="ry-input !w-auto !py-1.5 !pl-3 text-[11px]">
                {PROGRESS_SLOTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {PROGRESS_SLOTS.map((p) => (
                <button key={p.id} onClick={() => { setSlot(p.id); setTimeout(() => slotRef.current?.click(), 40); }} className="group relative aspect-square overflow-hidden rounded-xl border-2 border-amber-500/25 cy-shell">
                  {s.progressShots[p.id] ? <img src={s.progressShots[p.id]} alt={p.label} className="h-full w-full object-cover" /> : <ImagePlus size={17} className="absolute inset-0 m-auto cy-muted" />}
                  <span className="absolute inset-x-0 bottom-0 bg-neutral-950/75 py-1 font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] text-amber-400">{p.label}</span>
                </button>
              ))}
            </div>
            <input ref={slotRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void setShot(e.target.files?.[0]); e.target.value = ''; }} />
          </section>

          <section className="ry-plate p-5">
            <div className="ry-kicker"><HeartPulse size={13} className="text-amber-500" /> Side-by-side compare engine</div>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {([0, 1] as const).map((i) => (
                <div key={i} className="rounded-xl border-2 border-amber-500/25 cy-shell p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] cy-muted">{i === 0 ? 'Frame A' : 'Frame B'}</span>
                    <select
                      value={s.compare[i] ?? ''}
                      onChange={(e) => setS((x) => { const c: [string | null, string | null] = [...x.compare]; c[i] = e.target.value || null; return { ...x, compare: c }; })}
                      className="ry-input !w-auto !py-1 !pl-2 text-[10px]"
                    >
                      <option value="">— empty —</option>
                      {PROGRESS_SLOTS.filter((p) => s.progressShots[p.id]).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="aspect-square overflow-hidden rounded-lg cy-shell">
                    {a !== null && i === 0 && s.progressShots[a] ? <img src={s.progressShots[a]} alt="A" className="h-full w-full object-cover" /> : null}
                    {b !== null && i === 1 && s.progressShots[b] ? <img src={s.progressShots[b]} alt="B" className="h-full w-full object-cover" /> : null}
                    {!s.compare[i] && <span className="grid h-full place-items-center font-display italic cy-muted">no frame</span>}
                  </div>
                </div>
              ))}
            </div>
            {a && b && (
              <div className="mt-3.5 rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.06] p-3.5">
                <div className="font-monox text-[9px] font-bold uppercase tracking-[0.18em] text-amber-600">Comparison notes</div>
                <ul className="mt-2 space-y-1.5">
                  {[
                    `Tone: compare ${PROGRESS_SLOTS.find((p) => p.id === a)?.label} against ${PROGRESS_SLOTS.find((p) => p.id === b)?.label} for evenness drift.`,
                    'Texture: check cheek and forehead micro-clarity under the same light.',
                    'Structure: note jawline and shoulder definition changes across the window.',
                  ].map((n) => (
                    <li key={n} className="flex items-start gap-2 text-[12px] font-medium leading-snug cy-strong"><Check size={12} className="mt-0.5 flex-none text-amber-500" /> {n}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── local shared bits ── */

function Head({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <header>
      <div className="ry-kicker">{kicker}</div>
      <h1 className="ry-gold mt-2 font-display text-[30px] font-bold tracking-tight md:text-[38px]">{title}</h1>
      <p className="mt-1.5 max-w-xl text-[14px] font-medium leading-relaxed cy-muted">{sub}</p>
    </header>
  );
}

function Pill({ children, tone = 'gold' }: { children: React.ReactNode; tone?: 'gold' | 'danger' }) {
  return <span className={`rounded-lg border px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.12em] ${tone === 'danger' ? 'border-red-700 bg-red-950/40 text-red-400' : 'border-amber-500/30 bg-amber-500/[0.07] text-amber-600'}`}>{children}</span>;
}
