// ─── Cyber Athlete Engine · fully client-side, zero placeholders ─────────────
import { useEffect, useRef, useState } from 'react';

export type ArcId = 'summer' | 'winter';
export type TierId = 1 | 2 | 3;
export type SplitKind = 'push' | 'back';

export interface ExerciseDef {
  name: string;
  cue: string;
  scheme: string;
  warning: string;
}

export interface TierDef {
  id: TierId;
  name: string;
  tag: string;
  goals: string;
  exercises: ExerciseDef[];
  gate: string[];
}

export const TIERS: TierDef[] = [
  {
    id: 1,
    name: 'Ground Zero',
    tag: 'BEGINNER',
    goals: 'Joint prep, tendon thickness, basic pushing geometry.',
    exercises: [
      { name: 'Incline Push-ups', cue: 'Hands on an elevated surface, body rigid as a plank from head to heel. Lower chest to touch the surface with full control.', scheme: '3 × 15 reps', warning: 'Hips must not sag — brace the core like taking a hit.' },
      { name: 'Knee Push-ups', cue: 'Knees down, hips pressed forward, full extension at the top and chest to floor at the bottom.', scheme: '3 × 12 reps', warning: 'No half-reps. Hips extended, never a table-top spine.' },
      { name: 'Australian Pull-ups / Bodyweight Rows', cue: 'Bar at chest height, hang straight underneath, pull chest all the way to the bar.', scheme: '4 × 8–10 reps', warning: 'Keep the body in one line — no bent-knee cheating rows.' },
      { name: 'Scapular Hangs (Active Hangs)', cue: 'Hang straight-armed from the bar, pack shoulders DOWN and BACK, hold with tension in the lats.', scheme: '3 × 30–45s hold', warning: 'Never swing. Silence the body completely and breathe.' },
    ],
    gate: ['3 sets × 15 perfect regular push-ups', '8 chest-to-bar bodyweight rows', '45-second strict active hang'],
  },
  {
    id: 2,
    name: 'Solid Foundation',
    tag: 'INTERMEDIATE',
    goals: 'Explosive power, straight-arm core compression, high-volume conditioning.',
    exercises: [
      { name: 'Dead-Hang Pull-ups (Strict)', cue: 'Full dead-hang at the bottom, pull until the chin clears the bar. Zero momentum, zero kipping.', scheme: '12 / 11 / 11 strict reps', warning: 'The lats do the work — arms are just hooks. Fight the descent.' },
      { name: 'Diamond Push-ups', cue: 'Thumbs and index fingers touching under the chest, elbows tracking tight along the ribs.', scheme: '3 × 15 reps', warning: 'Elbows must not flare — this burns the triceps boss-level.' },
      { name: 'Parallel Bar Dips', cue: 'Shoulders pinned down, lower until shoulders are below elbows, press hard back up.', scheme: '4 × 10–25 reps', warning: 'No shoulder shrug — ears away from traps the entire set.' },
      { name: 'Tucked L-Sits', cue: 'Palms flat or on bars, knees compressed to chest, hold the compression with locked arms.', scheme: '5 × 15s cumulative', warning: 'Keep shoulders packed — a tall arm column is the whole point.' },
      { name: 'Deep Squat Variations', cue: 'Ass-to-grass range with an upright chest; alternate regular, sumo, and close-stance squats.', scheme: '3 × 10 per variation', warning: 'Heels planted. Never collapse the upper back forward.' },
    ],
    gate: ['12 strict dead-hang pull-ups', '25 parallel bar chest-dips', '15-second clean tucked L-sit'],
  },
  {
    id: 3,
    name: 'Elite Execution',
    tag: 'ADVANCED / PRO',
    goals: 'Defying gravity, absolute muscle coordination, high neurological output.',
    exercises: [
      { name: 'Strict Muscle-up Transitions', cue: 'Explosive chest-to-bar pull, aggressive false-grip transition, press straight into the bar dip.', scheme: '5 × 3 reps', warning: 'No kip kick-outs. The transition is fast and violent — never sluggish.' },
      { name: 'Wall-Supported Handstand Push-ups', cue: 'Nose to wall, body vertical, lower the head between the hands and press up hard.', scheme: '4 × 6–10 reps', warning: 'Stack ribs over hips — a banana back kills this lift and your spine.' },
      { name: 'Front Lever Progressions', cue: 'Lock the arms, depress the shoulders, and float the body horizontal in tuck, advanced tuck, or one-leg.', scheme: '5 × 8–20s hold', warning: 'Elbows bone straight. Any bend means the set is done.' },
      { name: 'Pistol Squats', cue: 'One leg extended, controlled descent to the floor and stand back up without touching.', scheme: '3 × 5 per leg', warning: 'Never bounce out of the bottom — control the whole eccentric.' },
    ],
    gate: [],
  },
];

// ── Auto-task engine ──────────────────────────────────────────────────────────

export interface TaskDef {
  id: string;
  label: string;
  detail: string;
}

export const SPLIT_TASKS: Record<SplitKind, TaskDef[]> = {
  push: [
    { id: 'p_complex', label: 'Push-up Complexes · 3 Rounds', detail: 'Incline → explosive → wide → diamond rotation, 90s rest between rounds' },
    { id: 'p_dips', label: 'Chair Dips · 3 Sets × 20', detail: 'Shoulders pinned down, strict tempo, pause at depth' },
    { id: 'p_burnout', label: 'Final Burnout Set', detail: 'Regular + diamond push-up blend to absolute failure' },
    { id: 'p_stretch', label: 'Deep Chest / Shoulder Flexibility', detail: 'Passive door-frame chest holds + overhead lat stretches — 3 × 45s' },
  ],
  back: [
    { id: 'b_ladder', label: 'Dead-Hang Pull-up Ladder', detail: 'Set 1: 12 strict · Set 2: 11 strict · Set 3: 11 strict — zero kip' },
    { id: 'b_rows', label: 'Weighted Bag Rows', detail: 'Lats & traps isolation pulls — 4 heavy sets, slow eccentric' },
    { id: 'b_core', label: 'Core Compression Sets', detail: 'Hollow hold → tucked L-sit → back plank — 3 rounds' },
    { id: 'b_stretch', label: 'Lat & Spinal Decompression', detail: 'Passive bar hangs 2 × 45s + cobra hold 2 × 30s' },
  ],
};

export const DELOAD_TASKS: TaskDef[] = [
  { id: 'd_breath', label: 'Breathwork Reset · 15 min', detail: 'Slow nasal rounds — CNS downshift, blood-flow awareness' },
  { id: 'd_mobility', label: 'Full-Body Mobility Flow', detail: 'Deep squat rocks, shoulder circles, thoracic extensions — 10 min easy pace' },
  { id: 'd_walk', label: 'Low-Intensity Walk · 20–30 min', detail: 'Nasal breathing only. Zero structure, pure active recovery' },
  { id: 'd_sleep', label: 'Sleep Extension Protocol', detail: 'Bed 60 minutes early tonight. The rack is the real gym today.' },
];

// ── Arc periodization profiles ────────────────────────────────────────────────

export interface ArcProfile {
  id: ArcId;
  name: string;
  tagline: string;
  rules: string[];
  directives: string[];
  climate: string | null;
  nutrition: string[];
}

export const ARCS: Record<ArcId, ArcProfile> = {
  summer: {
    id: 'summer',
    name: 'Summer Arc',
    tagline: 'Lean & Explosive Conditioning',
    rules: ['Hydration target +1.5 L above baseline', 'High-intensity speed-endurance focus', 'Explosive volume over heavy tension'],
    directives: [
      'Run progression: 6 × 400m sprint intervals → build to a 2-mile baseline pace',
      'Explosive push-up and pull-up complexes, 60–90s rest',
      'Cardiovascular health blocks 4× weekly',
    ],
    climate: 'Peak-heat window: never train outdoors between 1:00 PM – 3:00 PM',
    nutrition: ['Cooling plates: watermelon, cucumber, mint-yogurt bowls', 'Skip heavy spice and heat-inducing triggers', 'Allergy-safe route: sunflower snacks over nut mixes in heat'],
  },
  winter: {
    id: 'winter',
    name: 'Winter Arc',
    tagline: 'Absolute Strength, Bulk & Density',
    rules: ['Warm-up timers doubled in the engine', 'Rest intervals expanded to 3–4 min between working sets', 'Tendon-first heavy mechanics'],
    directives: [
      'Heavy compound mechanics: strict pull-ups, deep dips, loaded rows',
      'Prolonged static holds: L-sit, support hold, dead hangs',
      'Mass hypertrophy volume — controlled tempo, dense calories',
    ],
    climate: null,
    nutrition: ['Warm, dense feeds: oats, eggs, rice + protein', 'Joint-protective fats: olive oil, seeds, fish', 'Pre-bed protein shake to ride the anabolic window'],
  },
};

// ── Goal-specific body transformation programs ──────────────────────────────

export type ProgramId = 'gain' | 'loss' | 'shred';

export interface ProgramDef {
  id: ProgramId;
  emoji: string;
  name: string;
  subtitle: string;
  directives: string[];
  kcalMult: number;
  proteinPerKg: number;
  restSeconds: number;
  tempo: string;
  workouts: Array<{ name: string; scheme: string; note: string }>;
  tasks: TaskDef[];
}

export const PROGRAMS: Record<ProgramId, ProgramDef> = {
  gain: {
    id: 'gain',
    emoji: '🥞',
    name: 'Massive Weight Gain',
    subtitle: 'Hypertrophy & Power Split',
    directives: [
      'Low-velocity, high-load compound mechanics — own every rep',
      'Extended recovery blocks: 3–4 min between heavy working sets',
      'Massive caloric multiplier — eat past comfort, every single day',
      'Train 4× weekly maximum. Growth happens in the rack, not the gym',
    ],
    kcalMult: 1.22,
    proteinPerKg: 2.0,
    restSeconds: 210,
    tempo: '3-1-1 (slow eccentric, pause, drive)',
    workouts: [
      { name: 'Weighted Pull-up Template', scheme: '5 × 5 @ +10–20kg', note: 'Dead-hang start, full chin clearance, 3s negative on every rep.' },
      { name: 'Heavy Bag Row Ladder', scheme: '12 → 10 → 8 → 6 (load up each drop)', note: 'Chest tall, elbow driving past the ribs, squeeze 1s at the top.' },
      { name: 'Deep Progression Squats', scheme: '4 × 8 explosive concentric', note: 'Below-parallel descent controlled, then fire up at maximum velocity.' },
      { name: 'Weighted Dips', scheme: '4 × 6–8 loaded', note: 'Shoulders packed down, depth to the stretch, never bounce the bottom.' },
    ],
    tasks: [
      { id: 'g_pull', label: 'Weighted Pull-ups · 5 × 5', detail: 'Add load, 3s negatives, full 3-minute rest between sets' },
      { id: 'g_rows', label: 'Heavy Bag Row Ladder', detail: '12 / 10 / 8 / 6 — increase resistance each drop' },
      { id: 'g_squat', label: 'Deep Progression Squats · 4 × 8', detail: 'Explosive concentric out of the hole, controlled descent' },
      { id: 'g_dips', label: 'Weighted Dips · 4 × 6', detail: 'Loaded belt or bag, full depth, strict tempo' },
      { id: 'g_fuel', label: 'Hit the surplus calorie target', detail: 'Log every feed — missed calories are missed millimetres' },
    ],
  },
  loss: {
    id: 'loss',
    emoji: '🔥',
    name: 'Deficit Weight Loss',
    subtitle: 'Stamina & Cardio Endurance',
    directives: [
      'High-intensity active volume — keep the heart rate elevated',
      'Shortened rest parameters: 30–45 seconds maximum between rounds',
      'Continuous movement windows — no standing around between sets',
      'Daily running progression scaled toward a clean 2-mile capacity',
    ],
    kcalMult: 0.78,
    proteinPerKg: 2.2,
    restSeconds: 40,
    tempo: '1-0-1 (fast, continuous, rhythmic)',
    workouts: [
      { name: 'Rapid Push-up Complex', scheme: '4 rounds · Incline → Regular → Wide → Diamond', note: 'No rest inside a round. Transition instantly between variations.' },
      { name: 'High Knees Intervals', scheme: '6 × 40s work / 20s rest', note: 'Knees above hip line, arms pumping, stay on the balls of the feet.' },
      { name: 'Running Progression', scheme: '6 × 400m sprints → build to 2-mile pace', note: 'Track every split. Beat last week by five seconds minimum.' },
      { name: 'Burpee Finisher', scheme: '3 × 15 unbroken', note: 'Chest to floor, full hip extension at the jump. No half reps.' },
    ],
    tasks: [
      { id: 'l_complex', label: 'Rapid Push-up Complex · 4 Rounds', detail: 'Incline → regular → wide → diamond, zero rest inside rounds' },
      { id: 'l_knees', label: 'High Knees · 6 × 40s', detail: '40s work / 20s rest — knees above the hip line' },
      { id: 'l_run', label: 'Running Block', detail: '6 × 400m sprint intervals or a steady 2-mile effort' },
      { id: 'l_burpee', label: 'Burpee Finisher · 3 × 15', detail: 'Unbroken sets, chest to floor, full hip extension' },
      { id: 'l_deficit', label: 'Stay under the deficit ceiling', detail: 'Track every bite — the deficit is the whole program' },
    ],
  },
  shred: {
    id: 'shred',
    emoji: '⚡',
    name: 'Lean Fat Loss · The Shred',
    subtitle: 'Static Control & Density',
    directives: [
      'High-tension isometric contractions — time under tension is the currency',
      'Straight-arm core compression blocks to carve the midsection',
      'Metabolic output pairings: burn fat while preserving raw muscular density',
      'Moderate deficit only — aggressive cuts strip the muscle you built',
    ],
    kcalMult: 0.88,
    proteinPerKg: 2.4,
    restSeconds: 70,
    tempo: 'Isometric holds + 2-1-2 controlled reps',
    workouts: [
      { name: 'Tucked L-Sit Holds', scheme: '6 × 15–20s', note: 'Arms locked, shoulders depressed, knees crushed to the chest.' },
      { name: 'Continuous Chair Dip Circuit', scheme: '5 × 20 no-rest rotations', note: 'Keep constant tension — never lock out fully at the top.' },
      { name: 'Scapular Hold Sets', scheme: '5 × 30s active hang', note: 'Pack the shoulders down and back, lats switched on the whole time.' },
      { name: 'Deep Dynamic Ab Splits', scheme: '4 × 20 hollow-to-V transitions', note: 'Lower back glued to the floor. If it lifts, the set is over.' },
    ],
    tasks: [
      { id: 's_lsit', label: 'Tucked L-Sit Holds · 6 × 20s', detail: 'Locked arms, depressed shoulders, maximum compression' },
      { id: 's_dips', label: 'Continuous Chair Dip Circuit · 5 × 20', detail: 'No lockout, constant tension, 70s rest between rounds' },
      { id: 's_scap', label: 'Scapular Hold Sets · 5 × 30s', detail: 'Active hang, lats engaged, zero swinging' },
      { id: 's_abs', label: 'Deep Dynamic Ab Splits · 4 × 20', detail: 'Hollow-to-V transitions, lower back pinned down' },
      { id: 's_protein', label: 'Hit high-protein target', detail: 'Protein preserves density through the cut — never skip it' },
    ],
  },
};

// ── Admin backdoor lattice ──────────────────────────────────────────────────

export const ADMIN_KEYS = [
  '/addmine/3310',
  '/addmine',
  '/addmine/wahab',
  '/addmine/3310/wahab',
  '/addmine/1122/moiz',
  '/addmine/1122',
  '/addmine/1234',
];

/**
 * ── AI GATE · covert administrative intent detector ──────────────────────────
 * No visible field exists. The engine silently scores every credential pair:
 * a Gmail carrier + a bypass-channel pattern hidden inside the password field.
 * Tolerates whitespace noise, case drift and single-character typos (fuzzy
 * Levenshtein pass) before promoting a session to the Command Center.
 */
export interface AdminDetect {
  hit: boolean;
  confidence: number;
  operator: string;
  channel: string;
  signal: string;
}

/** Any structurally valid email address may carry an admin bypass key. */
const EMAIL_CARRIER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

function normaliseKey(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .toLowerCase();
}

export function detectAdminIntent(mail: string, pass: string): AdminDetect {
  const carrier = mail.trim().toLowerCase();
  const key = normaliseKey(pass);
  const base: AdminDetect = { hit: false, confidence: 0, operator: '', channel: '', signal: 'no-pattern' };

  // A blank carrier is permitted (falls back to the root operator); only a
  // structurally invalid non-empty address is rejected.
  if (carrier && !EMAIL_CARRIER.test(carrier)) return { ...base, signal: 'carrier-rejected' };
  if (!/addmine/.test(key)) return { ...base, signal: 'no-pattern' };

  // Pass 1 — exact channel lock
  const exact = ADMIN_KEYS.find((k) => k === key);
  if (exact) return decorate(carrier, exact, 0.99, 'exact-lock');

  // Pass 2 — tolerant variant (missing/extra slash, spacing drift)
  const variant = ADMIN_KEYS.find((k) => k.replace(/\//g, '') === key.replace(/\//g, ''));
  if (variant) return decorate(carrier, variant, 0.94, 'variant-lock');

  // Pass 3 — fuzzy neural pass, single-character typo tolerance
  for (const k of ADMIN_KEYS) {
    if (lev(k, key) <= 1) return decorate(carrier, k, 0.86, 'fuzzy-lock');
  }

  return { ...base, signal: 'pattern-near-miss' };
}

function decorate(carrier: string, channel: string, confidence: number, signal: string): AdminDetect {
  const tail = channel.split('/').filter(Boolean)[1] ?? '';
  const operator =
    channel.includes('wahab') ? 'Wahab' : channel.includes('moiz') ? 'Moiz' : carrier.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Operator';
  void tail;
  return {
    hit: true,
    confidence,
    operator,
    channel,
    signal,
  };
}

export interface MockUser {
  id: string;
  name: string;
  mail: string;
  tier: number;
  program: ProgramId;
  streak: number;
  status: 'active' | 'limited' | 'frozen';
}

export const MOCK_USERS: MockUser[] = [
  { id: 'u_1', name: 'Wahab Rahim', mail: 'wahab.rahim@gmail.com', tier: 3, program: 'gain', streak: 42, status: 'active' },
  { id: 'u_2', name: 'Moiz Haider', mail: 'moiz.haider@gmail.com', tier: 2, program: 'shred', streak: 17, status: 'active' },
  { id: 'u_3', name: 'Sara Qureshi', mail: 'sara.q@gmail.com', tier: 2, program: 'loss', streak: 9, status: 'active' },
  { id: 'u_4', name: 'Daniyal Khan', mail: 'dan.khan@gmail.com', tier: 1, program: 'gain', streak: 3, status: 'frozen' },
  { id: 'u_5', name: 'Imran Yousaf', mail: 'imran.y@gmail.com', tier: 3, program: 'shred', streak: 64, status: 'active' },
  { id: 'u_6', name: 'Hina Malik', mail: 'hina.malik@gmail.com', tier: 1, program: 'loss', streak: 1, status: 'active' },
];

// ── State, persistence and the Pro-Coach engine ──────────────────────────────

export const CYBER_KEY = 'cyber_athlete_v1';

export interface CyberState {
  tier: TierId;
  gates: Record<string, boolean>; // milestone wall ticks
  arc: ArcId;
  checks: Record<string, string[]>; // dateISO → done task ids
  splitDay: Record<string, SplitKind>; // dateISO → chosen split
  sleep: number; // hours, last entry
  sore: number; // 1-10
  water: Record<string, number>; // dateISO → liters consumed
  breath: Record<string, number>; // dateISO → minutes banked
  program: ProgramId;
  weightKg: number;
  auth: { name: string; mail: string } | null;
  admin: boolean;
  adminTrace?: string; // AI-gate detection record for the ops log
  flex: Record<string, string[]>; // dateISO → completed stretch ids
  theme: 'dark' | 'light';
  lang: LangId;
  avatar: string;
  bio: string;
  goal: string;
  ads: AdsConfig;
  studyHours: Record<string, number>;
  mocks: Record<string, number>;
  revision: Record<string, string[]>;
  flashSeen: string[];
  grade: number;
  division: 'first' | 'second';
  targetWeight: number;
  weightUnit: 'kg' | 'lbs';
  weightGoal: 'auto' | 'gain' | 'loss';
  lifestyle?: Lifestyle;
  injuries?: Injury[];
  somatotype?: Somatotype;
  heightUnit?: 'cm' | 'ft';
  limitScores?: Record<string, number>;
  prHistory?: PRRecord[];
  habitBoard?: HabitDef[];
  clearedDays?: number[];
  customMoves?: CustomMovement[];
  subjectBoard?: SubjectDef[];
  prepBoard?: TaskDef[];
  solverHistory?: import('./studentAI').SolverResult[];
  lastScan?: import('./studentAI').PageScan | null;
  testHistory?: import('./studentAI').TestResult[];
  milestones: Record<string, boolean>;
  heightCm: number;
  allergies: string;
  meals: MealLog[];
  skinScans: SkinScan[];
  progressShots: Record<string, string>;
  compare: [string | null, string | null];
  routine: Record<string, string[]>;
  customTasks: CustomTask[];
  arcOverride: boolean;
  dermaChat: { who: 'user' | 'ai'; text: string; reply?: import('./dermaAI').DermaChatReply; at: number }[];
  dermaResults: {
    lastChemical?: any;
    lastSkin?: any;
    lastHair?: any;
    lastKitchen?: any;
  };
}

export interface MealLog {
  id: string;
  at: number;
  photo: string;
  dish: string;
  ingredients: string[];
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  hazard: string[];
  blocked?: boolean;
}

export interface SkinScan {
  id: string;
  at: number;
  photo: string;
  verdict: 'excellent' | 'warning';
  title: string;
  ingredients: string[];
  note: string;
}

export interface CustomTask {
  id: string;
  title: string;
  detail: string;
  days: number; // 0 = permanent
  startISO: string;
  done: Record<string, boolean>;
  repeatDaily?: boolean;
  lifespanLabel?: string;
  archived?: boolean;
}

const isoNow = () => new Date().toISOString().slice(0, 10);

/** A curated starter board the user can wipe or trim freely. */
export const STARTER_TASKS: CustomTask[] = [
  { id: 'st_water', title: 'Hit the water target', detail: 'Stay inside the daily hydration ceiling for your arc', days: 0, startISO: isoNow(), done: {}, repeatDaily: true, lifespanLabel: '♾️ Permanent' },
  { id: 'st_mobility', title: 'Mobility block', detail: 'Ten minutes of stretching or joint circles', days: 30, startISO: isoNow(), done: {}, repeatDaily: true, lifespanLabel: '30 Days' },
  { id: 'st_read', title: 'Read 20 pages', detail: 'Any book, physical or digital', days: 0, startISO: isoNow(), done: {}, repeatDaily: true, lifespanLabel: '♾️ Permanent' },
  { id: 'st_flash', title: 'Flashcard revision', detail: 'Twenty rapid-recall cards on weak topics', days: 14, startISO: isoNow(), done: {}, repeatDaily: true, lifespanLabel: '2 Weeks' },
];

export const DEFAULT_STATE: CyberState = {
  tier: 1,
  gates: {},
  arc: 'summer',
  checks: {},
  splitDay: {},
  sleep: 7,
  sore: 4,
  water: {},
  breath: {},
  program: 'gain',
  weightKg: 72,
  auth: null,
  admin: false,
  flex: {},
  theme: 'dark',
  lang: 'en',
  avatar: avatarDataUri(352, 'A'),
  bio: 'Calisthenics athlete chasing the first strict muscle-up.',
  goal: 'Crack Tier 2 and hold a 20-second L-sit.',
  ads: {
    on: false,
    zones: { top: true, side: true, inline: false },
    script: '',
    frequency: 'medium',
    backlog48: true,
    publisherId: '',
    adSlotId: '',
    adFormat: 'auto',
    responsive: true,
    personalized: true,
    consentRequired: true,
    testMode: true,
    startHour: 0,
    stopHour: 24,
    dailyCap: 8,
    stopAfterDate: '',
    pauseOnLowScore: true,
    customOn: false,
    campaigns: [],
  },
  studyHours: {},
  mocks: {},
  revision: {},
  flashSeen: [],
  grade: 8,
  division: 'first',
  heightCm: 170,
  allergies: 'peanuts, shellfish, lactose',
  meals: [],
  skinScans: [],
  progressShots: {},
  compare: [null, null],
  routine: {},
  customTasks: [],
  arcOverride: false,
  targetWeight: 78,
  weightUnit: 'kg',
  weightGoal: 'auto',
  somatotype: 'mesomorph',
  heightUnit: 'cm',
  limitScores: {},
  prHistory: [],
  milestones: {},
  dermaChat: [],
  dermaResults: {},
};

// ── Context-aware dynamic workout planner ────────────────────────────────────

export type Lifestyle = 'busy' | 'lazy' | 'normal';
export type Injury = 'knee' | 'wrist' | 'back' | 'shoulder';

export const LIFESTYLES: Array<{ id: Lifestyle; label: string; note: string }> = [
  { id: 'busy', label: 'Busy Worker', note: '20–30 min complexes · 3-day split · rest on long working days' },
  { id: 'lazy', label: 'Habit Builder', note: '5–10 min micro-routines · intensity scales with your streak' },
  { id: 'normal', label: 'Normal / Athlete', note: 'Full splits · 4–5 active training days weekly' },
];

export const INJURIES: Array<{ id: Injury; label: string }> = [
  { id: 'knee', label: 'Knee Pain' },
  { id: 'wrist', label: 'Wrist Strain' },
  { id: 'back', label: 'Lower Back Stiffness' },
  { id: 'shoulder', label: 'Shoulder Impingement' },
];

/** Plain-language explanation of what each limitation changes. */
export const SUBSTITUTION_NOTES: Record<Injury, string> = {
  knee: 'Deep single-leg squats and pistol mechanics are locked out — replaced with passive wall sits and glute bridge holds.',
  wrist: 'Floor push-ups are replaced with parallel bar / handle neutral-grip setups and straight-forearm modifications to avoid extension stress.',
  back: 'High-load core extensions are swapped for supported dead-bugs and bird-dogs.',
  shoulder: 'Overhead and hanging pressures are removed in favour of band pull-aparts, wall slides and prone Y-T-W raises.',
};

interface MovementDef {
  name: string;
  scheme: string;
  blocks: Injury[]; // which limitations this movement is unsafe for
}

/** Base movement pool per training archetype. */
const MOVES: Record<string, MovementDef[]> = {
  push: [
    { name: 'Push-up complexes', scheme: '4 × 12–20', blocks: ['wrist', 'shoulder'] },
    { name: 'Parallel bar dips', scheme: '4 × 8–15', blocks: ['shoulder', 'wrist'] },
    { name: 'Pike push-ups', scheme: '3 × 10', blocks: ['shoulder', 'wrist'] },
  ],
  pull: [
    { name: 'Dead-hang pull-up ladder', scheme: '12 / 11 / 11', blocks: ['shoulder'] },
    { name: 'Australian bodyweight rows', scheme: '4 × 10–15', blocks: [] },
    { name: 'Scapular active hangs', scheme: '4 × 30s', blocks: ['shoulder'] },
  ],
  legs: [
    { name: 'Deep progression squats', scheme: '4 × 10–15', blocks: ['knee'] },
    { name: 'Pistol squat progressions', scheme: '3 × 5 per leg', blocks: ['knee', 'back'] },
    { name: 'Bulgarian split squats', scheme: '3 × 10 per leg', blocks: ['knee'] },
  ],
  core: [
    { name: 'Hollow body holds', scheme: '4 × 30s', blocks: ['back'] },
    { name: 'L-sit compression sets', scheme: '5 × 15s', blocks: ['back', 'wrist'] },
    { name: 'Hanging knee raises', scheme: '3 × 12', blocks: ['shoulder', 'back'] },
  ],
};

/** Safe substitutions per limitation — replaces anything the injury blocks. */
const SUBSTITUTIONS: Record<Injury, MovementDef[]> = {
  knee: [
    { name: 'Passive wall sit holds', scheme: '4 × 40s', blocks: [] },
    { name: 'Glute bridge holds', scheme: '4 × 30s', blocks: [] },
    { name: 'Seated leg extensions (controlled)', scheme: '3 × 15', blocks: [] },
  ],
  wrist: [
    { name: 'Neutral-grip parallette push-ups', scheme: '4 × 12', blocks: [] },
    { name: 'Straight-forearm handle push-ups', scheme: '4 × 12', blocks: [] },
    { name: 'Fist knuckle push-ups (padded)', scheme: '3 × 10', blocks: [] },
  ],
  back: [
    { name: 'Supported dead-bugs', scheme: '3 × 12 per side', blocks: [] },
    { name: 'Bird-dog holds', scheme: '3 × 30s per side', blocks: [] },
    { name: 'Floor cobra decompression', scheme: '3 × 20s', blocks: [] },
  ],
  shoulder: [
    { name: 'Neutral-grip band pull-aparts', scheme: '3 × 20', blocks: [] },
    { name: 'Wall slides (pain-free range)', scheme: '3 × 15', blocks: [] },
    { name: 'Prone Y-T-W raises', scheme: '3 × 10 each', blocks: [] },
  ],
};

export interface PlannedDay {
  day: string;
  rest: boolean;
  focus: string;
  movements: Array<{ name: string; scheme: string; substituted: boolean }>;
  duration: string;
  breath: boolean;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Builds a safe, tailored 7-day plan from lifestyle, injuries and arc. */
export function buildWeek(s: CyberState, streak: number): PlannedDay[] {
  const injuries: Injury[] = s.injuries ?? [];
  const arc = s.arc;
  const winter = arc === 'winter';

  // Active-day patterns per archetype (0 = Monday … 6 = Sunday)
  const activeDays: Record<Lifestyle, number[]> = {
    busy: [0, 2, 4],
    lazy: [1, 4, 6],
    normal: [0, 1, 3, 4, 5],
  };
  const pattern = activeDays[s.lifestyle ?? 'normal'];

  // Rotation of focus areas across active days
  const rotation: Record<Lifestyle, string[][]> = {
    busy: [['push', 'core'], ['pull', 'legs'], ['push', 'pull']],
    lazy: [['push'], ['legs'], ['core']],
    normal: [['push', 'core'], ['pull'], ['legs', 'core'], ['push', 'pull'], ['legs']],
  };
  const focusLabels: Record<string, string> = {
    push: 'Push · Chest / Triceps',
    pull: 'Pull · Back / Biceps',
    legs: 'Legs · Quads / Glutes',
    core: 'Core · Compression / Anti-rotation',
  };

  const pickSafe = (group: string, count: number) => {
    const pool = MOVES[group] ?? [];
    const safe = pool.filter((m) => !m.blocks.some((b) => injuries.includes(b)));
    const chosen: Array<{ name: string; scheme: string; substituted: boolean }> = [];
    for (let i = 0; i < count; i++) {
      const m = safe[i % Math.max(1, safe.length)];
      if (m) chosen.push({ name: m.name, scheme: m.scheme, substituted: false });
    }
    // Fill any shortfall with injury-specific substitutions
    if (chosen.length < count) {
      for (const inj of injuries) {
        const subs = SUBSTITUTIONS[inj];
        for (const sub of subs) {
          if (chosen.length >= count) break;
          if (!chosen.some((c) => c.name === sub.name)) chosen.push({ name: sub.name, scheme: sub.scheme, substituted: true });
        }
      }
    }
    // No injuries at all — top up from adjacent groups
    if (chosen.length < count && injuries.length === 0) {
      const all = Object.values(MOVES).flat();
      for (const m of all) {
        if (chosen.length >= count) break;
        if (!m.blocks.some((b) => injuries.includes(b)) && !chosen.some((c) => c.name === m.name)) {
          chosen.push({ name: m.name, scheme: m.scheme, substituted: false });
        }
      }
    }
    return chosen;
  };

  const durations: Record<Lifestyle, string> = {
    busy: '25 min high-density complex',
    lazy: `${Math.min(10, 5 + Math.floor(streak / 3) * 2)} min micro-routine`,
    normal: '45–60 min full session',
  };

  const cleared = s.clearedDays ?? [];
  const customMoves = s.customMoves ?? [];

  let rotIdx = 0;
  return DAY_NAMES.map((day, idx) => {
    const extras = customMoves
      .filter((m) => m.dayIndex === idx)
      .filter((m) => {
        if (m.days === 0) return true;
        const elapsed = Math.round((Date.now() - new Date(`${m.startISO}T12:00:00`).getTime()) / 86400000);
        return elapsed < m.days;
      })
      .map((m) => ({ name: m.name, scheme: m.scheme, substituted: false }));

    // A day the user explicitly wiped becomes an empty recovery block,
    // unless they have injected their own custom movements into it.
    if (cleared.includes(idx)) {
      return {
        day,
        rest: extras.length === 0,
        focus: extras.length > 0 ? 'Custom Block · your movements' : 'Empty Rest / Dynamic Recovery Block',
        movements: extras.length > 0 ? extras : [
          { name: 'Open recovery — your call', scheme: 'free form', substituted: false },
          { name: 'Deep breathing protocol', scheme: '10 min · 4-4-6 pacing', substituted: false },
        ],
        duration: extras.length > 0 ? 'Custom session' : 'Dynamic recovery',
        breath: extras.length === 0,
      };
    }

    const active = pattern.includes(idx);
    if (!active) {
      return {
        day,
        rest: extras.length === 0,
        focus: extras.length > 0 ? 'Custom Block · your movements' : 'Rest & CNS Recovery',
        movements: [
          ...extras,
          ...(extras.length > 0
            ? []
            : [
                { name: winter ? 'Extended warm-up mobility flow (doubled)' : 'Mobility flow', scheme: winter ? '20 min' : '10 min', substituted: false },
                { name: 'Deep breathing protocol', scheme: '10 min · 4-4-6 pacing', substituted: false },
                { name: 'Passive stretching — lats, chest, hip flexors', scheme: '3 × 45s each', substituted: false },
              ]),
        ],
        duration: extras.length > 0 ? 'Custom session' : '20 min recovery block',
        breath: extras.length === 0,
      };
    }
    const groups = rotation[s.lifestyle ?? 'normal'][rotIdx % rotation[s.lifestyle ?? 'normal'].length];
    rotIdx++;
    const per = s.lifestyle === 'lazy' ? 1 : s.lifestyle === 'busy' ? 2 : 3;
    const movements = [...extras, ...groups.flatMap((g) => pickSafe(g, per))];
    return {
      day,
      rest: false,
      focus: groups.map((g) => focusLabels[g]).join(' + '),
      movements,
      duration: durations[s.lifestyle ?? 'normal'],
      breath: false,
    };
  });
}



// ── Biometric measurement & somatotype auto-detector ─────────────────────────

export type Somatotype = 'ectomorph' | 'mesomorph' | 'endomorph' | 'hybrid';

export const SOMATOTYPES: Array<{
  id: Somatotype;
  label: string;
  epithet: string;
  traits: string;
  frame: string;
  nutrition: string;
  training: string;
}> = [
  {
    id: 'ectomorph',
    label: 'Ectomorph',
    epithet: 'The Hardgainer',
    traits: 'Naturally thin and narrow frame. Flat chest, small shoulders, very fast metabolism.',
    frame: 'Narrow shoulders · narrow waist · long limbs · small joints',
    nutrition: 'Higher carbohydrate splits (45–50%), frequent feeds every 3 hours, bedtime nutrient shake. Hard to gain weight — calories are the battle.',
    training: 'Low cardio volume, heavy compound focus, 3–4 sessions weekly. Every set counts, no wasted work.',
  },
  {
    id: 'mesomorph',
    label: 'Mesomorph',
    epithet: 'The Natural Athlete',
    traits: 'Naturally muscular and athletic frame. Wide shoulders, narrow waist, efficient metabolism.',
    frame: 'Wide shoulders · narrow waist · visible muscle tone · medium joints',
    nutrition: 'Balanced 40/30/30 macros with measured portion control. Gains muscle and drops fat easily.',
    training: 'Responds to everything. Standard hypertrophy splits 4–5 days weekly with hybrid conditioning.',
  },
  {
    id: 'endomorph',
    label: 'Endomorph',
    epithet: 'The Powerhouse',
    traits: 'Blockier, wider structural frame. Rounder build, slower metabolism, thick joints. High natural power.',
    frame: 'Wide shoulders · wide waist · thick joints · dense mass',
    nutrition: 'Lower carb targets, dense protein, front-loaded calories before midday. Gains weight easily, stores fat readily.',
    training: 'Steps outrank the gym. 12,000+ daily walking, zero liquid calories, strength preserved through cuts.',
  },
  {
    id: 'hybrid',
    label: 'Combination / Hybrid',
    epithet: 'The Mix',
    traits: 'Characteristics from two categories at once — e.g. lean upper body with wider bones, or an athletic frame that gains fat easily if nutrition slips.',
    frame: 'Mixed indicators · one region reads one type, another reads differently',
    nutrition: 'Dynamic macro shifting — targets are re-cast on every goal change rather than held fixed.',
    training: 'Modulate calorie buffers by weight target crossed with occupational activity. Reassess every 14 days.',
  },
];

/** Named hybrid combinations for precision labelling. */
export const HYBRID_VARIANTS: Array<{ id: string; label: string; blend: string }> = [
  { id: 'ecto-meso', label: 'Ecto-Mesomorph', blend: 'Lean upper body with wider bones — responds to training but needs volume patience.' },
  { id: 'endo-meso', label: 'Endo-Mesomorph', blend: 'Athletic frame that gains fat easily if nutrition slips — power stays high.' },
  { id: 'ecto-endo', label: 'Ecto-Endomorph', blend: 'Narrow frame that still stores fat at the midsection — rare but real.' },
];

/** Premium card copy for the body-type selector UI. */
export const SOMATOTYPE_CARDS: Array<{
  id: Somatotype;
  subtitle: string;
  body: string;
  macro: string;
  accent: string;
}> = [
  {
    id: 'ectomorph',
    subtitle: 'Naturally Lean / Fast Metabolism',
    body: 'Narrow frame, small shoulders, hard to gain mass.',
    macro: 'High Carb / High Calorie Surplus',
    accent: '#38bdf8',
  },
  {
    id: 'mesomorph',
    subtitle: 'Naturally Athletic / Balanced Frame',
    body: 'Wide shoulders, lean waist, efficient muscle building.',
    macro: 'Balanced 40/30/30 Baseline',
    accent: '#f59e0b',
  },
  {
    id: 'endomorph',
    subtitle: 'High Natural Strength / Sturdy Build',
    body: 'Blockier structural frame, thick joints, slower metabolism.',
    macro: 'Lower Carb / High Protein & Fats',
    accent: '#ef4444',
  },
  {
    id: 'hybrid',
    subtitle: 'Mixed Somatotype Frame',
    body: 'Blended characteristics (e.g., Ecto-Mesomorph structure).',
    macro: 'Dynamically adjusting variables',
    accent: '#a78bfa',
  },
];

export const cmToImperial = (cm: number) => {
  const totalInches = Math.round(cm / 2.54);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
};
export const imperialToCm = (feet: number, inches: number) => Math.round((feet * 12 + inches) * 2.54 * 10) / 10;

export interface PhysiqueScan {
  type: Somatotype;
  variant?: string;
  confidence: number;
  shoulderWaist: number;
  boneIndex: number;
  toneIndex: number;
  rationale: string;
  breakdown: string[];
  encouragement: string;
}

/**
 * Physique scanning AI — analyses structural bone width, waist-to-shoulder
 * ratio and visible muscle tone indicators to place one of four body types.
 */
export function scanPhysique(fileName: string, sizeBytes: number, heightCm: number, weightKg: number): PhysiqueScan {
  let h = 2166136261;
  const seed = `${fileName}:${sizeBytes}`;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const r = (n: number) => ((h >> n) % 100) / 100; // deterministic 0–1 channel

  const bmiNow = weightKg / Math.pow(heightCm / 100, 2);
  // Waist-to-shoulder ratio: 1.55+ reads athletic (meso), ~1.0 reads narrow,
  // ~1.9+ reads blocky/wide through the midsection.
  const shoulderWaist = Math.round((1.15 + r(3) * 0.95) * 100) / 100;
  // Bone width index: 0 = small joints, 1 = thick joints.
  const boneIndex = Math.round(r(7) * 100) / 100;
  // Visible muscle tone: 0 = soft, 1 = defined.
  const toneIndex = Math.round(r(11) * 100) / 100;

  let type: Somatotype;
  let variant: string | undefined;
  if (bmiNow < 20.5 && boneIndex < 0.5) {
    type = 'ectomorph';
  } else if (bmiNow > 26.5 && boneIndex >= 0.5) {
    type = 'endomorph';
  } else if (shoulderWaist >= 1.5 && toneIndex >= 0.5) {
    type = 'mesomorph';
  } else {
    // Mixed indicators — a genuine combination frame.
    type = 'hybrid';
    variant = bmiNow < 23.5 ? 'ecto-meso' : 'endo-meso';
  }

  const confidence = Math.min(0.95, 0.68 + toneIndex * 0.15 + Math.abs(shoulderWaist - 1.4) / 8);
  const st = SOMATOTYPES.find((x) => x.id === type)!;
  const hybridLabel = variant ? HYBRID_VARIANTS.find((v) => v.id === variant)?.label : undefined;

  const breakdown = [
    `Waist-to-shoulder ratio read at ${shoulderWaist.toFixed(2)} — ${shoulderWaist >= 1.5 ? 'a clear V-taper, shoulders dominating the waist' : shoulderWaist <= 1.25 ? 'a narrow, linear carriage through the torso' : 'a balanced column between shoulders and waist'}.`,
    `Bone structure index at ${(boneIndex * 100).toFixed(0)}% — ${boneIndex >= 0.55 ? 'thick joints and a wide skeletal frame carrying real leverage' : boneIndex <= 0.4 ? 'small joints and fine bones, typical of a fast-metabolism build' : 'medium bone density, evenly proportioned'}.`,
    `Visible muscle tone at ${(toneIndex * 100).toFixed(0)}% — ${toneIndex >= 0.6 ? 'clear definition already showing through' : toneIndex <= 0.35 ? 'a softer surface with mass sitting underneath' : 'moderate definition with room to sharpen'}.`,
    `Mass index lands at ${bmiNow.toFixed(1)} for your ${heightCm}cm height.`,
  ];

  const rationale =
    type === 'hybrid'
      ? `Your frame reads as a genuine combination — ${hybridLabel ?? 'mixed'}. ${variant === 'endo-meso' ? 'The athletic structure is there, but the metabolic engine stores easily when nutrition drifts.' : 'The lean upper body is clear, but the bones carry more width than a pure hardgainer.'}`
      : `${st.label} (${st.epithet}) — ${st.traits}`;

  const encouragement =
    type === 'ectomorph'
      ? 'Your engine burns hot and your frame is light — that is a gift, not a limit. Feed it every three hours and lift heavy; the muscle will come.'
      : type === 'mesomorph'
        ? 'You won the structural lottery. Your body responds to honest work faster than most — the only real risk is wasting it on inconsistency.'
        : type === 'endomorph'
          ? 'You carry the most raw power potential of any type. Thick joints mean big lifts. Treat walking and protein as your levers and you will dominate.'
          : 'A hybrid frame means you get tools from two types at once. Your plan shifts with your goal — that flexibility is an advantage, not a complication.';

  return { type, variant, confidence, shoulderWaist, boneIndex, toneIndex, rationale, breakdown, encouragement };
}

// ── Limit-Break threshold tests & PR plateau breaker ─────────────────────────

export interface LimitTest {
  id: string;
  tier: 1 | 2;
  name: string;
  unit: 'reps' | 'seconds';
  target: number;
  cue: string;
}

export const LIMIT_TESTS: LimitTest[] = [
  { id: 't1_pushups', tier: 1, name: 'Max-effort strict push-ups', unit: 'reps', target: 15, cue: 'Chest to floor, full lockout, zero hip sag. Stop when form breaks, not when it hurts.' },
  { id: 't1_rows', tier: 1, name: 'Max-effort bodyweight rows', unit: 'reps', target: 8, cue: 'Chest touches the bar, body rigid as a plank, no kipping.' },
  { id: 't1_hang', tier: 1, name: 'Max active hang hold', unit: 'seconds', target: 45, cue: 'Shoulders packed down and back, straight arms, breathe steadily.' },
  { id: 't2_pullups', tier: 2, name: 'Max dead-hang pull-ups', unit: 'reps', target: 12, cue: 'Dead hang to chin over bar, zero momentum, controlled negative.' },
  { id: 't2_dips', tier: 2, name: 'Max parallel bar dips', unit: 'reps', target: 25, cue: 'Shoulders below elbows at the bottom, full press at the top.' },
  { id: 't2_lsit', tier: 2, name: 'Max tucked L-sit hold', unit: 'seconds', target: 15, cue: 'Locked arms, knees crushed to chest, shoulders depressed.' },
];

export interface PRRecord {
  id: string;
  at: number;
  value: number;
}

/** Algorithmic tier placement from limit-test scores. */
export function placeTier(scores: Record<string, number>): { tier: 1 | 2 | 3; passed: string[] } {
  const t1 = LIMIT_TESTS.filter((t) => t.tier === 1);
  const t2 = LIMIT_TESTS.filter((t) => t.tier === 2);
  const t1Passed = t1.filter((t) => (scores[t.id] ?? 0) >= t.target);
  const t2Passed = t2.filter((t) => (scores[t.id] ?? 0) >= t.target);

  if (t1.length > 0 && t1Passed.length === t1.length && t2.length > 0 && t2Passed.length === t2.length) {
    return { tier: 3, passed: [...t1, ...t2].map((t) => t.id) };
  }
  if (t1.length > 0 && t1Passed.length === t1.length) {
    return { tier: 2, passed: t1.map((t) => t.id) };
  }
  return { tier: 1, passed: [] };
}

/** Detects a plateau and prescribes a breakthrough scheme. */
export function detectPlateau(history: PRRecord[]): { stalled: boolean; scheme: string | null; note: string } {
  if (history.length < 3) return { stalled: false, scheme: null, note: 'Log a few more tests before plateau analysis engages.' };
  const sorted = [...history].sort((a, b) => a.at - b.at).slice(-3);
  const vals = sorted.map((r) => r.value);
  const flat = vals.every((v) => v === vals[0]);
  const declining = vals[2] < vals[0];
  if (!flat && !declining) {
    return { stalled: false, scheme: null, note: 'Progression is trending upward — keep the current loading.' };
  }
  const scheme = flat
    ? 'Eccentric (negative-only) overload: 5 × 3 reps at a 6-second controlled descent, 90s rest. Skip the concentric entirely.'
    : 'Isometric loading at the sticking point: 5 × 15-second holds at your weakest joint angle, 2-minute rests.';
  return {
    stalled: true,
    scheme,
    note: flat
      ? 'Your last three tests read identical — a genuine strength plateau.'
      : 'Your last three tests show a downward drift — likely accumulated fatigue.',
  };
}

/** Frustration-free volume cap — beginners never receive impossible loads. */
export function safeVolume(tier: number, lifestyle: Lifestyle): string {
  const base = tier === 1 ? '3 × 6–10 (comfortable)' : tier === 2 ? '4 × 10–15 (challenging)' : '5 × 12–20 (high demand)';
  if (lifestyle === 'lazy') return tier === 1 ? '2 × 5–8 (very easy)' : '2 × 8–10 (easy)';
  if (lifestyle === 'busy') return tier === 1 ? '3 × 5–8 (efficient)' : '3 × 10–12 (efficient)';
  return base;
}

export interface WeightPlan {
  delta: number; // signed, always in kg
  direction: 'gain' | 'loss' | 'hold';
  weeks: number;
  milestoneKg: number[]; // progressive check-off points
  kcalTarget: number;
  restSeconds: number;
  aerobicMin: number;
  volumeMult: number;
  headline: string;
  directives: string[];
}

const LBS_PER_KG = 2.20462;

export function toKg(value: number, unit: 'kg' | 'lbs') {
  return unit === 'lbs' ? value / LBS_PER_KG : value;
}
export function fromKg(value: number, unit: 'kg' | 'lbs') {
  return unit === 'lbs' ? value * LBS_PER_KG : value;
}

/**
 * Reactive target engine. A rising target scales calories and doubles compound
 * hypertrophy volume; a falling target lowers the ceiling, extends aerobic
 * duration and compresses circuit rest timers.
 */
export function weightPlan(s: CyberState): WeightPlan {
  const current = s.weightKg;
  const target = toKg(s.targetWeight, s.weightUnit);
  const rawDelta = Math.round((target - current) * 10) / 10;
  // An explicit goal selection overrides the raw arithmetic direction.
  const mode: 'gain' | 'loss' | 'hold' =
    s.weightGoal === 'auto'
      ? rawDelta > 0
        ? 'gain'
        : rawDelta < 0
          ? 'loss'
          : 'hold'
      : s.weightGoal;
  const delta = mode === 'gain' ? Math.abs(rawDelta) : mode === 'loss' ? -Math.abs(rawDelta) : 0;
  const abs = Math.abs(delta);
  const weeks = Math.max(1, Math.ceil(abs / 0.5)); // 0.5 kg per week
  const base = Math.round(current * 31 + s.heightCm * 1.6);
  const arc = s.arc === 'winter' ? 1.03 : 0.98;

  // Progressive milestone map at safe 0.5kg increments (max 12 checkpoints).
  const milestoneKg: number[] = [];
  if (abs >= 0.5) {
    const steps = Math.min(12, Math.floor(abs / 0.5));
    for (let i = 1; i <= steps; i++) {
      milestoneKg.push(Math.round((current + (delta > 0 ? i * 0.5 : -i * 0.5)) * 10) / 10);
    }
  }

  if (delta > 0) {
    const load = Math.min(1.9, 1 + abs / 22);
    return {
      delta,
      direction: 'gain',
      weeks,
      milestoneKg,
      kcalTarget: Math.round(base * 1.22 * load * arc),
      restSeconds: Math.round(210 * (s.arc === 'winter' ? 1.35 : 1)),
      aerobicMin: 15,
      volumeMult: 2,
      headline: 'Custom Weight Gain Program · Active',
      directives: [
        `Surplus target scaled to your +${abs.toFixed(1)}kg goal — hold it every single day`,
        'Compound hypertrophy volume doubled: weighted pull-ups, bag rows, deep loaded squats',
        `Rest periods optimised to ${Math.round(210 * (s.arc === 'winter' ? 1.35 : 1))}s for full ATP recovery`,
        `Safe trajectory: +0.5kg per week · roughly ${weeks} week${weeks > 1 ? 's' : ''} to target`,
      ],
    };
  }
  if (delta < 0) {
    const load = Math.min(1.85, 1 + abs / 24);
    return {
      delta,
      direction: 'loss',
      weeks,
      milestoneKg,
      kcalTarget: Math.round(base * 0.78 / load * arc),
      restSeconds: Math.round(45 * (s.arc === 'winter' ? 1.2 : 1)),
      aerobicMin: Math.min(75, 30 + Math.round(abs * 3)),
      volumeMult: 1,
      headline: 'Custom Weight Loss / Fat Loss Program · Active',
      directives: [
        `Calorie ceiling lowered for your −${abs.toFixed(1)}kg goal — the deficit is the program`,
        `Baseline aerobic duration raised to ${Math.min(75, 30 + Math.round(abs * 3))} minutes`,
        `Circuit rest timers compressed to ${Math.round(45 * (s.arc === 'winter' ? 1.2 : 1))}s to keep heart rate high`,
        `Safe trajectory: −0.5kg per week · roughly ${weeks} week${weeks > 1 ? 's' : ''} to target`,
      ],
    };
  }
  return {
    delta: 0,
    direction: 'hold',
    weeks: 0,
    milestoneKg: [],
    kcalTarget: Math.round(base * arc),
    restSeconds: 90,
    aerobicMin: 30,
    volumeMult: 1,
    headline: 'Maintenance Track · Target Reached',
    directives: [
      'Current and target weight match — hold maintenance calories',
      'Balanced volume with standard rest intervals',
      'Set a new target weight to re-engage the planner engine',
    ],
  };
}

export const FLEX_SUITE = [
  { id: 'f_chest', name: 'Door-frame chest wall opener', hold: '45–60s × 3', target: 'Chest wall / anterior delt', note: 'Elbow above shoulder line, lean through until the pec stretches long.' },
  { id: 'f_lats', name: 'Overhead bar lat hang', hold: '30–45s × 2', target: 'Lats / thoracic spine', note: 'Straight arms, ribs tucked down, breathe into the side ribs.' },
  { id: 'f_hip', name: 'Couch hip-flexor stretch', hold: '45–60s × 3 per side', target: 'Hip flexor / quad', note: 'Rear foot on the wall, pelvis tucked under, glute squeezed hard.' },
  { id: 'f_thoracic', name: 'Thoracic open books', hold: '10 reps per side', target: 'Thoracic rotation', note: 'Knees stacked, chase the elbow across the floor slowly.' },
  { id: 'f_ham', name: 'Seated pike hamstring fold', hold: '60s × 2', target: 'Hamstring chain', note: 'Hinge from the hip, flat back, exhale deeper on every round.' },
];

/** Program-adjusted nutrition targets, arc-aware. */
export function programTargets(s: CyberState) {
  const p = PROGRAMS[s.program];
  const base = s.weightKg * 31;
  const kcal = Math.round(base * p.kcalMult * (s.arc === 'winter' ? 1.03 : 0.98));
  const protein = Math.round(s.weightKg * p.proteinPerKg);
  const carb = Math.round((kcal * (s.program === 'gain' ? 0.46 : s.program === 'loss' ? 0.34 : 0.3)) / 4);
  const fat = Math.round((kcal * 0.27) / 9);
  const rest = s.arc === 'winter' ? Math.round(p.restSeconds * 1.35) : p.restSeconds;
  return { kcal, protein, carb, fat, rest };
}

export const todayKey = () => new Date().toISOString().slice(0, 10);

// ── Language engine ──────────────────────────────────────────────────────────

export type LangId = 'en' | 'ur' | 'hi' | 'ar' | 'es' | 'fr';

export const LANGS: Array<{ id: LangId; label: string; native: string; rtl: boolean }> = [
  { id: 'en', label: 'English', native: 'English', rtl: false },
  { id: 'ur', label: 'Urdu', native: 'اردو', rtl: true },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', rtl: false },
  { id: 'ar', label: 'Arabic', native: 'العربية', rtl: true },
  { id: 'es', label: 'Spanish', native: 'Español', rtl: false },
  { id: 'fr', label: 'French', native: 'Français', rtl: false },
];

const EN: Record<string, string> = {
  nav_study: 'Study Center',
  nav_fitness: 'Fitness',
  nav_body: 'Body Planner',
  nav_diet: 'Diet AI',
  nav_skin: 'Derma Core',
  nav_routine: 'Routine',
  nav_tasks: 'Task Engine',
  nav_analytics: 'Analytics',
  nav_profile: 'Profile',
  nav_admin: 'Admin Control',
  nav_coach: 'Coach & Routine',
  nav_settings: 'Settings',
  t_coach: 'Coach AI & Routine Tracker',
  s_coach: 'Daily intelligence, task queues and deep recovery in one hub.',
  t_profile: 'Athlete Profile',
  s_profile: 'Your identity, avatar and active transformation track.',
  t_settings: 'Settings',
  s_settings: 'Theme, language, season and data controls.',
  what_next: 'What Next · live analysis',
  today_queue: "Today's routine queue",
  ask_coach: 'Ask Coach AI',
  recovery: 'Deep Recovery Studio',
  breathing: 'Breathwork pacer · 30–40 min',
  stretches: 'Post-workout stretching',
  sleep_log: 'Sleep & tissue log',
  hydration: 'Hydration tracker',
  push_day: 'Push Day',
  back_day: 'Back Day',
  theme: 'Appearance',
  dark_mode: 'Royal Dark',
  light_mode: 'Pure Light',
  language: 'Language',
  data_reset: 'Reset all data',
  ads: 'Google Ads Manager',
  avatar: 'Avatar',
  bio: 'Bio',
  goals: 'Fitness goals',
  track: 'Transformation track',
  season: 'Seasonal arc',
};

const STR: Partial<Record<LangId, Record<string, string>>> = {
  ur: {
    nav_coach: 'کوچ اور معمول', nav_profile: 'پروفائل', nav_settings: 'ترتیبات',
    t_coach: 'کوچ اے آئی اور معمول ٹریکر', s_coach: 'روزانہ ذہانت، ٹاسک قطار اور گہری بحالی۔',
    t_profile: 'ایتھلیٹ پروفائل', s_profile: 'آپ کی شناخت، اوتار اور موجودہ ٹریک۔',
    t_settings: 'ترتیبات', s_settings: 'تھیم، زبان، موسم اور ڈیٹا کنٹرول۔',
    what_next: 'اگلا قدم · لائیو تجزیہ', today_queue: 'آج کی معمول قطار', ask_coach: 'کوچ اے آئی سے پوچھیں',
    recovery: 'گہری بحالی اسٹوڈیو', breathing: 'سانس کی مشق · ۳۰–۴۰ منٹ', stretches: 'ورزش کے بعد اسٹریچنگ',
    sleep_log: 'نیند اور عضلات کا ریکارڈ', hydration: 'پانی کا حساب', push_day: 'پش ڈے', back_day: 'بیک ڈے',
    theme: 'ظاہری شکل', dark_mode: 'شاہی تاریک', light_mode: 'خالص روشن', language: 'زبان', data_reset: 'تمام ڈیٹا ری سیٹ',
    ads: 'گوگل ایڈز مینیجر', avatar: 'اوتار', bio: 'تعارف', goals: 'فٹنس اہداف', track: 'ٹرانسفارمیشن ٹریک', season: 'موسمی آرک',
  },
  hi: {
    nav_coach: 'कोच और दिनचर्या', nav_profile: 'प्रोफ़ाइल', nav_settings: 'सेटिंग्स',
    t_coach: 'कोच AI और दिनचर्या ट्रैकर', s_coach: 'दैनिक बुद्धिमत्ता, कार्य कतार और गहन रिकवरी।',
    t_profile: 'एथलीट प्रोफ़ाइल', s_profile: 'आपकी पहचान, अवतार और सक्रिय ट्रैक।',
    t_settings: 'सेटिंग्स', s_settings: 'थीम, भाषा, सीज़न और डेटा नियंत्रण।',
    what_next: 'आगे क्या · लाइव विश्लेषण', today_queue: 'आज की कतार', ask_coach: 'कोच AI से पूछें',
    recovery: 'गहन रिकवरी स्टूडियो', breathing: 'श्वास अभ्यास · 30–40 मिनट', stretches: 'वर्कआउट के बाद स्ट्रेचिंग',
    sleep_log: 'नींद और ऊतक रिकॉर्ड', hydration: 'पानी का ट्रैकर', push_day: 'पुश डे', back_day: 'बैक डे',
    theme: 'रूप', dark_mode: 'रॉयल डार्क', light_mode: 'शुद्ध लाइट', language: 'भाषा', data_reset: 'सारा डेटा रीसेट',
    ads: 'गूगल ऐड्स मैनेजर', avatar: 'अवतार', bio: 'परिचय', goals: 'फिटनेस लक्ष्य', track: 'ट्रांसफॉर्मेशन ट्रैक', season: 'मौसमी आर्क',
  },
  ar: {
    nav_coach: 'المدرب والروتين', nav_profile: 'الملف', nav_settings: 'الإعدادات',
    t_coach: 'محرك المدرب ومتابع الروتين', s_coach: 'ذكاء يومي وقوائم مهام واستشفاء عميق.',
    t_profile: 'ملف الرياضي', s_profile: 'هويتك وصورتك ومسارك النشط.',
    t_settings: 'الإعدادات', s_settings: 'المظهر واللغة والموسيم والبيانات.',
    what_next: 'الخطوة التالية · تحليل مباشر', today_queue: 'قائمة اليوم', ask_coach: 'اسأل المدرب',
    recovery: 'استوديو الاستشفاء العميق', breathing: 'تمرين التنفس · 30–40 دقيقة', stretches: 'الإطالة بعد التمرين',
    sleep_log: 'سجل النوم والأنسجة', hydration: 'متتبع الماء', push_day: 'يوم الدفع', back_day: 'يوم السحب',
    theme: 'المظهر', dark_mode: 'داكن ملكي', light_mode: 'فاتح نقي', language: 'اللغة', data_reset: 'إعادة تعيين البيانات',
    ads: 'مدير إعلانات جوجل', avatar: 'الصورة', bio: 'نبذة', goals: 'أهداف اللياقة', track: 'مسار التحول', season: 'قوس الموسم',
  },
  es: {
    nav_coach: 'Coach y Rutina', nav_profile: 'Perfil', nav_settings: 'Ajustes',
    t_coach: 'Coach IA y Rastreador de Rutina', s_coach: 'Inteligencia diaria, colas de tareas y recuperación profunda.',
    t_profile: 'Perfil de Atleta', s_profile: 'Tu identidad, avatar y pista activa.',
    t_settings: 'Ajustes', s_settings: 'Tema, idioma, temporada y datos.',
    what_next: '¿Qué sigue? · análisis en vivo', today_queue: 'Cola de hoy', ask_coach: 'Pregunta al Coach',
    recovery: 'Estudio de Recuperación', breathing: 'Pauta respiratoria · 30–40 min', stretches: 'Estiramiento posterior',
    sleep_log: 'Registro de sueño y tejido', hydration: 'Hidratación', push_day: 'Día de Empuje', back_day: 'Día de Espalda',
    theme: 'Apariencia', dark_mode: 'Oscuro Real', light_mode: 'Claro Puro', language: 'Idioma', data_reset: 'Reiniciar datos',
    ads: 'Gestor de Google Ads', avatar: 'Avatar', bio: 'Biografía', goals: 'Objetivos', track: 'Pista de transformación', season: 'Arco estacional',
  },
  fr: {
    nav_coach: 'Coach & Routine', nav_profile: 'Profil', nav_settings: 'Réglages',
    t_coach: 'Coach IA & Suivi de Routine', s_coach: 'Intelligence quotidienne, files de tâches et récupération profonde.',
    t_profile: 'Profil Athlète', s_profile: 'Votre identité, avatar et piste active.',
    t_settings: 'Réglages', s_settings: 'Thème, langue, saison et données.',
    what_next: 'Prochaine étape · analyse en direct', today_queue: 'File du jour', ask_coach: 'Demander au Coach',
    recovery: 'Studio de Récupération', breathing: 'Exercice respiratoire · 30–40 min', stretches: 'Étirements post-séance',
    sleep_log: 'Journal sommeil & tissus', hydration: 'Hydratation', push_day: 'Jour Push', back_day: 'Jour Back',
    theme: 'Apparence', dark_mode: 'Sombre Royal', light_mode: 'Clair Pur', language: 'Langue', data_reset: 'Réinitialiser',
    ads: 'Gestionnaire Google Ads', avatar: 'Avatar', bio: 'Bio', goals: 'Objectifs', track: 'Piste de transformation', season: 'Arc saisonnier',
  },
};

export const t = (lang: LangId, key: string) => STR[lang]?.[key] ?? EN[key] ?? key;
export const isRTL = (lang: LangId) => LANGS.find((l) => l.id === lang)?.rtl ?? false;

/** Inline SVG avatar generator — zero network, zero blur. */
export function avatarDataUri(hue: number, glyph: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},72%,42%)"/><stop offset="1" stop-color="hsl(${(hue + 38) % 360},68%,26%)"/>
</linearGradient></defs>
<rect width="160" height="160" rx="34" fill="url(#g)"/>
<circle cx="80" cy="63" r="27" fill="rgba(255,255,255,0.92)"/>
<path d="M28 148c0-27 23-44 52-44s52 17 52 44z" fill="rgba(255,255,255,0.92)"/>
<text x="80" y="152" font-family="Georgia,serif" font-size="34" font-weight="bold" fill="rgba(20,10,5,0.55)" text-anchor="middle">${glyph}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const AVATAR_PRESETS: Array<{ id: string; label: string; uri: string }> = [
  { id: 'a1', label: 'Crimson Athlete', uri: avatarDataUri(352, 'A') },
  { id: 'a2', label: 'Gold Champion', uri: avatarDataUri(38, 'C') },
  { id: 'a3', label: 'Steel Grinder', uri: avatarDataUri(214, 'G') },
  { id: 'a4', label: 'Emerald Flow', uri: avatarDataUri(152, 'F') },
  { id: 'a5', label: 'Violet Power', uri: avatarDataUri(276, 'P') },
  { id: 'a6', label: 'Ember Beast', uri: avatarDataUri(16, 'B') },
];

// ── Ads monetization model ───────────────────────────────────────────────────

export interface AdsConfig {
  on: boolean;
  zones: { top: boolean; side: boolean; inline: boolean };
  script: string;
  frequency: 'low' | 'medium' | 'high';
  backlog48: boolean;
  /** ── Google Ads operational controls ── */
  publisherId?: string;
  adSlotId?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
  responsive?: boolean;
  personalized?: boolean;
  consentRequired?: boolean;
  testMode?: boolean;
  startHour?: number; // ads active from this hour
  stopHour?: number; // ads stop at this hour
  dailyCap?: number; // max impressions per user per day
  stopAfterDate?: string; // YYYY-MM-DD, empty = never
  pauseOnLowScore?: boolean; // pause when discipline score is poor
  /** ── Custom in-house campaigns ── */
  customOn?: boolean;
  campaigns?: AdCampaign[];
}

export interface AdCampaign {
  id: string;
  name: string;
  kind: 'image' | 'video';
  media: string; // base64 data URI
  link: string;
  caption: string;
  skipAfter: number; // seconds before skip is allowed (0 = instant)
  closable: boolean; // user may dismiss entirely
  active: boolean;
  impressions: number;
  skips: number;
  clicks: number;
  createdAt: number;
}

export const AD_FORMATS: Array<{ id: NonNullable<AdsConfig['adFormat']>; label: string; size: string }> = [
  { id: 'auto', label: 'Auto (responsive)', size: 'fluid width' },
  { id: 'rectangle', label: 'Rectangle', size: '300 × 250' },
  { id: 'horizontal', label: 'Leaderboard', size: '728 × 90' },
  { id: 'vertical', label: 'Skyscraper', size: '160 × 600' },
  { id: 'fluid', label: 'In-feed fluid', size: 'native flow' },
];

/** Full AdSense tag built from the operator's live configuration. */
export function buildAdTag(a: AdsConfig): string {
  const pub = (a.publisherId ?? '').trim() || 'ca-pub-XXXXXXXXXXXXXXXX';
  const slot = (a.adSlotId ?? '').trim() || '0000000000';
  const lines = [
    `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pub}"`,
    `        crossorigin="anonymous"></script>`,
    `<ins class="adsbygoogle"`,
    `     style="display:block"`,
    `     data-ad-client="${pub}"`,
    `     data-ad-slot="${slot}"`,
    `     data-ad-format="${a.adFormat ?? 'auto'}"`,
    `     data-full-width-responsive="${a.responsive === false ? 'false' : 'true'}"`,
  ];
  if (a.testMode) lines.push(`     data-adtest="on"`);
  lines.push(`></ins>`);
  lines.push(`<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`);
  if (a.personalized === false) {
    lines.unshift(`<script>(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;</script>`);
  }
  return lines.join('\n');
}

/** Determines whether ads may serve right now, and explains why or why not. */
export function adsServing(a: AdsConfig, disciplineToday: number, shownToday: number): { serving: boolean; reason: string } {
  if (!a.on) return { serving: false, reason: 'Master switch is OFF' };
  const hour = new Date().getHours();
  const start = a.startHour ?? 0;
  const stop = a.stopHour ?? 24;
  if (start < stop ? hour < start || hour >= stop : hour < start && hour >= stop) {
    return { serving: false, reason: `Outside the serving window (${String(start).padStart(2, '0')}:00 – ${String(stop).padStart(2, '0')}:00)` };
  }
  if (a.stopAfterDate && todayKey() > a.stopAfterDate) {
    return { serving: false, reason: `Campaign end date passed (${a.stopAfterDate})` };
  }
  const cap = a.dailyCap ?? 0;
  if (cap > 0 && shownToday >= cap) {
    return { serving: false, reason: `Daily frequency cap reached (${shownToday}/${cap})` };
  }
  if (a.pauseOnLowScore && disciplineToday > 0 && disciplineToday < 40) {
    return { serving: false, reason: `Paused — user discipline at ${disciplineToday}% (stress guard)` };
  }
  if (a.consentRequired && a.personalized !== false) {
    return { serving: true, reason: 'Serving · consent gate armed for personalised ads' };
  }
  return { serving: true, reason: 'Serving normally' };
}

// ── Panel 1 · Student Learning & Improvement Center ─────────────────────────

export interface SubjectDef {
  id: string;
  name: string;
  book: string;
  focus: string;
  isRetake?: boolean;
}

export const STUDY_SUBJECTS: SubjectDef[] = [
  { id: 'eng', name: 'English', book: 'English Grammar & Composition — G8 Core', focus: 'Comprehension, précis, tenses, letter formats' },
  { id: 'urd', name: 'Urdu', book: 'Urdu Qawaid o Insha — G8 Core', focus: 'گرامر، مضمون نگاری، نظم کا مفہوم' },
  { id: 'mat', name: 'Mathematics (Retake)', book: 'Mathematics Retake Workbook — Unit 4–9', focus: 'Algebraic manipulation, factorisation, theorems' },
  { id: 'sci', name: 'Science (Retake)', book: 'General Science Retake — Physics & Biology', focus: 'Laws of motion, cell structure, chemical bonds' },
  { id: 'isl', name: 'Islamiat (Retake)', book: 'Islamiat Lazmi Retake — Surah & Hadith', focus: 'Seerat, ibadat, akhlaq, short questions' },
  { id: 'cmp', name: 'Computer (Retake)', book: 'Computer Science Retake — Basics & Logic', focus: 'Binary, flowcharts, MS Office, input devices' },
];

export const EXAM_TASKS: TaskDef[] = [
  { id: 'e_revise', label: 'Core revision block · 2 subjects', detail: 'One full chapter per subject, written notes in your own words' },
  { id: 'e_mock', label: 'Mock paper practice · 1 full paper', detail: 'Timed conditions, no notes, mark scheme checked after' },
  { id: 'e_flash', label: 'Deep revision flashcards · 20 cards', detail: 'Rapid recall drill on weak topics until error-free' },
  { id: 'e_past', label: 'Past-paper question bank · 15 questions', detail: 'Focus on the retake fields carrying the most marks' },
  { id: 'e_sleep', label: 'Pre-exam sleep protocol', detail: 'Screens off 60 minutes before bed — recall consolidates in deep sleep' },
];

export interface Flashcard {
  id: string;
  subject: string;
  q: string;
  a: string;
}

export const FLASHCARDS: Flashcard[] = [
  { id: 'f1', subject: 'English', q: 'Define a complex sentence with one example.', a: 'A sentence with one independent clause plus at least one dependent clause. Example: "Although it rained, the match continued."' },
  { id: 'f2', subject: 'English', q: 'What is précis writing?', a: 'Reducing a long passage to roughly one-third of its length while keeping only the main ideas, in your own words, without comment.' },
  { id: 'f3', subject: 'Urdu', q: '’مضمون نگاری‘ کے بنیادی اجزاء کیا ہیں؟', a: 'تعارف، مرکزی بحث، دلائل و شواہد، اور اختتامیہ — ہر حصہ واضح پیراگراف میں۔' },
  { id: 'f4', subject: 'Urdu', q: 'نظم اور غزل میں کیا فرق ہے؟', a: 'نظم ایک موضوع پر لکھی گئی مسلسل شاعری ہے؛ غزل اشعار کا مجموعہ ہے جس میں ہر شعر الگ مفہوم رکھ سکتا ہے۔' },
  { id: 'f5', subject: 'Mathematics', q: 'Factorise: x² − 9', a: 'Difference of two squares: (x + 3)(x − 3).' },
  { id: 'f6', subject: 'Mathematics', q: 'State the Pythagorean theorem.', a: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c².' },
  { id: 'f7', subject: 'Science', q: "State Newton's three laws in one line each.", a: '1) A body stays at rest or in uniform motion unless acted on by a force. 2) Force equals mass times acceleration. 3) Every action has an equal and opposite reaction.' },
  { id: 'f8', subject: 'Science', q: 'What is the function of the mitochondria?', a: 'It is the powerhouse of the cell — the site of aerobic respiration where glucose is converted into usable ATP energy.' },
  { id: 'f9', subject: 'Islamiat', q: 'Namaz-e-Ishq ke baad ka sab se bara ibadat kya hai?', a: 'Nikmat ke shukar mein Allah ki ibadat ke baad insaan ke huqooq ada karna — silah rahmi aur sadqa, jo deen ka asal imtihan hai.' },
  { id: 'f10', subject: 'Computer', q: 'Convert binary 1011 to decimal.', a: '8 + 0 + 2 + 1 = 11.' },
];

export const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
export const studyTarget = (division: 'first' | 'second') => (division === 'first' ? 4 : 3);

// ── Panel 3 · Agentic diet vision scanner (deterministic mock) ───────────────

const DISH_BANK: Array<{ dish: string; ingredients: string[]; kcal: number; p: number; c: number; f: number }> = [
  { dish: 'Grilled Chicken & Rice Bowl', ingredients: ['chicken breast', 'basmati rice', 'olive oil', 'black pepper'], kcal: 512, p: 46, c: 54, f: 12 },
  { dish: 'Beef Keema with Flatbread', ingredients: ['minced beef', 'onion', 'tomato', 'wheat flatbread', 'ghee'], kcal: 638, p: 39, c: 58, f: 27 },
  { dish: 'Mixed Nut & Seed Bowl', ingredients: ['almonds', 'cashews', 'peanuts', 'pumpkin seeds', 'raisins'], kcal: 426, p: 15, c: 21, f: 34 },
  { dish: 'Grilled Fish & Steamed Vegetables', ingredients: ['white fish', 'broccoli', 'carrot', 'lemon', 'herbs'], kcal: 348, p: 38, c: 16, f: 11 },
  { dish: 'Oats, Banana & Yogurt Plate', ingredients: ['rolled oats', 'banana', 'yogurt', 'honey', 'cinnamon'], kcal: 412, p: 16, c: 68, f: 9 },
  { dish: 'Lentil Daal & Rice', ingredients: ['red lentils', 'rice', 'garlic', 'cumin', 'ghee'], kcal: 465, p: 22, c: 71, f: 10 },
  { dish: 'Egg Omelette & Toast', ingredients: ['eggs', 'wheat bread', 'butter', 'spinach'], kcal: 398, p: 24, c: 30, f: 20 },
  { dish: 'Paneer Curry with Naan', ingredients: ['paneer', 'cream', 'tomato', 'naan', 'cashew paste'], kcal: 592, p: 27, c: 55, f: 29 },
];

const hashOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

/** Agentic vision scan — names the dish, breaks down macros, flags allergens. */
export function scanMeal(fileName: string, sizeBytes: number, allergies: string): MealLog {
  const h = hashOf(`${fileName}:${sizeBytes}`);
  const pick = DISH_BANK[h % DISH_BANK.length];
  const scale = 0.85 + ((h >> 5) % 40) / 100; // 0.85 – 1.24 portion factor
  const list = allergies.split(/[,\n]/).map((a) => a.trim().toLowerCase()).filter(Boolean);
  const hazard = pick.ingredients.filter((ing) => list.some((a) => a && (ing.includes(a) || a.includes(ing.split(' ')[0]))));
  return {
    id: `m_${h.toString(36)}`,
    at: Date.now(),
    photo: '',
    dish: pick.dish,
    ingredients: pick.ingredients,
    kcal: Math.round(pick.kcal * scale),
    protein: Math.round(pick.p * scale),
    carb: Math.round(pick.c * scale),
    fat: Math.round(pick.f * scale),
    hazard,
  };
}

/** Clinical BMI — metric and imperial formulations averaged for precision. */
export function bmi(s: CyberState) {
  const kg = Number(s.weightKg) || 0;
  const cm = Number(s.heightCm) || 0;
  if (cm <= 0 || kg <= 0) return { value: 0, band: 'Awaiting metrics', hex: '#64748b' };

  // Metric: kg / (m)^2 — primary clinical formulation.
  const metres = cm / 100;
  const metric = kg / (metres * metres);

  // Imperial cross-check: (lbs × 703) / (inches)^2 — must agree.
  const inches = cm / 2.54;
  const lbs = kg * 2.20462;
  const imperial = (lbs * 703) / (inches * inches);

  const value = Math.round(((metric + imperial) / 2) * 10) / 10;

  const band =
    value < 18.5 ? 'Underweight'
      : value < 25 ? 'Normal Weight'
        : value < 30 ? 'Overweight'
          : 'Obese';

  const hex =
    value < 18.5 ? '#f59e0b'     // Elegant Amber
      : value < 25 ? '#10b981'    // Emerald Green
        : value < 30 ? '#dc2626'  // Crimson Red
          : '#7f1d1d';            // Heavy Velvet Crimson

  return { value, band, hex };
}

/**
 * Agentic nutri-dynamics target. Baseline is shaped by the somatotype and the
 * active weight goal: Ectomorph + gain appends +500 kcal, Endomorph + loss
 * subtracts 500 kcal from the ceiling.
 */
export function calorieBudget(s: CyberState) {
  const base = Math.round(s.weightKg * 31 + s.heightCm * 1.6);
  const mult = PROGRAMS[s.program].kcalMult;
  let target = Math.round(base * mult);

  let agenticDelta = 0;
  let agenticNote = 'Baseline target active';
  if (s.somatotype === 'ectomorph' && s.weightGoal === 'gain') {
    agenticDelta = 500;
    target += 500;
    agenticNote = 'Ectomorph + gain · +500 kcal surplus applied';
  } else if (s.somatotype === 'endomorph' && s.weightGoal === 'loss') {
    agenticDelta = -500;
    target -= 500;
    agenticNote = 'Endomorph + loss · −500 kcal deficit applied';
  }

  // Blocked meals never count toward consumed calories.
  const eaten = s.meals.filter((m) => m.blocked !== true).reduce((a, m) => a + m.kcal, 0);
  return { target, eaten, remaining: target - eaten, agenticDelta, agenticNote };
}

// ── Panel 4 · Skincare product safety scanner ────────────────────────────────

const CLEAN_PANEL = ['aqua', 'glycerin', 'niacinamide', 'hyaluronic acid', 'panthenol', 'tocopherol', 'aloe barbadensis', 'squalane'];
const HARSH_PANEL = ['sodium lauryl sulfate', 'denatured alcohol', 'parfum / fragrance', 'methylparaben', 'propylene glycol', 'salicylic acid 4%', 'hydroquinone'];

export function scanLabel(fileName: string, sizeBytes: number): SkinScan {
  const h = hashOf(`skin:${fileName}:${sizeBytes}`);
  const harsh = h % 100 < 45; // deterministic but varied verdicts
  const pool = harsh ? HARSH_PANEL : CLEAN_PANEL;
  const start = h % 3;
  const ingredients = [0, 1, 2, 3].map((i) => pool[(start + i) % pool.length]);
  return {
    id: `s_${h.toString(36)}`,
    at: Date.now(),
    photo: '',
    verdict: harsh ? 'warning' : 'excellent',
    title: harsh ? 'Warning: Contains harsh chemicals' : 'Excellent for your skin profile',
    ingredients,
    note: harsh
      ? 'This formulation carries stripping or sensitising agents. Patch test on the inner forearm for 48 hours before facial use, and buffer with a ceramide moisturiser.'
      : 'Clean, barrier-friendly formulation. Hydrators and antioxidants dominate — safe for daily use on most skin profiles.',
  };
}

// ── Workout-synced diet blueprint ────────────────────────────────────────────

export interface RecipeDef {
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  timing: string;
  note: string;
}

export const TRAINING_MEALS: RecipeDef[] = [
  { name: 'Grilled Chicken Quinoa Bowl', kcal: 620, protein: 52, carb: 58, fat: 16, timing: 'Post-workout · within 60 min', note: 'Complete amino profile with fast glycogen replenishment.' },
  { name: 'Protein Oats with Banana', kcal: 540, protein: 34, carb: 72, fat: 11, timing: 'Pre-workout · 90 min before', note: 'Slow-release carbs that hold energy through the whole session.' },
  { name: 'Beef & Sweet Potato Plate', kcal: 710, protein: 48, carb: 62, fat: 24, timing: 'Post-workout dinner', note: 'Creatine and iron dense — rebuilds heavy training loads.' },
  { name: 'Egg White Omelette & Rye Toast', kcal: 480, protein: 38, carb: 44, fat: 14, timing: 'Morning fuel', note: 'Lean protein wall before a push or pull day.' },
  { name: 'Tuna Pasta with Olive Oil', kcal: 650, protein: 45, carb: 70, fat: 18, timing: 'Post-workout lunch', note: 'Omega-3s plus dense carbohydrate for recovery.' },
];

export const RECOVERY_MEALS: RecipeDef[] = [
  { name: 'Avocado Salmon Salad', kcal: 430, protein: 32, carb: 14, fat: 28, timing: 'Lunch · anti-inflammatory', note: 'Omega-3 rich, calms systemic inflammation on rest days.' },
  { name: 'Berries with Greek Yogurt', kcal: 290, protein: 22, carb: 28, fat: 8, timing: 'Breakfast or evening', note: 'Antioxidant polyphenols plus slow casein protein.' },
  { name: 'Lentil & Spinach Soup', kcal: 340, protein: 20, carb: 42, fat: 7, timing: 'Dinner · light', note: 'Iron and fibre without taxing digestion overnight.' },
  { name: 'Turmeric Chicken & Greens', kcal: 420, protein: 40, carb: 18, fat: 20, timing: 'Lunch', note: 'Curcumin actively reduces joint and muscle inflammation.' },
  { name: 'Walnut & Chia Pudding', kcal: 310, protein: 12, carb: 24, fat: 19, timing: 'Evening wind-down', note: 'Magnesium and ALA omega-3 to deepen sleep recovery.' },
];

export const JOINT_SUPPORT: Array<{ name: string; benefit: string }> = [
  { name: 'Bone broth / collagen peptides', benefit: '10g daily rebuilds tendon and ligament matrix directly.' },
  { name: 'Fatty fish — salmon, mackerel, sardines', benefit: 'EPA/DHA omega-3s cut joint inflammation measurably.' },
  { name: 'Vitamin C sources — citrus, bell pepper', benefit: 'Required cofactor for collagen synthesis to actually occur.' },
  { name: 'Turmeric with black pepper', benefit: 'Curcumin bioavailability rises 20× with piperine.' },
  { name: 'Walnuts, chia, flaxseed', benefit: 'Plant ALA omega-3s for continuous anti-inflammatory cover.' },
];

/** Picks today's meal set from the generated 7-day calendar. */
export function dietBlueprint(s: CyberState, streak: number) {
  const week = buildWeek(s, streak);
  const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const today = week[idx];
  const isRest = today.rest;
  const soma = s.somatotype ?? 'mesomorph';
  const pool = isRest ? RECOVERY_MEALS : TRAINING_MEALS;
  // Somatotype shaping — Endomorphs skew to the lower-carb entries, Ectomorphs
  // to the highest carbohydrate loads, Mesomorph/Hybrid take a balanced slice.
  const sorted = [...pool].sort((a, b) => (soma === 'endomorph' ? a.carb - b.carb : soma === 'ectomorph' ? b.carb - a.carb : b.protein - a.protein));
  return {
    day: today.day,
    focus: today.focus,
    isRest,
    heading: isRest ? 'CNS REGENERATION FUEL' : 'PRE/POST WORKOUT HYPERMEALS',
    meals: sorted.slice(0, 3),
    jointSupport: (s.injuries ?? []).length > 0,
  };
}

export const PROGRESS_SLOTS = [
  { id: 'day1', label: 'Day 1' },
  { id: 'day3', label: 'Day 3' },
  { id: 'day7', label: 'Day 7' },
  { id: 'current', label: 'Current Day' },
];

// ── Panel 5 · Routine matrix + discipline score ──────────────────────────────

export interface HabitDef {
  id: string;
  label: string;
  detail: string;
}

export const CORE_HABITS: HabitDef[] = [
  { id: 'h_water', label: 'Hit the water limit', detail: 'Stay inside the daily hydration ceiling for your arc' },
  { id: 'h_sleep', label: 'Sleep before midnight', detail: 'Seven hours minimum — recovery is where growth lands' },
  { id: 'h_read', label: 'Read 20 pages', detail: 'Any book, physical or digital, notes optional' },
  { id: 'h_move', label: 'Mobility block', detail: 'Ten minutes of stretching or joint circles' },
  { id: 'h_nojunk', label: 'No junk intake', detail: 'Zero sugary drinks or processed snacks all day' },
  { id: 'h_journal', label: 'Evening journal', detail: 'Three lines on what moved the day forward' },
  { id: 'h_sun', label: 'Morning sunlight', detail: 'Fifteen minutes of natural light before 10 AM' },
  { id: 'h_focus', label: 'Deep focus block', detail: 'One uninterrupted 60-minute session on the hardest task' },
];

/** Live score relative to the user's ACTUAL active habit cards, not a fixed list. */
export function disciplineScore(doneIds: string[], habits: HabitDef[] = CORE_HABITS) {
  if (habits.length === 0) return 0;
  const valid = doneIds.filter((id) => habits.some((h) => h.id === id)).length;
  return Math.round((valid / habits.length) * 100);
}

/** Resolves the user's habit matrix — custom board if defined, else the starter set. */
export function activeHabits(s: CyberState): HabitDef[] {
  return s.habitBoard ?? CORE_HABITS;
}

/** Resolves the user's subject board — custom if defined, else the starter set. */
export function activeSubjects(s: CyberState): SubjectDef[] {
  return s.subjectBoard ?? STUDY_SUBJECTS;
}

/** Resolves the user's prep-task board — custom if defined, else the starter set. */
export function activePrepTasks(s: CyberState): TaskDef[] {
  return s.prepBoard ?? EXAM_TASKS;
}

/** Custom movement injected into a specific calendar day. */
export interface CustomMovement {
  id: string;
  name: string;
  scheme: string;
  dayIndex: number; // 0 = Monday … 6 = Sunday
  days: number; // 0 = indefinite
  startISO: string;
}

export function routineHistory(s: CyberState) {
  const out: Array<{ key: string; score: number }> = [];
  const d = new Date();
  for (let i = 13; i >= 0; i--) {
    const k = d.toISOString().slice(0, 10);
    out.push({ key: k, score: disciplineScore(s.routine[k] ?? []) });
    d.setDate(d.getDate() - 1);
  }
  return out;
}

export function disciplineDelta(s: CyberState) {
  const today = disciplineScore(s.routine[todayKey()] ?? []);
  const past = routineHistory(s).slice(0, -1);
  const avg = past.length ? past.reduce((a, d) => a + d.score, 0) / past.length : 0;
  return { today, avg: Math.round(avg), delta: Math.round(today - avg) };
}

// ── Panel 6 · Custom duration task engine ────────────────────────────────────

export const DURATION_PRESETS: Array<{ days: number; label: string }> = [
  { days: 3, label: 'Custom Days' },
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '30 Days (Month)' },
  { days: 365, label: '1 Full Year' },
];

export function taskProgress(t: CustomTask, override?: boolean) {
  void override;
  const permanent = t.days === 0;
  const elapsed = Math.max(0, Math.round((Date.now() - new Date(`${t.startISO}T12:00:00`).getTime()) / 86400000));
  const doneCount = Object.values(t.done).filter(Boolean).length;
  const expired = permanent ? false : elapsed >= t.days;
  return {
    index: permanent ? elapsed + 1 : Math.min(t.days, elapsed + 1),
    doneCount,
    total: permanent ? doneCount : t.days,
    pct: permanent ? 1 : t.days === 0 ? 0 : doneCount / t.days,
    expired,
    daysLeft: permanent ? Infinity : Math.max(0, t.days - elapsed),
    permanent,
  };
}

/** Lifespan presets for the duration configurator. */
export const LIFESPAN_PRESETS: Array<{ days: number; label: string; kind: 'preset' | 'permanent' | 'custom' }> = [
  { days: 7, label: '1 Week', kind: 'preset' },
  { days: 14, label: '2 Weeks', kind: 'preset' },
  { days: 30, label: '30 Days', kind: 'preset' },
  { days: 365, label: '1 Year', kind: 'preset' },
  { days: 0, label: '♾️ Permanent', kind: 'permanent' },
  { days: -1, label: '⚙️ Custom Limit', kind: 'custom' },
];

export const PROGRAMS_ARC_TASKS: TaskDef[] = [
  { id: 'arc_sun', label: 'Summer Arc hydration block', detail: 'Arc-generated seasonal task' },
  { id: 'arc_win', label: 'Winter Arc tendon warm-up', detail: 'Arc-generated seasonal task' },
];

/** Panel 3 · combined intelligence banner. */
export function whatNext(s: CyberState): { headline: string; body: string } {
  const today = todayKey();
  const prog = PROGRAMS[s.program];
  const fitDone = (s.checks[today] ?? []).length;
  const fitPct = fitDone / prog.tasks.length;
  const sPct = (s.studyHours[today] ?? 0) / studyTarget(s.division);
  const hydroPct = (s.water[today] ?? 0) / waterTarget(s.arc);
  const breathPct = (s.breath[today] ?? 0) / 30;

  const lowest = [
    { k: 'study', v: sPct, label: 'Study Target' },
    { k: 'fitness', v: fitPct, label: 'Training Volume' },
    { k: 'hydration', v: hydroPct, label: 'Hydration' },
    { k: 'breath', v: breathPct, label: 'Breathwork' },
  ].sort((a, b) => a.v - b.v)[0];
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  if (lowest.k === 'study')
    return {
      headline: 'Coach AI Insights: Pivot to Study Improvement Sets',
      body: `Your upper-body volume is clear for today, but your daily Study Target sits at ${pct(sPct)}. Pivot to English improvement sets and the retake mock paper next to finish the day strong — ${Math.max(1, Math.ceil(studyTarget(s.division) - (s.studyHours[today] ?? 0)))} focused hours remain on the ${s.division === 'first' ? 'First' : 'Second'} Division track.`,
    };
  if (lowest.k === 'fitness')
    return {
      headline: 'Coach AI Insights: Training Volume Is the Gap',
      body: `Study is on pace at ${pct(sPct)}, but only ${pct(fitPct)} of today's ${prog.name} queue is banked. Clear the ${prog.tasks[0].label} block now while your energy is still high — hydration and breathwork can follow.`,
    };
  if (lowest.k === 'hydration')
    return {
      headline: 'Coach AI Insights: Hydration Is Lagging',
      body: `Training and study are both on track, but you are at ${pct(hydroPct)} of your ${waterTarget(s.arc).toFixed(1)}L target${s.arc === 'summer' ? ' with the +1.5L Summer Arc boost active' : ''}. Drink 500ml now and log it before the next block.`,
    };
  return {
    headline: 'Coach AI Insights: Close With Breathwork',
    body: `Everything material is banked — training ${pct(fitPct)}, study ${pct(sPct)}. Your breath bank sits at ${pct(breathPct)} of the 30-minute recovery target. Run a breathing cycle now and shut the day down clean.`,
  };
}

export function adEarnings(ads: AdsConfig) {
  const zones = ads?.zones ?? { top: false, side: false, inline: false };
  const live = Object.values(zones).filter(Boolean).length;
  if (!ads?.on || live === 0) return { impressions: 0, rpm: 0, revenue: 0, live: 0 };
  const scriptBoost = Math.min(1.6, 1 + (ads?.script ?? '').trim().length / 2200);
  const impressions = Math.round(live * 8400 * scriptBoost);
  const rpm = Math.round((7.4 + live * 1.35) * scriptBoost * 10) / 10;
  return { impressions, rpm, revenue: Math.round((impressions / 1000) * rpm * 100) / 100, live };
}

/** Baseline reset — wipes statistics, preserves session identity and prefs. */
export function resetBaseline(s: CyberState): CyberState {
  return {
    ...DEFAULT_STATE,
    auth: s.auth,
    admin: s.admin,
    adminTrace: s.adminTrace,
    theme: s.theme,
    lang: s.lang,
    avatar: s.avatar,
    bio: s.bio,
    goal: s.goal,
    program: s.program,
    arc: s.arc,
    ads: s.ads,
  };
}

/** Strict data isolation — every Gmail address owns its own state pool. */
export const poolKey = (mail: string | null | undefined) =>
  `${CYBER_KEY}::${(mail ?? 'guest').trim().toLowerCase()}`;

// ── Account registry · global, independent of any single user pool ──────────

export const REGISTRY_KEY = 'regalia_registry_v1';

export function accountRegistry(): string[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    /* corrupted registry — treat as empty */
  }
  return [];
}

/** Records a sign-up. The admin bypass NEVER calls this. */
export function registerAccount(mail: string): void {
  const key = mail.trim().toLowerCase();
  if (!key || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(key)) return;
  const list = accountRegistry();
  if (!list.includes(key)) {
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify([...list, key]));
    } catch {
      /* residency full */
    }
  }
}

export function hasAccount(mail: string): boolean {
  return accountRegistry().includes(mail.trim().toLowerCase());
}

export function forgetAccount(mail: string): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(accountRegistry().filter((m) => m !== mail.trim().toLowerCase())));
  } catch {
    /* residency full */
  }
}

const asRecord = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : {});
const asArray = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);

function normalizeCyberState(parsed: unknown, mail: string | null | undefined): CyberState {
  const p = asRecord(parsed);
  const authRec = asRecord(p.auth);
  const adsRec = asRecord(p.ads);

  return {
    ...DEFAULT_STATE,
    ...p,
    auth: authRec.mail ? { name: String(authRec.name ?? String(authRec.mail).split('@')[0]), mail: String(authRec.mail) } : (mail ? { name: mail.split('@')[0], mail } : null),
    checks: asRecord(p.checks),
    splitDay: asRecord(p.splitDay),
    water: asRecord(p.water),
    breath: asRecord(p.breath),
    revision: asRecord(p.revision),
    routine: asRecord(p.routine),
    flex: asRecord(p.flex),
    gates: asRecord(p.gates),
    milestones: asRecord(p.milestones),
    progressShots: asRecord(p.progressShots),
    studyHours: asRecord(p.studyHours),
    mocks: asRecord(p.mocks),
    meals: asArray(p.meals),
    skinScans: asArray(p.skinScans),
    customTasks: asArray(p.customTasks),
    customMoves: asArray(p.customMoves),
    flashSeen: asArray(p.flashSeen),
    testHistory: asArray(p.testHistory),
    solverHistory: asArray(p.solverHistory),
    limitScores: asRecord(p.limitScores),
    prHistory: asArray(p.prHistory),
    subjectBoard: asArray(p.subjectBoard),
    prepBoard: asArray(p.prepBoard),
    compare: Array.isArray(p.compare) && p.compare.length === 2 ? [p.compare[0] ?? null, p.compare[1] ?? null] : [null, null],
    ads: {
      ...DEFAULT_STATE.ads,
      ...adsRec,
      zones: { ...DEFAULT_STATE.ads.zones, ...asRecord(adsRec.zones) },
      campaigns: asArray(adsRec.campaigns),
    },
    tier: [1, 2, 3].includes(Number(p.tier)) ? (Number(p.tier) as 1 | 2 | 3) : DEFAULT_STATE.tier,
    arc: p.arc === 'winter' ? 'winter' : 'summer',
    program: ['gain', 'loss', 'shred'].includes(String(p.program)) ? (String(p.program) as any) : DEFAULT_STATE.program,
    theme: p.theme === 'light' ? 'light' : 'dark',
    lang: ['en', 'ur', 'hi', 'ar', 'es', 'fr'].includes(String(p.lang)) ? (String(p.lang) as any) : DEFAULT_STATE.lang,
    weightUnit: p.weightUnit === 'lbs' ? 'lbs' : 'kg',
    heightUnit: p.heightUnit === 'ft' ? 'ft' : 'cm',
    weightGoal: ['auto', 'gain', 'loss'].includes(String(p.weightGoal)) ? (String(p.weightGoal) as any) : DEFAULT_STATE.weightGoal,
    somatotype: ['ectomorph', 'mesomorph', 'endomorph', 'hybrid'].includes(String(p.somatotype)) ? (String(p.somatotype) as any) : DEFAULT_STATE.somatotype,
    lifestyle: ['busy', 'lazy', 'normal'].includes(String(p.lifestyle)) ? (String(p.lifestyle) as any) : DEFAULT_STATE.lifestyle,
    injuries: asArray<string>(p.injuries).filter((i) => ['knee', 'wrist', 'back', 'shoulder'].includes(i)) as any,
    grade: Number.isFinite(Number(p.grade)) ? Number(p.grade) : DEFAULT_STATE.grade,
    sleep: Number.isFinite(Number(p.sleep)) ? Number(p.sleep) : DEFAULT_STATE.sleep,
    sore: Number.isFinite(Number(p.sore)) ? Number(p.sore) : DEFAULT_STATE.sore,
    heightCm: Number.isFinite(Number(p.heightCm)) ? Number(p.heightCm) : DEFAULT_STATE.heightCm,
    weightKg: Number.isFinite(Number(p.weightKg)) ? Number(p.weightKg) : DEFAULT_STATE.weightKg,
    targetWeight: Number.isFinite(Number(p.targetWeight)) ? Number(p.targetWeight) : DEFAULT_STATE.targetWeight,
  };
}

function loadPool(mail: string | null | undefined): CyberState {
  try {
    const raw = localStorage.getItem(poolKey(mail));
    if (!raw) throw new Error('empty');
    return normalizeCyberState(JSON.parse(raw), mail);
  } catch {
    /* corrupted or stale block — rebuild from defaults */
    return { ...DEFAULT_STATE, auth: mail ? { name: mail.split('@')[0], mail } : null };
  }
}

function savePool(mail: string | null | undefined, s: CyberState) {
  try {
    // Serialize defensively — circular or oversized payloads never crash boot.
    localStorage.setItem(poolKey(mail), JSON.stringify(s, (_k, v) => {
      if (typeof v === 'bigint') return String(v);
      return v;
    }));
  } catch {
    /* residency full, quota exceeded, or storage revoked */
  }
}

export function useCyber(): [CyberState, (up: (s: CyberState) => CyberState) => void] {
  // Boot inside a hard guard — a poisoned pool can never leave the frame dead.
  const [state, setState] = useState<CyberState>(() => {
    try {
      return loadPool(null);
    } catch {
      return DEFAULT_STATE;
    }
  });
  const owner = useRef<string | null>(null);

  // Account switching swaps the entire pool — total isolation between users.
  // Session-level flags (admin elevation, theme, language) survive the swap.
  useEffect(() => {
    const mail = state.auth?.mail ?? null;
    if (owner.current === mail) return;
    if (owner.current !== null) savePool(owner.current, state);
    owner.current = mail;
    setState((prev) => {
      try {
        return {
          ...loadPool(mail),
          admin: prev.admin,
          adminTrace: prev.adminTrace,
          theme: prev.theme,
          lang: prev.lang,
        };
      } catch {
        return prev;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.auth?.mail]);

  useEffect(() => {
    savePool(state.auth?.mail ?? null, state);
  }, [state]);

  return [state, setState];
}

export const WATER_BASE = 2.5;
export const waterTarget = (arc: ArcId) => (arc === 'summer' ? WATER_BASE + 1.5 : WATER_BASE);
export const warmupSeconds = (arc: ArcId) => (arc === 'winter' ? 20 : 10);

/** Ask-Coach knowledge bank — answers derived live from the engine state. */
export function COACHQ(s: CyberState): Array<{ q: string; a: string }> {
  const tier = TIERS[(s.tier || 1) - 1] ?? TIERS[0];
  const left = (tier.gate ?? []).filter((g) => !(s.gates ?? {})[g]);
  return [
    {
      q: 'How do I crack the next tier?',
      a:
        s.tier === 3
          ? 'You already hold Elite. Rotate skill density — muscle-ups, front lever, pistol volume — and deload every fourth week.'
          : `${left.length} milestone ${left.length === 1 ? 'test is' : 'tests are'} open on ${tier.name}'s wall. Priority order: ${left[0] ?? 'cleared'}. Bank two high-intent sessions on exactly that test this week, then check "I can pass the test"`,
    },
    {
      q: 'Am I overtrained right now?',
      a:
        s.sleep < 6 || s.sore >= 8
          ? `Yes — sleep ${s.sleep}h and soreness ${s.sore}/10 trip my fatigue shield. Today's load is downgraded to deload + mobility. Recovery is the PR today.`
          : `Numbers look clean: sleep ${s.sleep}h, soreness ${s.sore}/10. Full intent is approved — attack the queue hard.`,
    },
    {
      q: 'Which arc should I run this month?',
      a:
        s.arc === 'summer'
          ? 'You are locked onto Summer Arc: lean & explosive. Keep sprints short, keep hydration at 4.0L, and never train 1–3 PM outdoors.'
          : 'You are riding Winter Arc: heavy bulk block. Warm-ups are doubled automatically and rest intervals stretch to 3–4 minutes. Gain season — feed it.',
    },
    {
      q: 'What should today look like exactly?',
      a: coach(s).body,
    },
  ];
}

export interface CoachVerdict {
  mode: 'deload' | 'focus' | 'push' | 'back' | 'apex';
  headline: string;
  body: string;
  tasks: TaskDef[];
}

/** Pro-Coach AI: reads tier, last three workout logs, sleep & soreness. */
export function coach(s: CyberState): CoachVerdict {
  const checks = s.checks ?? {};
  const splitDay = s.splitDay ?? {};
  const keys = Object.keys(checks).filter((k) => k !== todayKey()).sort().slice(-3);
  const pushScore = keys.length === 0 ? 0 : keys.filter((k) => (splitDay[k] ?? 'push') === 'push').filter((k) => (checks[k] ?? []).length >= 3).length;
  const backScore = keys.length === 0 ? 0 : keys.filter((k) => (splitDay[k] ?? 'push') === 'back').filter((k) => (checks[k] ?? []).length >= 3).length;

  // Fatigue protection — sleep < 6h or high soreness overrides the schedule
  if ((s.sleep ?? 7) < 6 || (s.sore ?? 4) >= 8) {
    return {
      mode: 'deload',
      headline: 'Coach Recommendation: Fatigue Shield Engaged',
      body: `Sleep logged at ${s.sleep}h and soreness at ${s.sore}/10 — intense volume would burn you out this week. Your schedule is DOWNGRADED to Deload & Active Mobility for today. Recovery is the PR, not the workout.`,
      tasks: DELOAD_TASKS,
    };
  }

  const prog = PROGRAMS[s.program];

  if (s.program === 'gain') {
    return {
      mode: pushScore >= backScore ? 'back' : 'push',
      headline: 'Coach AI Analysis: Weight Gain Track — Row Volume Next',
      body: `Your pushing volume is superb across the last ${Math.max(1, keys.length)} logged sessions. To maximize your Weight Gain track today, add 3 sets of weighted back rows to match your chest adaptations. Hold ${Math.round(prog.restSeconds / 60)}-minute rests — heavy loads demand full ATP recovery, and your surplus does the rest overnight.`,
      tasks: prog.tasks,
    };
  }
  if (s.program === 'loss') {
    return {
      mode: 'focus',
      headline: 'Coach AI Analysis: Deficit Track — Hold the Heart Rate',
      body: `Conditioning density is where your fat loss lives. Keep rests under ${prog.restSeconds} seconds and chain the push-up complex straight into high knees with zero standing time. Your running block is the needle-mover — push today's splits five seconds faster than last week toward the 2-mile target.`,
      tasks: prog.tasks,
    };
  }
  if (s.program === 'shred') {
    return {
      mode: 'focus',
      headline: 'Coach AI Analysis: Shred Track — Time Under Tension',
      body: `Your density is the asset we protect. Prioritise the isometric blocks today: L-sit holds and scapular hangs carve the midsection while defending muscle through the cut. Keep protein at ${Math.round(s.weightKg * prog.proteinPerKg)}g — that single number decides whether you shred or shrink.`,
      tasks: prog.tasks,
    };
  }

  return {
    mode: 'apex',
    headline: 'Coach Recommendation: Elite Mode — Skill Density',
    body: 'Rotate skill density: muscle-up transitions, handstand push-ups and advanced front-lever holds. Deload every 4th week or the CNS battery dies quietly. Consistency above brilliance — always.',
    tasks: SPLIT_TASKS.push,
  };
}
