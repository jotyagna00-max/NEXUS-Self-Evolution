import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, SkipForward, Cpu, CheckCircle, X } from 'lucide-react';
import { getNativeLLMStatus, downloadNativeLLM, initializeNativeLLM, onNativeLLMDownloadProgress } from '../services/nativeLLMBridge';

const SKIP_KEY = 'nexus_llm_first_launch_skipped';

type Phase = 'idle' | 'checking' | 'prompt' | 'downloading' | 'initializing' | 'done' | 'skipped' | 'error';

export const NativeLLMFirstLaunch: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('checking');
  const [downloadPct, setDownloadPct] = useState(0);
  const [modelSize, setModelSize] = useState(1.5);
  const [error, setError] = useState('');

  const checkStatus = useCallback(async () => {
    // Only relevant in Electron
    const api = (window as any).electronAPI;
    if (!api?.getLLMStatus) {
      setPhase('skipped');
      return;
    }

    // Already skipped before
    if (localStorage.getItem(SKIP_KEY)) {
      setPhase('skipped');
      return;
    }

    try {
      const status = await getNativeLLMStatus();
      if (!status) {
        setPhase('skipped');
        return;
      }

      if (status.ready) {
        setPhase('done');
        return;
      }

      if (status.modelExists) {
        // Model exists but not initialized — try to initialize
        setPhase('initializing');
        const result = await initializeNativeLLM();
        if (result.success) {
          setPhase('done');
        } else {
          setPhase('prompt');
        }
        return;
      }

      // Model doesn't exist — prompt user
      setModelSize(status.modelSize ? status.modelSize / (1024 * 1024 * 1024) : 1.5);
      setPhase('prompt');
    } catch {
      setPhase('skipped');
    }
  }, []);

  useEffect(() => {
    // Delay check slightly so the dashboard renders first
    const t = setTimeout(checkStatus, 1200);
    return () => clearTimeout(t);
  }, [checkStatus]);

  // Listen for download progress
  useEffect(() => {
    if (phase !== 'downloading') return;
    const cleanup = onNativeLLMDownloadProgress((pct) => {
      setDownloadPct(pct);
      if (pct >= 100) {
        // Download complete — initialize
        setPhase('initializing');
        initializeNativeLLM()
          .then((r) => {
            if (r.success) setPhase('done');
            else { setPhase('error'); setError(r.error || 'Initialization failed'); }
          })
          .catch((e) => { setPhase('error'); setError(e.message); });
      }
    });
    return cleanup;
  }, [phase]);

  const handleDownload = async () => {
    setPhase('downloading');
    setDownloadPct(0);
    setError('');
    try {
      const result = await downloadNativeLLM();
      if (!result.success) {
        setPhase('error');
        setError(result.error || 'Download failed');
      }
    } catch (e: any) {
      setPhase('error');
      setError(e.message);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(SKIP_KEY, '1');
    setPhase('skipped');
  };

  const handleRetry = () => {
    setPhase('prompt');
    setError('');
  };

  if (phase === 'skipped' || phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md mx-4 glass-card rounded-2xl border border-white/10 p-8"
          style={{
            background: 'rgba(10,10,15,0.95)',
            boxShadow: '0 0 60px rgba(239,68,68,0.15), 0 0 120px rgba(16,185,129,0.06)',
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/15 to-emerald-500/10 border border-red-500/20 flex items-center justify-center">
              {phase === 'downloading' || phase === 'initializing' ? (
                <Download size={28} className="text-emerald-400 animate-bounce" />
              ) : phase === 'error' ? (
                <X size={28} className="text-red-400" />
              ) : (
                <Cpu size={28} className="text-red-400" />
              )}
            </div>
          </div>

          {/* Content by phase */}
          {phase === 'checking' && (
            <div className="text-center">
              <p className="text-sm font-tech text-white/30">Checking system resources...</p>
            </div>
          )}

          {(phase === 'prompt' || phase === 'error') && (
            <>
              <h2 className="text-lg font-display font-bold text-white text-center tracking-wider uppercase mb-3">
                {phase === 'error' ? 'Something Went Wrong' : 'System Resources Required'}
              </h2>
              <p className="text-sm font-tech text-white/50 text-center leading-relaxed mb-2">
                {phase === 'error'
                  ? error || 'Failed to download the AI model.'
                  : `NEXUS runs a private AI model directly on your CPU — no cloud, no API keys. A one-time download (~${modelSize.toFixed(1)} GB) from HuggingFace is required. After that, the model stays on your machine permanently.`}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-mono text-emerald-400/70 uppercase tracking-wider">100% Private</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/8 border border-red-500/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-[9px] font-mono text-red-400/70 uppercase tracking-wider">One-Time Only</span>
                </div>
              </div>

              <div className="flex gap-3">
                {phase === 'error' ? (
                  <button
                    onClick={handleRetry}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-display font-bold text-red-400 uppercase tracking-[0.15em] hover:bg-red-500/20 transition-all"
                  >
                    <Download size={16} /> Try Again
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-sm font-display font-bold text-white uppercase tracking-[0.15em] hover:from-red-500/30 hover:to-red-600/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] transition-all"
                  >
                    <Download size={16} /> Download Now
                  </button>
                )}
                {phase !== 'error' && (
                  <button
                    onClick={handleSkip}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-tech text-white/40 uppercase tracking-wider hover:text-white/60 hover:border-white/20 transition-all"
                  >
                    <SkipForward size={16} /> Skip
                  </button>
                )}
              </div>
            </>
          )}

          {(phase === 'downloading' || phase === 'initializing') && (
            <>
              <h2 className="text-lg font-display font-bold text-white text-center tracking-wider uppercase mb-3">
                {phase === 'initializing' ? 'Initializing AI Engine' : 'Downloading AI Model'}
              </h2>
              <p className="text-sm font-tech text-white/50 text-center mb-4">
                {phase === 'initializing'
                  ? 'Loading the model into memory...'
                  : 'This may take a few minutes depending on your connection.'}
              </p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
                    {phase === 'initializing' ? 'Initializing' : 'Downloading'}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">
                    {phase === 'initializing' ? '...' : `${Math.round(downloadPct)}%`}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    className={`h-full rounded-full ${
                      phase === 'initializing'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-300 animate-pulse'
                        : 'bg-gradient-to-r from-red-500 to-emerald-400'
                    }`}
                    animate={{
                      width: phase === 'initializing' ? '100%' : `${downloadPct}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {phase === 'downloading' && (
                <p className="text-[9px] font-mono text-white/20 text-center">
                  ~{modelSize.toFixed(1)} GB · Do not close the app
                </p>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NativeLLMFirstLaunch;
