// ─── Calizen Engine · calisthenics roadmap + auto-task scheduler ────────────
// Deterministic tier progression, milestone gates and day-type task queues.

export interface Exercise {
  name: string;
  form: string;
}

export interface MilestoneReq {
  id: string;
  label: string;
  target: number;
  unit: string;
}

export interface CaliTier {
  id: number;
  name: string;
  numeral: string;
  epithet: string;
  focus: string;
  exercises: Exercise[];
  milestone: MilestoneReq[];
  gateText: string;
  next: string | null;
}

export const TIERS: CaliTier[] = [
  {
    id: 1,
    name: 'Ground Zero',
    numeral: 'I',
    epithet: 'The Tendon Forge',
    focus: 'Building baseline tendon strength and core stability.',
    exercises: [
      { name: 'Incline Push-ups', form: 'Body straight, chest touching the elevated surface.' },
      { name: 'Knee Push-ups', form: 'Hips extended, core tight, full range of motion.' },
      { name: 'Australian Pull-ups (Bodyweight Rows)', form: 'Bar at chest height, straight body line, pulling chest to bar.' },
      { name: 'Scapular Shrugs (Active Hangs)', form: 'Hanging straight-armed, packing shoulders down and back.' },
      { name: 'Support Hold', form: 'Keeping body stable on parallel bars/chairs with locked arms.' },
      { name: 'Air Squats', form: 'Feet shoulder-width, dropping hips below parallel with a straight back.' },
    ],
    milestone: [
      { id: 't1_pushups', label: 'Perfect regular push-ups (3 sets)', target: 15, unit: 'reps per set' },
      { id: 't1_rows', label: 'Strict bodyweight rows', target: 8, unit: 'reps' },
      { id: 't1_hang', label: 'Active hang hold', target: 45, unit: 'seconds' },
    ],
    gateText: 'Perform 3 sets of 15 perfect regular push-ups, 8 bodyweight rows, and a 45-second active hang.',
    next: 'Solid Foundation',
  },
  {
    id: 2,
    name: 'Solid Foundation',
    numeral: 'II',
    epithet: 'The Volume Engine',
    focus: 'Hypertrophy, volume accumulation, and straight-arm strength.',
    exercises: [
      { name: 'Regular / Explosive Push-ups', form: 'Chest-to-floor, explosive ascent.' },
      { name: 'Diamond & Clap Push-ups', form: 'Hands close for triceps; explosive push with hand-clap.' },
      { name: 'Chair Dips', form: 'Triceps isolation, maintaining safe shoulder extension angles.' },
      { name: 'Dead-Hang Pull-ups', form: 'Complete dead-hang to chin over bar without kipping — 12, 11, 11 rep schemes.' },
      { name: 'Lats & Traps Bag Rows', form: 'High-volume home rowing movements using weighted resistance.' },
      { name: 'L-Sit Progressions', form: 'Tucked L-sit on floor or bars holding core compression.' },
      { name: 'Deep Squat Variations', form: 'Sumo, regular, and close-stance squats — sets of 10.' },
    ],
    milestone: [
      { id: 't2_pullups', label: 'Strict dead-hang pull-ups', target: 12, unit: 'reps' },
      { id: 't2_dips', label: 'Deep dips', target: 25, unit: 'reps' },
      { id: 't2_lsit', label: 'Clean tucked L-sit', target: 15, unit: 'seconds' },
    ],
    gateText: '12 strict pull-ups, 25 deep dips, and a 15-second clean tucked L-sit.',
    next: 'Elite Execution',
  },
  {
    id: 3,
    name: 'Elite Execution',
    numeral: 'III',
    epithet: 'The Apex Tier',
    focus: 'Neurological adaptation, heavy explosive movements, static holds, absolute power.',
    exercises: [
      { name: 'Muscle-up Progressions', form: 'Fast chest-to-bar pull-ups transitioning cleanly into a straight-bar dip.' },
      { name: 'Handstand Push-ups', form: 'Vertical pushing power against a wall, head touching floor safely.' },
      { name: 'Front Lever & Planche Progressions', form: 'Tuck, advanced tuck, and one-leg hold variations.' },
      { name: 'Pistol Squats', form: 'Strict, single-leg deep squats controlling descent and ascent.' },
    ],
    milestone: [],
    gateText: 'The apex is held, not reached — maintain elite volume daily.',
    next: null,
  },
];

// ── Auto-task engine · training split schedules ─────────────────────────────

export type DayKind = 'push' | 'back' | 'rest';

export interface EngineTask {
  id: string;
  label: string;
  detail: string;
}

export const ENGINE_TASKS: Record<DayKind, EngineTask[]> = {
  push: [
    { id: 'push_complex', label: 'Push-up complexes × 3 rounds', detail: 'Incline / explosive / clap / wide / diamond rotations' },
    { id: 'push_dips', label: 'Chair dips 3 × 20', detail: 'Safe shoulder extension angles on the descent' },
    { id: 'push_burnout', label: 'Final burnout set', detail: 'Regular + diamond combinations to failure' },
    { id: 'push_stretch', label: 'Deep stretching session', detail: 'Chest-opening passive holds, 3 × 40s' },
  ],
  back: [
    { id: 'back_pullups', label: 'Dead-hang pull-ups', detail: 'Set 1: 12 reps · Set 2: 11 · Set 3: 11 — no kipping' },
    { id: 'back_rows', label: 'Bag-weighted traps & lats rows', detail: 'High-volume isolation pulls, 4 sets' },
    { id: 'back_core', label: 'Core structural sets', detail: 'Hollow hold + plank chain, 3 rounds' },
    { id: 'back_stretch', label: 'Lat & spinal decompression', detail: 'Passive lat hangs, 2 × 45s' },
  ],
  rest: [
    { id: 'rest_breath', label: 'Breathwork block — 20 min', detail: 'Recovery pacer, slow diaphragmatic rounds' },
    { id: 'rest_hips', label: 'Hip flexor passive hold', detail: 'Couch stretch 3 × 45s per side' },
    { id: 'rest_sleep', label: 'Log sleep metrics', detail: 'Hours + quality in the Recovery module' },
  ],
};

/** Weekday (0=Sun … 6=Sat) → day kind, per chosen split frequency. */
export const SPLIT_MAP: Record<number, Record<number, DayKind>> = {
  2: { 0: 'rest', 1: 'push', 2: 'rest', 3: 'rest', 4: 'back', 5: 'rest', 6: 'rest' },
  3: { 0: 'rest', 1: 'push', 2: 'rest', 3: 'back', 4: 'rest', 5: 'push', 6: 'rest' },
  4: { 0: 'rest', 1: 'push', 2: 'back', 3: 'rest', 4: 'push', 5: 'back', 6: 'rest' },
  5: { 0: 'rest', 1: 'push', 2: 'back', 3: 'push', 4: 'rest', 5: 'back', 6: 'rest' },
  6: { 0: 'push', 1: 'back', 2: 'push', 3: 'back', 4: 'push', 5: 'back', 6: 'rest' },
};

export const dayParts = (weekday: number, split: number): DayKind =>
  (SPLIT_MAP[split] ?? SPLIT_MAP[4])[weekday];

export const barPct = (done: number, total: number) => (total === 0 ? 0 : done / total);
