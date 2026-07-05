import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Cpu, Download, CheckCircle } from "lucide-react";
import { preloadModel, isWebGPUSupported } from "../services/webllmService";

export const ModelLoader: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "ready" | "unsupported">("loading");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("Initializing...");

  useEffect(() => {
    if (!isWebGPUSupported()) {
      setStatus("unsupported");
      return;
    }

    preloadModel((p) => {
      setProgress(p.progress);
      setText(p.text);
      if (p.progress >= 100) {
        setStatus("ready");
      }
    }).catch((err) => {
      console.error("Failed to load model:", err);
      setStatus("unsupported");
    });
  }, []);

  if (status === "ready") return null;

  if (status === "unsupported") {
    return (
      <div className="fixed bottom-4 right-4 z-50 p-4 glass rounded-2xl border border-amber-500/30 bg-amber-500/5 max-w-sm">
        <div className="flex items-start gap-3">
          <Cpu size={18} className="text-amber-400 mt-0.5" />
          <div>
            <p className="text-xs font-display font-bold text-white uppercase tracking-wider">
              AI Model Not Available
            </p>
            <p className="text-[10px] font-mono text-white/60 mt-1">
              Your browser doesn't support WebGPU. AI features will use the NVIDIA API (requires API key).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 p-4 glass rounded-2xl border border-emerald-500/30 bg-emerald-500/5 max-w-sm"
    >
      <div className="flex items-start gap-3">
        {progress < 100 ? (
          <Download size={18} className="text-emerald-400 mt-0.5 animate-pulse" />
        ) : (
          <CheckCircle size={18} className="text-emerald-400 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-xs font-display font-bold text-white uppercase tracking-wider">
            Loading AI Model
          </p>
          <p className="text-[10px] font-mono text-white/60 mt-1">{text}</p>
          {progress < 100 && (
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              />
            </div>
          )}
          {progress < 100 && (
            <p className="text-[9px] font-mono text-white/40 mt-1">
              {progress}% • First download only (~2.3GB)
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
