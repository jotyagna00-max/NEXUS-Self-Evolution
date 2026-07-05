import React from 'react';
import { motion } from 'motion/react';
import { Flame, RotateCcw, TrendingUp, Activity, Shield, Moon } from 'lucide-react';
import { ConsistencyData } from '../types';
import { useGame } from '../GameContext';

const ConsistencyTracker: React.FC<{ data: ConsistencyData }> = ({ data }) => {
  const { spendRestToken } = useGame();
  const dotColor = (active: boolean) =>
    active
      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
      : 'bg-white/10';

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Derive a day-of-week letter for each sliding-window entry so the
  // dot grid still shows S/M/T/W/T/F/S even though we're now bucketing
  // by date, not by weekday.
  const dayOfWeekLabel = (iso: string): string => {
    const d = new Date(iso + 'T00:00:00');
    return dayLabels[d.getDay()];
  };

  // R-02 — count the active days of the last 7. `last7Days` is a
  // sliding-window array of {date, completed}, so iterate via .completed.
  const activeCount = data.last7Days.filter(d => d.completed).length;
  const windowAlive = activeCount >= 3;

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

      <div className="w-full h-2 bg-white/5 rounded-full mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          className={`h-full rounded-full transition-all ${
            data.score >= 80
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : data.score >= 50
              ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
              : 'bg-gradient-to-r from-red-500 to-red-400'
          }`}
        />
     </div>

      {/* R-02 — 3-of-7 streak window indicator */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[9px] font-tech text-white/40">
          {windowAlive
            ? `Streak window alive · ${activeCount}/7 active`
            : `Window at risk · ${activeCount}/7 active — log today or spend a token`}
       </span>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            windowAlive ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          <Shield size={10} className={windowAlive ? 'text-emerald-400' : 'text-red-400'} />
          <span
            className={`text-[8px] font-display uppercase tracking-widest ${
              windowAlive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            3-of-7
         </span>
       </div>
     </div>

      <div className="flex items-center justify-between mb-4">
        {data.last7Days.map((entry) => (
          <div key={entry.date} className="flex flex-col items-center gap-1.5">
            <span className="text-[8px] font-mono text-white/30">{dayOfWeekLabel(entry.date)}</span>
            <div className={`w-3 h-3 rounded-full ${dotColor(entry.completed)}`} />
         </div>
        ))}
     </div>

      {/* R-02 — explicit rest-token spend button. Available when graceDaysRemaining > 0. */}
      {data.graceDaysRemaining > 0 && (
        <button
          onClick={() => {
            if (
              window.confirm(
                'Spend a rest token? This will mark today as rest and keep your streak window alive.'
              )
            ) {
              spendRestToken();
            }
          }}
          className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <Moon size={14} className="text-purple-400" />
            <div className="text-left">
              <span className="text-[9px] font-display uppercase tracking-widest text-purple-300 block">
                Spend Rest Token
             </span>
              <span className="text-[8px] font-tech text-white/40">
                Mark today as rest. Streak window stays alive.
             </span>
           </div>
         </div>
          <span className="text-sm font-mono font-bold text-purple-300 group-hover:text-white transition-colors">
            ×{data.graceDaysRemaining}
         </span>
       </button>
      )}

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
            <span className="text-[8px] font-display uppercase tracking-[0.2em] text-white/30">
              Recoveries
           </span>
         </div>
          <span className="text-xl font-mono font-bold text-white">{data.recoveryCount}</span>
       </div>
     </div>

      <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
        <span className="text-[9px] font-tech text-emerald-400/80">
          {data.score >= 80
            ? "Excellent consistency. You're building identity."
            : data.score >= 50
            ? 'Good rhythm. Three of seven keeps the window alive.'
            : data.graceDaysRemaining > 0
            ? `${data.graceDaysRemaining} rest token${
                data.graceDaysRemaining === 1 ? '' : 's'
              } remaining this week. Spend them when you need to recover.`
            : 'Every day is a fresh start. One task is enough.'}
       </span>
     </div>
   </div>
  );
};

export default ConsistencyTracker;
