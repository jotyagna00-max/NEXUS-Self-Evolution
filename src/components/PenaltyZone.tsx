/**
 * PenaltyZone — full-screen lockout when the Operator's streak has collapsed.
 *
 * Triggered when GameContext's `currentMode === 'penalty_zone'`. The
 * Dashboard behind this is unreachable (visually) until the Operator
 * clears ONE of three Survival Protocols. This is by design: in Solo
 * Leveling terms, the desert is what you go through when the daily
 * broke. There is no app-restart escape — the lockout persists across
 * reloads (we save it in localStorage on enter).
 *
 * Why three challenges (not one)?
 *   - 100 squats at 0% recovery is impossible
 *   - 30 minutes of focus when you can't sit still is impossible
 *   - 15-minute cold walk is the lowest-cost "I'm still here" signal
 * Letting the Operator choose picks the *kind* of recovery the body
 * needs most. Three buttons, one exit.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Flame, Timer, Wind, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useGame } from '../GameContext';

interface Challenge {
  id: 'squat' | 'focus' | 'walk';
  title: string;
  subtitle: string;
  duration: string;
  primaryStat: 'strength' | 'intelligence' | 'vitality';
  rewardCredits: number;
  rewardExp: number;
  reward: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'squat',
    title: '100 Squats',
    subtitle: 'Body rent. Any pace. Floor counts as rest.',
    duration: '~6 min',
    primaryStat: 'strength',
    rewardCredits: 80,
    rewardExp: 40,
    reward: '+2 STR · +1 WIL',
    icon: Flame,
  },
  {
    id: 'focus',
    title: '30-min Deep Focus',
    subtitle: 'Phone in another room. One task. Eyes on it.',
    duration: '30:00',
    primaryStat: 'intelligence',
    rewardCredits: 80,
    rewardExp: 60,
    reward: '+3 INT · +1 WIL',
    icon: Timer,
  },
  {
    id: 'walk',
    title: '15-min Cold Walk',
    subtitle: 'Outside. No phone. No music. Just walk.',
    duration: '~15 min',
    primaryStat: 'vitality',
    rewardCredits: 50,
    rewardExp: 30,
    reward: '+2 VIT · +1 WIL',
    icon: Wind,
  },
];

const PenaltyZone: React.FC<{ onSurrender?: () => void }> = ({ onSurrender }) => {
  const { userProfile, penaltyZoneReason, exitPenaltyZone, updateStat, addCredits, addExp, consistency, publishEvent } = useGame();
  const [completedId, setCompletedId] = useState<Challenge['id'] | null>(null);
  const [busy, setBusy] = useState(false);

  const clear = (challenge: Challenge) => {
    if (busy || completedId) return;
    setBusy(true);
    setCompletedId(challenge.id);
    // Apply rewards
    updateStat(challenge.primaryStat, 2);
    addCredits(challenge.rewardCredits);
    addExp(challenge.rewardExp);
    // SOS +2 willpower regardless of which challenge was picked — clearing a
    // penalty zone is itself a willpower event.
    updateStat('willpower', 2);
    publishEvent('stat.increased', {
      stat: challenge.primaryStat,
      delta: 2,
      newValue: (consistency?.score ?? 0),
    });
    publishEvent('rest_token.spent', { remaining: 0 });
    // Brief delay so the success animation reads
    setTimeout(() => {
      exitPenaltyZone();
      setBusy(false);
      setCompletedId(null);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto"
        data-testid="penalty-zone"
      >
        {/* Decorative scanlines / glitch */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(239,68,68,0.06)_2px,rgba(239,68,68,0.06)_4px)] animate-scanline-slow" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15)_0%,transparent_60%)]" />

        <motion.div
          initial={{ scale: 0.94, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center"
              >
                <Skull size={28} className="text-red-400" />
              </motion.div>
              <div>
                <span className="text-[8px] font-display uppercase tracking-[0.4em] text-red-400/80 block">
                  Survival Protocol
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-white">
                  Penalty Zone
                </h1>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-display uppercase tracking-widest text-white/40">Consistency</div>
              <div className="text-2xl font-display font-black text-red-400">{consistency.score}%</div>
            </div>
          </div>

          {/* Warning */}
          <div className="glass rounded-[24px] border border-red-500/30 bg-red-500/5 p-6 mb-8">
            <div className="flex items-start gap-3 mb-2">
              <AlertTriangle size={18} className="text-red-400 mt-0.5" />
              <span className="text-[8px] font-display uppercase tracking-[0.4em] text-red-400/80">
                System Warning
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-1">
              {userProfile.name || 'Operator'}, the daily hasn't held.
            </h2>
            <p className="text-sm font-tech text-white/70 leading-relaxed">
              {penaltyZoneReason || 'Your 7-day consistency has collapsed past the survival threshold. The Shadow grew while you were absent.'}
              <br />
              <span className="text-red-300">Clear one protocol below to regain the Command Center</span>
            </p>
          </div>

          {/* Challenge cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {CHALLENGES.map(c => {
              const isCompleted = completedId === c.id;
              const isOtherCompleted = completedId && completedId !== c.id;
              const Icon = c.icon;
              const statColor: Record<typeof c.primaryStat, string> = {
                strength: 'text-red-400',
                intelligence: 'text-blue-400',
                vitality: 'text-emerald-400',
              };
              return (
                <motion.button
                  key={c.id}
                  onClick={() => clear(c)}
                  disabled={busy || isOtherCompleted}
                  whileHover={!busy && !completedId ? { scale: 1.02 } : undefined}
                  whileTap={!busy && !completedId ? { scale: 0.98 } : undefined}
                  className={`relative text-left glass rounded-[28px] border p-6 transition-all ${
                    isCompleted
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-red-500/30 bg-red-500/[0.03] hover:border-red-500/60 hover:bg-red-500/[0.06] disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon size={22} className={isCompleted ? 'text-emerald-400' : statColor[c.primaryStat]} />
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <span className="text-[8px] font-mono text-white/40 px-2 py-1 rounded-full border border-white/10">
                        {c.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">
                    {c.title}
                  </h3>
                  <p className="text-[11px] font-tech text-white/50 mb-4 leading-relaxed min-h-[2.5em]">
                    {c.subtitle}
                  </p>
                  <div className={`text-[9px] font-display uppercase tracking-widest ${isCompleted ? 'text-emerald-300' : 'text-white/40'}`}>
                    {isCompleted ? '✓ CLEARED' : c.reward}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-mono text-white/30 max-w-md">
              Three challenges. One exit. Each one writes to your stat sheet before unlocking the Command Center.
            </p>
            {completedId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-emerald-400"
              >
                <Loader2 size={14} className="animate-spin" />
                <span className="text-[10px] font-display uppercase tracking-widest">
                  Restoring Command Center…
                </span>
              </motion.div>
            )}
            {!completedId && onSurrender && (
              <button
                onClick={onSurrender}
                className="text-[9px] font-mono text-white/30 hover:text-white/60"
              >
                Close (manual override, no rewards)
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PenaltyZone;