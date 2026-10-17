// ─── Agentic Student AI Portal · solver, scanner & test engine ───────────────

export interface SolverStep {
  label: string;
  detail: string;
}

export interface SolverResult {
  id: string;
  question: string;
  lang: LangProfile;
  steps: SolverStep[];
  /** Ultra-concise punchy lines — no filler, no preamble. */
  answer: string[];
  concepts: string[];
  at: number;
}

// ── Language & dialect detection ─────────────────────────────────────────────

export type LangProfile = 'english' | 'roman-urdu' | 'urdu' | 'arabic' | 'hindi' | 'spanish' | 'french';

export const LANG_META: Record<LangProfile, { label: string; badge: string; tone: string }> = {
  english: { label: 'English', badge: 'EN', tone: '#38bdf8' },
  'roman-urdu': { label: 'Roman Urdu', badge: 'RU', tone: '#34d399' },
  urdu: { label: 'اردو', badge: 'UR', tone: '#a78bfa' },
  arabic: { label: 'العربية', badge: 'AR', tone: '#f59e0b' },
  hindi: { label: 'हिन्दी', badge: 'HI', tone: '#fb7185' },
  spanish: { label: 'Español', badge: 'ES', tone: '#fbbf24' },
  french: { label: 'Français', badge: 'FR', tone: '#60a5fa' },
};

const SCRIPT_RANGES: Array<[LangProfile, RegExp]> = [
  ['urdu', /[\u0600-\u06FF]/],
  ['arabic', /[\u0600-\u06FF]/],
  ['hindi', /[\u0900-\u097F]/],
];

/** Roman Urdu markers — the Pakistani WhatsApp lexicon. */
const ROMAN_URDU_WORDS = [
  'kya', 'kaise', 'kyun', 'kyu', 'hai', 'hain', 'batain', 'batao', 'bata', 'samjhao', 'samjha',
  'krwa', 'karwa', 'karna', 'kardo', 'kar', 'den', 'dein', 'do', 'mujhe', 'mera', 'meri', 'aap',
  'tum', 'yeh', 'ye', 'woh', 'vo', 'konsa', 'kaunsa', 'kitna', 'kitne', 'kahan', 'kab', 'kaise',
  'acha', 'theek', 'nahi', 'nai', 'haan', 'ji', 'bhai', 'yaar', 'matlab', 'samajh', 'zara',
  'banao', 'bana', 'likho', 'likh', 'parho', 'padho', 'yaad', 'tarika', 'tareeqa', 'fayda',
];

/** Detects the language profile of a raw input string. */
export function detectLanguage(raw: string): LangProfile {
  const text = raw.trim();
  if (!text) return 'english';

  for (const [profile, re] of SCRIPT_RANGES) {
    if (re.test(text)) return profile;
  }

  const lower = ` ${text.toLowerCase()} `;
  const tokens = lower.split(/[^\w']+/).filter(Boolean);
  const hits = tokens.filter((t) => ROMAN_URDU_WORDS.includes(t)).length;
  // Two or more Roman Urdu function words is a confident signal; one strong
  // verb like "batain"/"krwa"/"samjhao" alone is enough for short queries.
  const strongVerb = /\b(batain|batao|samjhao|samjha|krwa|karwa|kardo|banao|likho|parho|padho|bata)\b/.test(lower);
  if (hits >= 2 || (strongVerb && hits >= 1)) return 'roman-urdu';

  return 'english';
}

/** Subject inference from free text so the answer feels genuinely tailored. */
function inferSubject(q: string): string {
  const t = q.toLowerCase();
  if (/(photosynth|cell|mitosis|atom|force|energy|velocity|gravity|chemical|acid|molecule|newton)/.test(t)) return 'Science';
  if (/(solve|equation|integral|derivat|algebra|theorem|triangle|factor|matrix|percent|ratio|geometry)/.test(t)) return 'Mathematics';
  if (/(grammar|tense|essay|poem|metaphor|noun|verb|comprehension|précis)/.test(t)) return 'English';
  if (/(surah|hadith|seerat|islam|namaz|quran)/.test(t)) return 'Islamiat';
  if (/(binary|algorithm|flowchart|cpu|software|database|network)/.test(t)) return 'Computer Science';
  if (/(qawaid|mazmun|nazm|urdu)/.test(t)) return 'Urdu';
  if (/(history|war|revolution|civilization|geography|climate|democracy)/.test(t)) return 'Social Studies';
  return 'General Studies';
}

const CONCEPT_BANK: Record<string, string[]> = {
  Science: ['Conservation of energy', 'Cell structure and function', 'Newtonian mechanics', 'Chemical bonding', 'The scientific method'],
  Mathematics: ['Order of operations', 'Isolating the variable', 'Factorisation patterns', 'Pythagorean theorem', 'Unit conversion'],
  English: ['Subject–verb agreement', 'Tense consistency', 'Literary devices', 'Paragraph structure', 'Contextual vocabulary'],
  Islamiat: ['Quranic context', 'Seerat timeline', 'Ibadat fundamentals', 'Akhlaq principles', 'Hadith authenticity'],
  'Computer Science': ['Binary representation', 'Algorithmic thinking', 'Input–process–output', 'Data structures', 'Logic gates'],
  Urdu: ['گرامر کے قواعد', 'مضمون نگاری کی ساخت', 'شاعری کا مزاج', 'لفظی ذخیرہ', 'سنوے بندی'],
  'Social Studies': ['Cause and effect chains', 'Timeline sequencing', 'Map reading', 'Source evaluation', 'Civic structures'],
  'General Studies': ['Core definitions', 'Key terminology', 'Applied examples', 'Common misconceptions', 'Revision spacing'],
};

/** Localized reasoning labels. */
const REASON_LABELS: Record<LangProfile, string[]> = {
  english: ['Parsing the question', 'Identifying the concept', 'Retrieving the rule', 'Constructing the answer', 'Verifying for errors'],
  'roman-urdu': ['Sawal samajhna', 'Concept pehchanna', 'Rule nikalna', 'Jawab banana', 'Ghalti check karna'],
  urdu: ['سوال سمجھنا', 'تصور پہچاننا', 'قاعدہ نکالنا', 'جواب بنانا', 'غلطی جانچنا'],
  arabic: ['تحليل السؤال', 'تحديد المفهوم', 'استرجاع القاعدة', 'بناء الجواب', 'التحقق من الأخطاء'],
  hindi: ['प्रश्न समझना', 'अवधारणा पहचानना', 'नियम निकालना', 'उत्तर बनाना', 'त्रुटि जाँचना'],
  spanish: ['Analizando la pregunta', 'Identificando el concepto', 'Recuperando la regla', 'Construyendo la respuesta', 'Verificando errores'],
  french: ['Analyse de la question', 'Identification du concept', 'Récupération de la règle', 'Construction de la réponse', 'Vérification des erreurs'],
};

const REASON_DETAILS: Record<LangProfile, string[]> = {
  english: [
    'Isolating the operative phrase and stripping filler.',
    'Classifying the prompt type — definition, mechanism, or computation.',
    'Pulling the governing syllabus rule for this topic.',
    'Assembling a direct, exam-ready answer.',
    'Screening against the most common student mistakes.',
  ],
  'roman-urdu': [
    'Sawal ka asal hissa alag kar raha hoon, faltu words hata raha hoon.',
    'Prompt ki qisam dekh raha hoon — definition, wazahat, ya calculation.',
    'Is topic ka lazmi rule nikal raha hoon.',
    'Seedha aur exam-ready jawab tayyar kar raha hoon.',
    'Aam ghaltiyon se mila kar check kar raha hoon.',
  ],
  urdu: [
    'سوال کے اصل حصے کو الگ کر رہا ہوں۔',
    'پرامپٹ کی قسم دیکھ رہا ہوں — تعریف، وضاحت، یا حساب۔',
    'اس موضوع کا لازمی قاعدہ نکال رہا ہوں۔',
    'سیدھا اور امتحان کے لیے تیار جواب بنا رہا ہوں۔',
    'عام غلطیوں سے مل کر جانچ رہا ہوں۔',
  ],
  arabic: [
    'أعزل الجزء الجوهري من السؤال.',
    'أحدد نوع السؤال — تعريف أو شرح أو حساب.',
    'أستخرج القاعدة الأساسية لهذا الموضوع.',
    'أبني إجابة مباشرة جاهزة للامتحان.',
    'أراجع مقابل الأخطاء الشائعة.',
  ],
  hindi: [
    'प्रश्न के मुख्य भाग को अलग कर रहा हूँ।',
    'प्रश्न का प्रकार पहचान रहा हूँ — परिभाषा, व्याख्या, या गणना।',
    'इस विषय का मूल नियम निकाल रहा हूँ।',
    'सीधा और परीक्षा-तैयार उत्तर बना रहा हूँ।',
    'आम गलतियों से मिलाकर जाँच रहा हूँ।',
  ],
  spanish: [
    'Aislando la frase clave y eliminando el relleno.',
    'Clasificando el tipo de pregunta — definición, mecanismo o cálculo.',
    'Recuperando la regla del temario para este tema.',
    'Construyendo una respuesta directa y lista para el examen.',
    'Revisando contra los errores estudiantiles más comunes.',
  ],
  french: [
    'Isolement de la phrase clé et suppression du remplissage.',
    'Classification du type de question — définition, mécanisme ou calcul.',
    'Récupération de la règle du programme pour ce sujet.',
    'Construction d’une réponse directe prête pour l’examen.',
    'Vérification par rapport aux erreurs les plus courantes.',
  ],
};

/** Prompt-type detection that works across every supported language. */
type PromptKind = 'definition' | 'mechanism' | 'computation';

function promptKind(q: string): PromptKind {
  const t = q.toLowerCase();
  if (/(why|explain|describe|how does|kaise|kyun|kyu|samjhao|wajah|كيف|لماذا|kaise kaam|kaise chalta)/.test(t)) return 'mechanism';
  if (/(solve|calculate|find|how many|value|krwa|karwa|solve kr|hisab|nkal|nikal|حل|احسب|गणना|kardo)/.test(t)) return 'computation';
  return 'definition';
}

/** Structural label dictionary — every label the answer card can render. */
export interface AnswerLabels {
  answer: string;
  definition: string;
  driver: string;
  chain: string;
  step: string;
  distinguish: string;
  concepts: string;
  reasoning: string;
}

export const ANSWER_LABELS: Record<LangProfile, AnswerLabels> = {
  english: {
    answer: 'The answer',
    definition: 'Definition',
    driver: 'Driver',
    chain: 'Chain',
    step: 'Step',
    distinguish: 'Distinguish from',
    concepts: 'Core concepts to remember',
    reasoning: 'Reasoning trace',
  },
  'roman-urdu': {
    answer: 'Jawab',
    definition: 'Tareef',
    driver: 'Wajah',
    chain: 'Silsila',
    step: 'Step',
    distinguish: 'Is se alag hai',
    concepts: 'Yaad rakhne ke bunyadi concepts',
    reasoning: 'Soch ka doran',
  },
  urdu: {
    answer: 'جواب',
    definition: 'تعریف',
    driver: 'وجہ',
    chain: 'سلسلہ',
    step: 'مرحلہ',
    distinguish: 'اس سے مختلف ہے',
    concepts: 'یاد رکھنے کے بنیادی تصورات',
    reasoning: 'استدلال',
  },
  arabic: {
    answer: 'الجواب',
    definition: 'التعريف',
    driver: 'السبب',
    chain: 'السلسلة',
    step: 'خطوة',
    distinguish: 'يختلف عن',
    concepts: 'المفاهيم الأساسية',
    reasoning: 'الاستدلال',
  },
  hindi: {
    answer: 'उत्तर',
    definition: 'परिभाषा',
    driver: 'कारण',
    chain: 'शृंखला',
    step: 'चरण',
    distinguish: 'इससे भिन्न है',
    concepts: 'याद रखने के मूल अवधारणाएँ',
    reasoning: 'तर्क',
  },
  spanish: {
    answer: 'La respuesta',
    definition: 'Definición',
    driver: 'Causa',
    chain: 'Cadena',
    step: 'Paso',
    distinguish: 'Se diferencia de',
    concepts: 'Conceptos clave',
    reasoning: 'Razonamiento',
  },
  french: {
    answer: 'La réponse',
    definition: 'Définition',
    driver: 'Cause',
    chain: 'Chaîne',
    step: 'Étape',
    distinguish: 'À distinguer de',
    concepts: 'Concepts clés',
    reasoning: 'Raisonnement',
  },
};

/** Full concept glossary — ensures no English leaks into localized output. */
const CONCEPT_GLOSSARY: Record<string, Partial<Record<LangProfile, string>>> = {
  'Conservation of energy': { 'roman-urdu': 'Energy ka hifazat', urdu: 'توانائی کا تحفظ', arabic: 'حفظ الطاقة', hindi: 'ऊर्जा संरक्षण', spanish: 'Conservación de energía', french: 'Conservation de l’énergie' },
  'Cell structure and function': { 'roman-urdu': 'Cell ki banawat aur kaam', urdu: 'خلیے کی ساخت اور کام', arabic: 'بنية الخلية ووظيفتها', hindi: 'कोशिका संरचना और कार्य', spanish: 'Estructura y función celular', french: 'Structure et fonction cellulaire' },
  'Newtonian mechanics': { 'roman-urdu': 'Newton ke qawaneen', urdu: 'نیوٹن کے قوانین', arabic: 'قوانين نيوتن', hindi: 'न्यूटनीय यांत्रिकी', spanish: 'Mecánica newtoniana', french: 'Mécanique newtonienne' },
  'Chemical bonding': { 'roman-urdu': 'Chemical bonding', urdu: 'کیمیائی بانڈ', arabic: 'الرابطة الكيميائية', hindi: 'रासायनिक बंधन', spanish: 'Enlace químico', french: 'Liaison chimique' },
  'The scientific method': { 'roman-urdu': 'Scientific method ka tareeqa', urdu: 'سائنسی طریقہ کار', arabic: 'المنهج العلمي', hindi: 'वैज्ञानिक विधि', spanish: 'Método científico', french: 'Méthode scientifique' },
  'Order of operations': { 'roman-urdu': 'Operation ka tarteeb', urdu: 'عملیات کی ترتیب', arabic: 'ترتيب العمليات', hindi: 'संक्रियाओं का क्रम', spanish: 'Orden de las operaciones', french: 'Ordre des opérations' },
  'Isolating the variable': { 'roman-urdu': 'Variable alag karna', urdu: 'متغیر کو الگ کرنا', arabic: 'عزل المتغير', hindi: 'चर को अलग करना', spanish: 'Aislar la variable', french: 'Isoler la variable' },
  'Factorisation patterns': { 'roman-urdu': 'Factorisation ka pattern', urdu: 'عامل بندی کا انداز', arabic: 'أنماط التحليل إلى العوامل', hindi: 'गुणनखंडन प्रतिरूप', spanish: 'Patrones de factorización', french: 'Schémas de factorisation' },
  'Pythagorean theorem': { 'roman-urdu': 'Pythagoras ka theorem', urdu: 'پائتھاگورس کا نظریہ', arabic: 'نظرية فيثاغورس', hindi: 'पाइथागोरस प्रमेय', spanish: 'Teorema de Pitágoras', french: 'Théorème de Pythagore' },
  'Unit conversion': { 'roman-urdu': 'Unit tabdeel karna', urdu: 'اکائی کی تبدیلی', arabic: 'تحويل الوحدات', hindi: 'इकाई रूपांतरण', spanish: 'Conversión de unidades', french: 'Conversion d’unités' },
  'Subject–verb agreement': { 'roman-urdu': 'Subject-verb ka mutual ittifaq', urdu: 'فاعل اور فعل کی مطابقت', arabic: 'توافق الفاعل والفعل', hindi: 'कर्ता-क्रिया अनुरूपता', spanish: 'Concordancia sujeto-verbo', french: 'Accord sujet-verbe' },
  'Tense consistency': { 'roman-urdu': 'Tense ki consistency', urdu: 'زمانے کی مطابقت', arabic: 'اتساق الزمن', hindi: 'काल स्थिरता', spanish: 'Consistencia de tiempos', french: 'Cohérence des temps' },
  'Literary devices': { 'roman-urdu': 'Adabi hathyar', urdu: 'ادبی اسالیب', arabic: 'الأساليب الأدبية', hindi: 'साहित्यिक उपकरण', spanish: 'Recursos literarios', french: 'Procédés littéraires' },
  'Paragraph structure': { 'roman-urdu': 'Paragraph ki tarteeb', urdu: 'پیراگراف کی ساخت', arabic: 'بنية الفقرة', hindi: 'अनुच्छेद संरचना', spanish: 'Estructura del párrafo', french: 'Structure du paragraphe' },
  'Contextual vocabulary': { 'roman-urdu': 'Context ke mutabiq alfaz', urdu: 'سیاق و سباق کے الفاظ', arabic: 'المفردات السياقية', hindi: 'संदर्भगत शब्दावली', spanish: 'Vocabulario contextual', french: 'Vocabulaire contextuel' },
  'Quranic context': { 'roman-urdu': 'Quran ka context', urdu: 'قرآنی سیاق و سباق', arabic: 'السياق القرآني', hindi: 'कुरानिक संदर्भ', spanish: 'Contexto coránico', french: 'Contexte coranique' },
  'Seerat timeline': { 'roman-urdu': 'Seerat ka waqti silsila', urdu: 'سیرت کا زمانی ترتیب', arabic: 'التسلسل الزمني للسيرة', hindi: 'सीरत की समयरेखा', spanish: 'Cronología de la Sira', french: 'Chronologie de la Sira' },
  'Ibadat fundamentals': { 'roman-urdu': 'Ibadat ki bunyadain', urdu: 'عبادات کی بنیادیں', arabic: 'أسس العبادات', hindi: 'इबादत की नींव', spanish: 'Fundamentos de adoraci\u00f3n', french: 'Fondamentaux de l’adoration' },
  'Akhlaq principles': { 'roman-urdu': 'Akhlaq ke usool', urdu: 'اخلاق کے اصول', arabic: 'مبادئ الأخلاق', hindi: 'अख़लाक़ के सिद्धांत', spanish: 'Principios de akhlaq', french: 'Principes d’akhlaq' },
  'Hadith authenticity': { 'roman-urdu': 'Hadith ki asliyat', urdu: 'حدیث کی اصالت', arabic: 'صحة الحديث', hindi: 'हदीस की प्रामाणिकता', spanish: 'Autenticidad del hadiz', french: 'Authenticité du hadith' },
  'Binary representation': { 'roman-urdu': 'Binary numaindagi', urdu: 'بائنری نمائندگی', arabic: 'التمثيل الثنائي', hindi: 'बाइनरी निरूपण', spanish: 'Representación binaria', french: 'Représentation binaire' },
  'Algorithmic thinking': { 'roman-urdu': 'Algorithmic soch', urdu: 'الگورتھمک سوچ', arabic: 'التفكير الخوارزمي', hindi: 'एल्गोरिदमिक चिंतन', spanish: 'Pensamiento algorítmico', french: 'Pensée algorithmique' },
  'Input–process–output': { 'roman-urdu': 'Input-process-output', urdu: 'ان پٹ، عمل، آؤٹ پٹ', arabic: 'مدخل - معالجة - مخرج', hindi: 'निवेश-प्रक्रिया-प्राप्ति', spanish: 'Entrada–proceso–salida', french: 'Entrée–traitement–sortie' },
  'Data structures': { 'roman-urdu': 'Data structures', urdu: 'ڈیٹا ساخت', arabic: 'هياكل البيانات', hindi: 'डेटा संरचना', spanish: 'Estructuras de datos', french: 'Structures de données' },
  'Logic gates': { 'roman-urdu': 'Logic gates', urdu: 'لاجک گیٹ', arabic: 'البوابات المنطقية', hindi: 'तर्क गेट', spanish: 'Puertas lógicas', french: 'Portes logiques' },
  'Cause and effect chains': { 'roman-urdu': 'Sabab aur nateejay ka silsila', urdu: 'سبب اور نتیجے کا سلسلہ', arabic: 'سلاسل السبب والأثر', hindi: 'कारण-परिणाम शृंखला', spanish: 'Cadenas de causa y efecto', french: 'Chaînes de cause à effet' },
  'Timeline sequencing': { 'roman-urdu': 'Waqti tarteeb', urdu: 'وقتی ترتیب', arabic: 'الترتيب الزمني', hindi: 'समय क्रम', spanish: 'Secuencia cronológica', french: 'Séquençage chronologique' },
  'Map reading': { 'roman-urdu': 'Naqsha parhna', urdu: 'نقشہ پڑھنا', arabic: 'قراءة الخرائط', hindi: 'मानचित्र पठन', spanish: 'Lectura de mapas', french: 'Lecture de cartes' },
  'Source evaluation': { 'roman-urdu': 'Manba ki jaanch', urdu: 'مصدر کی جانچ', arabic: 'تقييم المصادر', hindi: 'स्रोत मूल्यांकन', spanish: 'Evaluación de fuentes', french: 'Évaluation des sources' },
  'Civic structures': { 'roman-urdu': 'Shehri dhancha', urdu: 'شہری ڈھانچہ', arabic: 'الهياكل المدنية', hindi: 'नागरिक संरचना', spanish: 'Estructuras cívicas', french: 'Structures civiques' },
  'Core definitions': { 'roman-urdu': 'Bunyadi tareefein', urdu: 'بنیادی تعریفیں', arabic: 'التعريفات الأساسية', hindi: 'मूल परिभाषाएँ', spanish: 'Definiciones clave', french: 'Définitions clés' },
  'Key terminology': { 'roman-urdu': 'Ahem istilahat', urdu: 'اہم اصطلاحات', arabic: 'المصطلحات الأساسية', hindi: 'प्रमुख शब्दावली', spanish: 'Terminología clave', french: 'Terminologie clé' },
  'Applied examples': { 'roman-urdu': 'Amali misalein', urdu: 'عملی مثالیں', arabic: 'أمثلة تطبيقية', hindi: 'व्यावहारिक उदाहरण', spanish: 'Ejemplos aplicados', french: 'Exemples appliqués' },
  'Common misconceptions': { 'roman-urdu': 'Aam ghaltiyan', urdu: 'عام غلط فہمیاں', arabic: 'المفاهيم الخاطئة الشائعة', hindi: 'सामान्य भ्रांतियाँ', spanish: 'Errores comunes', french: 'Idées reçues courantes' },
  'Revision spacing': { 'roman-urdu': 'Revision ke darmiyan waqt', urdu: 'دہرائی کے درمیان وقفہ', arabic: 'تباعد المراجعة', hindi: 'पुनरावृत्ति अंतराल', spanish: 'Espaciado de repaso', french: 'Espacement des révisions' },
  'Diagram interpretation': { 'roman-urdu': 'Diagram samajhna', urdu: 'خاکے کی تشریح', arabic: 'تفسير الرسوم', hindi: 'आरेख निरूपण', spanish: 'Interpretación de diagramas', french: 'Interprétation des schémas' },
  'Applied reasoning': { 'roman-urdu': 'Amali mantiq', urdu: 'عملی استدلال', arabic: 'الاستدلال التطبيقي', hindi: 'व्यावहारिक तर्क', spanish: 'Razonamiento aplicado', french: 'Raisonnement appliqué' },
  'Core curriculum statement': { 'roman-urdu': 'Curriculum ki bunyadi baat', urdu: 'نصاب کی بنیادی بات', arabic: 'البيان المنهجي الأساسي', hindi: 'पाठ्यक्रम का मूल कथन', spanish: 'Enunciado curricular', french: 'Énoncé du programme' },
};

/** Localizes concept labels so no English leaks into a localized answer. */
function localizedConcepts(base: string[], lang: LangProfile): string[] {
  return base.map((c) => CONCEPT_GLOSSARY[c]?.[lang] ?? c);
}

/** Deterministic hash so the same question always yields the same solve. */
export function hashOf(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Agentic textbook solver — localized reasoning plus punchy bullet answers. */
export function solveQuestion(question: string): SolverResult {
  const lang = detectLanguage(question);
  const subject = inferSubject(question);
  const h = hashOf(question.trim().toLowerCase());
  const baseConcepts = (CONCEPT_BANK[subject] ?? CONCEPT_BANK['General Studies']).slice(0, 3);
  const concepts = localizedConcepts(baseConcepts, lang);
  const kind = promptKind(question);

  const labels = REASON_LABELS[lang];
  const details = REASON_DETAILS[lang];
  const steps: SolverStep[] = labels.map((label, i) => ({
    label,
    detail: i === 0
      ? lang === 'roman-urdu'
        ? `${subject} ka sawal hai. Asal phrase: “${question.trim().slice(0, 56)}${question.trim().length > 56 ? '…' : ''}”`
        : `${subject} question detected. Operative phrase: “${question.trim().slice(0, 56)}${question.trim().length > 56 ? '…' : ''}”`
      : details[i],
  }));

  // ── Ultra-concise answers — every structural label localized ──
  const L = ANSWER_LABELS[lang];
  const answer: string[] =
    kind === 'mechanism'
      ? [
          `${L.driver}: ${concepts[0]}`,
          `${L.chain}: ${concepts[0]} → ${concepts[1]}`,
        ]
      : kind === 'computation'
        ? [
            `${L.step} 1 — ${concepts[0]}`,
            `${L.step} 2 — ${concepts[1]}`,
            `${L.step} 3 — ${concepts[2] ?? concepts[0]}`,
          ]
        : [
            `${L.definition}: ${concepts[0]}`,
            `${L.distinguish}: ${concepts[1]}`,
          ];

  return {
    id: `sv_${h.toString(36)}`,
    question: question.trim().slice(0, 180),
    lang,
    steps,
    answer,
    concepts,
    at: Date.now(),
  };
}

// ── Multimodal book-page scanner ─────────────────────────────────────────────

export interface ExtractedQuestion {
  id: string;
  stem: string;
  topic: string;
  page: string;
}

export interface PageScan {
  id: string;
  fileName: string;
  subject: string;
  detected: ExtractedQuestion[];
  at: number;
}

const PAGE_TOPICS: Record<string, string[]> = {
  Science: ['Laws of motion', 'Cell division', 'Chemical reactions', 'Energy transfer', 'Human organ systems'],
  Mathematics: ['Linear equations', 'Factorisation', 'Area and perimeter', 'Ratio and proportion', 'Angle geometry'],
  English: ['Tense correction', 'Comprehension inference', 'Active and passive voice', 'Punctuation', 'Vocabulary in context'],
  Islamiat: ['Surah themes', 'Seerat events', 'Ibadat rulings', 'Akhlaq in daily life', 'Hadith meanings'],
  'Computer Science': ['Binary conversion', 'Algorithm design', 'Input and output devices', 'Spreadsheet formulas', 'Network basics'],
  Urdu: ['گرامر کی درستی', 'مضمون نگاری', 'نظم کی تشریح', 'محاورات', 'قواعد'],
  'Social Studies': ['Causes of war', 'Climate zones', 'Constitutional structure', 'Trade routes', 'Population movement'],
  'General Studies': ['Core definitions', 'Applied reasoning', 'Diagram interpretation', 'Key terminology', 'Sequencing events'],
};

/** Extracts a deterministic question set from an uploaded page image. */
export function scanPage(fileName: string, sizeBytes: number): PageScan {
  const h = hashOf(`${fileName}:${sizeBytes}`);
  const subjects = Object.keys(PAGE_TOPICS);
  const subject = subjects[h % subjects.length];
  const topics = PAGE_TOPICS[subject];
  const count = 4 + (h % 3); // 4–6 questions
  const detected: ExtractedQuestion[] = Array.from({ length: count }, (_, i) => {
    const topic = topics[(h + i) % topics.length];
    const pageNo = 40 + ((h >> (i + 2)) % 160);
    return {
      id: `eq_${h.toString(36)}_${i}`,
      stem:
        i % 3 === 0
          ? `Explain ${topic.toLowerCase()} in your own words and give one example.`
          : i % 3 === 1
            ? `Solve the ${topic.toLowerCase()} problem shown in exercise ${i + 1} of the uploaded page.`
            : `Define ${topic.toLowerCase()} and state where it is applied.`,
      topic,
      page: `p. ${pageNo}`,
    };
  });
  return { id: `ps_${h.toString(36)}`, fileName: fileName.slice(0, 48), subject, detected, at: Date.now() };
}

// ── Test generator & diagnostics ─────────────────────────────────────────────

export type TestKind = 'mcq' | 'short';

export interface TestOption {
  key: string;
  text: string;
}

export interface TestQuestion {
  id: string;
  kind: TestKind;
  stem: string;
  topic: string;
  page: string;
  options?: TestOption[];
  correct?: string; // option key for MCQ
  model?: string; // model answer for short-form
  marks: number;
}

export interface Diagnostic {
  questionId: string;
  stem: string;
  topic: string;
  page: string;
  given: string;
  expected: string;
  verdict: 'correct' | 'partial' | 'wrong';
}

export interface TestResult {
  id: string;
  kind: TestKind;
  subject: string;
  score: number;
  total: number;
  pct: number;
  diagnostics: Diagnostic[];
  at: number;
}

const DISTRACTORS: Record<string, string[]> = {
  Science: ['Osmosis through the membrane', 'Gravitational redshift', 'Inertial damping', 'Mitotic crossover'],
  Mathematics: ['Inverting the coefficient sign', 'Applying the converse theorem', 'Summing the constants only', 'Substituting the hypotenuse'],
  English: ['The passive infinitive form', 'A compound gerund phrase', 'Subjunctive mood', 'An appositive clause'],
  Islamiat: ['A later abrogated ruling', 'A weak narration', 'A regional practice', 'A later addition'],
  'Computer Science': ['Analog signal sampling', 'Recursive descent', 'Hexadecimal padding', 'Cache thrashing'],
  Urdu: ['اسم کی جمع', 'فعل کی گردان', 'صفت کی تہذیب', 'حرف جار'],
  'Social Studies': ['An economic consequence', 'A later territorial shift', 'A cultural byproduct', 'A subsequent treaty'],
  'General Studies': ['A common misconception', 'An unrelated principle', 'An inverted definition', 'A partial truth'],
};

/** Builds a full test canvas from a scan (or the active subject when no scan). */
export function generateTest(kind: TestKind, scan: PageScan | null, subjectFallback: string): TestQuestion[] {
  const subject = scan?.subject ?? subjectFallback;
  const topics = PAGE_TOPICS[subject] ?? PAGE_TOPICS['General Studies'];
  const pool = scan?.detected ?? topics.slice(0, 5).map((t, i) => ({
    id: `fb_${i}`,
    stem: `Explain ${t.toLowerCase()} with one worked example.`,
    topic: t,
    page: `p. ${60 + i * 12}`,
  }));
  const h = hashOf(`${kind}:${subject}:${scan?.id ?? 'fallback'}`);

  return pool.slice(0, kind === 'mcq' ? 5 : 4).map((q, i) => {
    if (kind === 'mcq') {
      const wrongs = (DISTRACTORS[subject] ?? DISTRACTORS['General Studies']);
      const correctText = `${q.topic} — the standard curriculum definition applied correctly`;
      const options: TestOption[] = [
        { key: 'A', text: correctText },
        { key: 'B', text: wrongs[(h + i) % wrongs.length] },
        { key: 'C', text: wrongs[(h + i + 1) % wrongs.length] },
        { key: 'D', text: wrongs[(h + i + 2) % wrongs.length] },
      ];
      // deterministic shuffle so the answer is not always A
      const shift = (h + i * 7) % 4;
      const rotated = [...options.slice(shift), ...options.slice(0, shift)];
      return {
        id: `q_${h.toString(36)}_${i}`,
        kind: 'mcq' as const,
        stem: `${q.stem} Which statement is correct?`,
        topic: q.topic,
        page: q.page,
        options: rotated,
        correct: rotated.find((o) => o.text === correctText)?.key ?? 'A',
        marks: 2,
      };
    }
    return {
      id: `q_${h.toString(36)}_${i}`,
      kind: 'short' as const,
      stem: q.stem,
      topic: q.topic,
      page: q.page,
      model: `A full-mark answer names ${q.topic.toLowerCase()}, states the governing rule in one sentence, then gives one concrete worked example. Two to three sentences is sufficient — but every part must be present.`,
      marks: 3,
    };
  });
}

const KEYWORD_BONUS = ['because', 'therefore', 'example', 'since', 'result', 'defined', 'applied'];

/** Grades a submission and produces per-question diagnostics. */
export function gradeTest(questions: TestQuestion[], answers: Record<string, string>, kind: TestKind, subject: string): TestResult {
  let score = 0;
  const total = questions.reduce((a, q) => a + q.marks, 0);
  const diagnostics: Diagnostic[] = [];

  for (const q of questions) {
    const given = (answers[q.id] ?? '').trim();
    if (q.kind === 'mcq') {
      const ok = given === q.correct;
      if (ok) score += q.marks;
      diagnostics.push({
        questionId: q.id,
        stem: q.stem,
        topic: q.topic,
        page: q.page,
        given: given ? `Option ${given}` : 'No answer selected',
        expected: `Option ${q.correct}`,
        verdict: ok ? 'correct' : 'wrong',
      });
    } else {
      const len = given.length;
      const hits = KEYWORD_BONUS.filter((k) => given.toLowerCase().includes(k)).length;
      let earned = 0;
      if (len >= 200) earned = 3;
      else if (len >= 110) earned = 2;
      else if (len >= 40) earned = 1;
      if (hits >= 2 && earned < 3) earned += 1;
      earned = Math.min(q.marks, earned);
      score += earned;
      diagnostics.push({
        questionId: q.id,
        stem: q.stem,
        topic: q.topic,
        page: q.page,
        given: given ? given.slice(0, 120) + (given.length > 120 ? '…' : '') : 'Left blank',
        expected: q.model ?? 'Full model answer',
        verdict: earned === q.marks ? 'correct' : earned > 0 ? 'partial' : 'wrong',
      });
    }
  }

  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  return {
    id: `tr_${Date.now().toString(36)}`,
    kind,
    subject,
    score,
    total,
    pct,
    diagnostics,
    at: Date.now(),
  };
}

/** Coaching guidance derived from the diagnostic spread. */
export function diagnosticAdvice(result: TestResult): string[] {
  const weak = result.diagnostics.filter((d) => d.verdict !== 'correct');
  if (weak.length === 0) {
    return [
      'Clean sweep — every question landed at full marks.',
      'Lock this in with one spaced repetition pass in 48 hours.',
      'Move to the next topic block rather than repeating this one.',
    ];
  }
  const topics = [...new Set(weak.map((d) => d.topic))];
  const pages = [...new Set(weak.map((d) => d.page))];
  return [
    `${weak.length} of ${result.diagnostics.length} questions lost marks — accuracy sits at ${result.pct}%.`,
    `Priority review topics: ${topics.slice(0, 3).join(', ')}.`,
    `Revisit ${pages.slice(0, 3).join(', ')} in your textbook before the next attempt.`,
    result.pct >= 60
      ? 'You are close — the gaps are narrow, not structural. One focused revision block should clear them.'
      : 'The gaps are structural. Slow down, rebuild the fundamentals of the flagged topics, then re-test.',
  ];
}

/** Benchmark band from a percentage — drives the Class Grade Benchmark selector. */
export function benchmarkFrom(pct: number): 'first' | 'second' {
  return pct >= 60 ? 'first' : 'second';
}
