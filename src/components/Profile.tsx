import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Target, Dumbbell, Brain, Shield, Activity, Zap, TrendingUp, Save, ChevronRight, Edit3, Sword, Eye, Clock, Flame, Trophy, Swords, Star, X } from 'lucide-react';
import { useGame } from '../GameContext';
import { HunterRank } from '../types';

const rankColor = (rank: string) => {
  const colors: Record<string, string> = { 'E': 'text-gray-400', 'D': 'text-green-400', 'C': 'text-blue-400', 'B': 'text-purple-400', 'A': 'text-yellow-400', 'S': 'text-red-400', 'SS': 'text-pink-400', 'SSS': 'text-amber-400' };
  return colors[rank] || 'text-white';
};

const rankGlow = (rank: string) => {
  const glows: Record<string, string> = { 'E': 'shadow-[0_0_15px_rgba(156,163,175,0.2)]', 'D': 'shadow-[0_0_15px_rgba(34,197,94,0.2)]', 'C': 'shadow-[0_0_15px_rgba(59,130,246,0.2)]', 'B': 'shadow-[0_0_15px_rgba(168,85,247,0.2)]', 'A': 'shadow-[0_0_15px_rgba(234,179,8,0.2)]', 'S': 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', 'SS': 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', 'SSS': 'shadow-[0_0_25px_rgba(251,191,36,0.4)]' };
  return glows[rank] || '';
};

const statIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  strength: Dumbbell, intelligence: Brain, agility: Zap, vitality: Shield, willpower: Flame, social: Activity,
};

const StatBar: React.FC<{ label: string; value: number; color: string; icon: React.FC<{ size?: number; className?: string }> }> = ({ label, value, color, icon: Icon }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className={`text-${color}-400`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-display uppercase tracking-wider text-white/60">{label}</span>
        <span className={`text-[11px] font-mono font-bold text-${color}-400`}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full rounded-full bg-gradient-to-r from-${color}-500/60 to-${color}-400`}
        />
      </div>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const { userProfile, selectedCharacter, updateUserProfile, setCharacter, stats, progression, credits, protocols, consistency } = useGame();
  const [showSetup, setShowSetup] = useState(false);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(userProfile.name || '');
  const [character, setLocalCharacter] = useState(selectedCharacter || 'Ayanokoji');
  const [goal, setGoal] = useState(userProfile.primaryGoal?.replace(/\s*\(Timeframe:.*\)$/, '') || '');
  const [timeframe, setTimeframe] = useState('');
  const [experience, setExperience] = useState(userProfile.fitnessExperience || 'intermediate');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(userProfile.secondaryGoals || []);
  const [barriers, setBarriers] = useState<string[]>(userProfile.barriers || []);

  const toggleSecondaryGoal = (g: string) => {
    setSecondaryGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleBarrier = (b: string) => {
    setBarriers(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const saveProfile = () => {
    updateUserProfile({
      name: name.trim() || 'Operator',
      primaryGoal: goal.trim() ? `${goal.trim()} (Timeframe: ${timeframe || 'Not set'})` : undefined,
      secondaryGoals,
      fitnessExperience: experience as any,
      barriers,
    });
    setCharacter(character);
    setStep(3);
  };

  const setupSteps = [
    {
      title: 'Identity', icon: User,
      content: (
        <div className="space-y-6">
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Operator Designation</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name or callsign..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Archetype</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Ayanokoji', label: 'The Strategist' },
                { id: 'Solo Leveling', label: 'The Awakener' },
                { id: 'Batman', label: 'Peak Human' },
                { id: 'Johan', label: 'The Manipulator' },
              ].map(c => (
                <button key={c.id} onClick={() => setLocalCharacter(c.id)}
                  className={`p-3 rounded-2xl text-left border text-[10px] font-display uppercase tracking-wider transition-all ${
                    character === c.id ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/10 text-white/40 hover:border-white/30'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Experience', icon: Dumbbell,
      content: (
        <div>
          <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Fitness Level</label>
          <div className="flex gap-2">
            {[
              { id: 'beginner', label: 'Beginner' },
              { id: 'intermediate', label: 'Intermediate' },
              { id: 'advanced', label: 'Advanced' },
            ].map(e => (
              <button key={e.id} onClick={() => setExperience(e.id)}
                className={`flex-1 p-4 rounded-2xl text-center border text-[10px] font-display uppercase tracking-wider transition-all ${
                  experience === e.id ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/10 text-white/40 hover:border-white/30'
                }`}>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Objectives', icon: Target,
      content: (
        <div className="space-y-5">
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Primary Mission</label>
            <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="Your main goal..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 resize-none h-16" />
          </div>
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Timeframe</label>
            <div className="flex gap-2">
              {['3 Months', '6 Months', '1 Year', '2+ Years'].map(t => (
                <button key={t} onClick={() => setTimeframe(t)}
                  className={`flex-1 py-2 rounded-2xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                    timeframe === t ? 'bg-emerald-500 border-emerald-500 text-black font-bold' : 'bg-black/50 border-white/10 text-white/40 hover:border-white/30'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Secondary Goals</label>
            <div className="flex flex-wrap gap-1.5">
              {['Build strength', 'Improve focus', 'Read more', 'Better sleep', 'Learn a skill', 'Social growth', 'Meditation', 'Running'].map(g => (
                <button key={g} onClick={() => toggleSecondaryGoal(g)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                    secondaryGoals.includes(g) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/10 text-white/30 hover:border-white/30'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Barriers', icon: Shield,
      content: (
        <div className="space-y-5">
          <div>
            <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Key Obstacles</label>
            <div className="flex flex-wrap gap-1.5">
              {['Procrastination', 'Low energy', 'Time management', 'Motivation dips', 'Social pressure', 'Info overload', 'Sleep issues', 'Self-doubt'].map(b => (
                <button key={b} onClick={() => toggleBarrier(b)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                    barriers.includes(b) ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-black/50 border-white/10 text-white/30 hover:border-white/30'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (showSetup) {
    const current = setupSteps[step];
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[32px] p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <User className="text-emerald-400" size={24} />
              </div>
              <div>
                <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Operator Profile</span>
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Configure Profile</h2>
              </div>
            </div>
            <button onClick={() => setShowSetup(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-2 mb-8">
            {setupSteps.map((s, i) => (
              <button key={s.title} onClick={() => setStep(i)}
                className={`flex items-center gap-2 flex-1 py-2.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                  step === i ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/5 text-white/20 hover:border-white/20'
                }`}>
                <s.icon size={12} />
                {s.title}
              </button>
            ))}
          </div>

          <div className="flex gap-1 mb-6">
            {setupSteps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-500/60' : 'bg-white/5'}`} />
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <current.icon size={14} className="text-emerald-400" />
              <span className="text-[10px] font-display uppercase tracking-widest text-white/40">{current.title}</span>
            </div>
            {current.content}
          </motion.div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-[10px] font-display uppercase tracking-widest">Back</button>
            )}
            {step < setupSteps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="flex-1 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-[10px] font-display uppercase tracking-widest flex items-center justify-center gap-2">
                Next <ChevronRight size={12} />
              </button>
            ) : (
              <button onClick={saveProfile}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 text-black font-display font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                <Save size={14} /> Save Profile
              </button>
            )}
          </div>

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
              <p className="text-[10px] text-emerald-400/60 font-mono">Profile saved successfully.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  const statEntries: { key: string; label: string; value: number; icon: React.FC<{ size?: number; className?: string }>; color: string }[] = [
    { key: 'strength', label: 'Strength', value: stats.strength, icon: statIcons.strength, color: 'red' },
    { key: 'intelligence', label: 'Intelligence', value: stats.intelligence, icon: statIcons.intelligence, color: 'blue' },
    { key: 'agility', label: 'Agility', value: stats.agility, icon: statIcons.agility, color: 'green' },
    { key: 'vitality', label: 'Vitality', value: stats.vitality, icon: statIcons.vitality, color: 'emerald' },
    { key: 'willpower', label: 'Willpower', value: stats.willpower, icon: statIcons.willpower, color: 'amber' },
    { key: 'social', label: 'Social', value: stats.social, icon: statIcons.social, color: 'purple' },
  ];

  const expPercent = Math.round((progression.exp / progression.expToNextLevel) * 100);
  const avatarArchetypes: Record<string, string> = { Ayanokoji: 'The Strategist', 'Solo Leveling': 'The Awakener', Batman: 'Peak Human', Johan: 'The Manipulator' };

  return (
    <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Identity Header */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center ${rankGlow(progression.rank)}`}>
              <Swords size={36} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                {userProfile.name || 'Operator_Nexus'}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] font-mono text-emerald-400/60">{avatarArchetypes[selectedCharacter || ''] || selectedCharacter}</span>
                <span className="text-white/10">|</span>
                <span className="text-[9px] font-mono text-white/40">{userProfile.primaryGoal?.replace(/\s*\(Timeframe:.*\)$/, '') || 'No mission set'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSetup(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
            <Edit3 size={14} />
            <span className="text-[8px] font-display uppercase tracking-wider">Edit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level & Rank */}
        <div className="glass rounded-[32px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={18} className={rankColor(progression.rank)} />
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Rank & Level</span>
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className={`text-5xl font-display font-black ${rankColor(progression.rank)}`}>{progression.rank}</span>
              <span className="text-lg font-mono text-white/40 ml-2">Rank</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-white">Lv.{progression.level}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-white/30 font-mono">EXP to next rank</span>
              <span className="text-white/60 font-mono">{progression.exp} / {progression.expToNextLevel}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* NC Wallet */}
        <div className="glass rounded-[32px] p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Star size={18} className="text-yellow-400" />
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">NC Balance</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-mono font-black text-yellow-400">{credits.toLocaleString()}</span>
            <span className="text-lg font-mono text-white/40 mb-1">NC</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-white/30">
            <TrendingUp size={12} />
            <span>Total EXP earned: {progression.totalExpEarned}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Eye size={18} className="text-emerald-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Operator Stats</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {statEntries.map(({ key, label, value, icon, color }) => (
            <StatBar key={key} label={label} value={value} color={color} icon={icon} />
          ))}
        </div>
      </div>

      {/* Account Details */}
      <div className="glass rounded-[32px] p-8 border border-white/10 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={18} className="text-emerald-400" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Account Details</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity size={14} className="text-emerald-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{protocols.length}</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Protocols</span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={14} className="text-orange-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{consistency.score}%</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Consistency</span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy size={14} className="text-yellow-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{progression.totalExpEarned}</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Total EXP</span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={14} className="text-purple-400" />
            </div>
            <span className="block text-2xl font-mono font-bold text-white">{consistency.longestRun}</span>
            <span className="text-[8px] font-display uppercase tracking-wider text-white/30">Best Run</span>
          </div>
        </div>
      </div>

      {/* Setup wizard collapsed button */}
      {(!userProfile.name || !userProfile.primaryGoal) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 glass rounded-[32px] border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 size={18} className="text-emerald-400" />
              <span className="text-[10px] font-display uppercase tracking-wider text-white/60">Complete your profile setup</span>
            </div>
            <button onClick={() => setShowSetup(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-[9px] font-display uppercase tracking-wider">
              Start Setup <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;