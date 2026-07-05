/**
 * ShadowSelf — Your dark mirror.
 *
 * The Shadow is not an enemy. It is a parallel Operator stat block that
 * represents the version of you that doesn't show up. It pulls ahead
 * when you skip days and pulls back when you grind. The taunt is
 * generated locally from your actual data — no LLM round-trip needed
 * for the headline, so the panel works even when the API is down.
 *
 * Engineering note: the rivalry ratio drives a 4-tier personality:
 *   < 0.5  → QUIET      (you are dominant)
 *   < 0.8  → COMPETITIVE
 *   < 1.0  → AGGRESSIVE
 *   >= 1.0 → TRIUMPHANT  (Shadow is dominant)
 *
 * The Shadow ramps up roughly 3× faster on the user's weakest stat
 * than on the strongest. This keeps it competitive without being unfair.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Skull, Flame, ArrowRight, Loader2 } from 'lucide-react';
import { useGame } from '../GameContext';
import { StatType } from '../types';

type Personality = 'quiet' | 'competitive' | 'aggressive' | 'triumphant';

interface MirrorStat {
  label: string;
  short: string;
  user: number;
  shadow: number;
  stat: StatType;
}

const STAT_LABELS: { stat: StatType; label: string; short: string }[] = [
  { stat: 'strength', label: 'Strength',   short: 'STR' },
  { stat: 'intelligence', label: 'Intelligence', short: 'INT' },
  { stat: 'agility', label: 'Agility',    short: 'AGI' },
  { stat: 'vitality', label: 'Vitality',   short: 'VIT' },
  { stat: 'willpower', label: 'Willpower', short: 'WIL' },
  { stat: 'social', label: 'Social',     short: 'SOC' },
];

function pickPersonality(ratio: number): Personality {
  if (ratio < 0.5) return 'quiet';
  if (ratio < 0.8) return 'competitive';
  if (ratio < 1.0) return 'aggressive';
  return 'triumphant';
}

function tauntFor(personality: Personality, weakestStat: MirrorStat): string {
  switch (personality) {
    case 'quiet':
      return `…You're ahead. For now. Everyone slips eventually. I'll be here when you do.`;
    case 'competitive':
      return `You did the work. I'll give you that. But your ${weakestStat.label} is still below mine. Don't celebrate early.`;
    case 'aggressive':
      return `Remember when you said "I'll start Sunday"? That was 3 Sundays ago. I've been training every one of them.`;
    case 'triumphant':
      return `Why are you even opening this app? We both know you're going to close it in 30 seconds. Make it worthwhile. Prove something.`;
  }
}

const personaStyle: Record<Personality, { ring: string; glow: string; label: string }> = {
  quiet:       { ring: 'border-white/10',  glow: 'shadow-none',                  label: 'Quiet' },
  competitive: { ring: 'border-amber-500/40', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]', label: 'Competitive' },
  aggressive:  { ring: 'border-red-500/50', glow: 'shadow-[0_0_28px_rgba(239,68,68,0.3)]', label: 'Aggressive' },
  triumphant:  { ring: 'border-red-500/70 bg-red-500/5', glow: 'shadow-[0_0_36px_rgba(239,68,68,0.45)]', label: 'Triumphant' },
};

const ShadowSelf: React.FC = () => {
  const { stats, shadowState, userProfile, sendCommandToAgent } = useGame();
  const [tauntLive, setTauntLive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Build parallel stats and find the weakest.
  const mirrors: MirrorStat[] = useMemo(() => {
    return STAT_LABELS.map(({ stat, label, short }) => ({
      label,
      short,
      stat,
      user: stats[stat] ?? 0,
      shadow: (shadowState[stat] as number) ?? 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, shadowState]);

  const sorted = [...mirrors].sort((a, b) => a.user - b.user);
  const weakest = sorted[0];

  const userAvg = mirrors.reduce((s, m) => s + m.user, 0) / mirrors.length;
  const shadowAvg = mirrors.reduce((s, m) => s + m.shadow, 0) / mirrors.length;
  const ratio = userAvg > 0 ? shadowAvg / userAvg : 0;

  const personality = pickPersonality(ratio);
  const isDominant = ratio >= 1.0;
  const defaultTaunt = tauntFor(personality, weakest);
  const taunt = tauntLive ?? defaultTaunt;
  const persona = personaStyle[personality];

  const talkToShadow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await sendCommandToAgent('SHADOW', defaultTaunt.replace(/\.$/, ''));
      setTauntLive(data.response || defaultTaunt);
    } catch (err: any) {
      // Stay on the deterministic taunt — Shadow has presence even offline.
      setTauntLive(err?.message ? `*static* — ${err.message}` : defaultTaunt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skull size={26} className="text-red-500" />
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 block">
              Mirror Protocol
          </span>
            <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">
              Shadow Self
          </h2>
        </div>
      </div>
        <span className={`text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded border ${persona.ring} ${persona.glow}`}>
          {persona.label}
      </span>
    </header>

      {/* Mirror stat block */}
      <div className={`glass rounded-[32px] border p-8 ${persona.ring} ${persona.glow}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-emerald-400/70">
              {userProfile.name || 'Operator'}
          </span>
            <div className="text-4xl font-display font-black text-white mt-1">{Math.round(userAvg)}</div>
            <span className="text-[8px] font-tech text-white/30">avg stat · present-tense you</span>
        </div>
          <div className="md:text-right">
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-red-400/70">
              Shadow Self
          </span>
            <div className="text-4xl font-display font-black text-red-400 mt-1">{Math.round(shadowAvg)}</div>
            <span className="text-[8px] font-tech text-white/30">avg stat · the you that gives in</span>
        </div>
      </div>

        <div className="mt-6 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${Math.min(100, Math.max(2, ratio * 50))}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${isDominant ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
          />
      </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[8px] font-mono text-white/30">RATIO {ratio.toFixed(2)}</span>
          <span className={`text-[8px] font-mono ${isDominant ? 'text-red-400' : 'text-emerald-400'}`}>
            {isDominant ? 'Shadow DOMINANT' : 'You LEAD'}
        </span>
      </div>
    </div>

      {/* Per-stat bars */}
      <div className="glass rounded-[32px] border border-white/10 p-6">
        <div className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 mb-4">
          Stat Mirror
      </div>
        <div className="space-y-3">
          {mirrors.map(m => {
            const leading = m.shadow > m.user;
            return (
              <div key={m.stat} className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-2 text-[9px] font-display uppercase tracking-widest text-white/40 text-right">{m.short}</span>
                <div className="col-span-7 relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 right-1/2 bg-emerald-500/30" />
                  <div className="absolute inset-y-0 right-0 left-1/2 bg-red-500/20" />
                  <motion.div
                    initial={false}
                    animate={{ left: `${Math.min(100, (m.user / Math.max(100, m.user + m.shadow)) * 100)}%`, width: '4px' }}
                    transition={{ duration: 0.5 }}
                    className="absolute h-full w-1 rounded-full bg-emerald-400"
                  />
              </div>
                <div className="col-span-3 flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-emerald-300">{m.user}</span>
                  <span className="text-white/20">vs</span>
                  <span className={`${leading ? 'text-red-400 font-bold' : 'text-red-200'}`}>{m.shadow}</span>
               </div>
            </div>
            );
          })}
      </div>
    </div>

      {/* Taunt */}
      <div className="glass rounded-[32px] border border-red-500/20 bg-red-500/[0.03] p-8">
        <div className="flex items-start gap-3 mb-2">
          <Flame size={16} className="text-red-400 mt-0.5" />
          <span className="text-[8px] font-display uppercase tracking-[0.3em] text-red-400/70">
            Shadow Speaks
        </span>
      </div>
        <p className="text-base font-tech leading-relaxed text-white/80 italic min-h-[3em]">
          “{taunt}”
      </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={talkToShadow}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-[10px] font-display uppercase tracking-widest transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Skull size={12} />}
            Talk to Shadow
        </button>
          <button
            onClick={() => {
              // "Prove It Wrong" → focus the user on a quest in their weakest
              // stat. We can't navigate tabs from here without coupling, but
              // we scroll them toward the Quest Board which is the next closest.
              const el = document.querySelector('[data-tab="quests"]');
              if (el) (el as HTMLElement).click();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-display uppercase tracking-widest transition-all"
          >
            Prove It Wrong
            <ArrowRight size={12} />
        </button>
      </div>
    </div>
  </div>
  );
};

export default ShadowSelf;
