import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Activity, ArrowRight, Cpu, Zap, Dumbbell, Moon, Apple, Heart, BookOpen, Eye, Users, Wind, Loader2, Target } from 'lucide-react';
import { useGame } from '../GameContext';
import { UserStats } from '../types';
import { PhysicalTrainerAgent } from '../agents/PhysicalTrainerAgent';
import { MentalTrainerAgent } from '../agents/MentalTrainerAgent';

interface Question {
  title: string;
  icon: React.ElementType;
  question: string;
  options: { label: string; value: string; hint?: string }[];
}

type Phase = 'boot' | 'physical' | 'cognitive' | 'processing_physical' | 'processing_cognitive' | 'profile' | 'complete';

type ProfileStep = 'identity' | 'experience' | 'goals' | 'preferences';

const physicalQuestions: Question[] = [
  {
    title: "Upper Body Strength",
    icon: Dumbbell,
    question: "How many pushups can you perform in one set with proper form?",
    options: [
      { label: "0-5", value: "sedentary", hint: "Just starting out" },
      { label: "6-15", value: "beginner", hint: "Some baseline strength" },
      { label: "16-30", value: "intermediate", hint: "Decent endurance" },
      { label: "30+", value: "advanced", hint: "Strong upper body" },
    ],
  },
  {
    title: "Training Frequency",
    icon: Activity,
    question: "How many days per week do you engage in physical exercise?",
    options: [
      { label: "0-1 days", value: "rarely", hint: "Minimal activity" },
      { label: "2-3 days", value: "light", hint: "Occasional training" },
      { label: "4-5 days", value: "moderate", hint: "Consistent routine" },
      { label: "6-7 days", value: "dedicated", hint: "High discipline" },
    ],
  },
  {
    title: "Sleep & Recovery",
    icon: Moon,
    question: "How would you rate your average sleep quality and recovery?",
    options: [
      { label: "Poor", value: "poor", hint: "< 5 hrs, restless" },
      { label: "Fair", value: "fair", hint: "5-6 hrs, interrupted" },
      { label: "Good", value: "good", hint: "7-8 hrs, restful" },
      { label: "Excellent", value: "excellent", hint: "8+ hrs, deep & consistent" },
    ],
  },
  {
    title: "Nutrition Habits",
    icon: Apple,
    question: "How would you describe your daily nutrition and hydration?",
    options: [
      { label: "Unstructured", value: "poor", hint: "Processed food, irregular meals" },
      { label: "Mixed", value: "fair", hint: "Some balance, occasional junk" },
      { label: "Balanced", value: "good", hint: "Whole foods, tracked macros" },
      { label: "Optimized", value: "excellent", hint: "Precision nutrition, supplements" },
    ],
  },
  {
    title: "Daily Activity Level",
    icon: Heart,
    question: "How physically active is your daily life outside of exercise?",
    options: [
      { label: "Sedentary", value: "sedentary", hint: "Desk job, minimal movement" },
      { label: "Light", value: "light", hint: "Some walking, standing" },
      { label: "Active", value: "active", hint: "On feet frequently" },
      { label: "Very Active", value: "very_active", hint: "Physical labor, constant motion" },
    ],
  },
];

const cognitiveQuestions: Question[] = [
  {
    title: "Deep Focus Capacity",
    icon: Brain,
    question: "How many hours of uninterrupted deep focus can you maintain daily?",
    options: [
      { label: "< 1 hour", value: "low", hint: "Easily distracted" },
      { label: "1-3 hours", value: "moderate", hint: "Some focus control" },
      { label: "3-5 hours", value: "strong", hint: "Good concentration" },
      { label: "5+ hours", value: "exceptional", hint: "Deep work mastery" },
    ],
  },
  {
    title: "Learning Throughput",
    icon: BookOpen,
    question: "How many books, articles, or courses have you completed in the past month?",
    options: [
      { label: "0", value: "none", hint: "No structured learning" },
      { label: "1-2", value: "light", hint: "Occasional reading" },
      { label: "3-5", value: "moderate", hint: "Consistent learner" },
      { label: "5+", value: "heavy", hint: "High knowledge intake" },
    ],
  },
  {
    title: "Memory & Retention",
    icon: Eye,
    question: "How well do you retain and recall new information?",
    options: [
      { label: "Struggle to recall", value: "weak", hint: "Need frequent review" },
      { label: "Need repetition", value: "average", hint: "Recall with practice" },
      { label: "Good retention", value: "strong", hint: "Remember after few reads" },
      { label: "Near-photographic", value: "exceptional", hint: "Minimal repetition needed" },
    ],
  },
  {
    title: "Problem-Solving Style",
    icon: Wind,
    question: "When faced with a complex problem, what is your typical approach?",
    options: [
      { label: "Avoid or delay", value: "avoidant", hint: "Procrastinate or defer" },
      { label: "Seek external help", value: "dependent", hint: "Rely on others' solutions" },
      { label: "Break it down", value: "analytical", hint: "Deconstruct systematically" },
      { label: "Systematically solve", value: "strategic", hint: "Independent deep analysis" },
    ],
  },
  {
    title: "Social & Emotional Regulation",
    icon: Users,
    question: "How often do you practice mindfulness, meditation, or intentional social connection?",
    options: [
      { label: "Never", value: "none", hint: "No structured practice" },
      { label: "Occasionally", value: "occasional", hint: "Once or twice a month" },
      { label: "Weekly", value: "weekly", hint: "Regular practice" },
      { label: "Daily", value: "daily", hint: "Integrated discipline" },
    ],
  },
];

const agentIcons: Record<string, React.ElementType> = {
  TITAN: Dumbbell,
  SAGE: Brain,
};

const InitialAssessment: React.FC = () => {
  const { completeAssessment, updateUserProfile, setCharacter } = useGame();

  const [phase, setPhase] = useState<Phase>('boot');
  const [step, setStep] = useState(0);
  const [physicalAnswers, setPhysicalAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [cognitiveAnswers, setCognitiveAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [processingMessage, setProcessingMessage] = useState('');
  const [agentReasoning, setAgentReasoning] = useState<string | null>(null);
  const [finalStats, setFinalStats] = useState<UserStats | null>(null);
  const [profileStep, setProfileStep] = useState<ProfileStep>('identity');
  const [profileName, setProfileName] = useState('');
  const [profileCharacter, setProfileCharacter] = useState('Ayanokoji');
  const [profileGoal, setProfileGoal] = useState('');
  const [profileTimeframe, setProfileTimeframe] = useState('');
  const [profileExperience, setProfileExperience] = useState<string>('intermediate');
  const [profileSecondaryGoals, setProfileSecondaryGoals] = useState<string[]>([]);
  const [profileBarriers, setProfileBarriers] = useState<string[]>([]);

  useEffect(() => {
    if (phase !== 'boot') return;
    const timer = setTimeout(() => setPhase('physical'), 5000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleProfileSubmit = () => {
    if (!profileName.trim()) return;
    const goalText = profileGoal.trim()
      ? `${profileGoal.trim()} (Timeframe: ${profileTimeframe || 'Not set'})`
      : 'Self-improvement (Timeframe: Ongoing)';
    updateUserProfile({
      name: profileName.trim(),
      primaryGoal: goalText,
      secondaryGoals: profileSecondaryGoals.length > 0 ? profileSecondaryGoals : ['Get stronger', 'Improve focus', 'Build better habits'],
      fitnessExperience: profileExperience as any,
      barriers: profileBarriers,
    });
    setCharacter(profileCharacter);
    if (finalStats) {
      completeAssessment(finalStats);
    }
  };

  const toggleSecondaryGoal = (goal: string) => {
    setProfileSecondaryGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleBarrier = (barrier: string) => {
    setProfileBarriers(prev =>
      prev.includes(barrier) ? prev.filter(b => b !== barrier) : [...prev, barrier]
    );
  };

  const currentQuestions = phase === 'physical' ? physicalQuestions : cognitiveQuestions;
  const currentStep = currentQuestions[step];

  const handleOption = useCallback(async (question: string, answerValue: string) => {
    if (phase === 'physical') {
      const updatedAnswers = [...physicalAnswers, { question, answer: answerValue }];
      setPhysicalAnswers(updatedAnswers);

      if (step < physicalQuestions.length - 1) {
        setStep(s => s + 1);
      } else {
        setPhase('processing_physical');
        setProcessingMessage('TITAN is analyzing your physical baseline...');
        await processPhysicalAssessment(updatedAnswers);
      }
    } else {
      const updatedAnswers = [...cognitiveAnswers, { question, answer: answerValue }];
      setCognitiveAnswers(updatedAnswers);

      if (step < cognitiveQuestions.length - 1) {
        setStep(s => s + 1);
      } else {
        setPhase('processing_cognitive');
        setProcessingMessage('SAGE is evaluating your cognitive profile...');
        await processCognitiveAssessment(updatedAnswers);
      }
    }
  }, [phase, step, physicalAnswers, cognitiveAnswers]);

  const scoreMap: Record<string, number> = {
    sedentary: 10, beginner: 25, intermediate: 45, advanced: 70,
    rarely: 10, light: 20, moderate: 40, dedicated: 65,
    poor: 10, fair: 25, good: 50, excellent: 75,
    unstructured: 10, mixed: 25, balanced: 50, optimized: 75,
    very_active: 65, active: 45, none: 10, occasional: 25,
    low: 10, strong: 55, exceptional: 80, heavy: 75,
    weak: 10, average: 30, avoidant: 10, dependent: 20,
    analytical: 50, strategic: 75, weekly: 50, daily: 75,
  };

  const computePhysicalStats = (answers: { question: string; answer: string }[]) => {
    const vals = answers.map(a => scoreMap[a.answer] || 25);
    return {
      strength: vals[0] || 25,
      agility: vals[4] || 25,
      vitality: Math.round((vals.slice(1, 4).reduce((a, b) => a + b, 0)) / Math.max(vals.slice(1, 4).length, 1)),
    };
  };

  const computeCognitiveStats = (answers: { question: string; answer: string }[]) => {
    const vals = answers.map(a => scoreMap[a.answer] || 25);
    return {
      intelligence: Math.round((vals.slice(0, 4).reduce((a, b) => a + b, 0)) / 4),
      willpower: Math.round((vals[0] + vals[3]) / 2),
      social: vals[4] || 25,
    };
  };

  const processPhysicalAssessment = async (answers: { question: string; answer: string }[]) => {
    const computed = computePhysicalStats(answers);
    const readableMap: Record<string, string> = {
      sedentary: "Sedentary - minimal activity", beginner: "Beginner level", intermediate: "Intermediate level", advanced: "Advanced level",
      rarely: "0-1 days per week", light: "2-3 days per week", moderate: "4-5 days per week", dedicated: "6-7 days per week",
      poor: "Poor quality", fair: "Fair quality", good: "Good quality", excellent: "Excellent quality",
      unstructured: "Unstructured", mixed: "Mixed habits", balanced: "Balanced nutrition", optimized: "Optimized nutrition",
      very_active: "Very active daily life",
    };
    const readableAnswers = answers.map(a => ({ question: a.question, answer: readableMap[a.answer] || a.answer }));
    try {
      const agent = new PhysicalTrainerAgent();
      const result = await agent.assessPhysicalBaseline(readableAnswers);
      setAgentReasoning(result.reasoning);
      setProcessingMessage('');

      localStorage.setItem('nexus_physical_assessment', JSON.stringify({
        strength: result.strength,
        agility: result.agility,
        vitality: result.vitality,
      }));
    } catch {
      localStorage.setItem('nexus_physical_assessment', JSON.stringify(computed));
    }
    setPhysicalAnswers(answers);
    setPhase('cognitive');
    setStep(0);
    setAgentReasoning(null);
  };

  const processCognitiveAssessment = async (answers: { question: string; answer: string }[]) => {
    const computed = computeCognitiveStats(answers);
    const savedPhysical = localStorage.getItem('nexus_physical_assessment');
    const physical = savedPhysical ? JSON.parse(savedPhysical) : { strength: 25, agility: 25, vitality: 25 };

    let intelligence = computed.intelligence;
    let willpower = computed.willpower;
    let social = computed.social;

    const readableCognitiveMap: Record<string, string> = {
      low: "Less than 1 hour", moderate: "1-3 hours", strong: "Strong capacity", exceptional: "Exceptional capacity",
      none: "None at all", light: "1-2 items", heavy: "Heavy throughput",
      weak: "Weak retention", average: "Average retention",
      avoidant: "Avoid or delay", dependent: "Seek external help", analytical: "Break it down analytically", strategic: "Systematically solve",
      occasional: "Occasional practice", weekly: "Weekly practice", daily: "Daily practice",
    };
    const readableAnswers = answers.map(a => ({ question: a.question, answer: readableCognitiveMap[a.answer] || a.answer }));

    try {
      const agent = new MentalTrainerAgent();
      const result = await agent.assessCognitiveBaseline(readableAnswers);
      setAgentReasoning(result.reasoning);
      intelligence = result.intelligence;
      willpower = result.willpower;
      social = result.social;
    } catch {}

    localStorage.removeItem('nexus_physical_assessment');
    setProcessingMessage('');
    setFinalStats({
      strength: physical.strength,
      intelligence,
      agility: physical.agility,
      vitality: physical.vitality,
      willpower,
      social,
    });
    setPhase('profile');
  };

  const isProcessing = phase === 'processing_physical' || phase === 'processing_cognitive';
  const processingAgent = phase === 'processing_physical' ? 'TITAN' : 'SAGE';

  return (
    <div className="fixed inset-0 bg-[#000] z-[100] flex items-start justify-center p-6 pt-12 font-tech overflow-y-auto nexus-grid">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* HUD Circles */}
      <div className="hud-circle" />
      <div className="hud-circle" />
      <div className="hud-circle" />
      <div className="hud-circle" />

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-500/10 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

        {/* Boot Splash */}
        <AnimatePresence mode="wait">
          {phase === 'boot' && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(2px)' }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center justify-center z-10 h-full"
            >
              {/* Rising dot */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                initial={{ top: '100%' }}
                animate={{ top: '45%' }}
                transition={{ duration: 5, ease: [0.43, 0.13, 0.23, 0.96] }}
              />

              {/* NEXUS title - smaller cinematic */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                <h1 className="text-7xl md:text-9xl font-display font-black text-white tracking-[0.06em] uppercase leading-none text-center" style={{ textShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                  NEXUS
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <h2 className="text-sm md:text-base font-display font-light uppercase tracking-[0.6em] text-emerald-400/40 mt-4">
                  Self-Evolution System
                </h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 2.0 }}
                className="absolute bottom-16"
              >
                <p className="text-[10px] font-mono text-emerald-500/25 tracking-[0.3em] uppercase">
                  by Mindraxus
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assessment Content */}
        {phase !== 'boot' && (
        <div className="flex flex-col items-center w-full">
            {/* Assessment Header */}
            <div className="mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center glow-emerald mb-4">
                  <Cpu className="text-emerald-400" size={32} />
                </div>
                <div className="space-y-2">
                  <span className="text-emerald-500 font-display text-[10px] tracking-[0.6em] uppercase glow-text-emerald">Initial Calibration Sequence</span>
                  <h1 className="text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
                    NEXUS is Testing You
                  </h1>
                </div>
              </motion.div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hologram-card p-12 rounded-[40px] border border-white/10 relative overflow-hidden text-center"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20 animate-scanline-fast" />
                <div className="flex flex-col items-center gap-6 py-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                      {React.createElement(agentIcons[processingAgent] || Cpu, { className: "text-emerald-400", size: 44 })}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Loader2 className="text-emerald-400 animate-spin" size={24} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-white text-2xl font-display font-bold uppercase tracking-tight">
                      {processingAgent} is Analyzing
                    </div>
                    <p className="text-white/50 text-sm">{processingMessage}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <motion.div className="w-2 h-2 bg-emerald-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                    <motion.div className="w-2 h-2 bg-emerald-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
                    <motion.div className="w-2 h-2 bg-emerald-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Question Card */}
            {!isProcessing && phase !== 'complete' && phase !== 'goal' && phase !== 'profile' && currentStep && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${phase}-${step}`}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="hologram-card p-10 rounded-[40px] border border-white/10 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20 animate-scanline-fast opacity-50" />

                  {/* Phase Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase tracking-[0.3em] font-display font-semibold ${phase === 'physical' ? 'text-orange-400' : 'text-blue-400'}`}>
                        {phase === 'physical' ? 'TITAN // Physical Calibration' : 'SAGE // Cognitive Calibration'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-white/20 uppercase tracking-widest font-display">System Integrity</span>
                      <span className={`text-xs font-mono ${phase === 'physical' ? 'text-orange-400' : 'text-blue-400'}`}>STABLE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                        {React.createElement(currentStep.icon, {
                          className: phase === 'physical' ? 'text-orange-400' : 'text-blue-400',
                          size: 24,
                        })}
                      </div>
                      <div>
                        <div className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-display mb-1">
                          {phase === 'physical' ? `Physical Assessment ${step + 1}/${physicalQuestions.length}` : `Cognitive Assessment ${step + 1}/${cognitiveQuestions.length}`}
                        </div>
                        <div className="text-white text-xl font-display font-bold uppercase tracking-tight">{currentStep.title}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/70 text-lg mb-8 font-tech leading-relaxed border-l-4 border-white/10 pl-5">
                    {currentStep.question}
                  </p>

                  <div className="grid gap-3">
                    {currentStep.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOption(currentStep.question, opt.value)}
                        className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl text-left transition-all flex items-center justify-between group/btn relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-4">
                          <span className="font-display text-sm uppercase tracking-widest text-white group-hover/btn:text-emerald-300 transition-colors">{opt.label}</span>
                          {opt.hint && (
                            <span className="text-[10px] text-white/20 font-mono hidden md:inline">{opt.hint}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="text-[10px] font-mono text-white/20 group-hover/btn:text-emerald-400/60 uppercase">Select</span>
                          <ArrowRight size={16} className="opacity-0 group-hover/btn:opacity-100 transition-all group-hover/btn:translate-x-1 text-emerald-400" />
                        </div>
                      </button>
                    ))}
                  </div>

                </motion.div>
              </AnimatePresence>
            )}

            {/* Agent Reasoning Display */}
            {agentReasoning && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <Cpu size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-white/30 font-mono leading-relaxed">{agentReasoning}</p>
                </div>
              </motion.div>
            )}

            {/* Phase Transition */}
            {phase === 'cognitive' && !isProcessing && step === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center"
              >
                <p className="text-blue-300 text-xs font-display uppercase tracking-widest">
                  Physical baseline calibrated. Initiating cognitive profiling...
                </p>
              </motion.div>
            )}

            {/* Profile Setup */}
            {phase === 'profile' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="hologram-card p-10 rounded-[40px] border border-white/10 relative overflow-hidden w-full max-w-2xl"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20 animate-scanline-fast opacity-50" />

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                    <Target className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <div className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-display mb-1">Final Step — Operator Profile</div>
                    <div className="text-white text-xl font-display font-bold uppercase tracking-tight">Configure Your Identity</div>
                  </div>
                </div>

                {/* Step tabs */}
                <div className="flex gap-2 mb-8">
                  {(['identity', 'experience', 'goals', 'preferences'] as ProfileStep[]).map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setProfileStep(s)}
                      className={`flex-1 py-2 rounded-xl text-[9px] font-display uppercase tracking-wider transition-all border ${
                        profileStep === s
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {['Identity', 'Experience', 'Goals', 'Barriers'][i]}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* Identity Step */}
                  {profileStep === 'identity' && (
                    <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Operator Designation</label>
                        <input
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          placeholder="Enter your name or callsign..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Archetype Alignment</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'Ayanokoji', label: 'The Strategist', desc: 'Calculated, analytical, self-reliant' },
                            { id: 'Solo Leveling', label: 'The Awakener', desc: 'Rises through adversity, relentless' },
                            { id: 'Batman', label: 'The Peak Human', desc: 'Peak mind & body through discipline' },
                            { id: 'Johan', label: 'The Manipulator', desc: 'Understands systems, exploits weakness' },
                          ].map(c => (
                            <button
                              key={c.id}
                              onClick={() => setProfileCharacter(c.id)}
                              className={`p-4 rounded-2xl text-left border transition-all ${
                                profileCharacter === c.id
                                  ? 'bg-emerald-500/10 border-emerald-500/40'
                                  : 'bg-white/5 border-white/10 hover:border-white/30'
                              }`}
                            >
                              <span className="text-xs font-display font-bold uppercase tracking-wider block text-white">{c.label}</span>
                              <span className="text-[9px] text-white/40 font-mono mt-1 block">{c.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Experience Step */}
                  {profileStep === 'experience' && (
                    <motion.div key="experience" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Fitness Experience</label>
                        <div className="flex gap-3">
                          {[
                            { id: 'beginner', label: 'Beginner', desc: 'New to training' },
                            { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                            { id: 'advanced', label: 'Advanced', desc: 'Consistent athlete' },
                          ].map(e => (
                            <button
                              key={e.id}
                              onClick={() => setProfileExperience(e.id)}
                              className={`flex-1 p-4 rounded-2xl text-center border transition-all ${
                                profileExperience === e.id
                                  ? 'bg-emerald-500/10 border-emerald-500/40'
                                  : 'bg-white/5 border-white/10 hover:border-white/30'
                              }`}
                            >
                              <span className="text-xs font-display font-bold uppercase block text-white">{e.label}</span>
                              <span className="text-[9px] text-white/40 font-mono mt-1 block">{e.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Learning Style</label>
                        <div className="flex gap-3">
                          {[
                            { id: 'reading', label: 'Reading' },
                            { id: 'visual', label: 'Visual' },
                            { id: 'hands-on', label: 'Hands-On' },
                            { id: 'mixed', label: 'Mixed' },
                          ].map(l => (
                            <button
                              key={l.id}
                              onClick={() => {}}
                              className="flex-1 py-3 rounded-2xl text-center border border-white/10 bg-white/5 hover:border-white/30 transition-all"
                            >
                              <span className="text-[10px] font-display uppercase text-white/50">{l.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Goals Step */}
                  {profileStep === 'goals' && (
                    <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-2 block">Primary Mission Objective</label>
                        <textarea
                          value={profileGoal}
                          onChange={e => setProfileGoal(e.target.value)}
                          placeholder="e.g. Build 10kg of lean muscle, master competitive programming, run a half-marathon..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none h-20"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Secondary Objectives</label>
                        <div className="flex flex-wrap gap-2">
                          {['Build strength', 'Improve focus', 'Read more books', 'Better sleep', 'Learn a skill', 'Social growth', 'Meditation', 'Running endurance'].map(g => (
                            <button
                              key={g}
                              onClick={() => toggleSecondaryGoal(g)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-display uppercase tracking-wider border transition-all ${
                                profileSecondaryGoals.includes(g)
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Target Timeframe</label>
                        <div className="flex gap-3">
                          {['3 Months', '6 Months', '1 Year', '2+ Years'].map(t => (
                            <button
                              key={t}
                              onClick={() => setProfileTimeframe(t)}
                              className={`flex-1 py-3 rounded-2xl text-xs font-display uppercase tracking-widest transition-all border ${
                                profileTimeframe === t
                                  ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-white/70'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Barriers Step */}
                  {profileStep === 'preferences' && (
                    <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <label className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-3 block">Key Obstacles / Barriers</label>
                        <div className="flex flex-wrap gap-2">
                          {['Procrastination', 'Low energy', 'Time management', 'Motivation dips', 'Social pressure', 'Information overload', 'Sleep issues', 'Self-doubt'].map(b => (
                            <button
                              key={b}
                              onClick={() => toggleBarrier(b)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-display uppercase tracking-wider border transition-all ${
                                profileBarriers.includes(b)
                                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[10px] text-emerald-400/60 font-mono leading-relaxed">
                          Your profile helps the AI calibrate your evolution protocols. You can update these anytime from the main dashboard.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 mt-8">
                  {profileStep !== 'identity' && (
                    <button
                      onClick={() => setProfileStep(['identity', 'experience', 'goals', 'preferences'][['identity', 'experience', 'goals', 'preferences'].indexOf(profileStep) - 1] as ProfileStep)}
                      className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all text-xs font-display uppercase tracking-widest"
                    >
                      Back
                    </button>
                  )}
                  {profileStep !== 'preferences' ? (
                    <button
                      onClick={() => setProfileStep(['experience', 'goals', 'preferences'][['identity', 'experience', 'goals'].indexOf(profileStep)] as ProfileStep)}
                      disabled={profileStep === 'identity' && !profileName.trim()}
                      className="flex-1 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-xs font-display uppercase tracking-widest disabled:opacity-30"
                    >
                      Next
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProfileSubmit}
                      disabled={!profileName.trim()}
                      className="flex-1 py-4 rounded-2xl font-display text-sm uppercase tracking-[0.3em] font-bold transition-all bg-emerald-500 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    >
                      Initialize Evolution System
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
    </div>
              );
};

              export default InitialAssessment;
