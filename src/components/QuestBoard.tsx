import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Zap, Flame, Star, Target, ChevronRight, Activity, Swords } from 'lucide-react';
import { useGame } from '../GameContext';

const QuestBoard: React.FC = () => {
  const { quests, tasks, completeQuest, completeTask, credits, progression, streakData, applyPenalty, failTask } = useGame();

  const handleCompleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      completeTask(id);
    }
  };

  const handleSkipTask = (id: string) => {
    failTask(id);
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
            <span className="text-yellow-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(234,179,8,0.6)] block">Operational Objectives</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Quest Board</h2>
          </div>
        </div>

      </div>

      {/* Stats & Streak Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Trophy className={`${rankColor(progression.rank)}`} size={24} />
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Rank</span>
              <div className={`text-2xl font-display font-black ${rankColor(progression.rank)}`}>{progression.rank}</div>
            </div>
          </div>
        </div>

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

      {/* Quests & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Quests Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Swords className="text-yellow-400" size={20} />
              <h2 className="text-lg font-display uppercase tracking-widest text-white">Active Quests</h2>
            </div>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Difficulty Based</span>
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
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[9px] text-yellow-400/60 font-tech">+{quest.rewardCredits} NC</span>
                      <span className="text-[9px] text-emerald-400/60 font-tech">+{quest.rewardExp} EXP</span>
                      {quest.difficulty && (
                        <span className="text-[9px] text-white/30 font-tech">D:{quest.difficulty}/5</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => completeQuest(quest.id)} disabled={quest.completed}
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
                {quest.bossName && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                )}
              </motion.div>
            ))}
            {quests.length === 0 && (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl">
                <Swords size={32} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/20 font-display uppercase tracking-widest text-xs">No active quests detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-400" size={20} />
              <h2 className="text-lg font-display uppercase tracking-widest text-white">Daily Tasks</h2>
            </div>
            <div className="flex items-center gap-2">
              <Flame className={`${streakData.currentStreak > 0 ? 'text-orange-400' : 'text-white/20'}`} size={14} />
              <span className="text-[10px] font-mono text-white/30">{streakData.dailyCompletions}/{streakData.totalDailyTarget}</span>
            </div>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => !t.completed).concat(tasks.filter(t => t.completed)).map((task) => (
              <motion.div key={task.id}
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                  task.completed ? 'bg-blue-500/5 border-blue-500/20 opacity-60' : 'glass border-white/10 hover:bg-white/5'
                }`}>
                <div className="flex items-center gap-4 flex-1" onClick={() => handleCompleteTask(task.id)}>
                  <div className={`p-2 rounded-lg transition-colors ${task.completed ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/20'}`}>
                    {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div>
                    <span className={`text-sm font-tech font-medium tracking-wide ${task.completed ? 'text-blue-300 line-through' : 'text-white/80'}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[8px] text-yellow-400/60 font-tech">+{task.rewardCredits} NC</span>
                      <span className="text-[8px] text-emerald-400/60 font-tech">+{task.rewardExp} EXP</span>
                    </div>
                  </div>
                </div>
                {!task.completed && (
                  <button onClick={() => handleSkipTask(task.id)}
                    className="p-2 rounded-lg text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Circle size={14} />
                  </button>
                )}
              </motion.div>
            ))}
            {tasks.length === 0 && (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-white/20 font-display uppercase tracking-widest text-xs">No daily tasks assigned</p>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
};

export default QuestBoard;
