import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Brain, Dumbbell, Clock, Zap, Trophy, Target, Flame, BookOpen, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const TUTORIAL_KEY = 'nexus_tutorial_complete';

const steps = [
  {
    title: 'Welcome to NEXUS',
    icon: Skull,
    color: '#10b981',
    content: 'NEXUS is your personal evolution system. It tracks your stats, guides your training, and holds you accountable through AI agents. No fluff. No social feeds. Just you vs. who you were yesterday.',
    highlight: null,
  },
  {
    title: 'Your Six Core Stats',
    icon: Zap,
    color: '#f59e0b',
    content: 'Everything you do feeds into six stats: Strength, Intelligence, Agility, Vitality, Willpower, and Social. Complete tasks, log training sessions, and read books to grow them. Watch the hex graph evolve in real time.',
    highlight: 'overview',
  },
  {
    title: 'Training Hub',
    icon: Dumbbell,
    color: '#ef4444',
    content: 'Create your own training routines — physical workouts, mental drills, reading goals, or habit tracking. When you complete a session, hit "Log Session" to sync your stats. Every action increments your numbers.',
    highlight: 'training',
  },
  {
    title: 'Quest Board',
    icon: Target,
    color: '#eab308',
    content: 'Daily Tasks keep you on track. Destiny Quests are your long-term objectives. Complete them for EXP and Nexus Credits (NC). Fail them and face penalties. The system does not forget.',
    highlight: 'quests',
  },
  {
    title: 'Shadow Chat',
    icon: Brain,
    color: '#a855f7',
    content: 'Your AI inner voice. Choose from 6 personas — Mirror, Mentor, Rival, Commander, Confidant, or Strategist. Each has a different personality. Talk to them for reflection, challenge, or guidance. Requires a local LLM (enable it in Profile → Local LLM).',
    highlight: 'shadow',
  },
  {
    title: 'Daily Review',
    icon: Clock,
    color: '#3b82f6',
    content: 'Every day, the Manager generates a debrief based on your performance. See yesterday\'s report, 7-day trends, monthly and yearly breakdowns. Track your evolution over time with real data charts.',
    highlight: 'debrief',
  },
  {
    title: 'Profile & AI Engine',
    icon: Trophy,
    color: '#10b981',
    content: 'Set up your identity, goals, and archetype in Profile. Download the bundled LLM (Qwen2.5-2B, ~1.5GB from HuggingFace) to run AI fully offline. All data stays on your device — zero cloud, zero telemetry.',
    highlight: null,
  },
  {
    title: 'You Are Ready',
    icon: Flame,
    color: '#f97316',
    content: 'No more excuses. No more "someday." NEXUS does not care about your reasons — only your actions. Log a session. Complete a task. Talk to the Shadow. Evolve or stay calibrated. The choice is yours, Operator.',
    highlight: null,
  },
];

const Tutorial: React.FC<{ onComplete: () => void; onSkip: (targetTab?: string) => void }> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
      onComplete();
    } else {
      if (current.highlight && onSkip) {
        onSkip(current.highlight);
      }
      setStep(step + 1);
    }
  };

  const handleSkipAll = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-[40px] border border-white/10 overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          {/* Skip button */}
          <button
            onClick={handleSkipAll}
            className="absolute top-5 right-5 p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all z-10"
          >
            <X size={16} />
          </button>

          {/* Icon header with glow */}
          <div className="pt-12 pb-6 flex flex-col items-center">
            <motion.div
              key={step}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center border-2 mb-6"
              style={{
                borderColor: current.color + '40',
                background: current.color + '0d',
                boxShadow: `0 0 40px ${current.color}20`,
              }}
            >
              <Icon size={36} style={{ color: current.color }} />
            </motion.div>
            <span
              className="text-[8px] font-display uppercase tracking-[0.4em] mb-2"
              style={{ color: current.color + '80' }}
            >
              Step {step + 1} of {steps.length}
            </span>
            <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white text-center px-6">
              {current.title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-10 pb-8">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-tech text-white/60 leading-relaxed text-center"
            >
              {current.content}
            </motion.p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? '24px' : '6px',
                  background: i <= step ? current.color : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 pb-8 pt-2">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-[9px] font-display uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-widest transition-all"
              style={{
                background: current.color + '20',
                border: `1px solid ${current.color}40`,
                color: current.color,
              }}
            >
              {isLast ? (
                <><Check size={14} /> Enter NEXUS</>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const shouldShowTutorial = () => {
  return localStorage.getItem(TUTORIAL_KEY) !== 'true';
};

export const markTutorialComplete = () => {
  localStorage.setItem(TUTORIAL_KEY, 'true');
};

export default Tutorial;
