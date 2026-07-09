import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, X, Scroll, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

interface RemoteVersionJson {
  latestVersion?: string;
  downloadUrl?: string;
  releaseNotes?: string;
  changelog?: ChangelogEntry[];
}

const GIST_URL = 'https://gist.githubusercontent.com/jotyagna00-max/5bbe4ebd4efadc7098259e62e830213b/raw/version.json';

const FALLBACK_CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.27.0',
    date: '2026-07-09',
    notes: [
      'Shadow Chat professional UI redesign with LLM status indicator',
      'First-time tutorial — 8-step onboarding for new users',
      'Monthly and yearly reports in Mission Debrief',
      'Store level gates, EXP overhaul, ranks removed',
      'App icon, achievement burst, data export/import, keyboard shortcuts',
    ],
  },
  {
    version: '1.26.0',
    date: '2026-07-06',
    notes: [
      'Shadow Chat persona selector — 6 voices',
      'First-launch LLM download prompt',
      'CPU-only inference via node-llama-cpp',
      'Website 3D overhaul',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-06-29',
    notes: [
      'Effort-mirror tone, streak window, domain badges',
      'Mission Debrief tab, Changelog panel',
    ],
  },
];

const ChangelogPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const api = (window as any).electronAPI;
        let data: RemoteVersionJson | null = null;

        if (api?.checkForUpdates) {
          try { data = await api.checkForUpdates(); } catch {}
        }

        if (!data || !data.latestVersion) {
          const res = await fetch(GIST_URL, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = await res.json();
        }

        if (aborted) return;
        setLatestVersion(data.latestVersion || '');
        setDownloadUrl(data.downloadUrl || '');
        if (Array.isArray(data.changelog) && data.changelog.length > 0) {
          setEntries(data.changelog);
        } else if (data.releaseNotes) {
          setEntries([{
            version: data.latestVersion || 'current',
            date: new Date().toISOString().split('T')[0],
            notes: data.releaseNotes.split(/[.;]\s+/).map(s => s.trim()).filter(Boolean).map(s => s.endsWith('.') ? s : s + '.'),
          }]);
        } else {
          setEntries(FALLBACK_CHANGELOG);
        }
      } catch (e: any) {
        if (aborted) return;
        setError(e?.message || 'Could not load changelog');
        setEntries(FALLBACK_CHANGELOG);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            className="glass rounded-[32px] border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-[0_0_80px_rgba(16,185,129,0.06)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-8 pb-6 border-b border-white/5 bg-black/60 backdrop-blur-xl">
              <div>
                <span className="text-emerald-500/60 font-display text-[8px] tracking-[0.5em] uppercase flex items-center gap-2">
                  <Scroll size={12} /> Public Record
                </span>
                <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-white mt-1">Changelog</h2>
                {latestVersion && (
                  <span className="text-[10px] font-mono text-white/30 mt-1 block">Current: v{latestVersion}</span>
                )}
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/30 hover:text-white border border-transparent hover:border-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 hover:from-emerald-500/20 hover:to-blue-500/20 border border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-display uppercase tracking-widest text-emerald-400">Download latest build</span>
                  </div>
                  <ExternalLink size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-3 py-12">
                  <RefreshCw size={16} className="text-emerald-400 animate-spin" />
                  <span className="text-[10px] font-display uppercase tracking-widest text-white/40">Querying update server…</span>
                </div>
              )}

              {error && !loading && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[10px] font-tech text-amber-400/80">
                    Update server unreachable. Showing bundled changelog.
                  </div>
                </div>
              )}

              {!loading && entries.map((entry, i) => (
                <motion.div
                  key={entry.version + i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-6 ${
                    i === 0
                      ? 'border-emerald-500/25 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.06)]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] font-display uppercase tracking-[0.4em] ${i === 0 ? 'text-emerald-400' : 'text-white/30'}`}>
                      {i === 0 ? 'Latest · ' : ''}v{entry.version}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 flex items-center gap-1">
                      <Calendar size={10} /> {entry.date}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {entry.notes.map((note, j) => (
                      <li key={j} className="flex items-start gap-3 text-[11px] font-tech text-white/70 leading-relaxed">
                        <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${i === 0 ? 'bg-emerald-400' : 'bg-white/30'}`} />
                        {note}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangelogPanel;
