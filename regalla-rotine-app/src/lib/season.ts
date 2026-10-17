// ─── Seasonal Arcs · climate-forged operating profiles ─────────────────────────
// Two forged seasons with full atmospherics. Body targets shift per season
// (hydration multipliers, kcal drift, step/workout arcs) and the shell
// re-skins with ice/snowfall or blaze/ember field layers.

import type { LangCode } from './types';

export type SeasonId = 'winter' | 'summer';

export interface SeasonProfile {
  id: SeasonId;
  title: string;
  tagline: string;
  motto: string;
  kcalBias: number; // seasonal kcal drift
  waterPlus: number; // additive liters (summer +1.5, winter negative)
  stepsDelta: number; // ± steps
  cardioNote: string;
  warmUp: string; // arc-modulated warmup directive
  restNote: string; // arc-modulated rest intervals
  heatWindow: string | null;
  cooling: string[];
  pelden: [string, string, string]; // gradient stops for the atmosphere
  field: 'snow' | 'ember';
  rites: Array<{ title: string; slot: 'dawn' | 'night'; domain: 'health' | 'fitness' }>;
}

export const SEASONS: Record<SeasonId, SeasonProfile> = {
  winter: {
    id: 'winter',
    title: 'WINTER ARC',
    tagline: 'The Absolute Strength & Bulk season',
    motto: 'Frost sharpens discipline; the furnace stays lit.',
    kcalBias: 1.03,
    waterPlus: -0.2,
    stepsDelta: -500,
    cardioNote: 'Winter arc — heavy compound mechanics and prolonged static holds over static cardio bars.',
    warmUp: 'Warm-up block doubled — 10 minutes before any working set',
    restNote: 'Rest intervals auto-extended to 3–4 min between working sets',
    heatWindow: null,
    cooling: [],
    pelden: ['rgba(130,180,235,0.14)', 'rgba(160,200,240,0.08)', 'rgba(200,220,250,0.05)'],
    field: 'snow',
    rites: [
      { title: 'Cold exposure — 30s finish', slot: 'dawn', domain: 'health' },
      { title: 'Thermal sleep protocol · warm fluid, no screens', slot: 'night', domain: 'health' },
    ],
  },
  summer: {
    id: 'summer',
    title: 'SUMMER ARC',
    tagline: 'The Lean & Explosive season',
    motto: 'Heat tempers the blade; sweat writes the ledger.',
    kcalBias: 0.97,
    waterPlus: 1.5,
    stepsDelta: 1000,
    cardioNote: 'Summer arc — high-intensity conditioning: 400m sprints up to a 2-mile baseline pace.',
    warmUp: 'Standard 5-minute warm-up — but hydrate before every block',
    restNote: 'Rest intervals 60–90s; never train during the peak-heat window',
    heatWindow: '1:00 PM – 3:00 PM',
    cooling: ['Watermelon & cucumber plates', 'Cold oat bowls', 'Hibiscus-ice tonics (skip heavy spice)'],
    pelden: ['rgba(255,150,80,0.12)', 'rgba(255,110,50,0.08)', 'rgba(255,180,90,0.05)'],
    field: 'ember',
    rites: [
      { title: 'Dawn hydration — 500ml before first light', slot: 'dawn', domain: 'health' },
      { title: 'Evening cooling ritual · cool rinse, light feed', slot: 'night', domain: 'health' },
    ],
  },
};

export function currentSeason(now = new Date()): SeasonId {
  const m = now.getMonth(); // 0-based
  return m >= 10 || m <= 3 ? 'winter' : 'summer';
}

export function resolveSeason(setting: 'auto' | 'winter' | 'summer' | undefined): SeasonId {
  return setting && setting !== 'auto' ? setting : currentSeason();
}

// ── seasonal voice decrees, localized across guidance tongues ───────────────
export const SEASON_BRIEF: Record<LangCode, Record<SeasonId, string>> = {
  en: { winter: 'The Winter Arc holds. Seal the cold discipline.', summer: 'The Summer Arc burns. Hydrate, then advance.' },
  ur: { winter: 'موسم سرما جاری ہے۔ سرد نظم مضبوط رکھیں۔', summer: 'گرمی کے موسم میں پانی پئیں، پھر آگے بڑھیں۔' },
  hi: { winter: 'शीत अर्धचक्र चल रहा है। ठंड में अनुशासन बनाए रखें।', summer: 'ग्रीष्म अर्धचक्र है। पानी पिएं, फिर आगे बढ़ें।' },
  ar: { winter: 'قوس الشتاء مستمر. حافظ على الانضباط في البرد.', summer: 'قوس الصيف متقد. اشرب الماء ثم تقدّم.' },
  es: { winter: 'El Arco de Invierno continúa. Sella la disciplina del frío.', summer: 'El Arco de Verano arde. Hidrátate y avanza.' },
  fr: { winter: "L'Arc d'Hiver tient bon. Scelle la discipline du froid.", summer: "L'Arc d'Été brûle. Hydrate-toi, puis avance." },
};

// ── Season-aware targets ────────────────────────────────────────────────────
export interface SeasonalAdjust {
  kcalDelta: number;
  waterL: number;
  stepsTotal: number;
  cardioNote: string;
}

export function applySeason(base: { kcal: number; waterL: number; stepsMin: number }, season: SeasonId): SeasonalAdjust {
  const p = SEASONS[season];
  const kcal = Math.round(base.kcal * p.kcalBias);
  return {
    kcalDelta: kcal - base.kcal,
    waterL: Math.round(Math.max(1, base.waterL + p.waterPlus) * 10) / 10,
    stepsTotal: Math.max(3000, base.stepsMin + p.stepsDelta),
    cardioNote: p.cardioNote,
  };
}
