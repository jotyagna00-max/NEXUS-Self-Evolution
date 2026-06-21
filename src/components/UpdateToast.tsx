import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Loader } from 'lucide-react';

interface UpdateState {
  version: string;
  url: string;
}

const UpdateToast = () => {
  const [update, setUpdate] = useState<UpdateState | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [installerPath, setInstallerPath] = useState<string | null>(null);

  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api) return;

    api.onUpdateAvailable((data: UpdateState) => setUpdate(data));

    api.onDownloadProgress((pct: number) => setProgress(pct));

    api.onDownloadComplete((path: string) => {
      setDownloading(false);
      setInstallerPath(path);
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!update) return;
    setDownloading(true);
    setProgress(0);
    try {
      await (window as any).electronAPI.startDownload(update.url);
    } catch {
      setDownloading(false);
    }
  }, [update]);

  const handleInstall = useCallback(async () => {
    if (!installerPath) return;
    try {
      await (window as any).electronAPI.installUpdate(installerPath);
    } catch {}
  }, [installerPath]);

  const handleDismiss = useCallback(() => {
    setUpdate(null);
    setInstallerPath(null);
    setDownloading(false);
    setProgress(0);
  }, []);

  const api = (window as any).electronAPI;

  return (
    <AnimatePresence>
      {update && !installerPath && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          className="fixed bottom-6 right-6 z-[9998] max-w-sm"
        >
          <div className="glass rounded-2xl p-5 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Download size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-white">Update Available</p>
                  <p className="text-[10px] font-mono text-white/40">v{update.version} ready to install</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-white/20 hover:text-white/60"><X size={16} /></button>
            </div>

            {downloading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader size={14} className="text-emerald-400 animate-spin" />
                  <span className="text-[10px] font-mono text-white/40">Downloading... {progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <button onClick={handleDownload}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all">
                Download Update
              </button>
            )}
          </div>
        </motion.div>
      )}

      {installerPath && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          className="fixed bottom-6 right-6 z-[9998] max-w-sm"
        >
          <div className="glass rounded-2xl p-5 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Download size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-display font-bold text-white">Download Complete</p>
                <p className="text-[10px] font-mono text-white/40">Ready to install</p>
              </div>
            </div>
            <button onClick={handleInstall}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all">
              Install Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateToast;
