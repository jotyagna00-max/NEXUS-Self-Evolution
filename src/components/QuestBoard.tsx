import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Zap, Flame, Star, Target, ChevronRight, Swords, BookOpen, Dumbbell, Sparkles, Lock, AlertTriangle } from 'lucide-react';
import { useGame } from '../GameContext';
import { canCompleteQuest, needsProof } from '../utils/questEngine';

const lineageIcons: Record<string, { icon: React.FC<any>; color: string; bg: string }> = {
  protocol: { icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  book: { icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  habit: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  addiction: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
};

function TimeLockBadge({ quest }: { quest: any }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!quest.createdAt || !quest.minDurationMinutes) { setRemaining(null); return; }
    const update = () => {
      const check = canCompleteQuest(quest);
      if (!check.allowed && check.remainingMinutes !== undefined) {
        setRemaining(check.remainingMinutes);
      } else {
        setRemaining(null);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [quest]);

  if (remaining === null || remaining <= 0) return null;

  const hours = Math.floor(remaining / 60);
  const mins = remaining % 60;
  const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400/80">
      <Lock size={10} />
      <span className="text-[8px] font-mono uppercase tracking-wider">{display}</span>
    </div>
  );
}

const QuestBoard: React.FC = () => {
  const { quests, completeQuest, credits, progression, streakData, applyPenalty } = useGame();

  const [confirmQuest, setConfirmQuest] = useState<any | null>(null);
  const [proofText, setProofText] = useState('');
  const [error, setError] = useState('');
  const [showProofInput, setShowProofInput] = useState(false);

  const handleCompleteQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    const check = canCompleteQuest(quest);
    if (!check.allowed) {
      setError(`Time lock active. ${check.remainingMinutes} min remaining.`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setShowProofInput(needsProof(quest));
    setProofText('');
    setError('');
    setConfirmQuest(quest);
  };

  const confirmQuestComplete = async () => {
    if (!confirmQuest) return;
    if (showProofInput && proofText.trim().length < 10) {
      setError('Write at least 10 characters about what you did.');
      return;
    }
    const result = await completeQuest(confirmQuest.id, showProofInput ? proofText.trim() : undefined);
    if (result && result.error) {
      setError(result.error);
      if (result.needsProof) setShowProofInput(true);
    } else {
      setConfirmQuest(null);
      setShowProofInput(false);
      setProofText('');
    }
  };

  const rankColor = (rank: string) => {
    const colors: Record<string, string> = { 'E': 'text-gray-400', 'D': 'text-green-400', 'C': 'text-blue-400', 'B': 'text-purple-400', 'A': 'text-yellow-400', 'S': 'text-red-400', 'SS': 'text-pink-400', 'SSS': 'text-amber-400' };
    return colors[rank] || 'text-white';
  };

  const expPercentage = (progression.exp / progression.expToNextLevel) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/5 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Swords className="text-yellow-400 relative z-10" size={44} />
          </div>
          <div className="space-y-1">
            <span className="text-yellow-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(234,179,8,0.6)] block">Your Objectives</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Quest Board</h2>
          </div>
        </div>

      </div>

      {/* Stats & Streak Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Star className="text-yellow-400" size={24} />
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Level</span>
              <div className="text-2xl font-display font-black text-white">{progression.level}</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${expPercentage}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" />
          </div>
          <div className="flex justify-between mt-1 text-[8px] text-white/20 font-mono">
            <span>{progression.exp} EXP</span>
            <span>{progression.expToNextLevel} EXP</span>
          </div>
        </div>

        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Flame className={`${streakData.currentStreak > 0 ? 'text-orange-400' : 'text-white/20'}`} size={24} />
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Streak</span>
              <div className="text-2xl font-display font-black text-white">{streakData.currentStreak} <span className="text-xs text-white/40 font-tech">days</span></div>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-white/30 font-tech">
            Best: {streakData.longestStreak} days
          </div>
        </div>

        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400" size={24} />
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Credits</span>
              <div className="text-2xl font-display font-black text-yellow-400">{credits} <span className="text-xs text-white/40 font-tech">NC</span></div>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-white/30 font-tech">
            Stat Points: {progression.statPoints}
          </div>
        </div>
      </div>

      {/* Quests — full width, no daily tasks section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Swords className="text-yellow-400" size={20} />
            <h2 className="text-lg font-display uppercase tracking-widest text-white">Active Quests</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{quests.filter(q => !q.completed && !q.failed).length} active</span>
            <div className="flex items-center gap-2">
              <Flame className={`${streakData.currentStreak > 0 ? 'text-orange-400' : 'text-white/20'}`} size={14} />
              <span className="text-[10px] font-mono text-white/30">{streakData.currentStreak}d streak</span>
            </div>
          </div>
        </div>
          <div className="space-y-4">
            {quests.map((quest) => (
              <motion.div key={quest.id} whileHover={{ x: 4 }}
                className={`group p-6 rounded-[24px] border transition-all relative overflow-hidden ${
                  quest.completed ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'glass border-white/10 hover:border-white/30'
                }`}>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl font-display font-bold tracking-tight ${quest.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                        {quest.title}
                      </h3>
                      {quest.narrative && (
                        <span className="text-[8px] text-purple-400/60 font-display uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">
                          Story
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 font-tech leading-relaxed">{quest.description}</p>
                    {/* v1.4.0 — Lineage chip: "Generated from: <protocol title>" */}
                    {quest.sourceType && quest.lineageLabel && (() => {
                      const lc = lineageIcons[quest.sourceType];
                      if (!lc) return null;
                      const LIcon = lc.icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded border text-[8px] font-display uppercase tracking-widest ${lc.bg} ${lc.color}`}>
                          <LIcon size={10} />
                          {quest.lineageLabel}
                        </span>
                      );
                    })()}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[9px] text-yellow-400/60 font-tech">+{quest.rewardCredits} NC</span>
                      <span className="text-[9px] text-emerald-400/60 font-tech">+{quest.rewardExp} EXP</span>
                      {quest.difficulty && (
                        <span className="text-[9px] text-white/30 font-tech">D:{quest.difficulty}/5</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCompleteQuest(quest.id)} disabled={quest.completed}
                      className={`p-3 rounded-xl transition-all ${
                        quest.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'
                      }`}>
                      {quest.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    {!quest.completed && (
                      <button onClick={() => {
                        applyPenalty('failed', `Skipped quest: ${quest.title}`, Math.floor(quest.rewardCredits * 0.3));
                      }} className="p-2 rounded-xl bg-white/5 text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Circle size={16} />
                      </button>
                    )}
                  </div>
                </div>
                {!quest.completed && (
                  <div className="flex items-center gap-2 mt-3">
                    <TimeLockBadge quest={quest} />
                    {needsProof(quest) && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400/80">
                        <AlertTriangle size={10} />
                        <span className="text-[8px] font-mono uppercase tracking-wider">Proof Required</span>
                      </div>
                    )}
                  </div>
                )}
                {quest.bossName && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                )}
              </motion.div>
            ))}
            {quests.length === 0 && (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl">
                <Swords size={32} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/20 font-display uppercase tracking-widest text-xs">No active quests</p>
                <p className="text-white/10 font-tech text-[10px] mt-2">Add protocols or habits to generate quests</p>
              </div>
            )}
          </div>
        </div>

      {/* Streak Rewards Preview */}
      {streakData.currentStreak > 0 && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="text-orange-400" size={20} />
            <span className="text-sm font-display text-white uppercase tracking-widest">Streak Progress</span>
          </div>
          <div className="flex items-center gap-2">
            {[3, 7, 30, 100].map((day) => (
              <div key={day} className={`flex-1 p-3 rounded-xl border text-center ${
                streakData.currentStreak >= day
                  ? 'bg-orange-500/20 border-orange-500/40'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}>
                <span className="text-[10px] font-display text-white/60">{day}d</span>
                <div className="text-[9px] text-yellow-400 font-tech mt-1">
                  {day === 3 ? '+50 NC' : day === 7 ? '+200 NC' : day === 30 ? '+1000 NC' : '+2500 NC'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-mono backdrop-blur-xl">
          {error}
        </div>
      )}

      <AnimatePresence>
        {confirmQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setConfirmQuest(null); setShowProofInput(false); setProofText(''); setError(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-[32px] border border-white/10 w-full max-w-md p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Confirm Completion</h3>
                  <p className="text-[10px] font-mono text-white/40">{confirmQuest.title}</p>
                </div>
              </div>

              <p className="text-[11px] font-tech text-white/60 leading-relaxed mb-4">
                Did you actually complete this quest? This will be permanently logged. False completions undermine your own evolution.
              </p>

              {showProofInput && (
                <div className="mb-4">
                  <label className="text-[9px] font-display uppercase tracking-widest text-white/40 mb-2 block">
                    Write what you did (min 10 chars)
                  </label>
                  <textarea
                    value={proofText}
                    onChange={e => setProofText(e.target.value)}
                    placeholder="Describe what you actually did to complete this quest..."
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 resize-none h-20"
                    maxLength={300}
                  />
                </div>
              )}

              {error && (
                <p className="text-[10px] font-mono text-red-400 mb-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setConfirmQuest(null); setShowProofInput(false); setProofText(''); setError(''); }}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-[10px] font-display uppercase tracking-widest">
                  Cancel
                </button>
                <button onClick={confirmQuestComplete}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-black font-display font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestBoard;
