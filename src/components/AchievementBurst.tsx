import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X } from 'lucide-react';

interface BurstData {
  id: string;
  title: string;
  description: string;
  expReward: number;
  creditsReward: number;
}

let burstCallback: ((data: BurstData) => void) | null = null;

export function triggerAchievementBurst(data: BurstData) {
  if (burstCallback) burstCallback(data);
}

const AchievementBurst: React.FC = () => {
  const [burst, setBurst] = useState<BurstData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    burstCallback = (data: BurstData) => {
      setBurst(data);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };
    return () => { burstCallback = null; };
  }, []);

  return (
    <AnimatePresence>
      {visible && burst && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl scale-150" />

            <div className="relative glass rounded-[40px] p-12 border-2 border-emerald-500/40 shadow-[0_0_80px_rgba(16,185,129,0.3)] text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
              >
                <Trophy size={48} className="text-emerald-400" />
              </motion.div>

              <span className="text-[8px] font-display uppercase tracking-[0.5em] text-emerald-400/80 mb-2 block">
                Achievement Unlocked
              </span>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
                {burst.title}
              </h2>
              <p className="text-sm font-tech text-white/50 leading-relaxed mb-6">
                {burst.description}
              </p>

              <div className="flex items-center justify-center gap-6">
                {burst.expReward > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-lg font-mono font-bold text-yellow-400">+{burst.expReward}</span>
                    <span className="text-[8px] font-display uppercase tracking-widest text-yellow-400/60">EXP</span>
                  </div>
                )}
                {burst.creditsReward > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-lg font-mono font-bold text-emerald-400">+{burst.creditsReward}</span>
                    <span className="text-[8px] font-display uppercase tracking-widest text-emerald-400/60">NC</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                x: Math.cos((i / 12) * Math.PI * 2) * 300,
                y: Math.sin((i / 12) * Math.PI * 2) * 300,
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute w-2 h-2 rounded-full bg-emerald-400"
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementBurst;
