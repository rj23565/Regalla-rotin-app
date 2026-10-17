import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Check,
  Flame,
  Gauge,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { CyberState } from '../../lib/cyber';
import {
  PROGRAMS,
  bmi,
  fromKg,
  toKg,
  todayKey,
  weightPlan,
} from '../../lib/cyber';

type Updater = (u: (x: CyberState) => CyberState) => void;

const GOALS: Array<{ id: 'auto' | 'gain' | 'loss'; label: string; note: string; Icon: typeof TrendingUp }> = [
  { id: 'auto', label: 'Auto Detect', note: 'Follows the target arithmetic', Icon: Gauge },
  { id: 'gain', label: 'Gain Mode', note: 'Force a surplus trajectory', Icon: TrendingUp },
  { id: 'loss', label: 'Loss Mode', note: 'Force a deficit trajectory', Icon: TrendingDown },
];

/** Coach recommendation engine derived from the live plan numbers. */
function recommend(s: CyberState, plan: ReturnType<typeof weightPlan>) {
  const mass = bmi(s);
  const protein = Math.round(s.weightKg * (plan.direction === 'gain' ? 2.0 : plan.direction === 'loss' ? 2.4 : 2.2));
  if (plan.direction === 'gain') {
    return {
      title: `Coach Suggestion: Gain ${Math.abs(plan.delta).toFixed(1)}kg of Lean Mass`,
      lines: [
        `Eat ${plan.kcalTarget.toLocaleString()} kcal daily — a surplus of roughly ${Math.max(200, plan.kcalTarget - Math.round(s.weightKg * 31))} kcal above maintenance.`,
        `Hold protein at ${protein}g and split the rest into dense carbs around training windows.`,
        'Double your compound volume: weighted pull-ups, heavy bag rows and deep loaded squats, 4 sessions weekly.',
        `Rest ${plan.restSeconds}s between working sets — full ATP recovery drives hypertrophy.`,
        `At a safe +0.5kg per week you reach ${toKg(s.targetWeight, s.weightUnit).toFixed(1)}kg in about ${plan.weeks} week${plan.weeks > 1 ? 's' : ''}.`,
      ],
    };
  }
  if (plan.direction === 'loss') {
    return {
      title: `Coach Suggestion: Cut ${Math.abs(plan.delta).toFixed(1)}kg of Fat`,
      lines: [
        `Cap intake at ${plan.kcalTarget.toLocaleString()} kcal daily — the deficit is the entire program.`,
        `Protect muscle with ${protein}g of protein; never trade density for speed.`,
        `Log ${plan.aerobicMin} minutes of aerobic work daily and keep circuit rests at ${plan.restSeconds}s.`,
        'Weighted strength stays in the plan — lifting heavy is what tells the body to keep the muscle.',
        `At a safe −0.5kg per week you reach ${toKg(s.targetWeight, s.weightUnit).toFixed(1)}kg in about ${plan.weeks} week${plan.weeks > 1 ? 's' : ''}.`,
      ],
    };
  }
  return {
    title: 'Coach Suggestion: Hold and Consolidate',
    lines: [
      `Your target matches your current ${s.weightKg}kg — maintenance calories are ${plan.kcalTarget.toLocaleString()} kcal.`,
      'Keep training volume balanced and prioritise sleep and protein consistency.',
      'Set a new target weight above or below to re-engage the gain or loss engine.',
      `Your BMI reads ${mass.value} (${mass.band}) — use it as a rough compass, not a verdict.`,
    ],
  };
}

export function BodyPanel({ s, setS }: { s: CyberState; setS: Updater }) {
  const plan = useMemo(() => weightPlan(s), [s]);
  const mass = bmi(s);
  const rec = recommend(s, plan);
  const today = todayKey();

  const setGoalProgram = (goal: 'gain' | 'loss') => {
    // Keep the transformation program selector in sync with the chosen goal.
    setS((x) => ({ ...x, weightGoal: goal, program: goal === 'gain' ? 'gain' : 'loss' }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <div className="ry-kicker">Body composition engine</div>
        <h1 className="ry-gold mt-2 font-display text-[30px] font-bold tracking-tight md:text-[38px]">Weight Target &amp; Goal Planner</h1>
        <p className="mt-1.5 max-w-xl text-[14px] font-medium leading-relaxed cy-muted">
          Set your current and target weight, pick gain or loss, and the engine calculates your calories, timeline and milestones — then tells you exactly what to do.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        {/* inputs */}
        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><Scale size={13} className="text-amber-500" /> Your numbers</div>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <label>
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Current (kg)</span>
              <input type="number" min={30} max={250} step={0.1} value={s.weightKg} onChange={(e) => setS((x) => ({ ...x, weightKg: Number(e.target.value) }))} className="ry-input mt-1.5 !pl-3 !py-2" />
            </label>
            <label>
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Target (kg)</span>
              <input type="number" min={30} max={250} step={0.1} value={fromKg(toKg(s.targetWeight, s.weightUnit), 'kg')} onChange={(e) => setS((x) => ({ ...x, targetWeight: Number(e.target.value), weightUnit: 'kg' }))} className="ry-input mt-1.5 !pl-3 !py-2" />
            </label>
            <label>
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Height (cm)</span>
              <input type="number" min={120} max={220} value={s.heightCm} onChange={(e) => setS((x) => ({ ...x, heightCm: Number(e.target.value) }))} className="ry-input mt-1.5 !pl-3 !py-2" />
            </label>
          </div>

          <div className="mt-3.5">
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Goal mode</span>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {GOALS.map(({ id, label, note, Icon }) => {
                const on = s.weightGoal === id;
                return (
                  <button
                    key={id}
                    onClick={() => (id === 'auto' ? setS((x) => ({ ...x, weightGoal: 'auto' })) : setGoalProgram(id))}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell hover:border-amber-500/40'}`}
                  >
                    <Icon size={17} className={on ? 'text-amber-500' : 'cy-muted'} />
                    <span className={`font-display text-[12.5px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{label}</span>
                    <span className="font-monox text-[7px] font-bold uppercase tracking-[0.1em] cy-muted">{note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ['Delta', `${plan.delta >= 0 ? '+' : ''}${plan.delta.toFixed(1)}kg`],
              ['Timeline', `${plan.weeks}w`],
              ['Calories', plan.kcalTarget.toLocaleString()],
              ['BMI', `${mass.value}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-amber-500/20 cy-shell px-2 py-2.5 text-center">
                <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] cy-muted">{k}</div>
                <div className="ry-num mt-0.5 text-[15px] text-amber-500">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Live progress to target</span>
              <span className="font-monox text-[9px] font-bold text-amber-500">{Math.round((1 - Math.abs(plan.delta) / Math.max(0.1, Math.abs(toKg(s.targetWeight, s.weightUnit) - s.weightKg) || 1)) * 100)}%</span>
            </div>
            <div className="ry-bar mt-1.5">
              <div style={{ width: `${Math.min(100, Math.max(4, 100 - (Math.abs(plan.delta) / Math.max(0.5, Math.abs(toKg(s.targetWeight, s.weightUnit) - s.weightKg) || 1)) * 100))}%` }} />
            </div>
            <p className="mt-1 font-monox text-[8px] font-bold uppercase tracking-[0.14em] cy-muted">BMI band · {mass.band}</p>
          </div>
        </section>

        {/* recommendation */}
        <div className="space-y-5">
          <section className="ry-frame">
            <div className="px-5 py-5 md:px-6">
              <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.28em] text-amber-600">
                <Sparkles size={13} className="text-amber-500" /> Coach AI recommendation
              </div>
              <h2 className={`mt-2 font-display text-[20px] font-bold leading-tight md:text-[24px] ${plan.direction === 'loss' ? 'text-red-500' : 'text-amber-500'}`}>{rec.title}</h2>
              <ul className="mt-3.5 space-y-2">
                {rec.lines.map((l) => (
                  <li key={l} className="flex items-start gap-2.5 text-[13px] font-medium leading-snug cy-soft">
                    <ArrowRight size={12} className="mt-0.5 flex-none text-amber-500" /> {l}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-2.5 py-1 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-amber-600">
                  {PROGRAMS[s.program].emoji} {PROGRAMS[s.program].name}
                </span>
                <span className="rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-2.5 py-1 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-amber-600">
                  {plan.volumeMult === 2 ? 'Doubled hypertrophy volume' : 'Standard volume'}
                </span>
              </div>
            </div>
          </section>

          <section className="ry-plate p-5">
            <div className="flex items-center justify-between">
              <div className="ry-kicker"><Target size={13} className="text-amber-500" /> Milestone check-offs</div>
              <span className="font-monox text-[9px] font-bold text-amber-500">{plan.milestoneKg.filter((m) =>  (s.milestones ?? {})[m]).length}/{plan.milestoneKg.length}</span>
            </div>
            {plan.milestoneKg.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed cy-hair py-8 text-center font-display italic cy-muted">
                Set a target different from your current weight to generate 0.5kg milestones.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {plan.milestoneKg.map((m) => {
                  const on = !! (s.milestones ?? {})[m];
                  return (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      key={m}
                      onClick={() => setS((x) => ({ ...x, milestones: { ...x.milestones, [m]: !on } }))}
                      className={`rounded-lg border-2 px-2.5 py-1.5 font-monox text-[9.5px] font-bold transition-all ${on ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-amber-600/35 text-amber-600'}`}
                    >
                      {on && <Check size={10} className="mr-1 inline" />}{m}kg
                    </motion.button>
                  );
                })}
              </div>
            )}
            <p className="mt-3 font-monox text-[8px] font-bold uppercase tracking-[0.14em] cy-muted">
              Safe rate 0.5kg/week · logged {today} · saved to your private pool
            </p>
          </section>

          <section className="ry-plate p-5">
            <div className="ry-kicker"><Activity size={13} className="text-amber-500" /> Program synced to goal</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(Object.keys(PROGRAMS) as Array<'gain' | 'loss' | 'shred'>).map((id) => {
                const p = PROGRAMS[id];
                const on = s.program === id;
                return (
                  <button key={id} onClick={() => setS((x) => ({ ...x, program: id, weightGoal: id === 'gain' ? 'gain' : id === 'loss' ? 'loss' : 'auto' }))} className={`rounded-xl border-2 px-2 py-3 text-center transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell'}`}>
                    <span className="text-lg">{p.emoji}</span>
                    <span className={`mt-1 block font-display text-[11.5px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{p.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[12px] font-medium leading-snug cy-muted">
              <Flame size={13} className="mt-0.5 flex-none text-amber-500" />
              Choosing a goal mode here keeps the transformation selector, calorie targets and rest timers in sync across every panel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
