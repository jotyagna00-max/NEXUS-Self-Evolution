import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpCircle, Sparkles, Zap, Trophy } from 'lucide-react';
import { useGame } from '../GameContext';

interface Props {
  show: boolean;
  onComplete: () => void;
}

const AscensionCeremony: React.FC<Props> = ({ show, onComplete }) => {
  const { ascensionData } = useGame();
  const [phase, setPhase] = useState<'intro' | 'reset' | 'reward' | 'done'>('intro');

  useEffect(() => {
    if (!show) return;
    setPhase('intro');
    const t1 = setTimeout(() => setPhase('reset'), 2500);
    const t2 = setTimeout(() => setPhase('reward'), 5000);
    const t3 = setTimeout(() => { setPhase('done'); onComplete(); }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 20, opacity: 0 }}
                animate={{ y: -20, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </div>

          {/* Screen shake */}
          <motion.div
            animate={phase === 'intro' ? { x: [0, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center"
          >
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div key="intro" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 12 }}>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                    <ArrowUpCircle size={48} className="text-emerald-400" />
                  </div>
                  <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight mb-2">Ascension Initiated</h1>
                  <p className="text-sm font-mono text-emerald-400/60">Stats resetting...</p>
                </motion.div>
              )}
              {phase === 'reset' && (
                <motion.div key="reset" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center">
                    <Zap size={48} className="text-orange-400" />
                  </div>
                  <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Stats Reset to Base</h2>
                  <p className="text-sm font-mono text-orange-400/60">All attributes returned to level 10</p>
                </motion.div>
              )}
              {phase === 'reward' && (
                <motion.div key="reward" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -50 }}>
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center">
                    <Trophy size={48} className="text-yellow-400" />
                  </div>
                  <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Ascension #{ascensionData.ascensionCount} Complete</h2>
                  <div className="flex gap-4 justify-center mt-4">
                    <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-[10px] font-display uppercase tracking-wider text-white/30">Multiplier</p>
                      <p className="text-lg font-mono font-bold text-emerald-400">{ascensionData.multiplier.toFixed(2)}x</p>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-[10px] font-display uppercase tracking-wider text-white/30">Bonus</p>
                      <p className="text-lg font-mono font-bold text-yellow-400">{500 * ascensionData.ascensionCount} NC</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dismiss hint */}
          {phase === 'done' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute bottom-12 text-[10px] font-mono text-white/20">
              Click anywhere to dismiss
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AscensionCeremony;
