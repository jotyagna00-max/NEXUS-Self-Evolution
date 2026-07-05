import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity, Brain, Dumbbell, Clock, MessageCircle, Award,
  Monitor, Package, GitCommit, BookOpen, Settings, Sparkles, Shield
} from 'lucide-react';
import { useGame } from '../GameContext';

interface AgentStatus {
  id: string;
  name: string;
  icon: any;
  color: string;
  status: string;
  task: string;
  details: string;
}

const AgentDashboard: React.FC = () => {
  const { stats, userProfile, credits, progression, streakData, habits, getAgentMotivation, getQuestGeneratorStatus } = useGame();
  const [motivation, setMotivation] = useState<string | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  useEffect(() => {
    loadMotivation();
  }, []);

  const loadMotivation = async () => {
    setLoadingMotivation(true);
    try {
      const msg = await getAgentMotivation();
      setMotivation(msg);
    } catch {
      setMotivation(null);
    } finally {
      setLoadingMotivation(false);
    }
  };

  const totalStats = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);
  const activeHabits = habits.filter(h => !h.isAddiction).length;
  const addictions = habits.filter(h => h.isAddiction).length;
  const questGenStatus = getQuestGeneratorStatus();

  const agents: AgentStatus[] = [
    {
      id: 'manager', name: 'MANAGER',
      icon: Sparkles, color: 'text-emerald-400',
      status: 'Online',
      task: 'Coordination',
      details: `Welcome back, ${userProfile.name || 'there'}. ${totalStats > 300 ? 'All systems running strong.' : 'Building momentum.'}`
    },
    {
      id: 'sage', name: 'SAGE',
      icon: Brain, color: 'text-blue-400',
      status: stats.intelligence > 30 ? 'Active' : 'Monitoring',
      task: 'Cognitive',
      details: `Intelligence: ${stats.intelligence}. ${stats.intelligence > 50 ? 'Sharp mind.' : 'Growing steadily.'}`
    },
    {
      id: 'titan', name: 'TITAN',
      icon: Dumbbell, color: 'text-red-400',
      status: stats.strength > 30 ? 'Active' : 'Standby',
      task: 'Physical',
      details: `Strength: ${stats.strength}. ${stats.strength > 50 ? 'Solid foundation.' : 'Building base.'}`
    },
    {
      id: 'chronos', name: 'CHRONOS',
      icon: Clock, color: 'text-yellow-400',
      status: streakData.currentStreak > 3 ? 'Active' : 'Standby',
      task: 'Temporal',
      details: `Streak: ${streakData.currentStreak}d. ${streakData.currentStreak > 7 ? 'Rhythm locked.' : 'Building consistency.'}`
    },
    {
      id: 'questGenerator', name: 'QUESTS',
      icon: Activity, color: 'text-purple-400',
      status: questGenStatus,
      task: 'Generation',
      details: `Level ${progression.level} · Rank ${progression.rank} · ${totalStats} total points.`
    },
    {
      id: 'statsMonitor', name: 'STATS',
      icon: Monitor, color: 'text-green-400',
      status: 'Analyzing',
      task: 'Analytics',
      details: `Level ${progression.level} · ${progression.exp}/${progression.expToNextLevel} XP to next.`
    },
    {
      id: 'progressTracker', name: 'PROGRESS',
      icon: GitCommit, color: 'text-gray-400',
      status: 'Tracking',
      task: 'History',
      details: `Best streak: ${streakData.longestStreak}d · Habits: ${habits.length}`
    },
    {
      id: 'notifier', name: 'NOTIFIER',
      icon: MessageCircle, color: 'text-pink-400',
      status: 'Online',
      task: 'Alerts',
      details: `${activeHabits} active habits · ${addictions} in recovery`
    },
    {
      id: 'motivator', name: 'MOTIVATOR',
      icon: Award, color: 'text-orange-400',
      status: motivation ? 'Ready' : 'Standby',
      task: 'Support',
      details: motivation ? 'Last insight loaded.' : 'Awaiting data...'
    },
    {
      id: 'bookMastery', name: 'BOOKS',
      icon: BookOpen, color: 'text-amber-700',
      status: 'Ready',
      task: 'Reading',
      details: `${stats.intelligence} INT · Knowledge compounds.`
    },
    {
      id: 'rewardPenalty', name: 'REWARDS',
      icon: Settings, color: 'text-gray-500',
      status: 'Balancing',
      task: 'Incentives',
      details: `${credits} NC available · Circuits active.`
    },
  ];

  return (
    <div className="space-y-6">
      {motivation && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 flex items-start gap-4">
          <Sparkles size={20} className="text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-mono text-emerald-300/80 leading-relaxed">{motivation}</p>
          </div>
          <button onClick={loadMotivation} disabled={loadingMotivation}
            className="text-[9px] text-emerald-400/50 hover:text-emerald-400 font-display uppercase tracking-widest shrink-0">
            {loadingMotivation ? '...' : 'Refresh'}
          </button>
        </motion.div>
      )}

      <div className="p-6 bg-black/60 rounded-[40px] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display uppercase tracking-[0.3em] text-white">Agent Network</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-widest">All Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <motion.div key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${agent.color}/20 ${agent.color} flex items-center justify-center`}>
                    <agent.icon size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[8px] font-display uppercase tracking-[0.2em] ${agent.color}`}>{agent.name}</span>
                    <span className="text-[9px] font-mono text-white/40">{agent.task}</span>
                  </div>
                </div>
                <div className={`text-[8px] font-mono ${
                  agent.status === 'Online' || agent.status === 'Active' || agent.status === 'Ready'
                    ? 'text-emerald-400/50' : 'text-white/20'
                }`}>{agent.status}</div>
              </div>

              <p className="text-[9px] text-white/60 leading-relaxed font-mono">{agent.details}</p>

              <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
                     style={{ width: agent.status === 'Online' || agent.status === 'Active' ? '85%' : '40%' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-black/60 rounded-[40px] border border-white/10">
        <h2 className="text-sm font-display uppercase tracking-[0.3em] text-white mb-4">Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-[9px] font-mono text-white/40">
          <div><span className="font-display">Active Agents:</span><span className="ml-2">{agents.filter(a => a.status !== 'Standby' && a.status !== 'Offline').length}/{agents.length}</span></div>
          <div><span className="font-display">Load:</span><span className="ml-2 text-emerald-400">Optimal</span></div>
          <div><span className="font-display">Sync:</span><span className="ml-2 text-emerald-400">{totalStats > 200 ? '98%' : '87%'}</span></div>
          <div><span className="font-display">Response:</span><span className="ml-2 text-emerald-400">{habits.length > 0 ? '12ms' : '8ms'}</span></div>
          <div><span className="font-display">Total Stats:</span><span className="ml-2 text-emerald-400">{totalStats}</span></div>
          <div><span className="font-display">Streak:</span><span className="ml-2 text-emerald-400">{streakData.currentStreak}d</span></div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
