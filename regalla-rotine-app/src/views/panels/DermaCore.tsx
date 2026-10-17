import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, ScanLine, ShieldCheck, 
  ImagePlus, User, Send, MessageCircle,
  Activity, Microscope, Droplets, Camera, ChefHat, Spline, ShieldAlert,
  Upload
} from 'lucide-react';
import { 
  analyzeChemicals, detectBiotype, getDermaResponse, scanKitchenObject
} from '../../lib/dermaAI';
import { fileToDataURL } from '../../lib/media';
import { PROGRESS_SLOTS } from '../../lib/cyber';

export function DermaCore({ s, setS }: { s: any; setS: any }) {
  const [analyzing, setScanning] = useState(false);
  const [draftMsg, setDraftMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const chemicalResult = s.dermaResults.lastChemical;
  const skinResult = s.dermaResults.lastSkin;
  const hairResult = s.dermaResults.lastHair;
  const kitchenResult = s.dermaResults.lastKitchen;

  const [compareA, setCompareA] = useState<string | null>(s.compare?.[0] ?? null);
  const [compareB, setCompareB] = useState<string | null>(s.compare?.[1] ?? null);
  const [activeSlot, setActiveSlot] = useState<string>('current');

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [s.dermaChat]);

  const ingestProduct = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setScanning(true);
    const result = analyzeChemicals(files.length, files[0].name);
    setTimeout(() => {
      setS((x: any) => ({ ...x, dermaResults: { ...x.dermaResults, lastChemical: result } }));
      setScanning(false);
    }, 1200);
  };

  const ingestKitchen = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setScanning(true);
    const result = scanKitchenObject(files[0].name);
    setTimeout(() => {
      setS((x: any) => ({ ...x, dermaResults: { ...x.dermaResults, lastKitchen: result } }));
      setScanning(false);
    }, 1200);
  };

  const ingestBiotype = async (file: File | null, mode: 'skin' | 'hair') => {
    if (!file) return;
    setScanning(true);
    const result = detectBiotype(file.name, mode);
    setTimeout(() => {
      setS((x: any) => ({ ...x, dermaResults: { ...x.dermaResults, [mode === 'skin' ? 'lastSkin' : 'lastHair']: result } }));
      setScanning(false);
    }, 1200);
  };

  const setShot = async (f: File | null | undefined) => {
    if (!f) return;
    const photo = await fileToDataURL(f);
    setS((x: any) => ({ ...x, progressShots: { ...x.progressShots, [activeSlot]: photo } }));
  };

  const sendChat = () => {
    if (!draftMsg.trim()) return;
    const userMsg = { who: 'user', text: draftMsg, at: Date.now() };
    
    // Add user message immediately
    setS((x: any) => ({ ...x, dermaChat: [...(x.dermaChat||[]), userMsg].slice(-20) }));
    setDraftMsg('');
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const skinType = s.dermaResults?.lastSkin?.type ?? 'Unknown';
      const aiResponse = getDermaResponse(draftMsg, skinType);
      
      setS((x: any) => {
        const chat = [...(x.dermaChat||[])];
        chat.push({ who: 'ai', text: '', reply: aiResponse, at: Date.now() });
        return { ...x, dermaChat: chat.slice(-20) };
      });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <div className="ry-kicker">Agentic Derma & Trichology Core</div>
        <h1 className="ry-gold mt-2 font-display text-[30px] font-bold tracking-tight md:text-[38px]">Beauty, Skincare & Comparison Lab</h1>
      </header>

      <div className="rd-grid grid gap-6 lg:grid-cols-2">
        
        {/* 🧴 PRODUCT ANALYSER */}
        <section className="ry-plate flex flex-col p-5 md:p-6">
          <div className="ry-kicker mb-4">
            <FlaskConical size={13} className="text-amber-500" /> Chemical Decomposition Engine
          </div>
          
          <div className="relative rounded-xl border-2 border-dashed border-amber-500/35 bg-neutral-900/50 p-6 text-center transition-colors hover:border-amber-500">
            <input 
              type="file" multiple className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => ingestProduct(e.target.files)}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              {analyzing ? <ScanLine className="animate-pulse" size={24} /> : <ImagePlus size={24} />}
            </div>
            <p className="mt-3 text-[14px] font-bold text-slate-100">Drop Product Multi-Angle Photos</p>
            <p className="mt-1 text-[11px] text-slate-400">Front design · Side print · Rear chemical list</p>
          </div>

          {chemicalResult && (
            <div className="mt-4 space-y-4">
              <div className={`flex items-center justify-center rounded-lg border-2 p-3 font-display font-bold ${chemicalResult.verdict === 'safe' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-red-600 bg-red-950/40 text-red-500'}`}>
                {chemicalResult.verdict === 'safe' ? '✅ CERTIFIED SAFE TO USE' : '❌ URGENT WARNING: DO NOT USE'}
              </div>
              
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-slate-500 uppercase font-monox text-[8px] border-b border-white/10">
                    <th className="py-2">Component Name</th>
                    <th className="py-2">AI Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {chemicalResult.actives.map((a: any) => (
                    <tr key={a.name}>
                      <td className="py-2 font-bold text-emerald-400">{a.name}</td>
                      <td className="py-2 text-slate-300">{a.benefit}</td>
                    </tr>
                  ))}
                  {chemicalResult.fillers.map((f: any) => (
                    <tr key={f.name}>
                      <td className="py-2 font-bold text-red-400">{f.name}</td>
                      <td className="py-2 text-slate-300">{f.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {chemicalResult.missing.length > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-neutral-900/50 p-3">
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Missing Essentials</div>
                  <div className="flex flex-wrap gap-2">
                    {chemicalResult.missing.map((m: any) => (
                      <span key={m} className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-[10px] font-bold text-slate-400">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 🔬 BIOTYPE SCANNER & KITCHEN SCANNER */}
        <div className="space-y-6">
          <section className="ry-plate p-5 md:p-6">
            <div className="ry-kicker mb-4">
              <Microscope size={13} className="text-amber-500" /> Clinical Bio-Type Scanner
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => ingestBiotype(e.target.files?.[0] || null, 'skin')} />
                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-900/50 py-4 hover:border-amber-500/50">
                  <User size={20} className="text-amber-500 mb-2" />
                  <span className="text-[10px] font-bold uppercase text-slate-300">Upload Face Profile</span>
                </div>
              </div>
              <div className="relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => ingestBiotype(e.target.files?.[0] || null, 'hair')} />
                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-900/50 py-4 hover:border-amber-500/50">
                  <Activity size={20} className="text-amber-500 mb-2" />
                  <span className="text-[10px] font-bold uppercase text-slate-300">Upload Scalp/Hair</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {skinResult && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.03] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-amber-500" />
                    <span className="font-display font-bold text-slate-100">Skin Profile: {skinResult.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skinResult.needs.map((n: string) => <span key={n} className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-500">{n}</span>)}
                  </div>
                </div>
              )}
              
              {hairResult && (
                <div className="rounded-xl border border-red-700/30 bg-red-950/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets size={16} className="text-red-500" />
                    <span className="font-display font-bold text-slate-100">Hair Mapping Data</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-[11px]">
                    <div><span className="text-slate-500">Thickness:</span> <span className="text-slate-200 block font-bold">{hairResult.thickness}</span></div>
                    <div><span className="text-slate-500">Texture:</span> <span className="text-slate-200 block font-bold">{hairResult.texture}</span></div>
                    <div><span className="text-slate-500">Scalp:</span> <span className="text-slate-200 block font-bold">{hairResult.scalp}</span></div>
                    <div><span className="text-slate-500">Condition:</span> <span className="text-slate-200 block font-bold">{hairResult.damage}</span></div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="ry-plate p-5 md:p-6">
             <div className="ry-kicker mb-4">
              <ChefHat size={13} className="text-amber-500" /> Kitchen Object Scanner Matrix
            </div>
            <div className="relative rounded-xl border-2 border-dashed border-amber-500/35 bg-neutral-900/50 p-4 text-center hover:border-amber-500">
              <input type="file" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => ingestKitchen(e.target.files)} />
              <Camera size={20} className="mx-auto text-amber-500 mb-2" />
              <span className="font-monox text-[10px] font-bold uppercase text-slate-300">Upload Raw Kitchen Items</span>
            </div>
            
            {kitchenResult && (
              <div className={`mt-4 rounded-xl border-2 p-4 ${kitchenResult.safe ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-red-700/50 bg-red-950/20'}`}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {kitchenResult.items.map((i: string) => (
                    <span key={i} className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${kitchenResult.safe ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {i}
                    </span>
                  ))}
                </div>
                <p className="text-[12px] font-medium leading-snug text-slate-200">{kitchenResult.recipe}</p>
              </div>
            )}
          </section>
        </div>

        {/* ✨ HISTORICAL PROGRESS COMPARISON LAB */}
        <section className="ry-plate p-5 md:p-6 lg:col-span-2">
          <div className="ry-kicker mb-5">
            <Spline size={13} className="text-amber-500" /> ✨ HISTORICAL PROGRESS COMPARISON LAB
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FRAME A */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
               <div className="flex items-center justify-between mb-3">
                 <span className="font-monox text-[9px] font-bold uppercase tracking-widest text-slate-400">[ Frame A ]</span>
                 <select 
                    value={compareA || ''} 
                    onChange={(e) => setCompareA(e.target.value)}
                    className="ry-input !w-auto !py-1.5 !pl-3 text-[11px]"
                  >
                   <option value="">Upload Historical Day...</option>
                   {PROGRESS_SLOTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                 </select>
               </div>
               
               {compareA && (
                 <div className="relative aspect-square rounded-xl border-2 border-dashed border-amber-500/30 bg-neutral-950 overflow-hidden">
                   {s.progressShots?.[compareA] ? (
                     <img src={s.progressShots[compareA]} className="w-full h-full object-cover" alt="Frame A" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:text-amber-500 transition-colors">
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { setActiveSlot(compareA); setShot(e.target.files?.[0]); }} />
                       <Upload size={24} className="mb-2" />
                       <span className="font-monox text-[10px] font-bold uppercase">Upload Image</span>
                     </div>
                   )}
                 </div>
               )}
            </div>

            {/* FRAME B */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
               <div className="flex items-center justify-between mb-3">
                 <span className="font-monox text-[9px] font-bold uppercase tracking-widest text-slate-400">[ Frame B ]</span>
                 <select 
                    value={compareB || ''} 
                    onChange={(e) => setCompareB(e.target.value)}
                    className="ry-input !w-auto !py-1.5 !pl-3 text-[11px]"
                  >
                   <option value="">Current Transformation...</option>
                   {PROGRESS_SLOTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                 </select>
               </div>
               
               {compareB && (
                 <div className="relative aspect-square rounded-xl border-2 border-dashed border-amber-500/30 bg-neutral-950 overflow-hidden">
                   {s.progressShots?.[compareB] ? (
                     <img src={s.progressShots[compareB]} className="w-full h-full object-cover" alt="Frame B" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:text-amber-500 transition-colors">
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { setActiveSlot(compareB); setShot(e.target.files?.[0]); }} />
                       <Upload size={24} className="mb-2" />
                       <span className="font-monox text-[10px] font-bold uppercase">Upload Image</span>
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        </section>

        {/* 💬 MULTILINGUAL DERMA AI ASSISTANT */}
        <section className="ry-plate flex flex-col p-5 md:p-6 lg:col-span-2">
          <div className="ry-kicker mb-4">
            <MessageCircle size={13} className="text-amber-500" /> 💬 ASK DERMA-AI ASSISTANT
          </div>
          
          <div className="scrollthin max-h-[400px] min-h-[250px] flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {s.dermaChat?.map((msg: any, i: number) => (
              <div key={msg.at + i} className={`flex ${msg.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.who === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl bg-amber-600 px-4 py-2.5 text-[13.5px] font-bold text-neutral-950 shadow-md">
                    {msg.text}
                  </div>
                ) : (
                  <div className="max-w-[90%] rounded-2xl border-2 border-amber-500/20 bg-neutral-900 px-5 py-4 shadow-lg">
                    {/* The Clean Claude-like Pro Response Layout */}
                    <div className="text-[13.5px] font-medium leading-relaxed text-slate-100 whitespace-pre-line mb-3">
                      {msg.reply?.text}
                    </div>
                    
                    {msg.reply?.proTip && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] font-bold text-amber-500 mb-2">
                        {msg.reply.proTip}
                      </div>
                    )}
                    
                    {msg.reply?.danger && (
                      <div className="flex items-start gap-2 rounded-lg border border-red-700/50 bg-red-950/40 px-3 py-2 text-[12px] font-bold text-red-400">
                        <ShieldAlert size={14} className="mt-0.5 flex-none" />
                        {msg.reply.danger}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2 relative">
            <input 
              value={draftMsg}
              onChange={(e) => setDraftMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="e.g., kya ye cream pimples k liye theek hai? ...in Spanish"
              className="ry-input !pl-4 flex-1"
            />
            <button onClick={sendChat} className="ry-btn !px-5"><Send size={16} /></button>
          </div>
        </section>

      </div>
    </div>
  );
}
