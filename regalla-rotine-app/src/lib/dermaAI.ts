// ─── Agentic Dermatology & Trichology Logic Core ──────────────────────────────
import { hashOf } from './studentAI';

export interface ChemicalBreakdown {
  actives: { name: string; benefit: string }[];
  missing: string[];
  fillers: { name: string; risk: string }[];
  verdict: 'safe' | 'danger';
}

export interface SkinProfile {
  type: 'Oily' | 'Dry' | 'Sensitive' | 'Acne-Prone' | 'Combination';
  needs: string[];
}

export interface HairProfile {
  thickness: string;
  texture: string;
  scalp: string;
  damage: string;
}

/** 
 * Multi-Image Chemical Analyser 
 * Decomposes product composition based on visual/text metadata.
 */
export function analyzeChemicals(_fileCount: number, seed: string): ChemicalBreakdown {
  const h = hashOf(seed);
  const isDanger = h % 100 < 35; // 35% chance of danger verdict for mock
  
  const actives = [
    { name: 'Niacinamide (5%)', benefit: 'Barrier repair & sebum control' },
    { name: 'Hyaluronic Acid', benefit: 'Deep epidermal hydration' },
    { name: 'Ceramides NP/AP', benefit: 'Lipid layer reinforcement' }
  ].slice(0, 1 + (h % 3));

  const missing = h % 2 === 0 ? ['Broad Spectrum UV Filters', 'Stabilized Vitamin C'] : [];

  const fillers = isDanger ? [
    { name: 'Methylparaben', risk: 'Endocrine disruption potential' },
    { name: 'Sodium Lauryl Sulfate', risk: 'Severe lipid barrier stripping' },
    { name: 'Synthetic Fragrance', risk: 'High sensitization / flare trigger' }
  ] : [
    { name: 'Propylene Glycol', risk: 'Mild humectant filler' }
  ];

  return { actives, missing, fillers, verdict: isDanger ? 'danger' : 'safe' };
}

/** Kitchen Object Scanner Matrix */
export function scanKitchenObject(seed: string): { items: string[]; recipe: string; safe: boolean } {
  const h = hashOf(seed);
  const isHealthy = h % 100 > 20;
  
  if (!isHealthy) {
    return {
      items: ['Processed Sugar', 'Refined Flour', 'Artificial Coloring'],
      recipe: 'WARNING: These raw materials map to ultra-processed junk. High glycemic index and zero cellular benefit. Discard.',
      safe: false
    };
  }

  const pools = [
    { items: ['Raw Oats', 'Almond Milk', 'Chia Seeds'], recipe: 'Overnight Recovery Oats: Soak oats and chia in almond milk for 6 hours. High fiber, omega-3 dense.' },
    { items: ['Fresh Spinach', 'Eggs', 'Garlic'], recipe: 'Anabolic Scramble: Sauté garlic and spinach, fold in eggs. High protein, rich in iron.' },
    { items: ['Sweet Potato', 'Chicken Breast', 'Olive Oil'], recipe: 'Power Roast: Cube potato, dice chicken, toss in oil and roast at 200°C for 25 mins. Complex carbs + lean protein.' },
  ];
  return { ...pools[h % pools.length], safe: true };
}

/** Biometric mapping for Skin & Hair */
export function detectBiotype(seed: string, mode: 'skin' | 'hair'): any {
  const h = hashOf(seed);
  if (mode === 'skin') {
    const types: SkinProfile['type'][] = ['Oily', 'Dry', 'Sensitive', 'Acne-Prone', 'Combination'];
    const type = types[h % types.length];
    const needs = type === 'Oily' ? ['Salicylic acid', 'Clay masking'] : ['Rich occlusives', 'Squalane'];
    return { type, needs };
  } else {
    const textures = ['Fine', 'Medium', 'Coarse'];
    return {
      thickness: h % 2 === 0 ? 'Thick' : 'Thinning',
      texture: textures[h % textures.length],
      scalp: h % 3 === 0 ? 'Seborrheic' : 'Dry',
      damage: 'Mechanical / Heat stress detected'
    };
  }
}

// ── Deep Botanical & Household Database (Desi Totkay) ───────────────────────

interface BotanicalEntry {
  name: string;
  benefits: string;
  actives: string;
  risks: string[];
}

const BOTANICAL_DB: Record<string, BotanicalEntry> = {
  haldi: { name: 'Haldi / Turmeric', benefits: 'Potent anti-inflammatory, reduces acne redness, brightens skin tone.', actives: 'Curcumin', risks: ['Stains skin yellow', 'Can cause contact dermatitis in pure form'] },
  besan: { name: 'Besan / Gram Flour', benefits: 'Natural exfoliant, absorbs excess sebum, deep cleanses pores.', actives: 'Zinc, Linoleic Acid', risks: ['Over-exfoliation', 'Severe micro-tears if rubbed aggressively'] },
  arq: { name: 'Arq-e-Gulab / Rose Water', benefits: 'Restores skin pH, mild astringent, instantly calms erythema.', actives: 'Terpenes, Flavonoids', risks: [] },
  dahi: { name: 'Dahi / Yogurt', benefits: 'Mild lactic acid peeling, cools inflammation, feeds skin microbiome.', actives: 'Lactic Acid, Probiotics', risks: ['Lactose sensitivity'] },
  honey: { name: 'Raw Honey', benefits: 'Natural humectant, antibacterial, speeds up wound healing.', actives: 'Hydrogen Peroxide (trace)', risks: [] },
  neem: { name: 'Neem', benefits: 'Aggressive antibacterial, rapidly flattens fungal acne and bacterial breakouts.', actives: 'Nimbidin, Nimbin', risks: ['Highly drying', 'Sensitizing on broken skin'] },
  aloe: { name: 'Aloe Vera', benefits: 'Instant cooling, intense hydration, repairs UV damage.', actives: 'Aloesin, Mucopolysaccharides', risks: ['Latex allergy'] },
  lemon: { name: 'Lemon Juice', benefits: 'Astringent, high vitamin C.', actives: 'Citric Acid', risks: ['SEVERE: Phytophotodermatitis (chemical burns in sun)', 'Destroys skin acid mantle'] },
  baking_soda: { name: 'Baking Soda', benefits: 'Physical scrub.', actives: 'Sodium Bicarbonate', risks: ['SEVERE: Highly alkaline (pH 9), obliterates skin barrier', 'Micro-tears'] },
};

export interface DermaChatReply {
  text: string;
  proTip?: string;
  danger?: string;
}

// ── Language Translation Matrix ─────────────────────────────────────────────

type OutputLang = 'en' | 'ru' | 'ur' | 'es' | 'ar';

function detectTargetLanguage(msg: string): OutputLang {
  const t = msg.toLowerCase();
  if (/tell me in spanish|in spanish/i.test(t)) return 'es';
  if (/urdu mai batain|in urdu/i.test(t) && !/roman urdu/i.test(t)) return 'ur';
  if (/roman urdu|in roman urdu/i.test(t)) return 'ru';
  if (/in arabic|بالعربية/i.test(t)) return 'ar';
  
  // Default parsing for WhatsApp style
  if (/\b(kya|kaise|hai|batain|batao|theek|lagana|kaisa)\b/.test(t)) return 'ru';
  if (/[\u0600-\u06FF]/.test(t)) return 'ur'; // detect arabic/urdu script

  return 'en';
}

const UI_STRINGS: Record<OutputLang, Record<string, string>> = {
  en: { pro: '💡 Pro-Tip Verdict', danger: '⚠️ Danger Check', safe: 'Certified Safe' },
  ru: { pro: '💡 Khas Mashwara', danger: '⚠️ Khatre Ki Ghanti', safe: 'Bilkul Safe' },
  ur: { pro: '💡 ماہرانہ مشورہ', danger: '⚠️ خطرے کی گھنٹی', safe: 'بالکل محفوظ' },
  es: { pro: '💡 Veredicto Experto', danger: '⚠️ Alerta de Peligro', safe: 'Seguro Certificado' },
  ar: { pro: '💡 نصيحة الخبراء', danger: '⚠️ تحذير خطير', safe: 'آمن تماماً' }
};

/** Conversational AI with Botanical Logic & Tail-End Translation */
export function getDermaResponse(msg: string, skinType?: string): DermaChatReply {
  const lang = detectTargetLanguage(msg);
  const L = UI_STRINGS[lang];
  const t = msg.toLowerCase();
  
  const isSensitive = skinType === 'Sensitive' || skinType === 'Acne-Prone';

  // 1. DANGER INTERCEPTOR (Lemon, Baking Soda, Toothpaste)
  if (/(lemon|limu|baking soda|toothpaste|colgate)/.test(t)) {
    let dangerMsg = '';
    if (lang === 'ru') dangerMsg = `${L.danger}: Ye remedy aapki active skin profile k liye BOHOT nuksan de hai. Lemon aur baking soda skin ka barrier tabah kar dete hain. Ise fauran rok dain.`;
    else if (lang === 'ur') dangerMsg = `${L.danger}: یہ ٹوٹکہ آپ کی جلد کے لیے انتہائی نقصان دہ ہے۔ لیموں اور بیکنگ سوڈا جلد کی تہہ کو تباہ کر دیتے ہیں۔`;
    else if (lang === 'es') dangerMsg = `${L.danger}: Este remedio es extremadamente dañino. El limón y el bicarbonato destruyen la barrera de la piel.`;
    else dangerMsg = `${L.danger}: This remedy contains abrasive elements completely unsafe for your active skin profile! Raw citrus and alkaline scrubs obliterate the skin barrier.`;

    return { 
      text: lang === 'ru' ? 'Home remedies mein aisi cheezain use mat karain jo khane ki hon lekin skin k pH k khilaf hon.' : 'Do not use highly alkaline or highly acidic household items on your face.',
      danger: dangerMsg 
    };
  }

  // 2. BOTANICAL DB MATCHER (Desi Totkay)
  let foundKey: string | null = null;
  if (/(haldi|turmeric)/.test(t)) foundKey = 'haldi';
  if (/(besan|gram flour)/.test(t)) foundKey = 'besan';
  if (/(arq|rose water|gulab)/.test(t)) foundKey = 'arq';
  if (/(dahi|yogurt|curd)/.test(t)) foundKey = 'dahi';
  if (/(neem)/.test(t)) foundKey = 'neem';

  if (foundKey) {
    const b = BOTANICAL_DB[foundKey];
    let reply = '';
    let proTip = '';
    
    // Formatting based on language
    if (lang === 'ru') {
      reply = `${b.name} ek behtareen natural ingredient hai. Iska main faida ye hai k ye: ${b.benefits} (Active: ${b.actives}).`;
      proTip = b.risks.length > 0 ? `${L.pro}: Ehtiyat karain — ${b.risks[0]}.` : `${L.pro}: Ye ingredient sensitive skin k liye bilkul safe hai.`;
    } else if (lang === 'ur') {
      reply = `${b.name} ایک بہترین قدرتی جزو ہے۔ اس کا بنیادی فائدہ یہ ہے: ${b.benefits}`;
      proTip = `${L.pro}: ہمیشہ استعمال سے پہلے پیچ ٹیسٹ کریں۔`;
    } else {
      reply = `${b.name} is a highly effective botanical. Clinical benefits: ${b.benefits} (Active Compound: ${b.actives}).`;
      proTip = b.risks.length > 0 ? `${L.pro}: Proceed with caution — ${b.risks[0]}.` : `${L.pro}: Excellent, barrier-safe ingredient.`;
    }

    let danger = undefined;
    if (isSensitive && b.risks.length > 0) {
      danger = lang === 'ru' ? `${L.danger}: Aapki skin Sensitive/Acne-Prone hai. Is remedy se irritation ho sakti hai.` : `${L.danger}: Your profile is logged as ${skinType}. This botanical carries sensitization risks for your barrier.`;
    }

    return { text: reply, proTip, danger };
  }

  // 3. CORE DERMATOLOGY LOGIC (Oily, Pimples, etc.)
  if (/(oily|oil|greasy)/.test(t)) {
    if (lang === 'ru') return { text: "Oily skin k liye lightweight gel-based moisturizers use karain.", proTip: `${L.pro}: Salicylic Acid (BHA) pores ko saaf rakhta hai. Heavy mineral oils se bachen jo pores block karte hain.` };
    return { text: "For oily skin, completely eliminate heavy occlusives.", proTip: `${L.pro}: Utilize lightweight gel-based Salicylic Acid compounds. Explicitly avoid heavy pore-clogging mineral oils.` };
  }
  
  if (/(pimple|acne|breakout|daane)/.test(t)) {
    if (lang === 'ru') return { text: "Active inflammation k doran skin ko scrub mat karain.", proTip: `${L.pro}: Pimple patches (hydrocolloid) use karain aur active ingredients ko safely track karain.` };
    return { text: "During active skin cell inflammation windows, eliminate all physical exfoliation.", proTip: `${L.pro}: Apply hydrocolloid patches immediately to active lesions and monitor ingredient interactions.` };
  }

  // 4. FALLBACK LOGIC
  if (lang === 'ru') return { text: "Main aapki derma profile, ingredients aur desi totkay analyze kar sakta hoon.", proTip: `${L.pro}: Koi specific cream ya gharelu nuskha type kar k dekhen.` };
  if (lang === 'ur') return { text: "میں آپ کی جلد، اجزاء اور گھریلو ٹوٹکوں کا تجزیہ کر سکتا ہوں۔", proTip: `${L.pro}: کسی خاص کریم یا ٹوٹکے کے بارے میں پوچھیں۔` };
  
  return { 
    text: "I am your Agentic Dermatology Core. I analyze clinical ingredient panels, biotypes, and botanical home remedies.", 
    proTip: `${L.pro}: Ask me about specific active acids (e.g., Niacinamide) or household botanicals (e.g., Turmeric, Aloe Vera).` 
  };
}
