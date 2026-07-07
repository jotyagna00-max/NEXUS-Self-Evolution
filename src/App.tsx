import React, { useState, useEffect } from 'react';

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
  Hexagon,
  Book,
  ShoppingCart,
  Flame,
  ArrowUpCircle,
  Download,
  Scroll,
  ClipboardList,
  Skull,
} from 'lucide-react';
import { GameProvider, useGame } from './GameContext';
import HexGraph from './components/HexGraph';
import QuestBoard from './components/QuestBoard';
import TrainingHub from './components/TrainingHub';

import InitialAssessment from './components/InitialAssessment';
import BookMastery from './components/BookMastery';
import Feedback from './components/Feedback';
import NexusStore from './components/NexusStore';
import HabitLab from './components/HabitLab';
import ConsistencyTracker from './components/ConsistencyTracker';
import AgentBriefing from './components/AgentBriefing';
import Profile from './components/Profile';
import AscensionCeremony from './components/AscensionCeremony';
import SplashScreen from './components/SplashScreen';
import UpdateToast from './components/UpdateToast';
import NotificationToast from './components/NotificationToast';
import ParticleBackground from './components/ParticleBackground';
import MissionDebrief from './components/MissionDebrief';
import ChangelogPanel from './components/ChangelogPanel';
import CalendarHeatmap from './components/CalendarHeatmap';
import ManagerAvatar from './components/ManagerAvatar';
import DailyBaseline from './components/DailyBaseline';
import ShadowChat from './components/ShadowChat';
import PenaltyZone from './components/PenaltyZone';
import Onboarding from './components/Onboarding';
import NativeLLMFirstLaunch from './components/NativeLLMFirstLaunch';
import ErrorBoundary from './components/ErrorBoundary';

const MenuOverlay = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  tabs,
  onShowChangelog,
}: {
  isOpen: boolean,
  onClose: () => void,
  activeTab: string,
  setActiveTab: (id: any) => void,
  tabs: any[],
  onShowChangelog: () => void,
}) => {
  const { stats, consistency, pushNotification } = useGame();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const compareVersions = (a: string, b: string): number => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pa[i] || 0) > (pb[i] || 0)) return 1;
      if ((pa[i] || 0) < (pb[i] || 0)) return -1;
    }
    return 0;
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const api = (window as any).electronAPI;
      let currentVer = '1.2.0';
      let result = null;

      if (api?.checkForUpdates) {
        try { result = await api.checkForUpdates(); } catch {}
      }
      if (result?.version) currentVer = result.version;

      if (!result || !result.available) {
        const res = await fetch('https://gist.githubusercontent.com/jotyagna00-max/5bbe4ebd4efadc7098259e62e830213b/raw/version.json', { signal: AbortSignal.timeout(5000) });
        const remote = await res.json();
        if (compareVersions(remote.latestVersion, currentVer) > 0) {
          result = { available: true, version: remote.latestVersion, url: remote.downloadUrl || '' };
        } else {
          result = { available: false, version: remote.latestVersion };
        }
      }

      if (result?.available) {
        pushNotification({ id: 'update_found_' + Date.now(), type: 'level_up', title: `Update v${result.version} Available`, description: `Download from ${result.url || 'github.com/jotyagna00-max/nexus-releases/releases'}`, timestamp: new Date().toISOString() });
      } else {
        pushNotification({ id: 'up_to_date_' + Date.now(), type: 'level_up', title: 'Up to Date', description: `Latest: v${result.version}`, timestamp: new Date().toISOString() });
      }
    } catch {
      pushNotification({ id: 'update_err_' + Date.now(), type: 'level_up', title: 'Update Check Failed', description: 'Could not reach update server. Check your internet connection.', timestamp: new Date().toISOString() });
    }
    setCheckingUpdate(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            onClick={e => e.stopPropagation()}
            className="glass rounded-[32px] border border-white/10 w-full max-w-lg max-h-[80vh] overflow-y-auto relative shadow-[0_0_80px_rgba(16,185,129,0.06)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-white/5 bg-black/60 backdrop-blur-xl">
              <div>
                <span className="text-emerald-500/60 font-display text-[8px] tracking-[0.5em] uppercase">NEXUS v2.0</span>
                <h2 className="text-lg font-display font-bold uppercase tracking-tight text-white mt-0.5">
                  <span className="text-emerald-400">Main</span> Menu
                </h2>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/30 hover:text-white border border-transparent hover:border-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); onClose(); }}
                    data-tab={tab.id}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group border ${
                      activeTab === tab.id
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'border-transparent text-white/40 hover:bg-white/[0.03] hover:border-white/5 hover:text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        activeTab === tab.id
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-white/5 text-white/30 group-hover:bg-white/10'
                      }`}>
                        <tab.icon size={15} />
                      </div>
                      <span className="font-display uppercase tracking-[0.2em] text-[10px]">{tab.label}</span>
                    </div>
                    <ChevronRight size={13} className={`transition-transform ${
                      activeTab === tab.id ? 'rotate-90 text-emerald-400' : 'text-white/20 group-hover:translate-x-1 group-hover:text-white/40'
                    }`} />
                  </button>
                ))}
              </nav>

              <button
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group border border-transparent text-white/40 hover:bg-emerald-500/10 hover:border-emerald-500/25 hover:text-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 text-white/30 group-hover:bg-emerald-500/15 group-hover:text-emerald-400 transition-all">
                    <Download size={15} className={checkingUpdate ? 'animate-spin' : ''} />
                  </div>
                  <span className="font-display uppercase tracking-[0.2em] text-[10px]">
                    {checkingUpdate ? 'Checking...' : 'Check for Update'}
                  </span>
                </div>
                <ChevronRight size={13} className="text-white/20 group-hover:translate-x-1 group-hover:text-emerald-400 transition-transform" />
              </button>

              <button
                onClick={() => { onShowChangelog(); onClose(); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group border border-transparent text-white/40 hover:bg-blue-500/10 hover:border-blue-500/25 hover:text-blue-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 text-white/30 group-hover:bg-blue-500/15 group-hover:text-blue-400 transition-all">
                    <Scroll size={15} />
                  </div>
                  <span className="font-display uppercase tracking-[0.2em] text-[10px]">View Changelog</span>
                </div>
                <ChevronRight size={13} className="text-white/20 group-hover:translate-x-1 group-hover:text-blue-400 transition-transform" />
              </button>

              <div className="h-px bg-gradient-to-r from-emerald-500/20 via-white/5 to-transparent" />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'INT', value: stats.intelligence, color: 'text-blue-400', bar: 'bg-blue-500/60' },
                  { label: 'STR', value: stats.strength, color: 'text-red-400', bar: 'bg-red-500/60' },
                  { label: 'WIL', value: stats.willpower, color: 'text-purple-400', bar: 'bg-purple-500/60' },
                  { label: 'CON', value: consistency.score, color: 'text-emerald-400', bar: 'bg-emerald-500/60' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-display font-bold ${s.color}`}>{s.label}</span>
                      <span className="text-[11px] font-mono text-white/60">{s.value}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const { stats, quests, hasCompletedAssessment, customSkillSets, addCustomSkillSet, removeCustomSkillSet, userProfile, selectedCharacter, canAscend, performAscension, lastStatUpdates, consistency, recommendations, generateRecommendations, resetAllData, currentMode, penaltyZoneReason, exitPenaltyZone } = useGame();

  // Penalty Zone lockout — when currentMode is penalty_zone, render a
  // fullscreen survival protocol instead of the regular dashboard. The
  // Operator must clear ONE challenge to regain the Command Center.
  // This is the entire point of the design from onboarding-design.md:
  // consequences feel like challenges, not punishments.
  if (currentMode === 'penalty_zone' && hasCompletedAssessment) {
    return (
      <>
        <PenaltyZone onSurrender={() => {
          if (window.confirm('Surrender? You will not earn rewards for clearing the Penalty Zone.')) {
            exitPenaltyZone();
          }
        }} />
        <UpdateToast />
        <NotificationToast />
      </>
    );
  }

  useEffect(() => { generateRecommendations(); }, [generateRecommendations]);
  const statKeys: (keyof typeof stats)[] = ['strength', 'intelligence', 'agility', 'vitality', 'willpower', 'social'];
  const decayingIndices = statKeys
    .map((k, i) => {
      if (!lastStatUpdates[k]) return -1;
      const daysSinceUpdate = (Date.now() - new Date(lastStatUpdates[k]).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate >= 7 ? i : -1;
    })
    .filter(i => i >= 0);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'quests' | 'feedback' | 'books' | 'store' | 'habits' | 'story' | 'debrief' | 'shadow'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAscension, setShowAscension] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [newSkillSet, setNewSkillSet] = useState<{ name: string; skills: { name: string; value: number }[] }>({ name: '', skills: [] });

  if (!hasCompletedAssessment) {
    return <InitialAssessment />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'training', label: 'Training', icon: Activity },
    { id: 'quests', label: 'Quests', icon: Sword },
    { id: 'debrief', label: 'Review', icon: ClipboardList },
    { id: 'books', label: 'Books', icon: Book },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'store', label: 'Store', icon: ShoppingCart },
    { id: 'shadow', label: 'Shadow Chat', icon: Skull },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
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
    <ChangelogPanel open={showChangelog} onClose={() => setShowChangelog(false)} />

    <AnimatePresence>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    </AnimatePresence>

    <UpdateToast />
    <NotificationToast />
    <NativeLLMFirstLaunch />
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
        onShowChangelog={() => setShowChangelog(true)}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Advanced HUD Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6 glass border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex items-center gap-2 sm:gap-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all glow-emerald"
            >
              <Menu size={18} className="text-emerald-400 group-hover:rotate-90 transition-transform sm:text-[20px]" />
              <span className="font-display text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-emerald-400 hidden sm:inline">Menu</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-6 border-l border-white/10 pl-3 sm:pl-10">
              <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 sm:gap-4 group">
                <div className="flex flex-col text-left">
                  <span className="text-[7px] sm:text-[8px] text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-display">Profile</span>
                  <span className="text-sm sm:text-lg font-display font-black text-white glow-text-emerald uppercase group-hover:text-emerald-300 transition-colors truncate max-w-[120px] sm:max-w-none">
                    {userProfile.name || 'Your Name'}
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl glass border border-emerald-500/40 flex items-center justify-center relative overflow-hidden group/avatar">
                  <div className="absolute inset-0 bg-emerald-500/10 group-hover/avatar:bg-emerald-500/20 transition-colors" />
                  <User size={20} className="text-emerald-400 relative z-10" />
                </div>
              </button>

              {/* Manager archetype chip */}
              <div className="border-l border-white/10 pl-3 sm:pl-6 hidden md:block">
                <ManagerAvatar archetypeId={selectedCharacter} />
              </div>

              {/* System Status Indicators */}
              <div className="hidden lg:flex items-center gap-8 ml-6 border-l border-white/10 pl-8">
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">AI Status</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`w-2 h-1 rounded-full ${i <= 4 ? 'bg-emerald-500 glow-emerald' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Rank</span>
                  <span className="text-[10px] text-emerald-400 font-tech tracking-wider">OMEGA-7</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => { if (confirm('Reset all data? This cannot be undone.')) resetAllData(); }}
              className="p-2 sm:p-3 glass border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/30 transition-all rounded-xl"
              title="Reset Session (Clears All Data)"
            >
              <LogOut size={18} className="sm:text-[20px]" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto scroll-smooth">
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
                  <div className="space-y-8">
                    {/* Row 1: HexGraph + Agent Briefing */}
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-12 lg:col-span-7">
                        <div className="glass p-8 rounded-[40px] border border-white/10 relative overflow-hidden group">
                          <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full" />
                            <div className="flex flex-wrap items-start gap-6">
                              <HexGraph stats={stats} size={240} title="Core Stats" decayingIndices={decayingIndices} />
                              <button
                                onClick={() => setShowSkillModal(true)}
                                className="flex flex-col items-center justify-center w-[240px] h-[240px] rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-white/30 hover:text-emerald-400 group"
                              >
                                <Hexagon size={28} className="mb-3 group-hover:rotate-90 transition-transform" />
                                <span className="font-display text-xs uppercase tracking-[0.2em]">Add More Skills</span>
                              </button>
                              {canAscend && (
                                <motion.button
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  onClick={() => { performAscension(); setShowAscension(true); }}
                                  className="flex flex-col items-center justify-center w-[240px] h-[240px] rounded-2xl border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-purple-400 group relative overflow-hidden"
                                >
                                  <motion.div className="absolute inset-0 bg-purple-500/10" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                                  <ArrowUpCircle size={36} className="mb-3 relative z-10 group-hover:scale-110 transition-transform" />
                                  <span className="font-display text-xs uppercase tracking-[0.2em] relative z-10">Ascension Ready</span>
                                  <span className="text-[8px] font-mono text-purple-400/60 mt-1 relative z-10">All stats at 100</span>
                                </motion.button>
                              )}
                            </div>
                            {customSkillSets.length > 0 && (
                              <div className="mt-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Custom Skill Trees</span>
                                  <div className="h-px flex-1 bg-white/5" />
                                </div>
                                <div className="flex flex-wrap gap-6">
                                  {customSkillSets.map((set) => (
                                    <div key={set.id} className="relative group/skill">
                                      <HexGraph customLabels={set.skills.map(s => s.name)} customData={set.skills.map(s => s.value)} size={180} title={set.name} />
                                      <button onClick={() => removeCustomSkillSet(set.id)} className="absolute top-2 right-2 p-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 opacity-0 group-hover/skill:opacity-100 transition-all text-[10px]"><X size={12} /></button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-5">
                        <AgentBriefing
                          recommendations={recommendations}
                          quests={quests}
                          onRefresh={() => generateRecommendations()}
                          onAction={(rec) => {
                            if (rec.targetStat) {
                              const tabMap: Record<string, string> = { strength: 'training', intelligence: 'training', willpower: 'training', agility: 'training', vitality: 'training', social: 'training' };
                              setActiveTab((tabMap[rec.targetStat] || 'training') as any);
                            } else {
                              setActiveTab('training');
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Consistency + Calendar Heatmap */}
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-12 lg:col-span-7">
                        <ConsistencyTracker data={consistency} />
                      </div>
                      <div className="col-span-12 lg:col-span-5">
                        <CalendarHeatmap />
                      </div>
                    </div>

                    {/* Row 3: Daily Baseline */}
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-12">
                        <DailyBaseline />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'training' && <TrainingHub />}
                {activeTab === 'quests' && <QuestBoard />}
                {activeTab === 'debrief' && <MissionDebrief />}
                {activeTab === 'books' && <BookMastery />}
                {activeTab === 'habits' && <HabitLab />}
                {activeTab === 'store' && <NexusStore />}
                {activeTab === 'shadow' && <ShadowChat />}
                {activeTab === 'feedback' && <Feedback />}
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
    <ErrorBoundary>
      <GameProvider>
        <Onboarding>
          <Dashboard />
        </Onboarding>
      </GameProvider>
    </ErrorBoundary>
  );
}

