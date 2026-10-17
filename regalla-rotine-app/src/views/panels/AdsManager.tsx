import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Copy,
  ExternalLink,
  Film,
  Gauge,
  ImagePlus,
  Megaphone,
  PlayCircle,
  Power,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Upload,
} from 'lucide-react';
import type { AdCampaign, CyberState } from '../../lib/cyber';
import { AD_FORMATS, adEarnings, adsServing, buildAdTag, disciplineScore, todayKey } from '../../lib/cyber';

type Updater = (u: (x: CyberState) => CyberState) => void;

export function AdsManager({ s, setS, log }: { s: CyberState; setS: Updater; log: (m: string) => void }) {
  const a = s.ads;
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<{ name: string; kind: 'image' | 'video'; media: string; link: string; caption: string; skipAfter: number; closable: boolean }>({
    name: '',
    kind: 'image',
    media: '',
    link: '',
    caption: '',
    skipAfter: 5,
    closable: true,
  });

  const earn = adEarnings(a);
  const todayScore = disciplineScore(s.routine[todayKey()] ?? []);
  void earn;
  const status = adsServing(a, todayScore, 0);
  const tag = buildAdTag(a);
  const campaigns = a.campaigns ?? [];

  const patch = (p: Partial<CyberState['ads']>) => setS((x) => ({ ...x, ads: { ...x.ads, ...p } }));

  const upload = (f: File | null | undefined) => {
    if (!f) return;
    const kind: 'image' | 'video' = f.type.startsWith('video') ? 'video' : 'image';
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, media: String(r.result), kind }));
    r.readAsDataURL(f);
  };

  const addCampaign = () => {
    if (!draft.name.trim() || !draft.media) return;
    const c: AdCampaign = {
      id: `c_${Date.now().toString(36)}`,
      name: draft.name.trim().slice(0, 48),
      kind: draft.kind,
      media: draft.media,
      link: draft.link.trim(),
      caption: draft.caption.trim().slice(0, 120),
      skipAfter: Math.max(0, Math.min(30, draft.skipAfter)),
      closable: draft.closable,
      active: true,
      impressions: 0,
      skips: 0,
      clicks: 0,
      createdAt: Date.now(),
    };
    patch({ campaigns: [...campaigns, c], customOn: true });
    log(`CAMPAIGN · "${c.name}" published (${c.kind}, skip ${c.skipAfter}s)`);
    setDraft({ name: '', kind: 'image', media: '', link: '', caption: '', skipAfter: 5, closable: true });
  };

  return (
    <div className="space-y-5">
      {/* ── Serving status ── */}
      <section className="ry-plate p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker"><Megaphone size={13} className="text-amber-500" /> Google Ads control centre</div>
          <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-monox text-[9px] font-bold uppercase tracking-[0.12em] ${status.serving ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-400' : 'border-red-700/60 bg-red-950/40 text-red-400'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.serving ? 'bg-emerald-400' : 'bg-red-500'}`} />
            {status.serving ? 'Live' : 'Stopped'}
          </span>
        </div>
        <p className="mt-2 text-[12.5px] font-medium cy-soft">{status.reason}</p>
        <button onClick={() => { patch({ on: !a.on }); log(`ADS · master switch ${!a.on ? 'ON' : 'OFF'}`); }} className={`ry-btn mt-3.5 w-full ${a.on ? 'ry-btn-crimson' : ''}`}>
          <Power size={13} /> {a.on ? 'Stop all Google Ads now' : 'Enable Google Ads'}
        </button>
      </section>

      {/* ── Account identity ── */}
      <section className="ry-plate p-5">
        <div className="ry-kicker"><ShieldCheck size={13} className="text-amber-500" /> Account &amp; unit identity</div>
        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          <label>
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Publisher ID</span>
            <input value={a.publisherId ?? ''} onChange={(e) => patch({ publisherId: e.target.value })} placeholder="ca-pub-0000000000000000" className="ry-input mt-1.5 !pl-3 !py-2 font-monox text-[11px]" />
          </label>
          <label>
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Ad slot ID</span>
            <input value={a.adSlotId ?? ''} onChange={(e) => patch({ adSlotId: e.target.value })} placeholder="1234567890" className="ry-input mt-1.5 !pl-3 !py-2 font-monox text-[11px]" />
          </label>
        </div>
        <div className="mt-3">
          <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Ad format</span>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {AD_FORMATS.map((f) => (
              <button key={f.id} onClick={() => patch({ adFormat: f.id })} className={`rounded-xl border-2 px-2 py-2 text-center transition-all ${a.adFormat === f.id ? 'border-amber-500 bg-amber-500/[0.07]' : 'cy-hair cy-shell'}`}>
                <span className={`block font-display text-[11.5px] font-bold ${a.adFormat === f.id ? 'text-amber-500' : 'cy-title'}`}>{f.label}</span>
                <span className="font-monox text-[7px] font-bold uppercase tracking-[0.1em] cy-muted">{f.size}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {([
            ['responsive', 'Full-width responsive', 'Scale the unit to the container'],
            ['personalized', 'Personalised ads', 'Off serves non-personalised inventory only'],
            ['consentRequired', 'Require consent gate', 'GDPR / CCPA compliance prompt'],
            ['testMode', 'Test mode (data-adtest)', 'Serve dummy ads — never bills advertisers'],
          ] as const).map(([k, label, note]) => (
            <button key={k} onClick={() => patch({ [k]: !a[k] } as Partial<CyberState['ads']>)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left ${a[k] ? 'border-amber-500/50 bg-amber-500/10' : 'cy-hair cy-shell'}`}>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-bold cy-title">{label}</span>
                <span className="block text-[11px] font-medium cy-muted">{note}</span>
              </span>
              <span className={`flex-none rounded-md px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${a[k] ? 'bg-amber-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>{a[k] ? 'on' : 'off'}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Scheduling & stop rules ── */}
      <section className="ry-plate p-5">
        <div className="ry-kicker"><Clock size={13} className="text-amber-500" /> Scheduling &amp; stop rules</div>
        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          <label>
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Start serving at</span>
            <select value={a.startHour ?? 0} onChange={(e) => patch({ startHour: Number(e.target.value) })} className="ry-input mt-1.5 !pl-3 !py-2 text-[11px]">
              {Array.from({ length: 25 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
            </select>
          </label>
          <label>
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Stop serving at</span>
            <select value={a.stopHour ?? 24} onChange={(e) => patch({ stopHour: Number(e.target.value) })} className="ry-input mt-1.5 !pl-3 !py-2 text-[11px]">
              {Array.from({ length: 25 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
            </select>
          </label>
          <label>
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Daily frequency cap</span>
            <input type="number" min={0} max={100} value={a.dailyCap ?? 0} onChange={(e) => patch({ dailyCap: Number(e.target.value) })} className="ry-input mt-1.5 !pl-3 !py-2" />
          </label>
          <label>
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Auto-stop after date</span>
            <input type="date" value={a.stopAfterDate ?? ''} onChange={(e) => patch({ stopAfterDate: e.target.value })} className="ry-input mt-1.5 !pl-3 !py-2 text-[11px]" />
          </label>
        </div>
        <button onClick={() => patch({ pauseOnLowScore: !a.pauseOnLowScore })} className={`mt-3 flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left ${a.pauseOnLowScore ? 'border-amber-500/50 bg-amber-500/10' : 'cy-hair cy-shell'}`}>
          <span className="min-w-0">
            <span className="block text-[12.5px] font-bold cy-title">Pause on low discipline</span>
            <span className="block text-[11px] font-medium cy-muted">Stops ads when a user&apos;s score drops under 40% — no pressure on bad days</span>
          </span>
          <span className={`flex-none rounded-md px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${a.pauseOnLowScore ? 'bg-amber-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>{a.pauseOnLowScore ? 'on' : 'off'}</span>
        </button>
        <div className="mt-3">
          <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Placement frequency</span>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(['low', 'medium', 'high'] as const).map((f) => (
              <button key={f} onClick={() => { patch({ frequency: f }); log(`ADS · frequency → ${f.toUpperCase()}`); }} className={`rounded-lg border-2 py-2 font-monox text-[9px] font-bold uppercase ${a.frequency === f ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'cy-hair cy-muted'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {([['top', 'Top leaderboard'], ['side', 'Sidebar zone'], ['inline', 'Inline dashboard card']] as const).map(([zone, label]) => (
            <button key={zone} onClick={() => patch({ zones: { ...a.zones, [zone]: !a.zones[zone] } })} className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 ${a.zones[zone] ? 'border-amber-500/50 bg-amber-500/10' : 'cy-hair cy-shell'}`}>
              <span className="text-[12.5px] font-bold cy-title">{label}</span>
              <span className={`rounded-md px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${a.zones[zone] ? 'bg-amber-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>{a.zones[zone] ? 'live' : 'off'}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Generated tag ── */}
      <section className="ry-plate p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker">Generated AdSense tag</div>
          <button
            onClick={async () => { try { await navigator.clipboard.writeText(tag); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); } }}
            className="ry-ghost !py-1.5"
          >
            <Copy size={11} /> {copied ? 'Copied' : 'Copy tag'}
          </button>
        </div>
        <pre className="scrollthin mt-3 max-h-48 overflow-auto rounded-xl border border-amber-500/20 bg-neutral-950 p-3 font-monox text-[9.5px] leading-relaxed text-emerald-400">{tag}</pre>
        <label className="mt-3 block">
          <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Extra script space (GAM / custom)</span>
          <textarea value={a.script} onChange={(e) => patch({ script: e.target.value })} rows={3} placeholder="<!-- paste additional tags here -->" className="ry-input mt-1.5 !pl-3 font-monox text-[11px]" />
        </label>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[['Impr.', earn.impressions.toLocaleString()], ['RPM', `$${earn.rpm}`], ['Rev/day', `$${earn.revenue.toFixed(2)}`]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-amber-500/20 cy-shell px-2 py-2.5 text-center">
              <div className="font-monox text-[7.5px] font-bold uppercase tracking-[0.14em] cy-muted">{k}</div>
              <div className="ry-num mt-0.5 text-[15px] text-amber-500">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Own campaigns ── */}
      <section className="ry-plate p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="ry-kicker"><Film size={13} className="text-amber-500" /> My own ad campaigns</div>
          <button onClick={() => { patch({ customOn: !a.customOn }); log(`CUSTOM ADS · ${!a.customOn ? 'ENABLED' : 'DISABLED'}`); }} className={`rounded-lg px-2.5 py-1 font-monox text-[9px] font-bold uppercase ${a.customOn ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>
            {a.customOn ? 'running' : 'paused'}
          </button>
        </div>

        <div className="mt-3.5 rounded-xl border-2 border-dashed border-amber-500/35 p-3.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label>
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Campaign name</span>
              <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Spring protein promo" className="ry-input mt-1.5 !pl-3 !py-2" />
            </label>
            <label>
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Click-through link</span>
              <input value={draft.link} onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))} placeholder="https://example.com" className="ry-input mt-1.5 !pl-3 !py-2 font-monox text-[11px]" />
            </label>
          </div>
          <label className="mt-2.5 block">
            <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Caption</span>
            <input value={draft.caption} onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))} placeholder="Short line shown under the creative" className="ry-input mt-1.5 !pl-3 !py-2" />
          </label>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <label>
              <span className="font-monox text-[8.5px] font-bold uppercase tracking-[0.16em] cy-muted">Skip allowed after (seconds)</span>
              <input type="number" min={0} max={30} value={draft.skipAfter} onChange={(e) => setDraft((d) => ({ ...d, skipAfter: Number(e.target.value) }))} className="ry-input mt-1.5 !pl-3 !py-2" />
            </label>
            <button onClick={() => setDraft((d) => ({ ...d, closable: !d.closable }))} className={`mt-5 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${draft.closable ? 'border-amber-500/50 bg-amber-500/10' : 'cy-hair cy-shell'}`}>
              <span className="text-[12px] font-bold cy-title">User can close entirely</span>
              <span className={`rounded-md px-2 py-0.5 font-monox text-[8px] font-bold uppercase ${draft.closable ? 'bg-amber-500 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>{draft.closable ? 'yes' : 'no'}</span>
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="ry-ghost !py-2"><Upload size={12} /> Upload image or video</button>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
            {draft.media && (draft.kind === 'video'
              ? <video src={draft.media} muted className="h-12 w-20 rounded-lg border border-amber-500/30 object-cover" />
              : <img src={draft.media} alt="creative" className="h-12 w-20 rounded-lg border border-amber-500/30 object-cover" />)}
            <button onClick={addCampaign} disabled={!draft.name.trim() || !draft.media} className={`ry-btn ml-auto !py-2 ${!draft.name.trim() || !draft.media ? 'opacity-50' : ''}`}>
              <PlayCircle size={13} /> Publish campaign
            </button>
          </div>
          {!draft.media && <p className="mt-2 flex items-center gap-1.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.12em] cy-muted"><ImagePlus size={11} /> Upload a creative to enable publishing</p>}
        </div>

        <div className="mt-3.5 space-y-2">
          {campaigns.length === 0 && <p className="rounded-xl border border-dashed cy-hair py-6 text-center font-display italic cy-muted">No campaigns yet — publish your first above.</p>}
          {campaigns.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-amber-500/20 cy-shell px-3 py-2.5">
              {c.kind === 'video'
                ? <video src={c.media} muted className="h-11 w-16 flex-none rounded-lg border border-amber-500/25 object-cover" />
                : <img src={c.media} alt={c.name} className="h-11 w-16 flex-none rounded-lg border border-amber-500/25 object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-[13px] font-bold cy-title">{c.name}</span>
                  <span className="rounded border border-amber-500/30 px-1.5 py-0.5 font-monox text-[7.5px] font-bold uppercase text-amber-600">{c.kind}</span>
                  <span className="rounded border border-neutral-700 px-1.5 py-0.5 font-monox text-[7.5px] font-bold uppercase cy-muted">skip {c.skipAfter}s</span>
                  {c.closable && <span className="rounded border border-neutral-700 px-1.5 py-0.5 font-monox text-[7.5px] font-bold uppercase cy-muted">closable</span>}
                </div>
                <div className="mt-0.5 font-monox text-[8.5px] font-bold uppercase tracking-[0.1em] cy-muted">
                  {c.impressions} views · {c.skips} skips · {c.clicks} clicks
                  {c.link && <span className="ml-1 text-amber-600"><ExternalLink size={9} className="inline" /> linked</span>}
                </div>
              </div>
              <button onClick={() => patch({ campaigns: campaigns.map((z) => (z.id === c.id ? { ...z, active: !z.active } : z)) })} className={`rounded-md border px-2 py-1 font-monox text-[8px] font-bold uppercase ${c.active ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-400' : 'border-neutral-700 cy-muted'}`}>
                {c.active ? 'live' : 'paused'}
              </button>
              <button onClick={() => { patch({ campaigns: campaigns.filter((z) => z.id !== c.id) }); log(`CAMPAIGN · "${c.name}" deleted`); }} className="rounded-md border border-red-700/60 px-2 py-1 font-monox text-[8px] font-bold uppercase text-red-400 hover:bg-red-950/40">
                <Trash2 size={10} />
              </button>
            </motion.div>
          ))}
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] px-3 py-2.5 text-[11.5px] font-medium leading-snug cy-soft">
          <Gauge size={13} className="mt-0.5 flex-none text-amber-500" />
          Every campaign shows a visible countdown and a Skip button, plus an optional hard close — users are never trapped in an ad.
        </p>
      </section>

      <section className="ry-plate p-5">
        <div className="ry-kicker"><TriangleAlert size={13} className="text-amber-500" /> Policy checklist</div>
        <ul className="mt-3 space-y-1.5">
          {[
            ['Publisher ID set', !!(a.publisherId ?? '').trim()],
            ['Ad slot ID set', !!(a.adSlotId ?? '').trim()],
            ['Consent gate armed', !!a.consentRequired],
            ['Frequency cap configured', (a.dailyCap ?? 0) > 0],
            ['Test mode off for production', !a.testMode],
            ['At least one zone live', Object.values(a.zones).some(Boolean)],
          ].map(([label, ok]) => (
            <li key={label as string} className="flex items-center gap-2 text-[12.5px] font-medium cy-soft">
              <span className={`grid h-4 w-4 flex-none place-items-center rounded-full text-[9px] font-bold ${ok ? 'bg-emerald-600 text-neutral-950' : 'border border-neutral-700 cy-muted'}`}>{ok ? '✓' : '!'}</span>
              {label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
