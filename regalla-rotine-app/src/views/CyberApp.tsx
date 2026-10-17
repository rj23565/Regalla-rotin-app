import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Plus,
  Database,
  Droplets,
  Eye,
  EyeOff,
  Flame,
  Gauge,
  GraduationCap,
  Grid2x2,
  Languages,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Megaphone,
  Moon,
  Power,
  RotateCcw,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  Target,
  ThermometerSun,
  Timer,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Trophy,
  User,
  UserPlus,
  Users,
  Wind,
  X,
  Zap,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import {
  ARCS,
  COACHQ,
  CyberState,
  INJURIES,
  activePrepTasks,
  activeSubjects,
  LIFESTYLES,
  SUBSTITUTION_NOTES,
  buildWeek,
  FLASHCARDS,
  FLEX_SUITE,
  GRADES,
  MOCK_USERS,
  PROGRAMS,
  TIERS,
  adEarnings,
  coach,
  detectAdminIntent,
  hasAccount,
  isRTL,
  registerAccount,
  programTargets,
  studyTarget,
  t,
  todayKey,
  useCyber,
  waterTarget,
  weightPlan,
} from '../lib/cyber';
import type { MockUser, ProgramId } from '../lib/cyber';
import { RegaliaLogo, RegaliaMark } from '../components/RegaliaLogo';
import { DietPanel } from './panels/DietSkin';
import { DermaCore } from './panels/DermaCore';
import { ProfilePanel, RoutinePanel, TaskPanel } from './panels/RoutineTasks';
import { BodyPanel } from './panels/BodyPlanner';
import { StudentAIPortal } from './panels/StudentAI';
import { BiometricHub, LimitTester } from './panels/Biometric';
import { AdsManager } from './panels/AdsManager';
import { AdPlayer } from '../components/AdPlayer';

type PanelId = 'study' | 'fitness' | 'body' | 'diet' | 'skin' | 'routine' | 'tasks' | 'analytics' | 'profile' | 'admin';

const CORE_NAV: Array<{ id: PanelId; key: string; Icon: typeof User }> = [
  { id: 'study', key: 'nav_study', Icon: GraduationCap },
  { id: 'fitness', key: 'nav_fitness', Icon: Zap },
  { id: 'diet', key: 'nav_diet', Icon: Target },
  { id: 'skin', key: 'nav_skin', Icon: Sparkles },
  { id: 'routine', key: 'nav_routine', Icon: Check },
  { id: 'tasks', key: 'nav_tasks', Icon: Timer },
  { id: 'analytics', key: 'nav_analytics', Icon: BarChart3 },
  { id: 'profile', key: 'nav_profile', Icon: User },
];

/** Admin-only navigation entry — appended once the bypass key authorises root. */
const ADMIN_NAV: Array<{ id: PanelId; key: string; Icon: typeof User }> = [
  { id: 'admin', key: 'nav_admin', Icon: ShieldCheck },
];

export default function CyberApp() {
  const [s, setS] = useCyber();
  const [panel, setPanel] = useState<PanelId>('study');
  const [drawer, setDrawer] = useState(false);

  const theme = s.theme ?? 'dark';
  const lang = s.lang ?? 'en';
  const ads = s.ads ?? { on: false, zones: { top: false, side: false, inline: false }, frequency: 'medium' as const, script: '', backlog48: true };

  useEffect(() => {
    document.body.classList.add('cyber');
    document.body.dataset.mode = theme;
    document.documentElement.style.background = theme === 'dark' ? '#0a0a0a' : '#f8fafc';
    document.body.style.background = theme === 'dark' ? '#0a0a0a' : '#f8fafc';
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
  }, [theme, lang]);

  if (!s.auth) return <AuthGate setS={setS} />;

  const adCount = ads.on ? (ads.frequency === 'high' ? 2 : ads.frequency === 'medium' ? 1 : 0) : 0;
  const NAV = s.admin ? [...CORE_NAV, ...ADMIN_NAV] : CORE_NAV;

  const views: Record<PanelId, ReactNode> = {
    study: <StudyPanel s={s} setS={setS} />,
    fitness: <FitnessPanel s={s} setS={setS} />,
    body: <BodyPanel s={s} setS={setS} />,
    diet: <DietPanel s={s} setS={setS} />,
    skin: <DermaCore s={s} setS={setS} />,
    routine: <RoutinePanel s={s} setS={setS} />,
    tasks: <TaskPanel s={s} setS={setS} />,
    analytics: <AnalyticsPanel s={s} setS={setS} />,
    profile: <ProfilePanel s={s} setS={setS} />,
    admin: <AdminPanel s={s} setS={setS} />,
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 font-body text-slate-100" style={theme === 'light' ? { background: '#f8fafc', color: '#0f172a' } : undefined}>
      <Atmosphere theme={theme} />

      <aside className="sticky top-0 z-20 hidden h-screen w-60 flex-none flex-col overflow-y-auto border-r border-amber-500/15 bg-neutral-950/80 px-4 py-5 backdrop-blur-xl lg:flex" style={theme === 'light' ? { background: 'rgba(248,250,252,0.85)' } : undefined}>
        <div className="ry-frame">
          <div className="flex items-center gap-3 px-3.5 py-3">
            <RegaliaMark size={38} />
            <div className="leading-tight">
              <div className="ry-gold font-display text-[15px] font-bold tracking-[0.2em]">REGALIA</div>
              <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.24em] cy-muted">Ecosystem</div>
            </div>
          </div>
        </div>

        {ads.on && ads.zones.side && <AdSlot label="Sidebar · 300×250" className="mt-4" />}

        <nav className="mt-5 flex-1 space-y-1.5">
          {NAV.map(({ id, key, Icon }, i) => {
            const active = panel === id;
            return (
              <button key={id} onClick={() => setPanel(id)} className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${active ? 'border border-amber-500/40 bg-amber-500/[0.07]' : 'border border-transparent hover:bg-neutral-900/70'}`} style={!active && theme === 'light' ? { background: 'rgba(255,255,255,0.7)' } : undefined}>
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-400 to-red-700 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />}
                <span className={`grid h-7 w-7 flex-none place-items-center rounded-lg border ${active ? 'border-amber-500/40 bg-amber-500/10' : 'border-amber-500/15 cy-shell'}`}><Icon size={14} className={active ? 'text-amber-500' : 'cy-muted'} /></span>
                <span className={`font-monox text-[9.5px] font-bold uppercase tracking-[0.14em] ${active ? 'text-amber-500' : 'cy-strong'}`}>{t(lang, key)}</span>
                <span className="ml-auto font-monox text-[7px] font-bold cy-muted">{i + 1}</span>
              </button>
            );
          })}
        </nav>

        <div className="ry-plate mt-4 px-3 py-3">
          <div className="flex items-center gap-2.5">
            {s.avatar ? <img src={s.avatar} alt="avatar" className="h-9 w-9 flex-none rounded-full border-2 border-amber-500/40 object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-amber-500/40 font-display text-sm font-bold text-amber-500">{(s.auth?.name ?? 'G').slice(0, 1)}</span>}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold cy-title">{s.auth?.name ?? 'Guest'}</div>
              <div className="truncate font-monox text-[7.5px] font-bold cy-muted">{s.auth?.mail ?? 'no-session'}</div>
            </div>
          </div>
          <button onClick={() => setS((x) => ({ ...x, auth: null }))} className="ry-ghost mt-2.5 w-full justify-center !py-2"><LogOut size={11} /> Sign out</button>
        </div>
      </aside>

      {/* mobile app bar + slide-out drawer */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-amber-500/20 bg-neutral-950/92 px-3 py-2.5 backdrop-blur-xl lg:hidden" style={theme === 'light' ? { background: 'rgba(248,250,252,0.94)' } : undefined}>
        <button onClick={() => setDrawer(true)} aria-label="Open navigation" className="grid h-9 w-9 place-items-center rounded-xl border border-amber-500/30 cy-shell">
          <Menu size={17} className="text-amber-500" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <RegaliaMark size={26} />
          <span className="ry-gold truncate font-display text-[13px] font-bold tracking-[0.2em]">REGALIA</span>
        </div>
        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-monox text-[8px] font-bold uppercase tracking-[0.12em] text-amber-500">P{NAV.findIndex((n) => n.id === panel) + 1}</span>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="fixed inset-0 z-40 bg-neutral-950/80 lg:hidden" />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[78vw] max-w-[280px] flex-col border-r border-amber-500/25 bg-neutral-950 px-3 py-4 lg:hidden"
              style={theme === 'light' ? { background: '#f8fafc' } : undefined}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <RegaliaMark size={34} />
                <button onClick={() => setDrawer(false)} aria-label="Close navigation" className="grid h-8 w-8 place-items-center rounded-xl border border-amber-500/30 cy-shell"><X size={15} className="text-amber-500" /></button>
              </div>
              <div className="ry-rule" />
              <nav className="scrollthin mt-3 flex-1 space-y-1.5 overflow-y-auto pb-3">
                {NAV.map(({ id, key, Icon }, i) => {
                  const active = panel === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setPanel(id); setDrawer(false); }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 ${active ? 'border border-amber-500/40 bg-amber-500/[0.07]' : 'border border-transparent'}`}
                    >
                      <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg border ${active ? 'border-amber-500/40 bg-amber-500/10' : 'border-amber-500/15 cy-shell'}`}><Icon size={15} className={active ? 'text-amber-500' : 'cy-muted'} /></span>
                      <span className={`font-monox text-[10px] font-bold uppercase tracking-[0.14em] ${active ? 'text-amber-500' : 'cy-strong'}`}>{t(lang, key)}</span>
                      <span className="ml-auto font-monox text-[7px] font-bold cy-muted">{i + 1}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="ry-plate px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  {s.avatar ? <img src={s.avatar} alt="avatar" className="h-8 w-8 flex-none rounded-full border-2 border-amber-500/40 object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-amber-500/40 font-display text-xs font-bold text-amber-500">{(s.auth?.name ?? 'G').slice(0, 1)}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11.5px] font-bold cy-title">{s.auth?.name ?? 'Guest'}</div>
                    <div className="truncate font-monox text-[7px] font-bold cy-muted">{s.auth?.mail ?? 'no-session'}</div>
                  </div>
                </div>
                <button onClick={() => setS((x) => ({ ...x, auth: null }))} className="ry-ghost mt-2 w-full justify-center !py-1.5"><LogOut size={11} /> Sign out</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 min-w-0 flex-1 px-3 pb-28 pt-16 sm:px-4 sm:pb-32 sm:pt-6 md:px-9 md:pt-8 lg:px-12 lg:pt-8">
        {ads.customOn && (ads.campaigns ?? []).some((c) => c.active) && (
          <div className="mb-5"><AdPlayer s={s} setS={setS} /></div>
        )}
        {ads.on && ads.zones.top && adCount > 0 && <AdSlot label="Leaderboard · 728×90" className="mb-5" />}
        <AnimatePresence mode="wait">
          <motion.div key={panel + lang} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
            {views[panel]}
          </motion.div>
        </AnimatePresence>
        {ads.on && ads.zones.inline && adCount > 1 && <AdSlot label="Inline card · responsive" className="mt-6" />}
      </main>

      <nav className="fixed inset-x-2 bottom-2 z-30 flex items-center justify-around gap-0.5 rounded-2xl border border-amber-500/20 bg-neutral-950/92 px-1 py-2 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:hidden" style={theme === 'light' ? { background: 'rgba(248,250,252,0.94)' } : undefined}>
        {NAV.map(({ id, key, Icon }) => {
          const active = panel === id;
          return (
            <button key={id} onClick={() => setPanel(id)} aria-label={t(lang, key)} className="flex flex-col items-center gap-1 px-1.5 py-1">
              <span className={`grid h-6 w-6 place-items-center rounded-lg ${active ? 'bg-amber-500/15 text-amber-500' : 'cy-muted'}`}><Icon size={14} /></span>
              <span className={`font-monox text-[6px] font-bold uppercase tracking-[0.08em] ${active ? 'text-amber-500' : 'cy-muted'}`}>{t(lang, key).split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── shared chrome ── */

function Atmosphere({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="ry-glow" style={{ top: '-8%', left: '12%', width: 520, height: 520, background: theme === 'dark' ? '#b91c1c' : '#f59e0b' }} />
      <div className="ry-glow" style={{ bottom: '-10%', right: '8%', width: 460, height: 460, background: theme === 'dark' ? '#f59e0b' : '#dc2626', animationDelay: '-8s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.045)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(70%_55%_at_50%_0%,#000_30%,transparent_100%)]" />
      <div className="cy-scan" />
      <div className="absolute inset-x-0 bottom-0 h-64" style={{ background: `linear-gradient(to top, ${theme === 'dark' ? '#0a0a0a' : '#f8fafc'}, transparent)` }} />
    </div>
  );
}

function AdSlot({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/[0.06] px-4 py-4 ${className}`}>
      <Megaphone size={15} className="text-amber-500" />
      <span className="font-monox text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">[Google Ads Monetized Space]</span>
      <span className="font-monox text-[8px] font-bold uppercase tracking-[0.14em] cy-muted">{label}</span>
    </div>
  );
}

function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <header>
      <div className="ry-kicker">{kicker}</div>
      <h1 className="ry-gold mt-2 font-display text-[30px] font-bold tracking-tight md:text-[38px]">{title}</h1>
      <p className="mt-1.5 max-w-xl text-[14px] font-medium leading-relaxed cy-muted">{sub}</p>
    </header>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.12em] text-amber-600">{children}</span>;
}

function Accordion({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`overflow-hidden rounded-xl border ${open ? 'border-amber-500/45 bg-amber-500/[0.05]' : 'cy-hair cy-shell'}`}>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
        <span className={`font-display text-[13.5px] font-bold ${open ? 'text-amber-500' : 'cy-title'}`}>{title}</span>
        <ChevronDown size={14} className={`flex-none transition-transform duration-300 ${open ? 'rotate-180 text-amber-500' : 'cy-muted'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <p className="border-t border-amber-500/15 px-3.5 pb-3.5 pt-3 text-[13px] font-medium leading-relaxed cy-soft">{body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBar({ label, pct, note }: { label: string; pct: number; note: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-monox text-[9px] font-bold uppercase tracking-[0.18em] cy-muted">{label}</span>
        <span className="ry-num text-lg cy-title">{Math.round(pct * 100)}<span className="text-[11px] text-amber-600">%</span></span>
      </div>
      <div className="ry-bar mt-1.5"><div style={{ width: `${Math.min(100, pct * 100)}%` }} /></div>
      <div className="mt-1 font-monox text-[8px] font-bold uppercase tracking-[0.14em] cy-muted">{note}</div>
    </div>
  );
}

/* ═══════════ AUTH GATE ═══════════ */

function AuthGate({ setS }: { setS: (u: (x: CyberState) => CyberState) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [acct, setAcct] = useState<'unknown' | 'found' | 'none'>('unknown');

  const validMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.trim());

  // Live account lookup — tells the user whether saved data exists for this Gmail.
  useEffect(() => {
    if (!validMail) {
      setAcct('unknown');
      return;
    }
    setAcct(hasAccount(mail) ? 'found' : 'none');
  }, [mail, validMail]);

  const elevate = (trace: string, operator: string) => {
    setBusy(true);
    // The bypass NEVER registers an account — root enters without creating one.
    setTimeout(() => setS((x) => ({
      ...x,
      admin: true,
      adminTrace: trace,
      auth: { name: operator, mail: mail.trim() || 'root@regalia.club' },
    })), 300);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    // Multi-key admin auto-detector — real-time regex scan of the password field.
    const scan = detectAdminIntent(mail, pass);
    if (scan.hit) {
      elevate(`AI GATE · ${scan.signal} · ${(scan.confidence * 100).toFixed(0)}% · ${scan.operator}`, scan.operator);
      return;
    }
    if (!mail.trim() || !pass.trim() || (mode === 'signup' && !name.trim())) {
      setErr('Every field is required to open the club gates.');
      return;
    }
    if (!validMail) {
      setErr('Enter a valid email address to continue.');
      return;
    }
    if (mode === 'login' && !hasAccount(mail)) {
      setErr('No account found for this email. Switch to Create Account to save your progress.');
      setMode('signup');
      return;
    }
    setBusy(true);
    if (mode === 'signup') registerAccount(mail);
    setTimeout(() => setS((x) => ({ ...x, auth: { name: name.trim() || mail.split('@')[0], mail: mail.trim() } })), 850);
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-neutral-950 px-4 py-10 font-body" style={{ background: '#0a0a0a' }}>
      <Atmosphere theme="dark" />
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-[430px]">
        <div className="ry-frame">
          <div className="px-7 py-8">
            <div className="text-center">
              <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="flex justify-center">
                <RegaliaLogo size={80} />
              </motion.div>
            </div>
            <div className="ry-rule mt-6" />
            <div className="mt-6 flex overflow-hidden rounded-xl border border-amber-500/30">
              {(['login', 'signup'] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setErr(null); }} className={`flex-1 py-2.5 font-monox text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === m ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-neutral-950' : 'bg-neutral-900/60 text-slate-400'}`}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="mt-5 space-y-3.5">
              {mode === 'signup' && (
                <Field icon={<User size={15} />} label="Full name">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="ry-input" placeholder="Your name" />
                </Field>
              )}
              <Field icon={<Mail size={15} />} label="Gmail address">
                <input value={mail} onChange={(e) => setMail(e.target.value)} className="ry-input" placeholder="yourname@gmail.com" autoComplete="username" />
              </Field>
              {mode === 'login' && acct !== 'unknown' && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-monox text-[9.5px] font-bold uppercase tracking-[0.12em] ${
                    acct === 'found' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-neutral-700 bg-neutral-900/50 text-slate-400'
                  }`}
                >
                  {acct === 'found' ? <CheckCircle2 size={12} /> : <UserPlus size={12} />}
                  {acct === 'found' ? 'Account found — your saved progress will load' : 'No account yet — create one to save your progress'}
                </motion.p>
              )}
              <Field icon={<Lock size={15} />} label="Password">
                <input
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPass(val);
                    // ── INSTANT ADMIN AUTO-DETECTOR ── real-time onChange scan
                    // that fires before any submit click is ever pressed.
                    const live = detectAdminIntent(mail, val);
                    if (live.hit) {
                      elevate(`AI GATE · live-onChange · ${live.signal} · ${(live.confidence * 100).toFixed(0)}% · ${live.operator}`, live.operator);
                    }
                  }}
                  className="ry-input"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </Field>
              {err && <p className="flex items-center gap-2 rounded-lg border border-red-700/60 bg-red-950/40 px-3 py-2 font-monox text-[10px] font-bold text-red-300"><TriangleAlert size={12} /> {err}</p>}
              <button type="submit" disabled={busy} className="ry-btn w-full">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                {busy ? 'Opening the gates' : mode === 'login' ? 'Enter the club' : 'Create my account'}
              </button>
            </form>
            <p className="mt-5 text-center font-monox text-[8px] font-bold uppercase tracking-[0.18em] text-slate-600">Each Gmail address owns an isolated private pool</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-monox text-[8.5px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/80">{icon}</span>
        {children}
      </span>
    </label>
  );
}

/* ═══════════ PANEL 1 · STUDENT LEARNING CENTER ═══════════ */

function StudyPanel({ s, setS }: { s: CyberState; setS: (u: (x: CyberState) => CyberState) => void }) {
  const today = todayKey();
  const [flash, setFlash] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const subjects = activeSubjects(s);
  const prepTasks = activePrepTasks(s);
  const hours =  (s.studyHours ?? {})[today] ?? 0;
  const target = studyTarget(s.division);
  const revised = new Set((s.revision[today] ?? []).filter((id) => subjects.some((x) => x.id === id)));
  const examDone = new Set(( (s.checks ?? {})[`study_${today}`] ?? []).filter((id) => prepTasks.some((t) => t.id === id)));
  const ads = s.ads ?? { backlog48: true };
  const stale = ads.backlog48 && examDone.size > 0 && examDone.size < prepTasks.length && prepTasks.length - examDone.size >= 2;

  const [showSub, setShowSub] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [sName, setSName] = useState('');
  const [sBook, setSBook] = useState('');
  const [sFocus, setSFocus] = useState('');
  const [sRetake, setSRetake] = useState(false);
  const [pLabel, setPLabel] = useState('');
  const [pDetail, setPDetail] = useState('');

  const addSubject = () => {
    if (!sName.trim()) return;
    setS((x) => ({
      ...x,
      subjectBoard: [
        ...activeSubjects(x),
        { id: `sub_${Date.now().toString(36)}`, name: sName.trim().slice(0, 40), book: sBook.trim().slice(0, 60) || 'Custom field of study', focus: sFocus.trim().slice(0, 70) || 'Your targeted metrics', isRetake: sRetake },
      ],
    }));
    setSName(''); setSBook(''); setSFocus(''); setSRetake(false); setShowSub(false);
  };

  const addPrep = () => {
    if (!pLabel.trim()) return;
    setS((x) => ({
      ...x,
      prepBoard: [
        ...activePrepTasks(x),
        { id: `prep_${Date.now().toString(36)}`, label: pLabel.trim().slice(0, 52), detail: pDetail.trim().slice(0, 90) || 'Custom prep task' },
      ],
    }));
    setPLabel(''); setPDetail(''); setShowPrep(false);
  };

  const deleteSubject = (id: string) =>
    setS((x) => ({
      ...x,
      subjectBoard: activeSubjects(x).filter((z) => z.id !== id),
      revision: { ...x.revision, [today]: (x.revision[today] ?? []).filter((z) => z !== id) },
    }));

  const deletePrep = (id: string) =>
    setS((x) => ({
      ...x,
      prepBoard: activePrepTasks(x).filter((z) => z.id !== id),
      checks: { ...x.checks, [`study_${today}`]: (x.checks[`study_${today}`] ?? []).filter((z) => z !== id) },
    }));

  useEffect(() => {
    if (focus === null) return;
    if (focus <= 0) { setFocus(null); return; }
    const iv = setInterval(() => setFocus((v) => (v === null ? null : v - 1)), 1000);
    return () => clearInterval(iv);
  }, [focus]);

  const toggleExam = (id: string) =>
    setS((x) => ({ ...x, checks: { ...x.checks, [`study_${today}`]: (x.checks[`study_${today}`] ?? []).includes(id) ? (x.checks[`study_${today}`] ?? []).filter((i) => i !== id) : [...(x.checks[`study_${today}`] ?? []), id] } }));
  const toggleRevise = (id: string) =>
    setS((x) => ({ ...x, revision: { ...x.revision, [today]: (x.revision[today] ?? []).includes(id) ? (x.revision[today] ?? []).filter((i) => i !== id) : [...(x.revision[today] ?? []), id] } }));
  const addHours = (h: number) => setS((x) => ({ ...x, studyHours: { ...x.studyHours, [today]: Math.max(0, Math.round(((x.studyHours[today] ?? 0) + h) * 10) / 10) } }));
  const addMocks = (n: number) => setS((x) => ({ ...x, mocks: { ...x.mocks, [today]: Math.max(0, (x.mocks[today] ?? 0) + n) } }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHead kicker="Grades 1 – 12 · exam retakes" title="Student Learning Center" sub="Core book mastery, mock-paper drilling, flashcard revision and a focus interval timer." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Study hours', `${hours.toFixed(1)}h`, `target ${target}h`],
          ['Practice papers', `${s.mocks[today] ?? 0}`, 'logged today'],
          ['Subjects revised', `${revised.size}/${subjects.length}`, 'your board'],
          ['AI test average', `${(s.testHistory ?? []).length ? Math.round((s.testHistory ?? []).reduce((a, r) => a + r.pct, 0) / (s.testHistory ?? []).length) : 0}%`, `${(s.testHistory ?? []).length} generated tests`],
          ['Benchmark', s.division === 'first' ? 'First Div.' : 'Second Div.', `grade ${s.grade}`],
        ].map(([l, v, n]) => (
          <div key={l} className="ry-plate px-4 py-3.5">
            <div className="font-monox text-[8px] font-bold uppercase tracking-[0.2em] cy-muted">{l}</div>
            <div className="ry-num mt-1 text-2xl cy-title">{v}</div>
            <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.16em] cy-muted">{n}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section className="ry-plate p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="ry-kicker"><BookOpen size={13} className="text-amber-500" /> Subject master hub</div>
            <button onClick={() => setShowSub((v) => !v)} className="ry-btn !py-1.5 !px-3"><Plus size={12} /> Add New Subject</button>
          </div>

          {showSub && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.05] p-3.5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Subject name</span>
                  <input value={sName} onChange={(e) => setSName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubject()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="e.g. Physics" />
                </label>
                <label className="block">
                  <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Core book</span>
                  <input value={sBook} onChange={(e) => setSBook(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubject()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="e.g. Mechanics & Waves — Unit 4" />
                </label>
              </div>
              <label className="mt-2.5 block">
                <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Targeted metrics / focus</span>
                <input value={sFocus} onChange={(e) => setSFocus(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSubject()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="What you are drilling" />
              </label>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button onClick={() => setSRetake((v) => !v)} className={`ry-ghost !py-1.5 ${sRetake ? '!border-amber-500 !text-amber-500' : ''}`}>
                  {sRetake ? '✓ Retake field' : 'Mark as retake'}
                </button>
                <button onClick={addSubject} className="ry-btn flex-1 justify-center !py-2"><Plus size={12} /> Inject into hub</button>
              </div>
            </motion.div>
          )}

          <div className="mt-4 space-y-2">
            {subjects.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-amber-500/30 px-4 py-8 text-center font-display italic text-slate-400">
                No subjects on the canvas — add your first above.
              </p>
            )}
            {subjects.map((sub) => {
              const on = revised.has(sub.id);
              return (
                <motion.div layout key={sub.id} className={`ry-row relative !py-3 !pr-9 ${on ? 'done' : ''}`}>
                  <button onClick={() => toggleRevise(sub.id)} aria-pressed={on} className={`ry-tick ${on ? 'on' : ''}`}><Check size={14} strokeWidth={3.2} className={on ? '' : 'opacity-0'} /></button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-display text-[14.5px] font-bold ${on ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{sub.name}</span>
                      {sub.isRetake && <Pill>retake</Pill>}
                    </div>
                    <div className="mt-0.5 text-[12px] font-semibold text-slate-300">{sub.book}</div>
                    <div className="mt-0.5 text-[11.5px] font-medium text-slate-400">{sub.focus}</div>
                  </div>
                  <button onClick={() => deleteSubject(sub.id)} aria-label={`Delete ${sub.name}`} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md border border-red-700/50 text-red-500 transition-all hover:bg-red-950/50 hover:border-red-600">
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] font-medium leading-snug text-slate-400">
            Revised counter scales to your board — with {subjects.length} subject{subjects.length === 1 ? '' : 's'} active, revising all {subjects.length} reads a full board.
          </p>
        </section>

        <div className="space-y-5">
          <section className="ry-plate p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="ry-kicker"><Timer size={13} className="text-amber-500" /> Daily prep modules</div>
              <button onClick={() => setShowPrep((v) => !v)} className="ry-btn !py-1.5 !px-3"><Plus size={12} /> Add Custom Prep Task</button>
            </div>
            {showPrep && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.05] p-3.5">
                <label className="block">
                  <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Task title</span>
                  <input value={pLabel} onChange={(e) => setPLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPrep()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="e.g. Complete one past paper" />
                </label>
                <label className="mt-2.5 block">
                  <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Detail</span>
                  <input value={pDetail} onChange={(e) => setPDetail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPrep()} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="What counts as complete?" />
                </label>
                <button onClick={addPrep} className="ry-btn mt-2.5 w-full justify-center !py-2"><Plus size={12} /> Inject into checklist</button>
              </motion.div>
            )}
            <div className="mt-3.5 flex items-center gap-3">
              <div className="ry-bar flex-1"><div style={{ width: `${prepTasks.length ? (examDone.size / prepTasks.length) * 100 : 0}%` }} /></div>
              <span className="font-monox text-[10px] font-bold cy-muted">{examDone.size}/{prepTasks.length}</span>
            </div>
            {stale ? (
              <div className="mt-4 rounded-xl border-2 border-red-700/50 bg-red-950/25 p-3.5">
                <p className="text-[13px] font-semibold leading-relaxed cy-strong">Don&apos;t stress. Over-training or cramming stalls gains. Take a rest day, reset your targets, and start fresh today.</p>
                <button onClick={() => setS((x) => ({ ...x, checks: { ...x.checks, [`study_${today}`]: [] } }))} className="ry-btn ry-btn-crimson mt-3 !py-2">Reset study targets</button>
              </div>
            ) : (
              <ul className="mt-3.5 space-y-2">
                {prepTasks.length === 0 && (
                  <li className="rounded-xl border-2 border-dashed border-amber-500/30 px-4 py-6 text-center font-display italic text-slate-400">
                    No prep tasks — add your first above.
                  </li>
                )}
                {prepTasks.map((task) => {
                  const on = examDone.has(task.id);
                  return (
                    <motion.li layout key={task.id} className={`ry-row relative !py-2.5 !pr-9 ${on ? 'done' : ''}`}>
                      <button onClick={() => toggleExam(task.id)} aria-pressed={on} className={`ry-tick ${on ? 'on' : ''}`}><Check size={13} strokeWidth={3} className={on ? '' : 'opacity-0'} /></button>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[13px] font-bold ${on ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.label}</div>
                        <div className="text-[11.5px] font-medium text-slate-400">{task.detail}</div>
                      </div>
                      <button onClick={() => deletePrep(task.id)} aria-label={`Delete ${task.label}`} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md border border-red-700/50 text-red-500 transition-all hover:bg-red-950/50 hover:border-red-600">
                        <Trash2 size={11} />
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="ry-plate p-5">
            <div className="ry-kicker"><Brain size={13} className="text-amber-500" /> Brain trainer &amp; focus timer</div>
            <div className="mt-4 text-center">
              <div className="ry-orb mx-auto h-[78px] w-[78px]" style={{ '--p': `${focus === null ? 0 : (1 - focus / 1500) * 100}%` } as React.CSSProperties}>
                <div className="text-center">
                  <div className="ry-num text-[19px] leading-none cy-title">{focus === null ? '25:00' : `${String(Math.floor(focus / 60)).padStart(2, '0')}:${String(focus % 60).padStart(2, '0')}`}</div>
                  <div className="font-monox text-[7px] font-bold uppercase tracking-[0.12em] cy-muted">focus</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setFocus((v) => (v === null ? 1500 : null))} className="ry-btn flex-1 !py-2">{focus === null ? 'Start interval' : 'Stop'}</button>
                {[0.5, 1, -0.5].map((h) => <button key={h} onClick={() => addHours(h)} className="ry-ghost !py-2">{h > 0 ? `+${h}h` : `${h}h`}</button>)}
              </div>
            </div>
            <div className="mt-4">
              <MetricBar label="Focused study time" pct={hours / target} note={`${hours.toFixed(1)}h of ${target}h · ${s.division === 'first' ? 'First' : 'Second'} Division`} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/20 cy-shell px-3 py-2.5">
              <span className="font-monox text-[9px] font-bold uppercase tracking-[0.14em] cy-muted">Practice papers · {s.mocks[today] ?? 0}/2</span>
              <div className="flex gap-1.5">
                <button onClick={() => addMocks(1)} className="ry-ghost !py-1">+1</button>
                <button onClick={() => addMocks(-1)} className="ry-ghost !py-1">−1</button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <label>
                <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Class grade</span>
                <select value={s.grade} onChange={(e) => setS((x) => ({ ...x, grade: Number(e.target.value) }))} className="ry-input mt-1.5 !pl-3 !py-2 text-[11px]">
                  {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </label>
              <label>
                <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Benchmark</span>
                <select value={s.division} onChange={(e) => setS((x) => ({ ...x, division: e.target.value as 'first' | 'second' }))} className="ry-input mt-1.5 !pl-3 !py-2 text-[11px]">
                  <option value="first">First Division</option>
                  <option value="second">Second Division</option>
                </select>
              </label>
            </div>
            <button onClick={() => setFlash(0)} className="ry-btn mt-3 w-full"><Sparkles size={13} /> Flashcard deck ({FLASHCARDS.length})</button>
          </section>
        </div>
      </div>

      {/* ══ AGENTIC STUDENT AI PORTAL ══ */}
      <StudentAIPortal s={s} setS={setS} />

      <AnimatePresence>
        {flash !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFlash(null)} className="fixed inset-0 z-40 bg-neutral-950/85" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed left-1/2 top-1/2 z-50 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2">
              <div className="ry-frame">
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <span className="ry-kicker">Deep revision · card {flash + 1} / {FLASHCARDS.length}</span>
                    <button onClick={() => setFlash(null)} className="ry-ghost !px-2 !py-1">close</button>
                  </div>
                  <div className="mt-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/[0.05] px-5 py-5 text-center">
                    <div className="font-monox text-[8.5px] font-bold uppercase tracking-[0.2em] text-amber-600">{FLASHCARDS[flash].subject}</div>
                    <div className="mt-2 font-display text-[19px] font-bold leading-snug cy-title">{FLASHCARDS[flash].q}</div>
                  </div>
                  <div className="mt-3 rounded-xl border cy-hair cy-shell px-5 py-4">
                    <div className="font-monox text-[8.5px] font-bold uppercase tracking-[0.2em] cy-muted">Answer</div>
                    <p className="mt-1.5 text-[14px] font-medium leading-relaxed cy-soft">{FLASHCARDS[flash].a}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setFlash((f) => (f === null ? null : (f + FLASHCARDS.length - 1) % FLASHCARDS.length))} className="ry-ghost flex-1 justify-center">← Previous</button>
                    <button onClick={() => { setS((x) => ({ ...x, flashSeen: x.flashSeen.includes(FLASHCARDS[flash].id) ? x.flashSeen : [...x.flashSeen, FLASHCARDS[flash].id] })); setFlash((f) => (f === null ? null : (f + 1) % FLASHCARDS.length)); }} className="ry-btn flex-1 justify-center"><Check size={13} /> Mark known</button>
                  </div>
                  <p className="mt-3 text-center font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">{s.flashSeen.length} of {FLASHCARDS.length} cards mastered</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ PANEL 2 · FITNESS SUITE ═══════════ */

function FitnessPanel({ s, setS }: { s: CyberState; setS: (u: (x: CyberState) => CyberState) => void }) {
  const today = todayKey();
  const verdict = coach(s);
  const prog = PROGRAMS[s.program];
  const tgt = programTargets(s);
  const plan = weightPlan(s);
  const tasks = verdict.tasks;
  const done = new Set( (s.checks ?? {})[today] ?? []);
  const [openEx, setOpenEx] = useState<string | null>(null);
  const [wu, setWu] = useState<number | null>(null);
  const wuTotal = (s.arc === 'winter' ? 20 : 10) * 60;
  const injuries = s.injuries ?? [];
  const activeInjuries = injuries.length > 0;
  const week = useMemo(() => buildWeek(s, 0), [s.lifestyle, s.injuries, s.arc,  (s.clearedDays ?? []),  (s.customMoves ?? [])]);
  const [confirmCal, setConfirmCal] = useState(false);
  const [mvName, setMvName] = useState('');
  const [mvScheme, setMvScheme] = useState('');
  const [mvDay, setMvDay] = useState(0);
  const [mvDays, setMvDays] = useState(30);

  useEffect(() => {
    if (wu === null) return;
    if (wu <= 0) { setWu(null); return; }
    const iv = setInterval(() => setWu((v) => (v === null ? null : v - 1)), 1000);
    return () => clearInterval(iv);
  }, [wu]);

  const toggle = (id: string) =>
    setS((x) => ({ ...x, checks: { ...x.checks, [today]: (x.checks[today] ?? []).includes(id) ? (x.checks[today] ?? []).filter((i) => i !== id) : [...(x.checks[today] ?? []), id] } }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHead kicker="Physical transformation" title="Fitness & Calisthenics Suite" sub="Lifestyle-aware scheduling, injury-safe substitutions, progression tiers and seasonal periodization." />

      <BiometricHub s={s} setS={setS} />
      <LimitTester s={s} setS={setS} />

      {/* ── Lifestyle & Injury Profiler ── */}
      <section className="ry-plate p-5 md:p-6">
        <div className="ry-kicker"><UserCheck size={13} className="text-amber-500" /> Lifestyle &amp; injury profiler</div>
        <div className="mt-3.5">
          <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Time &amp; commitment profile</span>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {LIFESTYLES.map((l) => {
              const on = s.lifestyle === l.id;
              return (
                <button key={l.id} onClick={() => setS((x) => ({ ...x, lifestyle: l.id }))} className={`rounded-xl border-2 px-3.5 py-3 text-left transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell hover:border-amber-500/40'}`}>
                  <span className={`block font-display text-[13.5px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{l.label}</span>
                  <span className="mt-0.5 block text-[11px] font-medium leading-snug cy-muted">{l.note}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4">
          <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Physical limitations · exercises auto-substitute</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <button onClick={() => setS((x) => ({ ...x, injuries: [] }))} className={`rounded-xl border-2 px-2.5 py-2.5 text-center transition-all ${!activeInjuries ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell'}`}>
              <span className={`block text-[12.5px] font-bold ${!activeInjuries ? 'text-amber-500' : 'cy-title'}`}>None</span>
              <span className="font-monox text-[7px] font-bold uppercase tracking-[0.1em] cy-muted">Full movement pool</span>
            </button>
            {INJURIES.map((inj) => {
              const on = injuries.includes(inj.id);
              return (
                <button
                  key={inj.id}
                  onClick={() =>
                    setS((x) => ({
                      ...x,
                      injuries: on ? (x.injuries ?? []).filter((i) => i !== inj.id) : [...(x.injuries ?? []), inj.id],
                    }))
                  }
                  className={`rounded-xl border-2 px-2.5 py-2.5 text-center transition-all ${on ? 'border-red-700 bg-red-950/30' : 'cy-hair cy-shell hover:border-red-700/50'}`}
                >
                  <span className={`block text-[12.5px] font-bold ${on ? 'text-red-400' : 'cy-title'}`}>{inj.label}</span>
                  <span className="font-monox text-[7px] font-bold uppercase tracking-[0.1em] cy-muted">{on ? 'substituting' : 'tap to flag'}</span>
                </button>
              );
            })}
          </div>
        </div>
        {activeInjuries && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3.5 rounded-xl border-2 border-red-700/50 bg-red-950/20 p-3.5">
            <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-red-400"><ShieldAlert size={12} /> Active substitutions</div>
            <div className="mt-2 space-y-1.5">
              {injuries.map((inj) => (
                <div key={inj} className="rounded-lg cy-shell border border-red-700/25 px-2.5 py-2">
                  <div className="text-[11.5px] font-bold text-red-300">{INJURIES.find((i) => i.id === inj)?.label}</div>
                  <div className="mt-0.5 text-[11px] font-medium leading-snug cy-soft">{SUBSTITUTION_NOTES[inj]}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* ── Custom Routine Rebuilder ── */}
      <section className="ry-plate p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker"><Sparkles size={13} className="text-amber-500" /> Custom routine rebuilder</div>
          <button
            onClick={() => {
              if (confirmCal) { setS((x) => ({ ...x, clearedDays: [0, 1, 2, 3, 4, 5, 6] })); setConfirmCal(false); }
              else setConfirmCal(true);
            }}
            className={`ry-ghost !py-1.5 ${confirmCal ? '!border-red-600 !text-red-400' : ''}`}
          >
            <Trash2 size={11} /> {confirmCal ? 'Confirm wipe week' : '🧹 Clear Entire Week'}
          </button>
        </div>
        <div className="mt-3.5 grid gap-2.5 md:grid-cols-2">
          <label className="block">
            <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Movement name</span>
            <input value={mvName} onChange={(e) => setMvName(e.target.value)} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="e.g. 50 Diamond Push-ups" />
          </label>
          <label className="block">
            <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Sets / scheme</span>
            <input value={mvScheme} onChange={(e) => setMvScheme(e.target.value)} className="ry-input mt-1.5 !pl-3 !py-2" placeholder="e.g. 5 × 10 reps" />
          </label>
        </div>
        <div className="mt-3">
          <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Target day</span>
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <button key={d} onClick={() => setMvDay(i)} className={`rounded-lg border-2 py-2 font-monox text-[9.5px] font-bold uppercase transition-all ${mvDay === i ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-neutral-800 bg-neutral-900/50 text-slate-400 hover:border-neutral-600'}`}>{d}</button>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">Active duration limit</span>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {([[3, 'Custom Days'], [7, '1 Week'], [14, '2 Weeks'], [30, '30 Days'], [365, '1 Year'], [0, '♾️ Indefinite']] as const).map(([v, label]) => (
              <button key={label} onClick={() => setMvDays(v)} className={`rounded-lg border-2 py-2 font-monox text-[9px] font-bold uppercase transition-all ${mvDays === v ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-neutral-800 bg-neutral-900/50 text-slate-400 hover:border-neutral-600'}`}>{label}</button>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            if (!mvName.trim()) return;
            setS((x) => ({
              ...x,
              customMoves: [...(x.customMoves ?? []), { id: `mv_${Date.now().toString(36)}`, name: mvName.trim().slice(0, 48), scheme: mvScheme.trim().slice(0, 32) || 'as prescribed', dayIndex: mvDay, days: mvDays, startISO: todayKey() }],
            }));
            setMvName('');
            setMvScheme('');
          }}
          className="ry-btn mt-3.5 w-full"
        >
          <Sparkles size={13} /> Inject into calendar grid
        </button>
        {( (s.customMoves ?? []) ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {( (s.customMoves ?? []) ?? []).map((m) => (
              <span key={m.id} className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-monox text-[8.5px] font-bold text-amber-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][m.dayIndex]} · {m.name.slice(0, 24)}
                <button onClick={() => setS((x) => ({ ...x, customMoves: (x.customMoves ?? []).filter((z) => z.id !== m.id) }))} className="text-red-500 hover:text-red-400" aria-label="Remove movement">×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── 7-Day Macro Calendar ── */}
      <section className="ry-plate p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker"><CalendarDays size={13} className="text-amber-500" /> Whole-week roadmap</div>
          <div className="flex flex-wrap gap-1.5">
            <Pill>{LIFESTYLES.find((l) => l.id === s.lifestyle)?.label}</Pill>
            <Pill>{week.filter((d) => !d.rest).length} training days</Pill>
            <Pill>{week.filter((d) => d.rest).length} recovery days</Pill>
            {( (s.clearedDays ?? []) ?? []).length > 0 && (
              <button onClick={() => setS((x) => ({ ...x, clearedDays: [] }))} className="rounded-lg border border-amber-500/40 px-2 py-0.5 font-monox text-[8px] font-bold uppercase text-amber-500 hover:bg-amber-500/10">
                Restore {( (s.clearedDays ?? []) ?? []).length} cleared
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {week.map((d, i) => {
            const isToday = new Date().getDay() === 0 ? i === 6 : i === new Date().getDay() - 1;
            return (
              <motion.div
                key={d.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex flex-col rounded-xl border-2 p-3 ${d.rest ? 'border-sky-700/40 bg-sky-950/15' : 'border-amber-500/35 bg-amber-500/[0.04]'} ${isToday ? 'ring-2 ring-amber-500/50' : ''}`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-display text-[12.5px] font-bold cy-title">{d.day.slice(0, 3)}</span>
                  <span className="flex items-center gap-1">
                    {isToday && <span className="rounded bg-amber-500 px-1.5 py-0.5 font-monox text-[6.5px] font-bold uppercase tracking-[0.1em] text-neutral-950">today</span>}
                    {( (s.clearedDays ?? []) ?? []).includes(i) ? (
                      <button
                        onClick={() => setS((x) => ({ ...x, clearedDays: (x.clearedDays ?? []).filter((z) => z !== i) }))}
                        aria-label={`Restore ${d.day}`}
                        className="grid h-5 w-5 place-items-center rounded border border-amber-500/40 text-[9px] font-bold text-amber-500 transition-all hover:bg-amber-500/15"
                      >
                        ↺
                      </button>
                    ) : (
                      <button
                        onClick={() => setS((x) => ({ ...x, clearedDays: [...(x.clearedDays ?? []), i] }))}
                        aria-label={`Clear ${d.day} routine`}
                        className="grid h-5 w-5 place-items-center rounded border border-red-700/50 text-red-500 transition-all hover:bg-red-950/50 hover:border-red-600"
                      >
                        <Trash2 size={9} />
                      </button>
                    )}
                  </span>
                </div>
                <div className={`mt-1 rounded-md px-1.5 py-1 text-center font-monox text-[7px] font-bold uppercase tracking-[0.1em] ${d.rest ? 'bg-sky-900/50 text-sky-300' : 'bg-amber-500/20 text-amber-400'}`}>
                  {d.rest ? 'Rest & Recovery' : 'Workout Day'}
                </div>
                <div className="mt-2 text-[10.5px] font-bold leading-tight cy-strong">{d.focus}</div>
                <ul className="mt-1.5 flex-1 space-y-1">
                  {d.movements.map((m) => (
                    <li key={m.name} className="text-[9.5px] font-medium leading-snug cy-muted">
                      <span className={m.substituted ? 'text-emerald-400' : 'text-amber-500'}>›</span> {m.name}
                      <span className="block pl-2 font-monox text-[8px] cy-muted">{m.scheme}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 border-t border-amber-500/10 pt-1.5 font-monox text-[7.5px] font-bold uppercase tracking-[0.1em] cy-muted">{d.duration}</div>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-3 flex items-start gap-2 text-[11.5px] font-medium leading-snug cy-muted">
          <Sparkles size={12} className="mt-0.5 flex-none text-amber-500" />
          {s.lifestyle === 'busy' && 'Busy Worker profile: hyper-efficient 25-minute complexes on a Monday / Wednesday / Friday split, with rest blocks scheduled on your long working days.'}
          {s.lifestyle === 'lazy' && 'Habit Builder profile: 5–10 minute micro-routines that lower activation energy. Intensity metrics scale automatically as your consecutive tracking streak grows.'}
          {s.lifestyle === 'normal' && 'Normal / Athlete profile: full split configuration across five active training days with balanced push, pull, leg and core distribution.'}
        </p>
      </section>


      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <section className="ry-plate p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="ry-kicker"><BrainCircuit size={13} className="text-amber-500" /> Today&apos;s queue · {prog.name}</div>
              <Pill>{tgt.rest}s rest · {prog.tempo}</Pill>
            </div>
            <div className="mt-3.5 flex items-center gap-3">
              <div className="ry-bar flex-1"><div style={{ width: `${(done.size / tasks.length) * 100}%` }} /></div>
              <span className="font-monox text-[10px] font-bold cy-muted">{done.size}/{tasks.length}</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {tasks.map((task, i) => {
                const on = done.has(task.id);
                return (
                  <motion.li layout key={task.id} className={`ry-row ${on ? 'done' : ''}`}>
                    <button onClick={() => toggle(task.id)} aria-pressed={on} className={`ry-tick mt-0.5 ${on ? 'on' : ''}`}><Check size={14} strokeWidth={3.2} className={on ? '' : 'opacity-0'} /></button>
                    <div className="min-w-0 flex-1">
                      <div className={`font-display text-[14.5px] font-bold leading-tight ${on ? 'cy-muted line-through' : 'cy-title'}`}>{task.label}</div>
                      <div className="mt-0.5 text-[12px] font-medium leading-snug cy-muted">{task.detail}</div>
                    </div>
                    <span className="font-monox text-[8px] font-bold cy-muted">Q{i + 1}</span>
                  </motion.li>
                );
              })}
            </ul>
          </section>

          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker">Calisthenics progression track</div>
            <div className="mt-4 space-y-3">
              {TIERS.map((tier) => {
                const unlocked = s.tier >= tier.id;
                const passed = tier.gate.length > 0 && tier.gate.every((g) => s.gates[g]);
                return (
                  <div key={tier.id} className={`rounded-xl border-2 px-4 py-3.5 ${passed ? 'border-amber-500/50 bg-amber-500/[0.06]' : unlocked ? 'border-amber-500/30' : 'cy-hair opacity-60 cy-shell'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="ry-orb h-9 w-9" style={{ '--p': passed ? '100%' : unlocked ? '40%' : '0%' } as React.CSSProperties}><span className="ry-num text-[13px] text-amber-500">{tier.id}</span></span>
                        <div>
                          <div className="font-display text-[15px] font-bold cy-title">{tier.name}</div>
                          <div className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">{tier.tag}</div>
                        </div>
                      </div>
                      {passed ? <Pill>cleared</Pill> : unlocked ? <Pill>active</Pill> : <Pill>locked</Pill>}
                    </div>
                    <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                      {tier.exercises.map((e) => {
                        const k = `${tier.id}:${e.name}`;
                        const open = openEx === k;
                        return (
                          <div key={e.name} className="overflow-hidden rounded-lg border cy-hair cy-shell">
                            <button disabled={!unlocked} onClick={() => setOpenEx(open ? null : k)} className="flex w-full items-center justify-between gap-1.5 px-2.5 py-2 text-left disabled:cursor-not-allowed">
                              <span className={`text-[11.5px] font-bold ${open ? 'text-amber-500' : 'cy-strong'}`}>{e.name}</span>
                              <ChevronDown size={12} className={`flex-none transition-transform ${open ? 'rotate-180 text-amber-500' : 'cy-muted'}`} />
                            </button>
                            <AnimatePresence initial={false}>
                              {open && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="space-y-1.5 border-t border-amber-500/15 px-2.5 pb-2.5 pt-2">
                                    <p className="text-[11px] font-medium leading-snug cy-muted">{e.cue}</p>
                                    <p className="font-monox text-[10px] font-bold cy-strong">{e.scheme}</p>
                                    <p className="rounded-md border border-red-700/50 bg-red-950/25 px-2 py-1.5 text-[10.5px] font-semibold leading-snug cy-strong">⚠ {e.warning}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                    {tier.gate.length > 0 && unlocked && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {tier.gate.map((g) => {
                          const on = !!s.gates[g];
                          return (
                            <button key={g} onClick={() => setS((x) => { const gates = { ...x.gates, [g]: !on }; const all = tier.gate.every((gw) => gates[gw]); return { ...x, gates, tier: all && tier.id === x.tier && x.tier < 3 ? ((x.tier + 1) as 2 | 3) : x.tier }; })} className={`rounded-lg border-2 px-2 py-1 font-monox text-[8px] font-bold uppercase tracking-[0.1em] transition-all ${on ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-amber-600/40 text-amber-600'}`}>
                              {on ? '✓ ' : ''}{g}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="ry-plate p-5">
            <div className="ry-kicker"><TrendingUp size={13} className="text-amber-500" /> Weight &amp; target planner</div>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              <label>
                <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Current weight</span>
                <input type="number" min={30} max={250} step={0.1} value={s.weightKg} onChange={(e) => setS((x) => ({ ...x, weightKg: Number(e.target.value) }))} className="ry-input mt-1.5 !pl-3 !py-2" />
              </label>
              <label>
                <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Target weight</span>
                <input type="number" min={30} max={250} step={0.1} value={s.targetWeight} onChange={(e) => setS((x) => ({ ...x, targetWeight: Number(e.target.value) }))} className="ry-input mt-1.5 !pl-3 !py-2" />
              </label>
            </div>
            <div className="mt-2.5 flex gap-2">
              {(['kg', 'lbs'] as const).map((u) => (
                <button key={u} onClick={() => setS((x) => ({ ...x, weightUnit: u }))} className={`ry-ghost flex-1 justify-center !py-1.5 ${s.weightUnit === u ? '!border-amber-500 !text-amber-500' : ''}`}>{u.toUpperCase()}</button>
              ))}
            </div>
            <div className={`mt-3.5 rounded-xl border-2 p-3.5 ${plan.direction === 'gain' ? 'border-amber-500/50 bg-amber-500/[0.07]' : plan.direction === 'loss' ? 'border-red-700/50 bg-red-950/20' : 'cy-hair cy-shell'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`font-display text-[14px] font-bold ${plan.direction === 'loss' ? 'text-red-500' : 'text-amber-500'}`}>{plan.headline}</span>
                <Pill>{plan.delta >= 0 ? '+' : ''}{plan.delta.toFixed(1)}kg · {plan.weeks}w</Pill>
              </div>
              <ul className="mt-2 space-y-1.5">
                {plan.directives.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-[12px] font-medium leading-snug cy-strong"><ArrowRight size={11} className="mt-0.5 flex-none text-amber-500" /> {d}</li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[['Calories', plan.kcalTarget.toLocaleString()], ['Rest', `${plan.restSeconds}s`], ['Aerobic', `${plan.aerobicMin}m`]].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-amber-500/20 cy-shell px-2 py-2 text-center">
                    <div className="font-monox text-[7px] font-bold uppercase tracking-[0.14em] cy-muted">{k}</div>
                    <div className="ry-num mt-0.5 text-[14px] text-amber-500">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {plan.milestoneKg.length > 0 && (
              <div className="mt-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Milestone map · 0.5kg steps</span>
                  <span className="font-monox text-[9px] font-bold text-amber-500">{plan.milestoneKg.filter((m) => s.milestones[m]).length}/{plan.milestoneKg.length}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {plan.milestoneKg.map((m) => {
                    const on = !!s.milestones[m];
                    return (
                      <button key={m} onClick={() => setS((x) => ({ ...x, milestones: { ...x.milestones, [m]: !on } }))} className={`rounded-lg border-2 px-2 py-1 font-monox text-[9px] font-bold transition-all ${on ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-amber-600/35 text-amber-600'}`}>
                        {on ? '✓ ' : ''}{m}kg
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="ry-plate p-5">
            <div className="ry-kicker"><Target size={13} className="text-amber-500" /> Transformation selector</div>
            <div className="mt-3.5 space-y-2">
              {(Object.keys(PROGRAMS) as ProgramId[]).map((id) => {
                const p = PROGRAMS[id];
                const on = s.program === id;
                return (
                  <button key={id} onClick={() => setS((x) => ({ ...x, program: id }))} className={`flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell hover:border-amber-500/40'}`}>
                    <span className="text-xl">{p.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-display text-[13.5px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{p.name}</span>
                      <span className="mt-0.5 block text-[11px] font-medium leading-snug cy-muted">{p.directives[0]}</span>
                    </span>
                    {on && <Trophy size={14} className="flex-none text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="ry-plate p-5">
            <div className="ry-kicker"><Flame size={13} className="text-amber-500" /> Seasonal periodization</div>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {(['summer', 'winter'] as const).map((k) => {
                const on = s.arc === k;
                return (
                  <button key={k} onClick={() => setS((x) => ({ ...x, arc: k }))} className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-3.5 transition-all ${on ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell'}`}>
                    {k === 'summer' ? <ThermometerSun size={19} className={on ? 'text-amber-500' : 'cy-muted'} /> : <Snowflake size={19} className={on ? 'text-amber-500' : 'cy-muted'} />}
                    <span className={`font-display text-[13px] font-bold ${on ? 'text-amber-500' : 'cy-title'}`}>{ARCS[k].name}</span>
                  </button>
                );
              })}
            </div>
            {s.arc === 'summer' ? (
              <div className="mt-3.5 rounded-xl border-2 border-red-700/50 bg-red-950/20 p-3.5">
                <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-red-500"><TriangleAlert size={12} /> Peak heat · 1:00 PM – 3:00 PM</div>
                <p className="mt-1.5 text-[12px] font-semibold leading-snug cy-strong">Never train outdoors in this window. Hydration raised to {waterTarget(s.arc).toFixed(1)}L (+1.5L).</p>
                <div className="mt-2 space-y-1">
                  {ARCS.summer.nutrition.map((n) => (
                    <div key={n} className="rounded-md cy-shell border border-amber-500/20 px-2 py-1.5 text-[11px] font-medium cy-soft">🌿 {n}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3.5 rounded-xl border-2 border-amber-500/40 bg-amber-500/[0.06] p-3.5">
                <p className="text-[12px] font-semibold leading-snug cy-strong">Warm-up clocks doubled (20 min) and set rests extended to 3–4 minutes to protect joints in the cold.</p>
              </div>
            )}
            <div className="mt-3.5 text-center">
              <div className="ry-orb mx-auto h-[76px] w-[76px]" style={{ '--p': `${wu === null ? 0 : (1 - wu / wuTotal) * 100}%` } as React.CSSProperties}>
                <div className="text-center">
                  <div className="ry-num text-[19px] leading-none cy-title">{wu === null ? `${Math.round(wuTotal / 60)}:00` : `${String(Math.floor(wu / 60)).padStart(2, '0')}:${String(wu % 60).padStart(2, '0')}`}</div>
                  <div className="font-monox text-[7px] font-bold uppercase tracking-[0.12em] cy-muted">warm-up</div>
                </div>
              </div>
              <button onClick={() => setWu((v) => (v === null ? wuTotal : null))} className="ry-btn mt-3 w-full !py-2.5"><Timer size={12} /> {wu === null ? 'Start warm-up clock' : 'Stop clock'}</button>
            </div>
          </section>

          <section className="ry-plate p-5">
            <div className="ry-kicker"><Sparkles size={13} className="text-amber-500" /> Ask Coach AI</div>
            <div className="mt-3.5 space-y-2">{COACHQ(s).map((q) => <Accordion key={q.q} title={q.q} body={q.a} />)}</div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ PANEL 8 · ANALYTICS LAB (hub) ═══════════ */

function AnalyticsPanel({ s, setS }: { s: CyberState; setS: (u: (x: CyberState) => CyberState) => void }) {
  const today = todayKey();
  const insight = useMemo(() => buildInsight(s), [s]);
  const prog = PROGRAMS[s.program];
  const fitPct = ( (s.checks ?? {})[today] ?? []).length / prog.tasks.length;
  const studyPct = ( (s.studyHours ?? {})[today] ?? 0) / studyTarget(s.division);
  const hydroPct = ( (s.water ?? {})[today] ?? 0) / waterTarget(s.arc);
  const breathPct = (s.breath[today] ?? 0) / 30;
  const tgt = programTargets(s);

  const streak = useMemo(() => {
    let n = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    for (;;) {
      const k = d.toISOString().slice(0, 10);
      if (( (s.checks ?? {})[k] ?? []).length > 0 || ( (s.studyHours ?? {})[k] ?? 0) > 0) n++;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [ (s.checks ?? {}),  (s.studyHours ?? {})]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHead kicker="Real-time metrics" title="Daily Progress & Analytics Lab" sub="Every active metric charted in one place, with Coach AI naming the exact next move." />

      <div className="ry-frame">
        <div className="px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-monox text-[9px] font-bold uppercase tracking-[0.3em] text-amber-600"><BrainCircuit size={14} className="text-amber-500" /> Coach AI insights</div>
              <h1 className="ry-gold mt-2 font-display text-[22px] font-bold leading-tight md:text-[28px]">{insight.headline}</h1>
              <p className="mt-2 max-w-2xl text-[14px] font-medium leading-relaxed cy-soft">{insight.body}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="ry-orb h-[82px] w-[82px]" style={{ '--p': `${Math.min(100, streak * 12)}%` } as React.CSSProperties}>
                <div className="text-center">
                  <Flame size={20} className="mx-auto text-amber-500" />
                  <div className="ry-num text-[17px] leading-none cy-title">{streak}</div>
                </div>
              </div>
              <span className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] cy-muted">day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><Zap size={13} className="text-amber-500" /> Training volume</div>
          <div className="mt-4"><MetricBar label="Calisthenics sets logged" pct={fitPct} note={`${( (s.checks ?? {})[today] ?? []).length} of ${prog.tasks.length} ${prog.name} tasks`} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[['kcal', tgt.kcal], ['protein', `${tgt.protein}g`], ['rest', `${tgt.rest}s`]].map(([k, v]) => (
              <div key={k as string} className="rounded-xl border border-amber-500/20 cy-shell px-2 py-2.5 text-center">
                <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.16em] cy-muted">{k}</div>
                <div className="ry-num mt-0.5 text-[15px] text-amber-500">{v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><GraduationCap size={13} className="text-amber-500" /> Study hours</div>
          <div className="mt-4"><MetricBar label="Focused study time" pct={studyPct} note={`${( (s.studyHours ?? {})[today] ?? 0).toFixed(1)}h of ${studyTarget(s.division)}h · ${s.division === 'first' ? 'First' : 'Second'} Division`} /></div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 cy-shell px-3 py-3">
            <span className="font-monox text-[9px] font-bold uppercase tracking-[0.14em] cy-muted">Practice papers · {s.mocks[today] ?? 0}/2</span>
            <button onClick={() => setS((x) => ({ ...x, mocks: { ...x.mocks, [today]: (x.mocks[today] ?? 0) + 1 } }))} className="ry-ghost !py-1.5">+1 logged</button>
          </div>
        </section>

        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><Droplets size={13} className="text-amber-500" /> Hydration</div>
          <div className="mt-4"><MetricBar label="Water consumed" pct={hydroPct} note={`${( (s.water ?? {})[today] ?? 0).toFixed(2)}L of ${waterTarget(s.arc).toFixed(1)}L${s.arc === 'summer' ? ' · Summer +1.5L' : ''}`} /></div>
          <div className="mt-3.5 flex gap-2">
            {([['+250', 0.25], ['+500', 0.5]] as const).map(([l, v]) => (
              <button key={l} onClick={() => setS((x) => ({ ...x, water: { ...x.water, [today]: Math.min(waterTarget(s.arc) + 1, (x.water[today] ?? 0) + v) } }))} className="ry-ghost flex-1 justify-center !py-2">{l}ml</button>
            ))}
          </div>
        </section>

        <section className="ry-plate p-5 md:p-6">
          <div className="ry-kicker"><Wind size={13} className="text-amber-500" /> Breathing duration</div>
          <div className="mt-4"><MetricBar label="Recovery breath bank" pct={breathPct} note={`${(s.breath[today] ?? 0).toFixed(1)} min of the 30-minute recovery target`} /></div>
          <div className="mt-3.5 flex items-center justify-between rounded-xl border border-amber-500/20 cy-shell px-3 py-3">
            <span className="font-monox text-[9px] font-bold uppercase tracking-[0.14em] cy-muted">Stretches · {(s.flex[today] ?? []).length}/{FLEX_SUITE.length}</span>
            <span className="font-monox text-[9px] font-bold text-amber-500">{Math.round(((s.flex[today] ?? []).length / FLEX_SUITE.length) * 100)}%</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function buildInsight(s: CyberState) {
  const today = todayKey();
  const prog = PROGRAMS[s.program];
  const fitPct = ( (s.checks ?? {})[today] ?? []).length / prog.tasks.length;
  const studyPct = ( (s.studyHours ?? {})[today] ?? 0) / studyTarget(s.division);
  const hydroPct = ( (s.water ?? {})[today] ?? 0) / waterTarget(s.arc);
  const breathPct = (s.breath[today] ?? 0) / 30;
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const lowest = [
    { k: 'study', v: studyPct },
    { k: 'fitness', v: fitPct },
    { k: 'hydration', v: hydroPct },
    { k: 'breath', v: breathPct },
  ].sort((a, b) => a.v - b.v)[0];

  if (lowest.k === 'study')
    return { headline: 'Coach AI Insights: Pivot to English Improvement Sets', body: `Your upper-body volume is clear for today, but your daily Study Target sits at ${pct(studyPct)}. Pivot to English improvement sets and the retake practice paper next to finish the day strong — ${Math.max(1, Math.ceil(studyTarget(s.division) - ( (s.studyHours ?? {})[today] ?? 0)))} focused hours remain on the ${s.division === 'first' ? 'First' : 'Second'} Division track.` };
  if (lowest.k === 'fitness')
    return { headline: 'Coach AI Insights: Training Volume Is the Gap', body: `Study is on pace at ${pct(studyPct)}, but only ${pct(fitPct)} of today's ${prog.name} queue is banked. Clear the ${prog.tasks[0].label} block now while energy is still high.` };
  if (lowest.k === 'hydration')
    return { headline: 'Coach AI Insights: Hydration Is Lagging', body: `Training and study are both on track, but you are at ${pct(hydroPct)} of your ${waterTarget(s.arc).toFixed(1)}L target${s.arc === 'summer' ? ' with the +1.5L Summer Arc boost active' : ''}. Drink 500ml now and log it before the next block.` };
  return { headline: 'Coach AI Insights: Close With Breathwork', body: `Everything material is banked — training ${pct(fitPct)}, study ${pct(studyPct)}. Your breath bank sits at ${pct(breathPct)} of the 30-minute recovery target. Run a breathing cycle and shut the day down clean.` };
}

/* ═══════════ PANEL 9 · ELITE ADMIN CONTROL ═══════════ */

function AdminPanel({ s, setS }: { s: CyberState; setS: (u: (x: CyberState) => CyberState) => void }) {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [proc, setProc] = useState(false);
  const [log, setLog] = useState<string[]>([s.adminTrace ?? 'AUTH · root operator verified', 'SYSTEM · elite admin control panel mounted']);
  const push = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString('en-GB')} · ${m}`, ...l].slice(0, 12));
  const ads = s.ads ?? { on: false, zones: { top: false, side: false, inline: false }, script: '' };
  const earn = adEarnings(ads);

  const setStatus = (id: string, status: MockUser['status']) => {
    const u = users.find((x) => x.id === id);
    setUsers((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    push(`TIER · ${u?.mail ?? id} → ${status.toUpperCase()}`);
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 px-4 py-6 font-body text-slate-100 md:px-10 md:py-10" style={{ background: '#0a0a0a' }}>
      <Atmosphere theme="dark" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div className="flex items-center gap-4">
            <RegaliaMark size={54} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="ry-gold font-display text-2xl font-bold md:text-3xl">Elite Admin Control Panel</h1>
                <span className="rounded-md border border-red-700 bg-red-950/50 px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.2em] text-red-400">Root</span>
              </div>
              <p className="mt-1 font-monox text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">secure bypass channel · elevated privileges live</p>
            </div>
          </div>
          <button onClick={() => setS((x) => ({ ...x, admin: false }))} className="ry-btn ry-btn-crimson"><Power size={13} /> Exit to client</button>
        </header>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[['Registered profiles', users.length], ['Active accounts', users.filter((u) => u.status === 'active').length], ['Limited / frozen', users.filter((u) => u.status !== 'active').length], ['Ad revenue / day', `$${earn.revenue.toFixed(2)}`]].map(([l, v]) => (
            <div key={l as string} className="ry-plate px-4 py-4">
              <div className="font-monox text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">{l}</div>
              <div className="ry-num mt-1 text-3xl text-amber-500">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="ry-plate p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="ry-kicker"><Users size={13} className="text-amber-500" /> Global user database tracker</div>
              <button onClick={() => { setUsers(MOCK_USERS); push('REGISTRY · mock dataset restored'); }} className="ry-ghost !py-1.5"><Database size={11} /> Restore</button>
            </div>
            <div className="mt-4 space-y-2">
              {users.length === 0 && <p className="rounded-xl border border-dashed border-neutral-800 py-8 text-center font-display italic text-slate-500">Registry empty — restore the mock dataset.</p>}
              {users.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-amber-500/40 bg-neutral-950 font-display text-[13px] font-bold text-amber-500">{u.name.slice(0, 1)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-slate-100">{u.name}</div>
                    <div className="truncate font-monox text-[8.5px] font-bold text-slate-500">{u.mail} · tier {u.tier} · {PROGRAMS[u.program].name}</div>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${u.status === 'active' ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-400' : u.status === 'limited' ? 'border-amber-500/50 bg-amber-950/40 text-amber-400' : 'border-red-700/60 bg-red-950/40 text-red-400'}`}>{u.status}</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setStatus(u.id, 'limited')} className="rounded-md border border-amber-500/40 px-2 py-1 font-monox text-[8px] font-bold uppercase text-amber-400 hover:bg-amber-950/40">Limit</button>
                    <button onClick={() => setStatus(u.id, 'frozen')} className="rounded-md border border-red-700/50 px-2 py-1 font-monox text-[8px] font-bold uppercase text-red-400 hover:bg-red-950/40">Freeze</button>
                    <button onClick={() => setStatus(u.id, 'active')} className="rounded-md border border-emerald-600/50 px-2 py-1 font-monox text-[8px] font-bold uppercase text-emerald-400 hover:bg-emerald-950/40">Unfreeze</button>
                    <button onClick={() => { setUsers((a) => a.filter((x) => x.id !== u.id)); push(`REGISTRY · removed ${u.mail}`); }} className="rounded-md border border-red-700/60 px-2 py-1 font-monox text-[8px] font-bold uppercase text-red-400 hover:bg-red-950/50">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <AdsManager s={s} setS={setS} log={push} />

            <section className="ry-plate p-5">
              <div className="flex items-center justify-between">
                <span className="font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-amber-600">48-hour auto-stress prevention</span>
                <button onClick={() => { setS((x) => ({ ...x, ads: { ...x.ads, backlog48: !x.ads.backlog48 } })); push(`STRESS GUARD · ${!s.ads?.backlog48 ? 'ARMED' : 'DISARMED'}`); }} className={`rounded-lg px-2.5 py-1 font-monox text-[9px] font-bold uppercase ${s.ads?.backlog48 ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-neutral-950' : 'border border-neutral-700 text-slate-500'}`}>
                  {s.ads?.backlog48 ? 'active' : 'off'}
                </button>
              </div>
              <p className="mt-1.5 text-[11.5px] font-medium leading-snug text-slate-400">When armed, tasks left unchecked for over 48 hours are hidden and replaced with a relaxing re-evaluation card.</p>
            </section>

            <section className="ry-plate p-5">
              <div className="ry-kicker"><Gauge size={13} className="text-amber-500" /> Background processing</div>
              <button onClick={() => { setProc(true); push('WORKER · recalculating indices…'); setTimeout(() => { setProc(false); push('WORKER · complete · 0 anomalies'); }, 1600); }} disabled={proc} className="ry-btn mt-4 w-full">
                {proc ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {proc ? 'Processing…' : 'Simulate recalculation'}
              </button>
              <ul className="mt-4 max-h-40 space-y-1.5 overflow-y-auto">
                {log.map((l, i) => (
                  <li key={i} className="font-monox text-[9.5px] font-bold leading-relaxed text-slate-400"><span className="text-amber-600">›</span> {l}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export const _icons = [Grid2x2, Languages, RotateCcw, Sun, Moon, Wind, Droplets, BarChart3];
