import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Plus, X, RotateCcw, Zap, BookOpen, Brain, Dumbbell, Wind, Moon } from 'lucide-react';
import { useGame } from '../GameContext';
import type { StatType } from '../types';

const STAT_ICONS: Record<string, any> = {
  strength: Dumbbell, intelligence: Brain, agility: Wind, vitality: Zap, willpower: Moon, social: BookOpen,
};

const DailyBaseline: React.FC = () => {
  const { dailyBaseline, toggleBaselineMode, toggleBaselineTask, addCustomBaselineTask, removeCustomBaselineTask, resetDailyBaseline } = useGame();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', statAffected: 'strength' as StatType, targetReps: 10 });

  const tasks = dailyBaseline.mode === 'fixed' ? dailyBaseline.fixedTasks : dailyBaseline.customTasks;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addCustomBaselineTask(newTask);
    setNewTask({ title: '', description: '', statAffected: 'strength', targetReps: 10 });
    setShowAddTask(false);
  };

  return (
    <div className="glass rounded-[32px] p-8 border border-white/10 relative overflow-hidden">
      {isComplete && (
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${isComplete ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'}`}>
            <Target size={20} className={isComplete ? 'text-emerald-400' : 'text-white/40'} />
          </div>
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Solo Leveling</span>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Daily Baseline</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDailyBaseline}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Reset today's progress"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={toggleBaselineMode}
            className={`px-4 py-2 rounded-xl text-[9px] font-display uppercase tracking-widest border transition-all ${
              dailyBaseline.mode === 'fixed'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            {dailyBaseline.mode === 'fixed' ? '🔒 Fixed Mode' : '✏️ Custom Mode'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-white/30'}`}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-tech text-white/40">
          {completedCount}/{totalCount} completed today
        </span>
        {isComplete && (
          <span className="text-[9px] font-display uppercase tracking-widest text-emerald-400">
            ✓ Baseline Complete
          </span>
        )}
      </div>

      {/* Task list */}
      <div className="space-y-2 mb-4">
        {tasks.map((task) => {
          const Icon = STAT_ICONS[task.statAffected] || Target;
          return (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                task.completed
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
              onClick={() => toggleBaselineTask(task.id)}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                task.completed ? 'bg-emerald-500 border-emerald-400' : 'bg-white/5 border-white/10'
              }`}>
                {task.completed && <span className="text-black text-xs">✓</span>}
              </div>
              <Icon size={14} className={task.completed ? 'text-emerald-400' : 'text-white/30'} />
              <div className="flex-1 min-w-0">
                <span className={`text-[11px] font-tech block ${task.completed ? 'text-emerald-300 line-through opacity-60' : 'text-white/70'}`}>
                  {task.title}
                </span>
                {task.description && (
                  <span className="text-[8px] text-white/25 font-tech block truncate">{task.description}</span>
                )}
              </div>
              {task.targetReps && (
                <span className="text-[9px] font-mono text-white/30">{task.targetReps}×</span>
              )}
              {task.targetMinutes && (
                <span className="text-[9px] font-mono text-white/30">{task.targetMinutes}m</span>
              )}
              {dailyBaseline.mode === 'custom' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeCustomBaselineTask(task.id); }}
                  className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <X size={12} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add task button (custom mode only) */}
      {dailyBaseline.mode === 'custom' && (
        <>
          {!showAddTask ? (
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full p-3 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-[10px] font-display uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add Custom Task
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <input
                value={newTask.title}
                onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task name"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
              />
              <input
                value={newTask.description}
                onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
              />
              <div className="flex gap-2">
                <select
                  value={newTask.statAffected}
                  onChange={e => setNewTask(prev => ({ ...prev, statAffected: e.target.value as StatType }))}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
                >
                  {(['strength', 'intelligence', 'agility', 'vitality', 'willpower', 'social'] as const).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newTask.targetReps || ''}
                  onChange={e => setNewTask(prev => ({ ...prev, targetReps: parseInt(e.target.value) || undefined }))}
                  placeholder="Reps"
                  className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddTask} className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-display uppercase tracking-widest hover:bg-emerald-500/30 transition-all">
                  Add
                </button>
                <button onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-xl text-[10px] font-display uppercase tracking-widest hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mode description */}
      <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
        <span className="text-[9px] font-tech text-emerald-400/80">
          {dailyBaseline.mode === 'fixed'
            ? "Fixed mode: Complete all 6 tasks daily. No shortcuts. This is your baseline."
            : "Custom mode: Define your own daily baseline. Add tasks that matter to you."}
        </span>
      </div>
    </div>
  );
};

export default DailyBaseline;