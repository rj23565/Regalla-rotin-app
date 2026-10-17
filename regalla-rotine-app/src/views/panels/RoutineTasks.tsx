import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  Flame,
  ImagePlus,
  Languages,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import type { CyberState } from '../../lib/cyber';
import {
  AVATAR_PRESETS,
  LANGS,
  LIFESPAN_PRESETS,
  ARCS,
  PROGRAMS,
  activeHabits,
  disciplineScore,
  routineHistory,
  taskProgress,
  todayKey,
} from '../../lib/cyber';

type Updater = (u: (x: CyberState) => CyberState) => void;

function Head({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <header>
      <div className="ry-kicker">{kicker}</div>
      <h1 className="ry-gold mt-2 font-display text-[30px] font-bold tracking-tight md:text-[38px]">{title}</h1>
      <p className="mt-1.5 max-w-xl text-[14px] font-medium leading-relaxed cy-muted">{sub}</p>
    </header>
  );
}

/* ═══════════ PANEL 5 · ROUTINE CHECKBOX & DISCIPLINE SCOREBOARD ═══════════ */

export function RoutinePanel({ s, setS }: { s: CyberState; setS: Updater }) {
  const today = todayKey();
  const habits = activeHabits(s);
  const done = new Set(( (s.routine ?? {})[today] ?? []).filter((id) => habits.some((h) => h.id === id)));
  const score = disciplineScore( (s.routine ?? {})[today] ?? [], habits);
  const history = routineHistory(s);
  const past = history.slice(0, -1);
  const avg = past.length ? Math.round(past.reduce((a, d) => a + d.score, 0) / past.length) : 0;
  const delta = score - avg;

  const [adding, setAdding] = useState(false);
  const [hTitle, setHTitle] = useState('');
  const [hDetail, setHDetail] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);

  const toggle = (id: string) =>
    setS((x) => ({ ...x, routine: { ...x.routine, [today]: (x.routine[today] ?? []).includes(id) ? (x.routine[today] ?? []).filter((i) => i !== id) : [...(x.routine[today] ?? []), id] } }));

  const deleteHabit = (id: string) =>
    setS((x) => ({
      ...x,
      habitBoard: activeHabits(x).filter((h) => h.id !== id),
      routine: { ...x.routine, [today]: (x.routine[today] ?? []).filter((i) => i !== id) },
    }));

  const addHabit = () => {
    if (!hTitle.trim()) return;
    setS((x) => ({
      ...x,
      habitBoard: [
        ...activeHabits(x),
        { id: `h_${Date.now().toString(36)}`, label: hTitle.trim().slice(0, 48), detail: hDetail.trim().slice(0, 90) || 'Custom daily habit' },
      ],
    }));
    setHTitle('');
    setHDetail('');
    setAdding(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Head kicker="Daily discipline" title="Routine & Discipline Scoreboard" sub="Eight core habits, one algorithmic score, and a fourteen-day performance timeline." />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {[
          ['Discipline score', `${score}%`, 'live calculation'],
          ['Rolling average', `${avg}%`, 'previous days'],
          ['Delta', `${delta >= 0 ? '+' : ''}${delta}%`, 'vs average'],
          ['Habits today', `${done.size}/${habits.length}`, 'ticked'],
        ].map(([l, v, n]) => (
          <div key={l} className="ry-plate px-4 py-3.5">
            <div className="font-monox text-[8px] font-bold uppercase tracking-[0.2em] cy-muted">{l}</div>
            <div className={`ry-num mt-1 text-2xl ${l === 'Delta' ? (delta >= 0 ? 'text-amber-500' : 'text-red-500') : 'cy-title'}`}>{v}</div>
            <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.16em] cy-muted">{n}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <section className="ry-plate p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="ry-kicker"><Check size={13} className="text-amber-500" /> Core habit matrix</div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setAdding((v) => !v)} className="ry-btn !py-1.5 !px-3">
                <Plus size={12} /> Add Custom Daily Habit
              </button>
              <button
                onClick={() => {
                  if (confirmWipe) {
                    setS((x) => ({ ...x, habitBoard: [], routine: { ...x.routine, [today]: [] } }));
                    setConfirmWipe(false);
                  } else setConfirmWipe(true);
                }}
                className={`ry-ghost !py-1.5 ${confirmWipe ? '!border-red-600 !text-red-400' : ''}`}
              >
                <Trash2 size={11} /> {confirmWipe ? 'Confirm wipe' : '🧹 Clear Canvas'}
              </button>
            </div>
          </div>

          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.05] p-3.5">
              <label className="block">
                <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Habit title</span>
                <input value={hTitle} onChange={(e) => setHTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addHabit()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="e.g. Cold shower every morning" />
              </label>
              <label className="mt-2.5 block">
                <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Description</span>
                <input value={hDetail} onChange={(e) => setHDetail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addHabit()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="What counts as complete?" />
              </label>
              <div className="mt-2.5 flex gap-2">
                <button onClick={addHabit} className="ry-btn flex-1 justify-center !py-2"><Plus size={12} /> Inject into matrix</button>
                <button onClick={() => setAdding(false)} className="ry-ghost !py-2">Cancel</button>
              </div>
            </motion.div>
          )}

          <div className="mt-3.5 flex items-center gap-3">
            <div className="ry-bar flex-1"><div style={{ width: `${score}%` }} /></div>
            <span className="font-monox text-[10px] font-bold cy-muted">{done.size}/{habits.length}</span>
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {habits.length === 0 && (
              <li className="sm:col-span-2 rounded-xl border-2 border-dashed border-amber-500/30 px-4 py-8 text-center">
                <p className="font-display italic text-slate-400">Clean slate — no habits on the canvas.</p>
                <button onClick={() => setAdding(true)} className="ry-btn mt-3 !py-2"><Plus size={12} /> Design your first habit</button>
              </li>
            )}
            {habits.map((h) => {
              const on = done.has(h.id);
              return (
                <motion.li layout key={h.id} className={`ry-row relative !py-3 !pr-9 ${on ? 'done' : ''}`}>
                  <button onClick={() => toggle(h.id)} aria-pressed={on} className={`ry-tick ${on ? 'on' : ''}`}><Check size={13} strokeWidth={3} className={on ? '' : 'opacity-0'} /></button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13px] font-bold ${on ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{h.label}</div>
                    <div className="text-[11px] font-medium text-slate-400">{h.detail}</div>
                  </div>
                  <button
                    onClick={() => deleteHabit(h.id)}
                    aria-label={`Delete ${h.label}`}
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md border border-red-700/50 text-red-500 transition-all hover:bg-red-950/50 hover:border-red-600"
                  >
                    <Trash2 size={11} />
                  </button>
                </motion.li>
              );
            })}
          </ul>
          <p className="mt-3 text-[11px] font-medium leading-snug text-slate-400">
            The score scales to your actual board — with {habits.length} habit{habits.length === 1 ? '' : 's'} active, ticking all {habits.length} registers a perfect 100%.
          </p>
        </section>

        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><Flame size={13} className="text-amber-500" /> Streak timeline · 14 days</div>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            {history.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, d.score)}%` }}
                  transition={{ duration: 0.5 }}
                  className={`w-full rounded-t-md ${d.score >= 75 ? 'bg-gradient-to-t from-amber-600 to-yellow-400' : d.score > 0 ? 'bg-gradient-to-t from-red-800 to-red-600' : 'cy-shell border border-amber-500/15'}`}
                  style={{ minHeight: 4 }}
                  title={`${d.key}: ${d.score}%`}
                />
                <span className="font-monox text-[6.5px] font-bold cy-muted">{d.key.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] font-medium leading-relaxed cy-muted">
            Gold bars mark days at 75% discipline or higher. Today&apos;s {score}% sits {delta >= 0 ? 'above' : 'below'} your rolling {avg}% average.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ═══════════ PANEL 6 · CUSTOM DURATION TASK ENGINE ═══════════ */

export function TaskPanel({ s, setS }: { s: CyberState; setS: Updater }) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [days, setDays] = useState(30);
  const [repeatDaily, setRepeatDaily] = useState(true);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState(21);
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const today = todayKey();

  const resolvedDays = customMode
    ? customUnit === 'days' ? customValue : customUnit === 'weeks' ? customValue * 7 : customValue * 30
    : days;

  const lifespanLabel =
    days === 0 && !customMode ? '♾️ Permanent'
      : customMode ? `⚙️ ${customValue} ${customUnit}`
        : LIFESPAN_PRESETS.find((p) => p.days === days)?.label ?? `${days} Days`;

  const add = () => {
    if (!title.trim()) return;
    setS((x) => ({
      ...x,
      customTasks: [
        ...x.customTasks,
        {
          id: `t_${Date.now().toString(36)}`,
          title: title.trim().slice(0, 60),
          detail: detail.trim().slice(0, 90),
          days: resolvedDays,
          startISO: today,
          done: {},
          repeatDaily,
          lifespanLabel,
        },
      ],
    }));
    setTitle('');
    setDetail('');
  };

  const tickDay = (id: string, day: number | string) =>
    setS((x) => ({ ...x, customTasks: x.customTasks.map((tk) => (tk.id === id ? { ...tk, done: { ...tk.done, [day]: !tk.done[day] } } : tk)) }));

  const active =  (s.customTasks ?? []).filter((tk) => !tk.archived);
  const archived =  (s.customTasks ?? []).filter((tk) => tk.archived);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Head kicker="Duration engine" title="Custom Task Engine" sub="Total control — every default task is deletable, every duration configurable, every timeline tracked." />

      {/* global wipe */}
      <section className="ry-plate p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-[15px] font-bold cy-title">Routine board control</div>
            <p className="mt-0.5 text-[12px] font-medium cy-muted">{active.length} active · {archived.length} archived · every item is deletable</p>
          </div>
          <button
            onClick={() => {
              if (confirmWipe) {
                setS((x) => ({ ...x, customTasks: [] }));
                setConfirmWipe(false);
              } else setConfirmWipe(true);
            }}
            className={`ry-btn ${confirmWipe ? 'ry-btn-crimson' : ''}`}
          >
            <Trash2 size={13} /> {confirmWipe ? 'Tap again to confirm wipe' : '🧹 Clear All Default Tasks'}
          </button>
        </div>
        {active.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-amber-500/30 px-4 py-6 text-center font-display italic cy-muted">
            Board is empty — build your dashboard entirely from scratch below.
          </p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          {/* configurator */}
          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker"><Sparkles size={13} className="text-amber-500" /> Task generator</div>
            <label className="mt-4 block">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Goal title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="ry-input mt-1.5 !pl-3.5" placeholder="e.g. Read 20 pages nightly" />
            </label>
            <label className="mt-3 block">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Detail (optional)</span>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} className="ry-input mt-1.5 !pl-3.5" placeholder="What counts as complete?" />
            </label>

            <div className="mt-3.5">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Task expiration duration</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LIFESPAN_PRESETS.map((p) => {
                  const isCustom = p.kind === 'custom';
                  const on = isCustom ? customMode : !customMode && days === p.days;
                  return (
                    <button
                      key={p.label}
                      onClick={() => {
                        if (isCustom) setCustomMode(true);
                        else { setCustomMode(false); setDays(p.days); }
                      }}
                      className={`rounded-xl border-2 px-2 py-2.5 text-center transition-all duration-300 hover:-translate-y-0.5 ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'}`}
                    >
                      <span className={`block font-display text-[12px] font-bold ${on ? 'text-amber-500' : 'text-slate-300'}`}>{p.label}</span>
                      <span className="font-monox text-[7px] font-bold uppercase tracking-[0.1em] cy-muted">
                        {isCustom ? 'exact control' : p.days === 0 ? 'never expires' : `${p.days} days`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {customMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2.5 overflow-hidden rounded-xl border-2 border-amber-500/35 bg-amber-500/[0.05] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={customValue}
                      onChange={(e) => setCustomValue(Math.max(1, Number(e.target.value)))}
                      className="ry-input !w-24 !pl-3 !py-2 text-center"
                    />
                    <div className="flex overflow-hidden rounded-lg border border-amber-500/30">
                      {(['days', 'weeks', 'months'] as const).map((u) => (
                        <button key={u} onClick={() => setCustomUnit(u)} className={`px-2.5 py-2 font-monox text-[9px] font-bold uppercase ${customUnit === u ? 'bg-amber-500 text-neutral-950' : 'cy-muted'}`}>{u}</button>
                      ))}
                    </div>
                    <span className="font-monox text-[9px] font-bold uppercase tracking-[0.12em] text-amber-600">= {resolvedDays} days</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* recurrence */}
            <button
              onClick={() => setRepeatDaily((v) => !v)}
              className={`mt-3.5 flex w-full items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition-all ${repeatDaily ? 'border-amber-500/50 bg-amber-500/10' : 'border-neutral-800 bg-neutral-900/50'}`}
            >
              <span className="min-w-0">
                <span className="block text-[12.5px] font-bold cy-title">🔁 Repeat Daily for this Duration</span>
                <span className="block text-[11px] font-medium cy-muted">
                  {repeatDaily ? 'Re-appears on Today’s checklist every morning until expiry' : 'One-off — ticks only the days you choose'}
                </span>
              </span>
              <span className={`flex-none rounded-md px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${repeatDaily ? 'bg-amber-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>
                {repeatDaily ? 'on' : 'off'}
              </span>
            </button>

            <button onClick={add} className="ry-btn mt-4 w-full"><Sparkles size={13} /> Generate task</button>
          </section>

          <section className="ry-plate p-5">
            <div className="flex items-center justify-between">
              <div className="ry-kicker"><Zap size={13} className="text-amber-500" /> Arc task override</div>
              <button onClick={() => setS((x) => ({ ...x, arcOverride: !x.arcOverride }))} className={`rounded-lg px-2.5 py-1 font-monox text-[9px] font-bold uppercase ${s.arcOverride ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>
                {s.arcOverride ? 'stripped' : 'default'}
              </button>
            </div>
            <p className="mt-2.5 text-[12px] font-medium leading-relaxed cy-muted">
              {s.arcOverride
                ? 'Seasonal Arc tasks are stripped from your queues. Only your custom rules drive the trackers now.'
                : 'Seasonal Arc tasks (hydration blocks, tendon warm-ups) currently ride alongside your custom tasks.'}
            </p>
          </section>
        </div>

        {/* active tracks */}
        <section className="ry-plate p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="ry-kicker"><CalendarDays size={13} className="text-amber-500" /> Active task tracks</div>
            <span className="font-monox text-[9px] font-bold cy-muted">{active.length} running</span>
          </div>
          <div className="mt-4 space-y-3">
            {active.length === 0 && <p className="rounded-xl border border-dashed cy-hair py-10 text-center font-display italic cy-muted">No active tasks — forge your first on the left.</p>}
            {active.map((tk) => {
              const p = taskProgress(tk, s.arcOverride);
              const tickedToday = tk.repeatDaily ? !!tk.done[today] : undefined;
              return (
                <motion.div layout key={tk.id} className="rounded-xl border-2 border-amber-500/25 cy-shell p-3.5 transition-all duration-300 hover:border-amber-500/45">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-[14.5px] font-bold cy-title">{tk.title}</span>
                        {tk.repeatDaily && <span className="rounded border border-amber-500/30 px-1.5 py-0.5 font-monox text-[7px] font-bold uppercase text-amber-600">🔁 daily</span>}
                      </div>
                      {tk.detail && <div className="mt-0.5 text-[11.5px] font-medium cy-muted">{tk.detail}</div>
                      }
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className={`rounded-md border px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.1em] ${p.permanent ? 'border-sky-700/50 bg-sky-950/30 text-sky-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-600'}`}>
                          Timeline: {tk.lifespanLabel ?? (p.permanent ? '♾️ Permanent' : `${tk.days} Days`)}
                        </span>
                        <span className="rounded-md border border-neutral-700 bg-neutral-950/50 px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.1em] cy-muted">
                          {p.permanent ? `Day ${p.index} · ${p.doneCount} banked` : `Days Remaining: ${p.daysLeft} of ${tk.days}`}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setS((x) => ({ ...x, customTasks: x.customTasks.filter((z) => z.id !== tk.id) }))} className="flex-none rounded-lg border border-red-700/50 p-1.5 text-red-500 transition-all hover:bg-red-950/40 hover:border-red-600" aria-label={`Delete ${tk.title}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="ry-bar flex-1"><div style={{ width: `${p.permanent ? 100 : p.pct * 100}%` }} /></div>
                    <span className="font-monox text-[9px] font-bold cy-muted">{p.doneCount}{p.permanent ? '' : `/${p.total}`}</span>
                  </div>

                  {tickedToday !== undefined && (
                    <button
                      onClick={() => tickDay(tk.id, today)}
                      className={`mt-2.5 w-full rounded-lg border-2 py-2 font-monox text-[9.5px] font-bold uppercase tracking-[0.12em] transition-all ${tickedToday ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-neutral-800 bg-neutral-900/50 text-slate-400 hover:border-amber-500/50'}`}
                    >
                      {tickedToday ? '✓ Completed today' : 'Mark today complete'}
                    </button>
                  )}

                  {p.expired ? (
                    <div className="mt-2.5 rounded-lg border-2 border-red-700/50 bg-red-950/20 px-3 py-2.5">
                      <p className="text-[12px] font-semibold cy-strong">This track has reached its expiration date.</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button onClick={() => setS((x) => ({ ...x, customTasks: x.customTasks.map((z) => (z.id === tk.id ? { ...z, archived: true } : z)) }))} className="ry-ghost !py-1.5">
                          Archive smoothly
                        </button>
                        <button onClick={() => setS((x) => ({ ...x, customTasks: x.customTasks.map((z) => (z.id === tk.id ? { ...z, startISO: today, done: {} } : z)) }))} className="ry-btn !py-1.5">
                          Restart timeline
                        </button>
                      </div>
                    </div>
                  ) : (
                    !tk.repeatDaily && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {Array.from({ length: tk.days }, (_, i) => i + 1).slice(0, 40).map((d) => (
                          <button key={d} onClick={() => tickDay(tk.id, d)} className={`h-5 w-5 rounded-[5px] border-2 text-[7px] font-bold transition-all ${tk.done[d] ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-amber-500/25 cy-shell cy-muted'}`}>
                            {d > 99 ? '' : d}
                          </button>
                        ))}
                        {tk.days > 40 && <span className="self-center font-monox text-[8px] font-bold cy-muted">+{tk.days - 40} more days</span>}
                      </div>
                    )
                  )}
                </motion.div>
              );
            })}
          </div>

          {archived.length > 0 && (
            <div className="mt-4 border-t border-neutral-800 pt-3.5">
              <div className="flex items-center justify-between">
                <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Archived · {archived.length}</span>
                <button onClick={() => setS((x) => ({ ...x, customTasks: x.customTasks.filter((z) => !z.archived) }))} className="ry-ghost !py-1 !px-2 text-[8px]">Purge archive</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {archived.map((tk) => (
                  <span key={tk.id} className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-950/50 px-2 py-1 font-monox text-[8.5px] font-bold text-slate-500">
                    {tk.title.slice(0, 22)}
                    <button onClick={() => setS((x) => ({ ...x, customTasks: x.customTasks.map((z) => (z.id === tk.id ? { ...z, archived: false, startISO: today, done: {} } : z)) }))} className="text-amber-600 hover:text-amber-400" aria-label="Restore">↺</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ═══════════ PANEL 7 · PROFILE & LOCAL SYSTEM SETTINGS ═══════════ */

export function ProfilePanel({ s, setS }: { s: CyberState; setS: Updater }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const onFile = (f: File | null | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setS((x) => ({ ...x, avatar: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Head kicker="Identity & configuration" title="Profile & System Settings" sub="Avatar, bio, core targets, language and data controls — all bound to your private pool." />

      <div className="grid gap-5 md:grid-cols-2">
        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><ImagePlus size={13} className="text-amber-500" /> Avatar</div>
          <div className="mt-5 flex flex-col items-center">
            {s.avatar ? <img src={s.avatar} alt="avatar" className="h-[116px] w-[116px] rounded-full border-2 border-amber-500/40 object-cover" /> : <span className="grid h-[116px] w-[116px] place-items-center rounded-full border-2 border-amber-500/40 font-display text-3xl font-bold text-amber-500">{(s.auth?.name ?? 'A').slice(0, 1)}</span>}
            <button onClick={() => fileRef.current?.click()} className="ry-btn mt-4 !py-2.5"><Upload size={13} /> Upload from device</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {AVATAR_PRESETS.map((a) => (
              <button key={a.id} onClick={() => setS((x) => ({ ...x, avatar: a.uri }))} title={a.label} className={`overflow-hidden rounded-xl border-2 transition-all ${s.avatar === a.uri ? 'border-amber-500' : 'border-transparent hover:border-amber-500/40'}`}>
                <img src={a.uri} alt={a.label} className="h-full w-full" />
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker">Profile customizer</div>
            <label className="mt-4 block">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Display name</span>
              <input value={s.auth?.name ?? ''} onChange={(e) => setS((x) => ({ ...x, auth: x.auth ? { ...x.auth, name: e.target.value } : x.auth }))} className="ry-input mt-1.5 !pl-3.5" placeholder="Your name" />
            </label>
            <label className="mt-3 block">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Bio</span>
              <textarea value={s.bio} onChange={(e) => setS((x) => ({ ...x, bio: e.target.value }))} rows={2} className="ry-input mt-1.5 !pl-3.5" placeholder="Who are you?" />
            </label>
            <label className="mt-3 block">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] cy-muted">Core target</span>
              <textarea value={s.goal} onChange={(e) => setS((x) => ({ ...x, goal: e.target.value }))} rows={2} className="ry-input mt-1.5 !pl-3.5" placeholder="What are you chasing?" />
            </label>
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="ry-btn mt-4">{saved ? <Check size={13} /> : <Sparkles size={13} />} {saved ? 'Saved to your pool' : 'Save profile'}</button>
          </section>

          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker"><Languages size={13} className="text-amber-500" /> System language</div>
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              {LANGS.map((l) => {
                const on = s.lang === l.id;
                return (
                  <button key={l.id} onClick={() => setS((x) => ({ ...x, lang: l.id }))} className={`rounded-xl border-2 px-3 py-2.5 text-center transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell'}`}>
                    <span className={`block text-[13px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{l.native}</span>
                    <span className="font-monox text-[7.5px] font-bold uppercase tracking-[0.12em] cy-muted">{l.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker"><Sun size={13} className="text-amber-500" /> Theme</div>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {([['dark', 'Royal Dark', Moon], ['light', 'Pure Light', Sun]] as const).map(([id, label, Icon]) => {
                const on = s.theme === id;
                return (
                  <button key={id} onClick={() => setS((x) => ({ ...x, theme: id }))} className={`flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-3 transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell'}`}>
                    <Icon size={16} className={on ? 'text-amber-500' : 'cy-muted'} />
                    <span className={`font-display text-[13px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker"><RotateCcw size={13} className="text-amber-500" /> Data reset</div>
            <p className="mt-3 text-[12.5px] font-medium leading-relaxed cy-soft">
              Wipes every statistic in <span className="font-bold text-amber-600">{(s.auth?.mail ?? 'guest').toLowerCase()}</span>&apos;s private pool — logs, scores, meals, scans and task tracks. Profile, theme and language survive.
            </p>
            <button onClick={() => { if (confirm) { setS((x) => ({ ...x, tier: 1, gates: {}, checks: {}, routine: {}, customTasks: [], meals: [], skinScans: [], progressShots: {}, compare: [null, null], studyHours: {}, mocks: {}, revision: {}, flashSeen: [], water: {}, breath: {}, flex: {} })); setConfirm(false); } else setConfirm(true); }} className={`ry-btn mt-3.5 ${confirm ? 'ry-btn-crimson' : ''}`}>
              <RotateCcw size={13} /> {confirm ? 'Tap again to confirm' : 'Reset my data'}
            </button>
          </section>
        </div>
      </div>

      <section className="ry-plate p-5 md:p-6">
        <div className="ry-kicker">Active configuration snapshot</div>
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {[
            ['Program', PROGRAMS[s.program].name],
            ['Season', ARCS[s.arc].name],
            ['Grade', `Grade ${s.grade}`],
            ['Benchmark', s.division === 'first' ? 'First Division' : 'Second Division'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-amber-500/20 cy-shell px-3 py-3 text-center">
              <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.16em] cy-muted">{k}</div>
              <div className="mt-0.5 font-display text-[13px] font-bold cy-title">{v}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
