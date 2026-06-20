import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Dumbbell, Clock, Cpu, Lightbulb, ArrowRight, Zap, Target } from 'lucide-react';
import { AgentRecommendation, Quest } from '../types';

const AGENT_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  SAGE: Brain, TITAN: Dumbbell, CHRONOS: Clock, MANAGER: Cpu,
};

const CATEGORY_AGENTS: Record<string, string> = {
  fitness: 'TITAN', mental: 'SAGE', emotional: 'MANAGER', habit: 'CHRONOS', social: 'MANAGER',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/25',
  medium: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  low: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Recommended', medium: 'Consider', low: 'Note',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Casual', 2: 'Casual', 3: 'Active', 4: 'Critical', 5: 'Critical',
};

const DIFFICULTY_STYLES: Record<number, string> = {
  1: 'bg-blue-500/20 text-blue-400',
  2: 'bg-blue-500/20 text-blue-400',
  3: 'bg-amber-500/20 text-amber-400',
  4: 'bg-emerald-500/20 text-emerald-400',
  5: 'bg-emerald-500/20 text-emerald-400',
};

const DIFFICULTY_GRADIENTS: Record<number, string> = {
  1: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
  2: 'from-blue-500/10 to-blue-500/5 border-blue-500/15',
  3: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  4: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/25',
  5: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/25',
};

const AgentBriefing: React.FC<{
  recommendations: AgentRecommendation[];
  quests: Quest[];
  onRefresh: () => void;
  onAction: (rec: AgentRecommendation) => void;
}> = ({ recommendations, quests, onRefresh, onAction }) => {
  const activeQuests = quests.filter(q => !q.completed && !q.failed);

  return (
    <div className="glass rounded-[32px] p-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex items-center justify-center">
            <Lightbulb size={20} className="text-purple-400" />
          </div>
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Agent</span>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Daily Briefing</h3>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
          title="Refresh recommendations"
        >
          <Zap size={16} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {recommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
          >
            <span className="text-[10px] font-tech text-white/30">Complete a task to get recommendations</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {recommendations.map((rec) => {
              const Icon = AGENT_ICONS[rec.agent] || Cpu;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${PRIORITY_COLORS[rec.priority]} border`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-white/50" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-display font-bold text-white uppercase tracking-tight">{rec.title}</span>
                          <span className={`text-[7px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            rec.priority === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                            rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {PRIORITY_LABELS[rec.priority]}
                          </span>
                        </div>
                        <p className="text-[9px] font-tech text-white/50 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onAction(rec)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex-shrink-0"
                    >
                      <span className="text-[8px] font-display uppercase tracking-wider">{rec.actionLabel}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {activeQuests.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-white/5" />
            <div className="flex items-center gap-2">
              <Target size={14} className="text-purple-400" />
              <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Active Quests</span>
            </div>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <AnimatePresence>
            {activeQuests.map((quest) => {
              const agent = CATEGORY_AGENTS[quest.category] || 'MANAGER';
              const Icon = AGENT_ICONS[agent] || Cpu;
              const diffStyle = DIFFICULTY_STYLES[quest.difficulty] || 'bg-blue-500/20 text-blue-400';
              const diffGrad = DIFFICULTY_GRADIENTS[quest.difficulty] || DIFFICULTY_GRADIENTS[1];
              const diffLabel = DIFFICULTY_LABELS[quest.difficulty] || 'Casual';
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${diffGrad} border`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-white/50" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-display font-bold text-white uppercase tracking-tight">
                            {quest.bossName ? `${quest.title} — ${quest.bossName}` : quest.title}
                          </span>
                          <span className={`text-[7px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md ${diffStyle}`}>
                            {diffLabel}
                          </span>
                        </div>
                        <p className="text-[9px] font-tech text-white/50 leading-relaxed">
                          {quest.narrative || quest.description}
                          <span className="ml-2 text-emerald-400/70">
                            +{quest.rewardCredits} NC +{quest.rewardExp} XP{quest.rewardStatPoints ? ` +${quest.rewardStatPoints} ${quest.statAffected}` : ''}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AgentBriefing;
