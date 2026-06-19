import React, { useState } from 'react';

import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Sword,
  Activity,
  User,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  LogOut,
  Brain,
  Hexagon,
  Book,
  ShoppingCart,
  Flame,
  Skull,
  ArrowUpCircle
} from 'lucide-react';
import { GameProvider, useGame } from './GameContext';
import HexGraph from './components/HexGraph';
import QuestBoard from './components/QuestBoard';
import TrainingHub from './components/TrainingHub';

import InitialAssessment from './components/InitialAssessment';
import BookMastery from './components/BookMastery';
import Feedback from './components/Feedback';
import PersonalizedTrainer from './components/PersonalizedTrainer';
import NexusStore from './components/NexusStore';
import HabitLab from './components/HabitLab';
import ShadowSelf from './components/ShadowSelf';
import RaidBossMount from './components/RaidBossMount';
import Profile from './components/Profile';
import AscensionCeremony from './components/AscensionCeremony';
import NotificationToast from './components/NotificationToast';
import ParticleBackground from './components/ParticleBackground';

const MenuOverlay = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  tabs,
}: {
  isOpen: boolean,
  onClose: () => void,
  activeTab: string,
  setActiveTab: (id: any) => void,
  tabs: any[],
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-4 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-emerald-500 font-display text-[8px] tracking-[0.4em] uppercase">System Navigation</span>
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Main Menu</h2>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeTab === tab.id
                      ? 'bg-emerald-500 text-black'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={16} />
                      <span className="font-display uppercase tracking-widest text-[11px]">{tab.label}</span>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${activeTab === tab.id ? 'rotate-90' : 'group-hover:translate-x-2'}`} />
                  </button>
                ))}
              </nav>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const { stats, hasCompletedAssessment, customSkillSets, addCustomSkillSet, removeCustomSkillSet, userProfile, canAscend, performAscension, lastStatUpdates } = useGame();
  const statKeys: (keyof typeof stats)[] = ['strength', 'intelligence', 'agility', 'vitality', 'willpower', 'social'];
  const decayingIndices = statKeys
    .map((k, i) => {
      if (!lastStatUpdates[k]) return -1;
      const daysSinceUpdate = (Date.now() - new Date(lastStatUpdates[k]).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate >= 7 ? i : -1;
    })
    .filter(i => i >= 0);
  const [activeTab, setActiveTab] = useState<'overview' | 'trainer' | 'training' | 'quests' | 'feedback' | 'books' | 'store' | 'habits' | 'shadow'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAscension, setShowAscension] = useState(false);
  const [newSkillSet, setNewSkillSet] = useState<{ name: string; skills: { name: string; value: number }[] }>({ name: '', skills: [] });

  if (!hasCompletedAssessment) {
    return <InitialAssessment />;
  }

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'trainer', label: 'AI Trainer Coach', icon: Brain },
    { id: 'training', label: 'Evolution Protocols', icon: Activity },
    { id: 'quests', label: 'Destiny Quests', icon: Sword },
    { id: 'books', label: 'Book Mastery', icon: Book },
    { id: 'habits', label: 'Habit Lab', icon: Flame },
    { id: 'shadow', label: 'Shadow Self', icon: Skull },
    { id: 'store', label: 'Nexus Store', icon: ShoppingCart },
    { id: 'feedback', label: 'System Feedback', icon: MessageCircle },
  ];

  const addSkillToNewSet = () => {
    if (newSkillSet.skills.length >= 6) return;
    setNewSkillSet(prev => ({ ...prev, skills: [...prev.skills, { name: '', value: 10 }] }));
  };

  const updateNewSkillName = (index: number, name: string) => {
    setNewSkillSet(prev => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], name };
      return { ...prev, skills: updated };
    });
  };

  const updateNewSkillValue = (index: number, value: number) => {
    setNewSkillSet(prev => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], value: Math.min(100, Math.max(0, value)) };
      return { ...prev, skills: updated };
    });
  };

  const saveCustomSkillSet = () => {
    if (!newSkillSet.name.trim() || newSkillSet.skills.length < 3) return;
    const validSkills = newSkillSet.skills.filter(s => s.name.trim());
    if (validSkills.length < 3) return;
    addCustomSkillSet({
      id: `custom_${Date.now()}`,
      name: newSkillSet.name,
      skills: validSkills.map(s => ({ name: s.name.trim(), value: Math.min(100, Math.max(0, s.value)) })),
      createdAt: new Date().toISOString(),
    });
    setNewSkillSet({ name: '', skills: [] });
    setShowSkillModal(false);
  };

  return (<>
    {/* Add More Skills Modal */}
    {showSkillModal && (
      <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6" onClick={() => { if (newSkillSet.skills.length === 0) setShowSkillModal(false); }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full glass rounded-[32px] p-8 border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold uppercase tracking-tight">New Skill Tree</h2>
            <button onClick={() => { setNewSkillSet({ name: '', skills: [] }); setShowSkillModal(false); }} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Tree Name</label>
              <input
                value={newSkillSet.name}
                onChange={e => setNewSkillSet(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Coding Skills, Artistry, Combat"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Skills (3-6)</label>
                {newSkillSet.skills.length < 6 && (
                  <button onClick={addSkillToNewSet} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-display uppercase tracking-wider">
                    + Add Skill
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {newSkillSet.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={skill.name}
                      onChange={e => updateNewSkillName(i, e.target.value)}
                      placeholder="Skill name"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={skill.value}
                      onChange={e => updateNewSkillValue(i, parseInt(e.target.value))}
                      className="w-20 h-1 accent-emerald-500"
                    />
                    <span className="text-[10px] font-mono text-emerald-400 w-6 text-right">{skill.value}</span>
                    {newSkillSet.skills.length > 3 && (
                      <button onClick={() => setNewSkillSet(prev => ({ ...prev, skills: prev.skills.filter((_, j) => j !== i) }))} className="text-red-400/60 hover:text-red-400 p-1">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {newSkillSet.skills.length === 0 && (
                  <button onClick={addSkillToNewSet} className="w-full p-4 rounded-xl border-2 border-dashed border-white/10 text-white/30 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-xs font-display uppercase tracking-wider">
                    + Add First Skill
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={saveCustomSkillSet}
              disabled={!newSkillSet.name.trim() || newSkillSet.skills.filter(s => s.name.trim()).length < 3}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black font-display font-bold uppercase tracking-wider text-xs rounded-xl transition-all disabled:cursor-not-allowed"
            >
              Create Skill Tree
            </button>
          </div>
        </motion.div>
      </div>
    )}

    {/* Profile Modal */}
    {showProfile && (
      <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto" onClick={() => setShowProfile(false)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
          <Profile />
        </motion.div>
      </div>
    )}

    <AscensionCeremony show={showAscension} onComplete={() => { setShowAscension(false); }} />

    <NotificationToast />
    <ParticleBackground count={25} color="rgba(16,185,129,0.25)" speed={0.7} />

    <div className="min-h-screen bg-[#000] text-white font-tech selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-500/10 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      </div>

      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Advanced HUD Header */}
        <header className="flex items-center justify-between px-10 py-6 glass border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center gap-10">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex items-center gap-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 rounded-xl transition-all glow-emerald"
            >
              <Menu size={20} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
              <span className="font-display text-xs uppercase tracking-[0.3em] text-emerald-400">System Access</span>
            </button>

            <div className="flex items-center gap-6 border-l border-white/10 pl-10">
              <button onClick={() => setShowProfile(true)} className="flex items-center gap-4 group">
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-white/40 uppercase tracking-[0.3em] font-display">Neural Interface</span>
                  <span className="text-lg font-display font-black text-white glow-text-emerald uppercase group-hover:text-emerald-300 transition-colors">
                    {userProfile.name || 'Operator_Nexus'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl glass border border-emerald-500/40 flex items-center justify-center relative overflow-hidden group/avatar">
                  <div className="absolute inset-0 bg-emerald-500/10 group-hover/avatar:bg-emerald-500/20 transition-colors" />
                  <User size={24} className="text-emerald-400 relative z-10" />
                </div>
              </button>

              {/* System Status Indicators */}
              <div className="hidden lg:flex items-center gap-8 ml-6 border-l border-white/10 pl-8">
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Neural Sync</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-2 h-1 rounded-full ${i <= 4 ? 'bg-emerald-500 glow-emerald' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Security Level</span>
                  <span className="text-[10px] text-emerald-400 font-tech tracking-wider">OMEGA-7</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Core Temp</span>
                  <span className="text-[10px] text-blue-400 font-tech tracking-wider">32.4°C</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => window.location.reload()}
              className="p-3 glass border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/30 transition-all rounded-xl"
              title="Reset Session"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-12 gap-8">
                    {/* Main Stats Area */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                      <div className="glass p-8 rounded-[40px] border border-white/10 relative overflow-hidden group">
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full" />

                          {/* Main HexGraph + Add More Skills */}
                          <div className="flex flex-wrap items-start gap-6">
                            <HexGraph stats={stats} size={280} title="Core Stats" decayingIndices={decayingIndices} />
                            <button
                              onClick={() => setShowSkillModal(true)}
                              className="flex flex-col items-center justify-center w-[280px] h-[280px] rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-white/30 hover:text-emerald-400 group"
                            >
                              <Hexagon size={32} className="mb-3 group-hover:rotate-90 transition-transform" />
                              <span className="font-display text-xs uppercase tracking-[0.2em]">Add More Skills</span>
                            </button>
                            {canAscend && (
                              <motion.button
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => { performAscension(); setShowAscension(true); }}
                                className="flex flex-col items-center justify-center w-[280px] h-[280px] rounded-2xl border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-purple-400 group relative overflow-hidden"
                              >
                                <motion.div
                                  className="absolute inset-0 bg-purple-500/10"
                                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <ArrowUpCircle size={40} className="mb-3 relative z-10 group-hover:scale-110 transition-transform" />
                                <span className="font-display text-xs uppercase tracking-[0.2em] relative z-10">Ascension Ready</span>
                                <span className="text-[8px] font-mono text-purple-400/60 mt-1 relative z-10">All stats at 100</span>
                              </motion.button>
                            )}
                          </div>

                          {/* Custom Skill Sets */}
                          {customSkillSets.length > 0 && (
                            <div className="mt-8">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Custom Skill Trees</span>
                                <div className="h-px flex-1 bg-white/5" />
                              </div>
                              <div className="flex flex-wrap gap-6">
                                {customSkillSets.map((set) => (
                                  <div key={set.id} className="relative group/skill">
                                    <HexGraph
                                      customLabels={set.skills.map(s => s.name)}
                                      customData={set.skills.map(s => s.value)}
                                      size={200}
                                      title={set.name}
                                    />
                                    <button
                                      onClick={() => removeCustomSkillSet(set.id)}
                                      className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 opacity-0 group-hover/skill:opacity-100 transition-all text-[10px]"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar: Raid Boss */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                      <RaidBossMount />
                    </div>
                  </div>
                )}

                {activeTab === 'trainer' && <PersonalizedTrainer />}
                {activeTab === 'training' && <TrainingHub />}
                {activeTab === 'quests' && <QuestBoard />}
                {activeTab === 'books' && <BookMastery />}
                {activeTab === 'habits' && <HabitLab />}
                {activeTab === 'store' && <NexusStore />}
                {activeTab === 'feedback' && <Feedback />}
                {activeTab === 'shadow' && (
                  <div className="max-w-xl mx-auto">
                    <ShadowSelf />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
    </>
  );
};

export default function App() {
  return (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  );
}

