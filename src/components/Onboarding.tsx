/**
 * Onboarding — the "Awakening" calibration gate.
 *
 * Sits over the existing InitialAssessment to add a cinematic + 3 calibration questions:
 *
 *   QUERY 1 — callsign (drives agent personalization)
 *   QUERY 2 — tone of honesty (drives Shadow voice)
 *   QUERY 3 — what would you lose (drives Penalty Zone narrative)
 *
 * The physical/cognitive baseline math is unchanged — it still runs in
 * InitialAssessment. Calibration answers are persisted to localStorage
 * under `nexus_calibration_v1`.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../GameContext';
import InitialAssessment from './InitialAssessment';

export type Tone = 'gentle' | 'direct' | 'brutal';

export interface CalibrationAnswers {
  callsign: string;
  tone: Tone;
  whatWouldYouLose: string;
}

const STORAGE_KEY = 'nexus_calibration_v1';

const readCalibration = (): CalibrationAnswers | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCalibration = (a: CalibrationAnswers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
};

export const getCalibration = (): CalibrationAnswers => {
  return readCalibration() || { callsign: 'Operator', tone: 'direct', whatWouldYouLose: '' };
};

type Stage = 'boot' | 'callsign' | 'tone' | 'loss';

const SystemAwakening: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [stage, setStage] = useState<Stage>('boot');
  const [callsign, setCallsign] = useState('');
  const [tone, setTone] = useState<Tone>('direct');
  const [whatWouldYouLose, setWhatWouldYouLose] = useState('');
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootReady(true), 2400);
    return () => clearTimeout(t);
  }, []);

  const finish = () => {
    writeCalibration({
      callsign: callsign.trim() || 'Operator',
      tone,
      whatWouldYouLose,
    });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center overflow-y-auto p-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_55%)]" />

      <AnimatePresence mode="wait">
        {stage === 'boot' && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, ease: [0.83, 0, 0.17, 1] }}
              className="h-px w-48 bg-emerald-500 mb-12 origin-left"
            />
<motion.span
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6, duration: 0.5 }}
               className="text-[10px] font-mono tracking-[0.4em] uppercase text-emerald-400 mb-4"
             >
               [INITIALIZING...]
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-white"
            >
              You have been selected.
           </motion.h1>
<motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.8, duration: 0.5 }}
               className="text-[11px] font-tech text-white/40 mt-6 max-w-md"
             >
               Before we begin, we need to calibrate to you.
               <br />
               Answer honestly. We'll know if you're not.
            </motion.p>
            {bootReady && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStage('callsign')}
                className="mt-10 px-8 py-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-display uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-500/20 transition-all"
              >
                [ BEGIN CALIBRATION ]
             </motion.button>
            )}
         </motion.div>
        )}

        {stage === 'callsign' && (
          <motion.div
            key="callsign"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-lg w-full"
          >
            <span className="text-[8px] font-mono tracking-[0.4em] uppercase text-emerald-400 block">QUERY #1</span>
            <h2 className="text-2xl font-display font-black uppercase text-white mt-3 mb-1">
              What should we call you?
           </h2>
            <p className="text-[10px] font-tech text-white/40 mb-6">
              This will be how the agents address you. Choose a name that means something.
           </p>
            <input
              autoFocus
              value={callsign}
              onChange={e => setCallsign(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && callsign.trim()) setStage('tone');
              }}
              placeholder="callsign"
              className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-base font-mono text-white focus:outline-none focus:border-emerald-500/50"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setStage('tone')}
                disabled={!callsign.trim()}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black font-display uppercase tracking-widest text-[10px]"
              >
                Next →
             </button>
           </div>
         </motion.div>
        )}

        {stage === 'tone' && (
          <motion.div
            key="tone"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-2xl w-full"
          >
            <span className="text-[8px] font-mono tracking-[0.4em] uppercase text-emerald-400 block">QUERY #2</span>
            <h2 className="text-2xl font-display font-black uppercase text-white mt-3 mb-1">
              How honest should we be?
           </h2>
            <p className="text-[10px] font-tech text-white/40 mb-6">
              This dials the Shadow&apos;s voice. You can change it anytime in Settings, but it&apos;s easier to pick now.
           </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { id: 'gentle' as Tone, label: 'Gentle', blurb: 'Encouragement over challenge. Shadows stay quiet.' },
                { id: 'direct' as Tone, label: 'Direct', blurb: 'Honest but kind. The default.' },
                { id: 'brutal' as Tone, label: 'Brutal', blurb: 'Quotes your own failures back. Use with care.' },
              ]).map(o => {
                const selected = tone === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setTone(o.id)}
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      selected
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    <span
                      className={`block text-[10px] font-display uppercase tracking-widest mb-1 ${
                        selected ? 'text-emerald-300' : 'text-white/70'
                      }`}
                    >
                      {o.label}
                   </span>
                    <span className="block text-[10px] font-tech text-white/40 leading-relaxed">{o.blurb}</span>
                 </button>
                );
              })}
           </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStage('callsign')} className="px-4 py-2 text-[10px] font-display uppercase tracking-widest text-white/40">
                ← Back
             </button>
              <button onClick={() => setStage('loss')} className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-display uppercase tracking-widest text-[10px]">
                Next →
             </button>
           </div>
         </motion.div>
        )}

        {stage === 'loss' && (
          <motion.div
            key="loss"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-xl w-full"
          >
            <span className="text-[8px] font-mono tracking-[0.4em] uppercase text-emerald-400 block">QUERY #3 — FINAL</span>
            <h2 className="text-2xl font-display font-black uppercase text-white mt-3 mb-1">
              What would you lose if you quit?
           </h2>
            <p className="text-[10px] font-tech text-white/40 mb-6">
              One sentence. We won&apos;t forget it. Your future self will read it during Penalty Zone.
           </p>
            <textarea
              autoFocus
              value={whatWouldYouLose}
              onChange={e => setWhatWouldYouLose(e.target.value)}
              rows={3}
              placeholder="The feeling that I could become more than I currently am."
              className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-sm font-tech text-white focus:outline-none focus:border-emerald-500/50 resize-none"
            />
            <div className="flex justify-between mt-5">
              <button onClick={() => setStage('tone')} className="px-4 py-2 text-[10px] font-display uppercase tracking-widest text-white/40">
                ← Back
             </button>
              <button
                onClick={finish}
                disabled={!whatWouldYouLose.trim()}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black font-display uppercase tracking-widest text-[10px]"
              >
                Begin
             </button>
           </div>
         </motion.div>
        )}
     </AnimatePresence>
   </div>
  );
};

/**
 * Top-level Onboarding gate.
 *
 * If `hasCompletedAssessment === false`:
 *   1. Play the System Awakening (3 calibration queries).
 *   2. Hand off to InitialAssessment for the actual stat math.
 *
 * Otherwise, render children normally.
 */
const Onboarding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasCompletedAssessment } = useGame();
  const [phase, setPhase] = useState<'awakening' | 'baseline' | 'done' | null>(null);

  useEffect(() => {
    const existing = readCalibration();
    if (!existing && !hasCompletedAssessment) {
      setPhase('awakening');
    } else if (!hasCompletedAssessment) {
      // Calibration exists but baseline math didn't finish → fill the
      // baseline without forcing another awakening run.
      setPhase('baseline');
    } else {
      // Returning user: ensure calibration exists at all for backward
      // compatibility.
      if (!existing) {
        writeCalibration({ callsign: 'Operator', tone: 'direct', whatWouldYouLose: '' });
      }
      setPhase('done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'awakening') {
    return <SystemAwakening onDone={() => setPhase('baseline')} />;
  }

  if (phase === 'baseline') {
    // InitialAssessment calls onComplete() after `completeAssessment` runs.
    // We rely on it setting `hasCompletedAssessment=true` for the gate to drop.
    return (
      <InitialAssessmentWithHook
        onComplete={() => setPhase('done')}
      />
    );
  }

  return <>{children}</>;
};

/**
 * The existing InitialAssessment component manages its own UI and only
 * invokes `completeAssessment` from context. We can't pass an onComplete
 * directly without changing its API. Instead, observe `hasCompletedAssessment`
 * via a small sibling that mirrors the prop.
 */
const InitialAssessmentWithHook: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { hasCompletedAssessment } = useGame();
  useEffect(() => {
    if (hasCompletedAssessment) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedAssessment]);
  return <InitialAssessment />;
};

export default Onboarding;
