import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Check, Flame, AlertTriangle, Brain, Dumbbell, Moon, Users, Target, Activity, TrendingUp, BookOpen } from 'lucide-react';
import { useGame } from '../GameContext';
import { Habit } from '../types';

const categoryIcons: Record<string, any> = { mental: Brain, physical: Dumbbell, willpower: Moon, social: Users };
const categoryColors: Record<string, string> = { mental: 'text-blue-400', physical: 'text-red-400', willpower: 'text-purple-400', social: 'text-green-400' };

const HabitLab: React.FC = () => {
  const { habits, addHabit, completeMicroQuest, recordRelapse, removeHabit, credits, addCredits } = useGame();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', description: '', type: 'build' as 'build' | 'destroy', category: 'mental' as string, weeklyTarget: 5, isAddiction: false });

  const goodHabits = habits.filter(h => !h.isAddiction);
  const addictions = habits.filter(h => h.isAddiction);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    addHabit({
      title: newHabit.title,
      description: newHabit.description,
      type: newHabit.type,
      category: newHabit.category as any,
      weeklyTarget: newHabit.weeklyTarget,
      isAddiction: newHabit.isAddiction || newHabit.type === 'destroy',
      microQuests: generateDefaultMicroQuests(newHabit.title, newHabit.category as any, newHabit.type === 'destroy'),
    });
    setNewHabit({ title: '', description: '', type: 'build', category: 'mental', weeklyTarget: 5, isAddiction: false });
    setIsAdding(false);
  };

  const generateDefaultMicroQuests = (title: string, category: string, isAddiction: boolean): any[] => {
    const base = [
      { id: Date.now().toString() + '_1', habitId: 'pending', title: `Practice ${title} (5 min)`, description: `Minimum viable effort for ${title}`, completed: false, difficulty: 1, ncReward: 5, expReward: 10, createdAt: new Date().toISOString() },
      { id: Date.now().toString() + '_2', habitId: 'pending', title: `Focused ${title} session (15 min)`, description: `Deeper engagement with ${title}`, completed: false, difficulty: 2, ncReward: 10, expReward: 15, createdAt: new Date().toISOString() },
      { id: Date.now().toString() + '_3', habitId: 'pending', title: `Master ${title} challenge (30 min)`, description: `Extended session mastering ${title}`, completed: false, difficulty: 3, ncReward: 15, expReward: 25, createdAt: new Date().toISOString() },
    ];
    if (isAddiction) {
      return [
        { id: Date.now().toString() + '_1', habitId: 'pending', title: `Resist ${title} (1 hour)`, description: `Successfully resisted the urge for ${title}`, completed: false, difficulty: 3, ncReward: 15, expReward: 20, createdAt: new Date().toISOString() },
        { id: Date.now().toString() + '_2', habitId: 'pending', title: `Replacement activity for ${title}`, description: `Engage in a healthier alternative instead of ${title}`, completed: false, difficulty: 2, ncReward: 20, expReward: 25, createdAt: new Date().toISOString() },
        { id: Date.now().toString() + '_3', habitId: 'pending', title: `Reflection on ${title} triggers`, description: `Journal about what triggers the urge and how to manage it`, completed: false, difficulty: 1, ncReward: 10, expReward: 15, createdAt: new Date().toISOString() },
      ];
    }
    return base;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/5 flex items-center justify-center border border-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Activity className="text-amber-400 relative z-10" size={44} />
          </div>
          <div className="space-y-1">
            <span className="text-amber-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(251,191,36,0.6)] block">Behavior Engineering</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Habit Lab</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">Credits: {credits} NC</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-display text-xs uppercase tracking-widest transition-all group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Add {isAdding && newHabit.isAddiction ? 'Addiction' : 'Habit'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Activity className="text-emerald-400" size={24} />
            <div><span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Active Habits</span>
              <div className="text-2xl font-display font-black text-white">{goodHabits.length}</div></div>
          </div>
        </div>
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={24} />
            <div><span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Addictions</span>
              <div className="text-2xl font-display font-black text-white">{addictions.length}</div></div>
          </div>
        </div>
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-400" size={24} />
            <div><span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Best Streak</span>
              <div className="text-2xl font-display font-black text-white">
                {Math.max(...habits.map(h => h.longestStreak), 0)}
              </div></div>
          </div>
        </div>
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3">
            <Target className="text-yellow-400" size={24} />
            <div><span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Total Micro-Quests</span>
              <div className="text-2xl font-display font-black text-white">
                {habits.reduce((sum, h) => sum + h.microQuests.filter(q => q.completed).length, 0)}
              </div></div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="hologram-card p-10 rounded-[40px] border-2 border-amber-500/30 mb-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">
                  {newHabit.isAddiction ? 'Track Addiction' : 'New Habit'}
                </h3>
                <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">
                      {newHabit.isAddiction ? 'Addiction Name' : 'Habit Name'}
                    </label>
                    <input required value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all"
                      placeholder={newHabit.isAddiction ? "e.g. Social Media Doomscrolling" : "e.g. Daily Reading"} />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Description</label>
                    <textarea value={newHabit.description} onChange={e => setNewHabit({...newHabit, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all h-24 resize-none"
                      placeholder="Describe what this involves..." />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Category</label>
                      <select value={newHabit.category} onChange={e => setNewHabit({...newHabit, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all">
                        <option value="mental">Mental</option>
                        <option value="physical">Physical</option>
                        <option value="willpower">Willpower</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Type</label>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setNewHabit({...newHabit, type: 'build', isAddiction: false })}
                          className={`flex-1 py-4 rounded-xl border text-xs font-display uppercase tracking-widest transition-all ${
                            !newHabit.isAddiction ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
                          }`}>Build</button>
                        <button type="button" onClick={() => setNewHabit({...newHabit, type: 'destroy', isAddiction: true })}
                          className={`flex-1 py-4 rounded-xl border text-xs font-display uppercase tracking-widest transition-all ${
                            newHabit.isAddiction ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/40'
                          }`}>Destroy</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Weekly Target: {newHabit.weeklyTarget}x</label>
                    <input type="range" min="1" max="7" value={newHabit.weeklyTarget} onChange={e => setNewHabit({...newHabit, weeklyTarget: parseInt(e.target.value)})} className="w-full accent-amber-500" />
                  </div>
                  <button type="submit"
                    className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-display font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                    {newHabit.isAddiction ? 'Track Addiction' : 'Add Habit'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Good Habits Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-emerald-400" size={20} />
          <h2 className="text-lg font-display uppercase tracking-widest text-white">Active Habits</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goodHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit}
              onCompleteQuest={completeMicroQuest} onRemove={removeHabit} />
          ))}
          {goodHabits.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl">
              <Activity size={40} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/20 font-display uppercase tracking-widest text-xs">No habits tracked yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Addictions Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-400" size={20} />
          <h2 className="text-lg font-display uppercase tracking-widest text-white">Addictions to Destroy</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {addictions.map((addiction) => (
            <HabitCard key={addiction.id} habit={addiction} isAddiction
              onCompleteQuest={completeMicroQuest}
              onRelapse={recordRelapse} onRemove={removeHabit} />
          ))}
          {addictions.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl">
              <AlertTriangle size={40} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/20 font-display uppercase tracking-widest text-xs">No addictions tracked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HabitCard: React.FC<{
  habit: Habit; isAddiction?: boolean;
  onCompleteQuest: (habitId: string, questId: string) => void;
  onRelapse?: (habitId: string) => void;
  onRemove: (id: string) => void;
}> = ({ habit, isAddiction, onCompleteQuest, onRelapse, onRemove }) => {
  const Icon = categoryIcons[habit.category] || Brain;
  const color = categoryColors[habit.category] || 'text-blue-400';
  const completedQuestCount = habit.microQuests.filter(q => q.completed).length;
  const totalQuestCount = habit.microQuests.length;

  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }}
      className="group relative hologram-card rounded-[32px] p-8 overflow-hidden transition-all border border-white/5 hover:border-amber-500/30">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
              <Icon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[8px] font-display text-white/30 uppercase tracking-[0.3em]">
                  {isAddiction ? 'Addiction' : 'Habit'}
                </span>
                <Flame className={`${habit.streak > 0 ? 'text-orange-400' : 'text-white/10'}`} size={14} />
                <span className={`text-[10px] font-display font-bold ${habit.streak > 0 ? 'text-orange-400' : 'text-white/20'}`}>
                  {habit.streak}d
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight leading-none mt-1">{habit.title}</h3>
              {habit.description && <p className="text-[10px] text-white/40 font-tech mt-1">{habit.description}</p>}
            </div>
          </div>
          <button onClick={() => onRemove(habit.id)}
            className="p-2 text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
            <X size={16} />
          </button>
        </div>

        {/* Streak bar */}
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: Math.min(habit.weeklyTarget, 7) }).map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < habit.streak ? (isAddiction ? 'bg-red-500' : 'bg-emerald-500') : 'bg-white/5'}`} />
          ))}
          <span className="text-[8px] text-white/30 font-mono ml-2">{habit.streak}/{habit.weeklyTarget}wk</span>
        </div>

        {/* Micro-quests */}
        <div className="space-y-2 mb-6">
          {habit.microQuests.map((quest) => (
            <div key={quest.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                quest.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => !quest.completed && onCompleteQuest(habit.id, quest.id)}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${quest.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                  {quest.completed ? <Check size={14} /> : <Target size={14} />}
                </div>
                <span className={`text-[11px] font-tech ${quest.completed ? 'text-emerald-300 line-through' : 'text-white/60'}`}>
                  {quest.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-yellow-400/60 font-tech">+{quest.ncReward}NC</span>
                <span className="text-[8px] text-emerald-400/60 font-tech">+{quest.expReward}XP</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[8px] text-white/30 font-mono">{completedQuestCount}/{totalQuestCount} quests done</div>
          {isAddiction && onRelapse && (
            <button onClick={() => onRelapse(habit.id)}
              className="ml-auto px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[9px] font-display text-red-400 uppercase tracking-widest transition-all">
              Relapse
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HabitLab;
