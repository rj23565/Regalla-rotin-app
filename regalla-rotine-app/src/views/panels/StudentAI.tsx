import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Eye,
  FileText,
  Languages,
  Loader2,
  PenLine,
  ScanLine,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import type { CyberState } from '../../lib/cyber';
import {
  activeSubjects,
} from '../../lib/cyber';
import type {
  LangProfile,
  PageScan,
  SolverResult,
  TestKind,
  TestQuestion,
  TestResult,
} from '../../lib/studentAI';
import {
  ANSWER_LABELS,
  LANG_META,
  benchmarkFrom,
  detectLanguage,
  diagnosticAdvice,
  generateTest,
  gradeTest,
  scanPage,
  solveQuestion,
} from '../../lib/studentAI';

type Updater = (u: (x: CyberState) => CyberState) => void;

const SOLVER_PHASES = [
  'Parsing the question structure…',
  'Identifying the governing concept…',
  'Retrieving the curriculum rule set…',
  'Constructing the worked solution…',
  'Verifying against common errors…',
];

/* ═══════════ AGENTIC STUDENT AI PORTAL ═══════════ */

export function StudentAIPortal({ s, setS }: { s: CyberState; setS: Updater }) {
  const subjects = activeSubjects(s);

  /* ── Solver ── */
  const [question, setQuestion] = useState('');
  const detected: LangProfile = detectLanguage(question);
  const [thinking, setThinking] = useState(false);
  const [phase, setPhase] = useState(0);
  const [solution, setSolution] = useState<SolverResult | null>(null);

  const runSolve = () => {
    if (!question.trim()) return;
    setThinking(true);
    setSolution(null);
    setPhase(0);
    let step = 0;
    const iv = setInterval(() => {
      step += 1;
      if (step >= SOLVER_PHASES.length) {
        clearInterval(iv);
        const res = solveQuestion(question);
        setSolution(res);
        setThinking(false);
        setS((x) => ({ ...x, solverHistory: [res, ...(x.solverHistory ?? [])].slice(0, 20) }));
      } else {
        setPhase(step);
      }
    }, 420);
  };

  /* ── Page scanner ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState<PageScan | null>(s.lastScan ?? null);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  const runScan = (f: File | null | undefined) => {
    if (!f) return;
    setScanning(true);
    setScan(null);
    setScanMsg(null);
    setTimeout(() => {
      const res = scanPage(f.name, f.size);
      setScan(res);
      setScanning(false);
      setS((x) => ({ ...x, lastScan: res }));
    }, 1800);
  };

  /* ── Test engine ── */
  const [test, setTest] = useState<TestQuestion[] | null>(null);
  const [kind, setKind] = useState<TestKind>('mcq');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [testSubject, setTestSubject] = useState(subjects[0]?.name ?? 'General Studies');

  const buildTest = (k: TestKind) => {
    setKind(k);
    const qs = generateTest(k, scan, testSubject);
    setTest(qs);
    setAnswers({});
    setResult(null);
  };

  const submit = () => {
    if (!test) return;
    const res = gradeTest(test, answers, kind, scan?.subject ?? testSubject);
    setResult(res);
    setS((x) => ({
      ...x,
      testHistory: [res, ...(x.testHistory ?? [])].slice(0, 24),
      // Roll the benchmark selector with the live performance band.
      division: benchmarkFrom(res.pct),
    }));
  };

  return (
    <div className="space-y-5">
      {/* ══ 📚 GLOBAL TEXTBOOK AI SOLVER ══ */}
      <section className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/[0.03] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker"><BookOpen size={13} className="text-amber-500" /> Global Textbook AI Solver</div>
          <span className="rounded-lg border border-amber-500/30 px-2 py-0.5 font-monox text-[8px] font-bold uppercase tracking-[0.12em] text-amber-600">any curriculum · worldwide</span>
        </div>

        <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSolve()}
              className="ry-input !pl-3.5 !pr-20"
              placeholder="Koi bhi sawal — what is english structure batain · maths unit 4 solve krwa den · Explain photosynthesis"
            />
            {question.trim() && (
              <motion.span
                key={detected}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-lg border px-2 py-1 font-monox text-[8.5px] font-bold uppercase tracking-[0.1em]"
                style={{ borderColor: `${LANG_META[detected].tone}66`, background: `${LANG_META[detected].tone}18`, color: LANG_META[detected].tone }}
              >
                <Languages size={10} /> {LANG_META[detected].badge}
              </motion.span>
            )}
          </div>
          <button onClick={runSolve} disabled={thinking || !question.trim()} className={`ry-btn !py-2.5 ${thinking || !question.trim() ? 'opacity-50' : ''}`}>
            {thinking ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Solve
          </button>
        </div>
        {question.trim() && (
          <p className="mt-1.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Auto-detected · <span style={{ color: LANG_META[detected].tone }}>{LANG_META[detected].label}</span>
            {detected === 'roman-urdu' && ' · Roman Urdu mode — jawab isi lehjay mein aayega'}
          </p>
        )}

        <AnimatePresence>
          {thinking && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3.5 overflow-hidden">
              <div className="rounded-xl border-2 border-amber-500/35 bg-neutral-950/60 p-4">
                <div className="flex items-center gap-2 font-monox text-[9.5px] font-bold uppercase tracking-[0.2em] text-amber-500">
                  <Brain size={13} className="animate-pulse" /> Thinking process…
                </div>
                <ul className="mt-3 space-y-2">
                  {SOLVER_PHASES.slice(0, phase + 1).map((p, i) => (
                    <motion.li key={p} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2.5">
                      {i < phase ? (
                        <CheckCircle2 size={13} className="mt-0.5 flex-none text-emerald-400" />
                      ) : (
                        <Loader2 size={13} className="mt-0.5 flex-none animate-spin text-amber-500" />
                      )}
                      <span className={`text-[12px] font-medium ${i <= phase ? 'text-slate-200' : 'text-slate-500'}`}>{p}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {solution && !thinking && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3.5 space-y-3">
              <div className="rounded-xl border-2 border-amber-500/40 bg-neutral-950/60 p-4">
                <div className="font-monox text-[8.5px] font-bold uppercase tracking-[0.18em] text-amber-600">Reasoning trace</div>
                <ul className="mt-2.5 space-y-2.5">
                  {solution.steps.map((st, i) => (
                    <motion.li key={st.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.09 }} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border border-amber-500/40 font-monox text-[8.5px] font-bold text-amber-500">{i + 1}</span>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-bold text-slate-100">{st.label}</div>
                        <div className="mt-0.5 text-[11.5px] font-medium leading-snug text-slate-300">{st.detail}</div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/[0.08] to-neutral-950 p-4">
                  <div className="flex items-center gap-2 font-display text-[15px] font-bold text-amber-500">
                    <Sparkles size={13} /> {ANSWER_LABELS[solution.lang].answer}
                  </div>
                <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-slate-100">{solution.answer}</p>
                <div className="mt-3 border-t border-amber-500/25 pt-3">
                  <div className="font-monox text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Core concepts to remember</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {solution.concepts.map((c) => (
                      <span key={c} className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-bold text-amber-400">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ══ 📷 MULTIMODAL BOOK PAGE SCANNER ══ */}
      <section className="rounded-2xl border-2 border-red-700/50 bg-red-950/[0.06] p-5 md:p-6">
        <div className="ry-kicker"><ScanLine size={13} className="text-red-400" /> Multimodal Book Page Scanner</div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); void runScan(e.dataTransfer.files?.[0]); }}
          className="mt-3.5 cursor-pointer rounded-xl border-2 border-dashed border-red-700/50 bg-neutral-900/50 px-4 py-7 text-center transition-colors hover:border-red-600"
        >
          {scanning ? (
            <div>
              <Loader2 size={24} className="mx-auto animate-spin text-red-400" />
              <p className="mt-2.5 font-display text-[14.5px] font-bold text-slate-100">Extracting questions from the page…</p>
              <p className="mt-1 font-monox text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">optical scan · question segmentation · topic mapping</p>
            </div>
          ) : (
            <div>
              <Camera size={24} className="mx-auto text-red-400" />
              <p className="mt-2.5 text-[13.5px] font-bold text-slate-100">Drop a book page, exercise set or handwritten notes</p>
              <p className="mt-1 text-[11.5px] font-medium text-slate-400">JPG or PNG · the AI extracts the core questions instantly</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void runScan(e.target.files?.[0]); e.target.value = ''; }} />

        <AnimatePresence>
          {scan && !scanning && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3.5 rounded-xl border-2 border-red-700/45 bg-neutral-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-red-400" />
                  <span className="text-[13px] font-bold text-slate-100">{scan.fileName}</span>
                </div>
                <span className="rounded-lg border border-red-700/50 bg-red-950/40 px-2 py-0.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-red-400">
                  {scan.subject} · {scan.detected.length} questions
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {scan.detected.map((q, i) => (
                  <motion.li key={q.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2.5">
                    <ChevronRight size={12} className="mt-0.5 flex-none text-red-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium leading-snug text-slate-200">{q.stem}</div>
                      <div className="mt-0.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{q.topic} · {q.page}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
              {scanMsg && <p className="mt-2.5 font-monox text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-400">{scanMsg}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ══ ✍️ AI INTERACTIVE TEST GENERATOR ══ */}
      <section className="rounded-2xl border-2 border-amber-500/50 bg-neutral-900/40 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker"><ClipboardList size={13} className="text-amber-500" /> AI Interactive Test Generator</div>
          {test && (
            <button onClick={() => { setTest(null); setResult(null); setAnswers({}); }} className="ry-ghost !py-1.5 !px-2.5">
              <X size={11} /> Close canvas
            </button>
          )}
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <label className="block">
            <span className="font-monox text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Source subject</span>
            <select value={testSubject} onChange={(e) => setTestSubject(e.target.value)} className="ry-input mt-1.5 !pl-3 !py-2 text-[12px]">
              {subjects.map((sub) => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
              <option value="General Studies">General Studies</option>
            </select>
          </label>
          <button
            onClick={() => { setScan(null); setS((x) => ({ ...x, lastScan: null })); buildTest('mcq'); }}
            className="ry-btn !py-2.5"
          >
            <PenLine size={13} /> Generate 5 MCQs
          </button>
          <button
            onClick={() => { setScan(null); setS((x) => ({ ...x, lastScan: null })); buildTest('short'); }}
            className="ry-btn !py-2.5"
          >
            <FileText size={13} /> Generate Short-Answer Exam
          </button>
        </div>

        {scan && !test && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => buildTest('mcq')} className="ry-btn !py-2"><PenLine size={12} /> Generate 5 MCQs from scan</button>
            <button onClick={() => buildTest('short')} className="ry-btn !py-2"><FileText size={12} /> Generate Short-Answer from scan</button>
          </div>
        )}

        <AnimatePresence>
          {test && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] px-3.5 py-2.5">
                <span className="font-monox text-[9px] font-bold uppercase tracking-[0.14em] text-amber-500">
                  {kind === 'mcq' ? 'Multiple choice · 5 questions' : 'Short answer · 4 questions'}
                </span>
                <span className="font-monox text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {Object.values(answers).filter((a) => a.trim()).length}/{test.length} attempted
                </span>
              </div>

              {test.map((q, qi) => (
                <motion.div key={q.id}initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.06 }} className="rounded-xl border-2 border-neutral-800 bg-neutral-900/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-bold leading-snug text-slate-100">
                        <span className="mr-1.5 font-monox text-[10px] font-bold text-amber-500">Q{qi + 1}.</span>
                        {q.stem}
                      </div>
                      <div className="mt-1 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{q.topic} · {q.page} · {q.marks} marks</div>
                    </div>
                  </div>

                  {q.kind === 'mcq' && q.options ? (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((o) => {
                        const picked = answers[q.id] === o.key;
                        return (
                          <button
                            key={o.key}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.key }))}
                            className={`flex items-start gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left transition-all ${picked ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-600'}`}
                          >
                            <span className={`mt-px grid h-5 w-5 flex-none place-items-center rounded-full border font-monox text-[9px] font-bold ${picked ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-700 text-slate-400'}`}>{o.key}</span>
                            <span className={`text-[12px] font-medium leading-snug ${picked ? 'text-slate-100' : 'text-slate-300'}`}>{o.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      rows={3}
                      placeholder="Write your answer — name the concept, state the rule, give one example…"
                      className="ry-input mt-3 !pl-3"
                    />
                  )}
                </motion.div>
              ))}

              <button onClick={submit} className="ry-btn w-full !py-3"><Send size={13} /> Submit test for grading</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
              <div className={`rounded-xl border-2 p-4 ${result.pct >= 60 ? 'border-amber-500/60 bg-amber-500/[0.07]' : 'border-red-700/60 bg-red-950/25'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`font-display text-[17px] font-bold ${result.pct >= 60 ? 'text-amber-500' : 'text-red-400'}`}>
                    Score {result.score}/{result.total} · {result.pct}%
                  </span>
                  <span className="rounded-lg border border-amber-500/40 px-2 py-0.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] text-amber-500">
                    Benchmark set to {result.pct >= 60 ? 'First Division' : 'Second Division'}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border-2 border-red-700/55 bg-red-950/20 p-4">
                <div className="flex items-center gap-2 font-monox text-[9.5px] font-bold uppercase tracking-[0.18em] text-red-400">
                  <CircleAlert size={13} /> Knowledge Gap &amp; Diagnostics Assessment
                </div>
                <ul className="mt-3 space-y-2.5">
                  {result.diagnostics.map((d, i) => (
                    <motion.li
                      key={d.questionId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-lg border-2 p-3 ${d.verdict === 'correct' ? 'border-emerald-700/40 bg-emerald-950/20' : d.verdict === 'partial' ? 'border-amber-500/40 bg-amber-950/15' : 'border-red-700/50 bg-red-950/30'}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`font-monox text-[8.5px] font-bold uppercase tracking-[0.14em] ${d.verdict === 'correct' ? 'text-emerald-400' : d.verdict === 'partial' ? 'text-amber-500' : 'text-red-400'}`}>
                          {d.verdict === 'correct' ? '✓ Correct' : d.verdict === 'partial' ? '◐ Partial' : '✕ Incorrect'}
                        </span>
                        <span className="font-monox text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Review {d.page} · {d.topic}</span>
                      </div>
                      <div className="mt-1.5 text-[12px] font-medium leading-snug text-slate-200">{d.stem}</div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-md border border-neutral-800 bg-neutral-950/60 px-2.5 py-2">
                          <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.12em] text-slate-500">Your answer</div>
                          <div className="mt-0.5 text-[11px] font-medium leading-snug text-slate-300">{d.given}</div>
                        </div>
                        <div className="rounded-md border border-emerald-700/30 bg-emerald-950/20 px-2.5 py-2">
                          <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.12em] text-emerald-400">Expected</div>
                          <div className="mt-0.5 text-[11px] font-medium leading-snug text-slate-300">{d.expected}</div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-3.5 rounded-lg border-2 border-amber-500/40 bg-amber-500/[0.06] p-3.5">
                  <div className="flex items-center gap-2 font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] text-amber-600"><Eye size={11} /> Coaching guidance</div>
                  <ul className="mt-2 space-y-1.5">
                    {diagnosticAdvice(result).map((a) => (
                      <li key={a} className="flex items-start gap-2 text-[12px] font-medium leading-snug text-slate-200">
                        <ChevronRight size={11} className="mt-0.5 flex-none text-amber-500" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(s.testHistory ?? []).length > 0 && (
          <div className="mt-4 border-t border-neutral-800 pt-3.5">
            <div className="flex items-center justify-between">
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] text-slate-400">Test history · {(s.testHistory ?? []).length}</span>
              <span className="font-monox text-[9px] font-bold text-amber-500">
                Avg {Math.round((s.testHistory ?? []).reduce((a, r) => a + r.pct, 0) / (s.testHistory ?? []).length)}%
              </span>
            </div>
            <div className="scrollthin mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {(s.testHistory ?? []).slice(0, 12).map((r) => (
                <span key={r.id} className={`flex-none rounded-md border px-2 py-1 font-monox text-[8.5px] font-bold uppercase ${r.pct >= 60 ? 'border-amber-500/35 text-amber-500' : 'border-red-700/40 text-red-400'}`}>
                  {new Date(r.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {r.pct}%
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
