import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Check, Flame, AlertTriangle, Brain, Dumbbell, Moon, Users, Target, Activity, TrendingUp, BookOpen, ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';
import { useGame } from '../GameContext';
import { Habit, MicroQuest } from '../types';
import { HabitMasterAgent } from '../agents/HabitMasterAgent';

const categoryIcons: Record<string, any> = { mental: Brain, physical: Dumbbell, willpower: Moon, social: Users };
const categoryColors: Record<string, string> = { mental: 'text-blue-400', physical: 'text-red-400', willpower: 'text-purple-400', social: 'text-green-400' };

interface TabInfo {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const TABS: TabInfo[] = [
  { id: 'builder', label: 'Habit Builder', icon: Sparkles, color: 'text-amber-400' },
  { id: 'tracker', label: 'Habit Tracker', icon: Activity, color: 'text-emerald-400' },
  { id: 'destroyer', label: 'Addiction Destroyer', icon: AlertTriangle, color: 'text-red-400' },
];

const HabitLab: React.FC = () => {
  const { habits, addHabit, completeMicroQuest, recordRelapse, removeHabit, credits } = useGame();
  const [activeTab, setActiveTab] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [generatingQuests, setGeneratingQuests] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', description: '', type: 'build' as 'build' | 'destroy', category: 'mental' as string, weeklyTarget: 5, isAddiction: false });
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const habitMaster = new HabitMasterAgent();
  const goodHabits = habits.filter(h => !h.isAddiction);
  const addictions = habits.filter(h => h.isAddiction);

  const generateAiMicroQuests = useCallback(async (title: string, description: string, isAddiction: boolean, streak: number) => {
    setGeneratingQuests(true);
    try {
      const quests = await habitMaster.generateHabitMicroQuests(title, description, isAddiction, streak);
      return quests.map((q, i) => ({
        id: Date.now().toString() + '_' + i,
        habitId: 'pending',
        title: q.title,
        description: q.description,
        completed: false,
        difficulty: q.difficulty,
        ncReward: 5 + q.difficulty * 5,
        expReward: 10 + q.difficulty * 5,
        createdAt: new Date().toISOString(),
      }));
    } catch {
      return null;
    } finally {
      setGeneratingQuests(false);
    }
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;

    let microQuests;
    try {
      const aiQuests = await generateAiMicroQuests(newHabit.title, newHabit.description, newHabit.isAddiction || newHabit.type === 'destroy', 0);
      if (aiQuests) microQuests = aiQuests;
    } catch {}

    addHabit({
      title: newHabit.title,
      description: newHabit.description,
      type: newHabit.type,
      category: newHabit.category as any,
      weeklyTarget: newHabit.weeklyTarget,
      isAddiction: newHabit.isAddiction || newHabit.type === 'destroy',
      microQuests: microQuests || generateDefaultMicroQuests(newHabit.title, newHabit.category as any, newHabit.type === 'destroy'),
    });
    setNewHabit({ title: '', description: '', type: 'build', category: 'mental', weeklyTarget: 5, isAddiction: false });
    setIsAdding(false);
    setAiInsight(null);
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

  const analyzeHabit = async (habit: Habit) => {
    setAnalyzing(habit.id);
    try {
      const insight = await habitMaster.analyzePattern({
        title: habit.title,
        streak: habit.streak,
        relapses: habit.relapses,
        microQuests: habit.microQuests,
      });
      setAiInsight(insight);
    } catch {
      setAiInsight('Keep building momentum. Consistency is the key to transformation.');
    } finally {
      setAnalyzing(null);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const nextTab = () => setActiveTab(prev => Math.min(prev + 1, TABS.length - 1));
  const prevTab = () => setActiveTab(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/5 flex items-center justify-center border border-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Activity className="text-amber-400 relative z-10" size={36} />
          </div>
          <div className="space-y-1">
            <span className="text-amber-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(251,191,36,0.6)] block">Behavior Engineering</span>
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-white leading-none">Habit Lab</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">Credits: {credits} NC</p>
          </div>
        </div>

        {activeTab === 0 && (
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-display text-xs uppercase tracking-widest transition-all group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            New Habit
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="relative">
        <div className="flex items-center gap-2">
          {TABS.map((tab, i) => (
            <button key={tab.id} onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all border ${
                activeTab === i
                  ? `${tab.color} border-white/20 bg-white/5`
                  : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/[0.02]'
              }`}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button onClick={prevTab} disabled={activeTab === 0}
              className="p-2 rounded-xl border border-white/10 text-white/30 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-mono text-white/30 w-12 text-center">{activeTab + 1}/{TABS.length}</span>
            <button onClick={nextTab} disabled={activeTab === TABS.length - 1}
              className="p-2 rounded-xl border border-white/10 text-white/30 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Content */}
      <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
        <AnimatePresence mode="wait" custom={activeTab}>
          <motion.div key={activeTab} custom={activeTab} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
            {/* Tab 0: Habit Builder */}
            {activeTab === 0 && (
              <div className="space-y-8">
                <AnimatePresence>
                  {isAdding && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="hologram-card p-8 rounded-[32px] border-2 border-amber-500/30 mb-8">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
                            <Sparkles size={18} className="text-amber-400" />
                            {newHabit.isAddiction ? 'Track Addiction' : 'New Habit'}
                            {generatingQuests && <span className="text-[8px] text-amber-400/60 font-mono animate-pulse">AI generating micro-quests...</span>}
                          </h3>
                          <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-5">
                            <div>
                              <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">
                                {newHabit.isAddiction ? 'Addiction Name' : 'Habit Name'}
                              </label>
                              <input required value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-amber-500/50 outline-none transition-all"
                                placeholder={newHabit.isAddiction ? "e.g. Social Media Doomscrolling" : "e.g. Daily Reading"} />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Description</label>
                              <textarea value={newHabit.description} onChange={e => setNewHabit({...newHabit, description: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-amber-500/50 outline-none transition-all h-24 resize-none"
                                placeholder="Describe what this involves..." />
                            </div>
                          </div>
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Category</label>
                                <select value={newHabit.category} onChange={e => setNewHabit({...newHabit, category: e.target.value})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-amber-500/50 outline-none transition-all">
                                  <option value="mental">Mental</option>
                                  <option value="physical">Physical</option>
                                  <option value="willpower">Willpower</option>
                                  <option value="social">Social</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Type</label>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => setNewHabit({...newHabit, type: 'build', isAddiction: false })}
                                    className={`flex-1 py-3.5 rounded-xl border text-[10px] font-display uppercase tracking-widest transition-all ${
                                      !newHabit.isAddiction ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
                                    }`}>Build</button>
                                  <button type="button" onClick={() => setNewHabit({...newHabit, type: 'destroy', isAddiction: true })}
                                    className={`flex-1 py-3.5 rounded-xl border text-[10px] font-display uppercase tracking-widest transition-all ${
                                      newHabit.isAddiction ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/40'
                                    }`}>Destroy</button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Weekly Target: {newHabit.weeklyTarget}x</label>
                              <input type="range" min="1" max="7" value={newHabit.weeklyTarget} onChange={e => setNewHabit({...newHabit, weeklyTarget: parseInt(e.target.value)})} className="w-full accent-amber-500" />
                            </div>
                            <button type="submit" disabled={generatingQuests}
                              className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-white/30 text-black rounded-2xl font-display font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)] disabled:shadow-none">
                              {generatingQuests ? 'Generating AI Quests...' : newHabit.isAddiction ? 'Track Addiction' : 'Add Habit'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isAdding && (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl">
                    <Sparkles size={48} className="mx-auto text-amber-400/30 mb-4" />
                    <h3 className="text-lg font-display font-bold text-white/40 uppercase tracking-widest mb-2">Ready to Build a New Habit?</h3>
                    <p className="text-[10px] text-white/20 font-mono max-w-md mx-auto mb-6">Define a new habit or addiction to track. AI will generate personalized micro-quests to guide your progression.</p>
                    <button onClick={() => setIsAdding(true)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 font-display text-xs uppercase tracking-widest transition-all">
                      <Plus size={18} />
                      Create New Habit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 1: Habit Tracker */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="text-emerald-400" size={18} />
                  <h3 className="text-sm font-display uppercase tracking-widest text-white/70">Active Habits</h3>
                  <span className="text-[10px] font-mono text-white/30">({goodHabits.length})</span>
                </div>

                {aiInsight && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                    <Sparkles size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-emerald-300/80 font-mono">{aiInsight}</p>
                    <button onClick={() => setAiInsight(null)} className="text-white/20 hover:text-white/60 shrink-0"><X size={14} /></button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {goodHabits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit}
                      onCompleteQuest={completeMicroQuest} onRemove={removeHabit}
                      onAnalyze={analyzeHabit} analyzing={analyzing === habit.id} />
                  ))}
                  {goodHabits.length === 0 && (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl">
                      <Activity size={36} className="mx-auto text-white/10 mb-3" />
                      <p className="text-white/20 font-display uppercase tracking-widest text-xs">No habits tracked yet</p>
                      <button onClick={() => setActiveTab(0)} className="mt-4 text-[10px] text-emerald-400/60 hover:text-emerald-400 font-display uppercase tracking-widest">Go to Habit Builder</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Addiction Destroyer */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-red-400" size={18} />
                  <h3 className="text-sm font-display uppercase tracking-widest text-white/70">Addictions to Destroy</h3>
                  <span className="text-[10px] font-mono text-white/30">({addictions.length})</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {addictions.map((addiction) => (
                    <HabitCard key={addiction.id} habit={addiction} isAddiction
                      onCompleteQuest={completeMicroQuest}
                      onRelapse={recordRelapse} onRemove={removeHabit}
                      onAnalyze={analyzeHabit} analyzing={analyzing === addiction.id} />
                  ))}
                  {addictions.length === 0 && (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl">
                      <AlertTriangle size={36} className="mx-auto text-white/10 mb-3" />
                      <p className="text-white/20 font-display uppercase tracking-widest text-xs">No addictions tracked</p>
                      <button onClick={() => setActiveTab(0)} className="mt-4 text-[10px] text-red-400/60 hover:text-red-400 font-display uppercase tracking-widest">Go to Habit Builder</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const HabitCard: React.FC<{
  habit: Habit; isAddiction?: boolean;
  onCompleteQuest: (habitId: string, questId: string) => void;
  onRelapse?: (habitId: string) => void;
  onRemove: (id: string) => void;
  onAnalyze?: (habit: Habit) => void;
  analyzing?: boolean;
}> = ({ habit, isAddiction, onCompleteQuest, onRelapse, onRemove, onAnalyze, analyzing }) => {
  const Icon = categoryIcons[habit.category] || Brain;
  const color = categoryColors[habit.category] || 'text-blue-400';
  const completedQuestCount = habit.microQuests.filter(q => q.completed).length;
  const totalQuestCount = habit.microQuests.length;

  return (
    <motion.div whileHover={{ y: -2, scale: 1.005 }}
      className="group relative hologram-card rounded-[28px] p-6 overflow-hidden transition-all border border-white/5 hover:border-amber-500/30">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-display text-white/30 uppercase tracking-[0.3em]">
                  {isAddiction ? 'Addiction' : 'Habit'}
                </span>
                <Flame className={`${habit.streak > 0 ? 'text-orange-400' : 'text-white/10'}`} size={12} />
                <span className={`text-[9px] font-display font-bold ${habit.streak > 0 ? 'text-orange-400' : 'text-white/20'}`}>
                  {habit.streak}d
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight leading-none mt-0.5">{habit.title}</h3>
              {habit.description && <p className="text-[9px] text-white/40 font-tech mt-0.5">{habit.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onAnalyze && (
              <button onClick={() => onAnalyze(habit)} disabled={analyzing}
                className="p-1.5 text-white/10 hover:text-emerald-400 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30">
                <RotateCcw size={13} className={analyzing ? 'animate-spin' : ''} />
              </button>
            )}
            <button onClick={() => onRemove(habit.id)}
              className="p-1.5 text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: Math.min(habit.weeklyTarget, 7) }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i < habit.streak ? (isAddiction ? 'bg-red-500' : 'bg-emerald-500') : 'bg-white/5'}`} />
          ))}
          <span className="text-[7px] text-white/30 font-mono ml-1">{habit.streak}/{habit.weeklyTarget}wk</span>
        </div>

        <div className="space-y-1.5 mb-4">
          {habit.microQuests.map((quest) => (
            <div key={quest.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                quest.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => !quest.completed && onCompleteQuest(habit.id, quest.id)}>
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-lg ${quest.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                  {quest.completed ? <Check size={12} /> : <Target size={12} />}
                </div>
                <span className={`text-[10px] font-tech ${quest.completed ? 'text-emerald-300 line-through' : 'text-white/60'}`}>
                  {quest.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[7px] text-yellow-400/60 font-tech">+{quest.ncReward}NC</span>
                <span className="text-[7px] text-emerald-400/60 font-tech">+{quest.expReward}XP</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[7px] text-white/30 font-mono">{completedQuestCount}/{totalQuestCount} quests done</div>
          {isAddiction && onRelapse && (
            <button onClick={() => onRelapse(habit.id)}
              className="ml-auto px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[8px] font-display text-red-400 uppercase tracking-widest transition-all">
              Relapse
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HabitLab;
