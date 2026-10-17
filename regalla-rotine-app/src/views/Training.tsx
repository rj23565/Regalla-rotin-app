import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Flame,
  Lock,
  MoonStar,
  PersonStanding,
  RotateCcw,
  Sparkles,
  Sun,
  Thermometer,
  Timer,
  TriangleAlert,
  Trophy,
  Wind,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRegalia } from '../store';
import { TIERS, ENGINE_TASKS, SPLIT_MAP, dayParts, barPct } from '../lib/calizen';
import { SEASONS, resolveSeason } from '../lib/season';
import { todayISO } from '../lib/time';
import { Bar, Chip, Ring, SectionLabel } from '../components/bits';
import type { DayKind } from '../lib/calizen';

const KIND_META: Record<DayKind, { label: string; tone: 'crimson' | 'gold' | 'faint' }> = {
  push: { label: 'Push Day', tone: 'crimson' },
  back: { label: 'Back Day', tone: 'gold' },
  rest: { label: 'Rest · Recovery', tone: 'faint' },
};

export default function Training() {
  const train = useRegalia((s) => s.train);
  const seasonSetting = useRegalia((s) => s.season);
  const logMilestoneReq = useRegalia((s) => s.logMilestoneReq);
  const setSplit = useRegalia((s) => s.setSplit);
  const toggleEngineTask = useRegalia((s) => s.toggleEngineTask);
  const bankBreath = useRegalia((s) => s.bankBreath);
  const logSleep = useRegalia((s) => s.logSleep);
  const dismissStale = useRegalia((s) => s.dismissStale);
  const pushNote = useRegalia((s) => s.pushNote);

  const season = resolveSeason(seasonSetting);
  const prof = SEASONS[season];
  const today = todayISO();
  const weekday = new Date().getDay();
  const [splitOverride, setSplitOverride] = useState<number | null>(null);
  const split = splitOverride ?? train.split;
  const kind = SPLIT_MAP[split]?.[weekday] ?? dayParts(weekday, split);
  const tasks = ENGINE_TASKS[kind];
  const done = new Set(train.engineLogs[today] ?? []);

  // 48-hour stale detector + re-evaluation prompt
  const stale = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yk = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    const yDone = train.engineLogs[yk] ?? [];
    const yKind = SPLIT_MAP[split]?.[y.getDay()] ?? 'rest';
    const incomplete =
      ENGINE_TASKS[yKind].filter((t) => !yDone.includes(t.id)).length;
    return incomplete >= 2 && Date.now() - train.staleAt > 12 * 3600 * 1000;
  }, [train.engineLogs, train.staleAt, split]);

  // breath pacer machine: 4s in, 4s hold, 6s out
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [secs, setSecs] = useState(10 * 60); // 10-minute default
  const elapsedRef = useRef(0);
  const breathToday = (train.breath[today] ?? 0) / 60;

  useEffect(() => {
    if (!breathing) return;
    elapsedRef.current = 0;
    const iv = setInterval(() => {
      elapsedRef.current += 1;
      const next = elapsedRef.current;
      if (next >= secs) {
        setBreathing(false);
        bankBreath(secs);
        pushNote('milestone', 'Breathwork block sealed', `${Math.round(secs / 60)} minutes banked into regeneration.`);
        elapsedRef.current = 0;
        return;
      }
      const slot = next % 14;
      setPhase(slot < 4 ? 'in' : slot < 8 ? 'hold' : 'out');
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breathing, secs]);

  const scale = phase === 'in' ? 1.65 : phase === 'hold' ? 1.35 : 1.0;
  const breathTarget = season === 'summer' ? 30 : 40;

  const toggle = (id: string) => {
    const before = done.size;
    toggleEngineTask(id);
    if (!done.has(id) && before + 1 === tasks.length) {
      pushNote('milestone', 'Day structurally sealed', `${KIND_META[kind].label} — every queue item banked.`);
      confetti({ particleCount: 80, spread: 60, startVelocity: 28, origin: { y: 0.7 }, colors: ['#A8861E', '#D9C47F', '#7E1628'] });
    }
  };

  const tierId = train.tier;
  const nowH = new Date().getHours();
  const inHeat = season === 'summer' && nowH >= 13 && nowH < 15;

  return (
    <div className="space-y-5">
      {/* arc header */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card ornate px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {season === 'winter' ? <MoonStar size={16} className="text-[#3a7cb8]" /> : <Sun size={16} className="text-[#b05421]" />}
              <span className={`season-chip ${season === 'winter' ? 'season-winter' : 'season-summer'}`}>
                {prof.title}
              </span>
              <span className="font-monox text-[9px] font-bold uppercase tracking-[0.2em] text-faint">{prof.tagline}</span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">{prof.motto}</h2>
            <p className="mt-1 font-display text-[14px] italic text-ink2/90">{prof.cardioNote}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="gold">{prof.warmUp}</Chip>
            <Chip tone="faint">{prof.restNote}</Chip>
            {season === 'summer' && (
              <Chip tone={inHeat ? 'crimson' : 'faint'}>
                <Thermometer size={10} /> Heat window {prof.heatWindow}
              </Chip>
            )}
          </div>
        </div>
        {season === 'summer' && (
          <div className={`mt-4 rounded-[5px] border-2 px-4 py-3 ${inHeat ? 'border-crimson bg-crimson/8' : 'border-gold/40 bg-gold/6'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <TriangleAlert size={13} className={inHeat ? 'text-crimson' : 'text-golddeep'} />
              <span className="font-monox text-[10px] font-bold tracking-[0.14em] uppercase text-ink">
                {inHeat ? 'Peak heat — shade & hydrate now' : 'Peak heat protection armed — 1:00 PM to 3:00 PM'}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-ink2">
              Cooling nutrition stack: {prof.cooling.join(' · ')}. Hydration target auto-raised by +1.5 L today.
            </p>
          </div>
        )}
      </motion.section>

      <div className="rd-grid grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* left — roadmap + engine */}
        <div className="space-y-5">
          {/* Auto-task engine */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>Auto-task engine · today</SectionLabel>
              <Chip tone={KIND_META[kind].tone}>
                {KIND_META[kind].label} · {split}×/week
              </Chip>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {[2, 3, 4, 5, 6].map((n) => (
                <button key={n} onClick={() => { setSplitOverride(n); setSplit(n); }} className={`rounded-[3px] border px-2.5 py-1 font-monox text-[10px] font-bold ${split === n ? 'border-gold bg-gold/15 text-golddeep' : 'border-line text-ink2'}`}>
                  {n} days
                </button>
              ))}
              <button onClick={() => setSplitOverride(null)} className="font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-faint">auto</button>
            </div>

            {stale && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-[4px] border-2 border-[#c07f2a]/70 bg-[#c07f2a]/10 p-3.5">
                <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a6420]">
                  <RotateCcw size={12} /> Cadence re-evaluation (48-hour backlog)
                </div>
                <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-ink2">
                  Items from yesterday's queue are still open. Step back, breathe, and reshuffle — the chain restarts
                  fresh today. Nothing compounds.
                </p>
                <div className="mt-2.5 flex gap-2">
                  <button onClick={dismissStale} className="btn-seal !py-1.5">Acknowledge & recalculate</button>
                </div>
              </motion.div>
            )}

            <ul className="mt-4 space-y-2.5">
              {tasks.map((t, i) => {
                const on = done.has(t.id);
                return (
                  <li key={t.id} className={`flex items-start gap-3 rounded-[4px] border-2 p-3 transition-all ${on ? 'border-[#3f6b3a]/50 bg-[#3f6b3a]/8' : 'border-line bg-paper/60'}`}>
                    <button onClick={() => toggle(t.id)} aria-pressed={on} className={`tick ${on ? 'on' : ''} mt-0.5`}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5 L6.5 12 L13 4.5" stroke="#f2dda0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`font-display text-[14.5px] font-bold leading-tight ${on ? 'text-faint line-through decoration-crimson/40' : 'text-ink'}`}>
                        {t.label}
                      </div>
                      <div className="mt-0.5 text-[12px] font-medium leading-snug text-ink2/85">{t.detail}</div>
                    </div>
                    <span className="font-monox text-[8px] font-bold text-faint">Q{i + 1}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <Bar pct={barPct(done.size, tasks.length)} />
              <span className="font-monox text-[10px] font-bold text-ink2">{done.size}/{tasks.length}</span>
            </div>
          </motion.section>

          {/* Roadmap tiers */}
          {TIERS.map((tier, i) => {
            const unlocked = tierId >= tier.id;
            const passed = train.passed.includes(tier.name);
            const reqs = tier.milestone;
            const met = reqs.filter((r) => (train.best[r.id] ?? 0) >= r.target).length;
            return (
              <motion.section
                key={tier.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04 }}
                className={`card px-5 py-5 ${unlocked && !passed ? '!border-gold ring-2 ring-gold/25' : ''} ${!unlocked ? 'opacity-55' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`grid h-9 w-9 place-items-center rounded-[4px] border-2 font-display text-[14px] font-bold ${unlocked ? 'border-gold bg-gold/12 text-golddeep' : 'border-line text-faint'}`}>
                      {tier.numeral}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-[17px] font-bold text-ink">{tier.name}</h3>
                        {passed && <CheckCircle2 size={15} className="text-[#3f6b3a]" />}
                        {!unlocked && <Lock size={13} className="text-faint" />}
                      </div>
                      <p className="font-monox text-[8px] font-bold uppercase tracking-[0.22em] text-faint">{tier.epithet}</p>
                    </div>
                  </div>
                  {tier.next && unlocked && !passed && (
                    <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] text-golddeep">next: {tier.next}</span>
                  )}
                </div>
                <p className="mt-2 text-[12.5px] font-semibold leading-snug text-ink2">{tier.focus}</p>

                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {tier.exercises.map((e) => (
                    <li key={e.name} className="rounded-[3px] border border-line bg-paper/50 px-2.5 py-2">
                      <div className="text-[12.5px] font-bold text-ink">{e.name}</div>
                      <div className="mt-0.5 text-[11px] font-medium italic leading-snug text-ink2/85">{e.form}</div>
                    </li>
                  ))}
                </ul>

                {reqs.length > 0 && (
                  <div className="mt-4 rounded-[4px] border-2 border-line bg-parch/30 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-monox text-[9px] font-bold uppercase tracking-[0.2em] text-faint">Milestone gate → {tier.next}</span>
                      <span className="font-monox text-[10px] font-bold text-golddeep">{met}/{reqs.length} cleared</span>
                    </div>
                    <p className="mt-1.5 text-[12px] font-semibold italic leading-snug text-ink2">Gate: {tier.gateText}</p>
                    <div className="mt-2.5 space-y-2.5">
                      {reqs.map((r) => {
                        const best = train.best[r.id] ?? 0;
                        const pct = Math.min(1, best / r.target);
                        return (
                          <div key={r.id}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12.5px] font-bold text-ink">{r.label}</span>
                              <span className="font-monox text-[10px] font-bold text-ink2">
                                <input
                                  type="number"
                                  min={0}
                                  value={best}
                                  disabled={!unlocked}
                                  onChange={(e) => logMilestoneReq(tier.id, r.id, Number(e.target.value))}
                                  className="mr-1 w-14 rounded-[3px] border border-line bg-paper px-1.5 py-0.5 text-center font-monox font-bold text-ink"
                                />
                                / {r.target} {r.unit}
                              </span>
                            </div>
                            <div className="mt-1"><Bar pct={pct} tone={pct >= 1 ? '#7E1628' : undefined} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {reqs.length === 0 && unlocked && (
                  <div className="mt-4 flex items-center gap-2 rounded-[4px] border-2 border-gold/50 bg-gold/10 px-3 py-2.5 font-monox text-[10px] font-bold uppercase tracking-[0.18em] text-golddeep">
                    <Trophy size={13} /> Apex tier — keep the elite chain burning daily
                  </div>
                )}
              </motion.section>
            );
          })}
        </div>

        {/* right — recovery */}
        <div className="space-y-5">
          {/* breath pacer */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card ornate px-5 py-6 text-center">
            <SectionLabel>Deep breathing protocol</SectionLabel>
            <p className="mt-2 font-monox text-[9px] font-bold uppercase tracking-[0.18em] text-faint">
              4s in · 4s hold · 6s out · cycle × {breathTarget}–40 min
            </p>
            <div className="relative mx-auto mt-6 h-44 w-44">
              <motion.div
                animate={{ scale }}
                transition={{ duration: phase === 'in' ? 4 : phase === 'out' ? 6 : 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 grid place-items-center rounded-full border-2 border-gold/65"
                style={{ background: 'radial-gradient(circle at 40% 32%, rgba(168,134,30,0.22), rgba(126,22,40,0.12) 70%)' }}
              >
                <div>
                  <div className="font-display text-xl font-bold text-ink">{phase === 'in' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}</div>
                  <div className="font-monox text-[9px] font-bold uppercase tracking-[0.18em] text-faint">{phase === 'in' ? '4s' : phase === 'hold' ? '4s' : '6s'}</div>
                </div>
              </motion.div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <select value={secs} onChange={(e) => setSecs(Number(e.target.value))} className="rounded-[4px] border-2 border-line bg-paper px-2 py-1.5 font-monox text-[11px] font-bold text-ink" disabled={breathing}>
                {[300, 600, 900, 1200, 1800, 2400].map((m) => (
                  <option key={m} value={m}>{m / 60} min</option>
                ))}
              </select>
              <button onClick={() => setBreathing((v) => !v)} className={`btn-seal !py-2 ${breathing ? '!bg-paper !text-ink' : ''}`}>
                <Wind size={12} /> {breathing ? 'Stop' : 'Start pacer'}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-[4px] border-2 border-line bg-parch/30 px-3 py-2.5">
              <span className="font-monox text-[9px] font-bold uppercase tracking-[0.18em] text-faint">Today's breath bank</span>
              <span className="font-display text-[17px] font-bold text-ink">{breathToday.toFixed(1)} min</span>
            </div>
            <p className="mt-2 font-monox text-[8.5px] font-bold uppercase leading-relaxed tracking-[0.14em] text-faint">
              safety checkpoint — blood-flow awareness pacing · stop on any dizziness
            </p>
          </motion.section>

          {/* flexibility + rest-day */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="card px-5 py-5">
            <SectionLabel>Flexibility engine & rest-day log</SectionLabel>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['Chest openers 3×40s', 'Upper-lat hangs 2×45s', 'Hip flexor holds 3×45s', 'Thoracic rotations 2×10'].map((s) => (
                <div key={s} className="rounded-[3px] border-2 border-line bg-paper/60 px-2.5 py-2.5 text-center">
                  <PersonStanding size={13} className="mx-auto text-golddeep" />
                  <div className="mt-1 text-[11px] font-bold leading-tight text-ink2">{s}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[4px] border-2 border-line bg-parch/30 p-3.5">
              <div className="font-monox text-[9px] font-bold uppercase tracking-[0.2em] text-faint">Tonight's sleep metrics</div>
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <label>
                  <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] text-faint">Hours</span>
                  <input type="range" min={4} max={10} step={0.5} defaultValue={7} className="mt-1 w-full accent-[#7E1628]" onChange={(e) => logSleep(Number(e.target.value), (train.sleep[today] ?? { quality: 3 }).quality)} />
                </label>
                <label>
                  <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] text-faint">Quality (1–5)</span>
                  <input type="range" min={1} max={5} step={1} defaultValue={3} className="mt-1 w-full accent-[#A8861E]" onChange={(e) => logSleep((train.sleep[today] ?? { hours: 7 }).hours, Number(e.target.value))} />
                </label>
              </div>
              {train.sleep[today] && (
                <div className="mt-3 flex items-center gap-3">
                  <Ring pct={train.sleep[today].quality / 5} size={46} stroke={5} tone="#A8861E">
                    <span className="font-display text-[12px] font-bold text-ink">{train.sleep[today].quality}</span>
                  </Ring>
                  <div className="text-[12.5px] font-semibold leading-snug text-ink2">
                    {train.sleep[today].hours}h logged · recovery index {Math.round((train.sleep[today].quality / 5) * 100)}% ·{' '}
                    {train.sleep[today].hours >= 7.5 ? 'deep regenerative window' : train.sleep[today].hours >= 6 ? 'moderate recovery' : 'underslept — radow the load'}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* season rites quick-ref */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card px-5 py-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Arc rites this season</SectionLabel>
              <Flame size={13} className={season === 'winter' ? 'text-[#3a7cb8]' : 'text-crimson'} />
            </div>
            <ul className="mt-3 space-y-2">
              {prof.rites.map((r) => (
                <li key={r.title} className="flex items-start gap-2 rounded-[3px] border border-line bg-paper/60 px-2.5 py-2 text-[12.5px] font-semibold leading-snug text-ink">
                  <Sparkles size={12} className="mt-0.5 flex-none text-golddeep" />
                  {r.title}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 rounded-[3px] border-2 border-dashed border-line px-2.5 py-2 font-monox text-[8.5px] font-bold uppercase tracking-[0.14em] text-faint">
              <Timer size={11} /> Arc: steps {applySteps(prof.kcalBias >= 1 ? -500 : 1000)} ± · water {prof.waterPlus >= 0 ? '+' : ''}{prof.waterPlus}L · warm-up layer armed
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function applySteps(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toLocaleString()}`;
}
