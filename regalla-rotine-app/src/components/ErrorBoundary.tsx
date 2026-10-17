import { Component, type ReactNode } from 'react';
import { RefreshCcw, RotateCcw } from 'lucide-react';
import { Crest } from './Brand';
import { STORE_KEY } from '../lib/types';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-of-all-defenses crash veil. If ANY render thread throws, the frame
 * falls back to this sovereign recovery chamber instead of dying blank —
 * which is what makes embeds report the site as temporarily down.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[regalia:crash-veil]', error);
  }

  private reload = () => location.reload();

  private repair = () => {
    try {
      localStorage.removeItem(STORE_KEY);
    } finally {
      location.reload();
    }
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-[linear-gradient(170deg,#F6F1E7,#FDFBF7)] px-5">
        <div className="card ornate w-full max-w-md px-7 py-8 text-center">
          <div className="flex justify-center">
            <Crest size={64} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">The runtime stumbled</h1>
          <p className="mt-2 font-monox text-[10px] font-bold uppercase tracking-[0.2em] text-faint">
            a render thread threw — the vault itself is intact
          </p>
          <div className="mx-auto mt-5 max-h-28 overflow-auto rounded-[4px] border border-line bg-parch/50 p-3 text-left">
            <code className="font-monox text-[11px] font-bold leading-relaxed text-crimson">
              {String(this.state.error.message || this.state.error).slice(0, 220)}
            </code>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <button onClick={this.reload} className="btn-seal !px-5 !py-2.5">
              <RefreshCcw size={13} /> Reload runtime
            </button>
            <button onClick={this.repair} className="btn-ghost !py-2.5">
              <RotateCcw size={13} /> Repair & reseed
            </button>
          </div>
          <p className="mx-auto mt-4 max-w-xs font-monox text-[8px] font-bold uppercase leading-relaxed tracking-[0.16em] text-faint">
            repair wipes only key regalia_v2 on this device and reboots clean
          </p>
        </div>
      </div>
    );
  }
}
