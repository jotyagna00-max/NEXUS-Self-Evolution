import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Target, Dumbbell, Brain, AlertTriangle, Save, ChevronRight } from 'lucide-react';
import { useGame } from '../GameContext';

const Profile: React.FC = () => {
  const { userProfile, selectedCharacter, updateUserProfile, setCharacter } = useGame();
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

  const steps = [
    {
      title: 'Identity',
      icon: User,
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
      title: 'Experience',
      icon: Dumbbell,
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
      title: 'Objectives',
      icon: Target,
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
      title: 'Barriers',
      icon: AlertTriangle,
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

  const current = steps[step];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[32px] p-8 border border-white/10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <User className="text-emerald-400" size={24} />
          </div>
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">Operator Profile</span>
            <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Configure Profile</h2>
          </div>
        </div>

        {/* Step nav */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <button key={s.title} onClick={() => setStep(i)}
              className={`flex items-center gap-2 flex-1 py-2.5 rounded-xl text-[9px] font-display uppercase tracking-wider border transition-all ${
                step === i ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/50 border-white/5 text-white/20 hover:border-white/20'
              }`}>
              <s.icon size={12} />
              {s.title}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-emerald-500/60' : 'bg-white/5'
            }`} />
          ))}
        </div>

        {/* Current step */}
        <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <current.icon size={14} className="text-emerald-400" />
            <span className="text-[10px] font-display uppercase tracking-widest text-white/40">{current.title}</span>
          </div>
          {current.content}
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-[10px] font-display uppercase tracking-widest">
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
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
};

export default Profile;
