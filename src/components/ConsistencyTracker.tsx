import React from 'react';
import { motion } from 'motion/react';
import { Flame, RotateCcw, TrendingUp, Activity } from 'lucide-react';
import { ConsistencyData } from '../types';

const ConsistencyTracker: React.FC<{ data: ConsistencyData }> = ({ data }) => {
  const dotColor = (active: boolean) => active
    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    : 'bg-white/10';

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="glass rounded-[32px] p-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
            <Activity size={20} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Trait</span>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Consistency</h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-emerald-400">{data.score}%</div>
          <span className="text-[8px] font-mono text-white/30">7-day score</span>
        </div>
      </div>

      <div className="w-full h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          className={`h-full rounded-full transition-all ${
            data.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
            data.score >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
            'bg-gradient-to-r from-red-500 to-red-400'
          }`}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        {data.last7Days.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[8px] font-mono text-white/30">{dayLabels[i]}</span>
            <div className={`w-3 h-3 rounded-full ${dotColor(active)}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-[8px] font-display uppercase tracking-[0.2em] text-white/30">Run</span>
          </div>
          <span className="text-xl font-mono font-bold text-white">{data.currentRun}</span>
          <span className="text-[9px] text-white/40 font-mono ml-1">days</span>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[8px] font-display uppercase tracking-[0.2em] text-white/30">Best</span>
          </div>
          <span className="text-xl font-mono font-bold text-white">{data.longestRun}</span>
          <span className="text-[9px] text-white/40 font-mono ml-1">days</span>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw size={14} className={data.recoveryCount > 0 ? 'text-blue-400' : 'text-white/30'} />
            <span className="text-[8px] font-display uppercase tracking-[0.2em] text-white/30">Recoveries</span>
          </div>
          <span className="text-xl font-mono font-bold text-white">{data.recoveryCount}</span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
        <span className="text-[9px] font-tech text-emerald-400/80">
          {data.score >= 80 ? "Excellent consistency. You're building identity." :
           data.score >= 50 ? "Good rhythm. Remember: never miss twice." :
           data.graceDaysRemaining > 0 ? `${data.graceDaysRemaining} grace days remaining this week. Use them wisely.` :
           "Every day is a fresh start. One task is enough."}
        </span>
      </div>
    </div>
  );
};

export default ConsistencyTracker;
