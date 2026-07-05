/**
 * Digital Discipline Governor — AppControlPanel.
 *
 * The "lock" here is local: the Operator commits to a stance on each
 * distracting app (Locked / Open). Toggling to Locked makes the
 * decision visible to yourself — there is no kernel-level sandboxing.
 *
 * Why bother with no real enforcement? Because the only person you
 * need to defeat is *future you*, three seconds before opening
 * TikTok. Hesitation is where discipline lives.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, Shield, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useGame } from '../GameContext';

interface AppTarget {
  id: string;
  name: string;
  icon: string;
  category: 'social' | 'video' | 'messaging' | 'gaming';
  riskNote: string;
}

const TARGETS: AppTarget[] = [
  { id: 'Instagram', name: 'Instagram',  icon: '📷', category: 'social',    riskNote: 'Endless feed. ≈ 90 min/day leak.' },
  { id: 'Twitter',   name: 'X / Twitter', icon: '✖', category: 'social',    riskNote: 'Dopamine ping. Comparison trap.' },
  { id: 'TikTok',    name: 'TikTok',     icon: '🎵', category: 'video',      riskNote: 'Reels rabbit hole. Avg session 24 min.' },
  { id: 'YouTube',   name: 'YouTube',    icon: '▶', category: 'video',      riskNote: 'Algorithm is the boss of you.' },
  { id: 'Reddit',    name: 'Reddit',     icon: '🤖', category: 'social',    riskNote: 'One thread → three hours.' },
  { id: 'Discord',   name: 'Discord',    icon: '💬', category: 'messaging', riskNote: 'Invisible until it isn’t.' },
  { id: 'Steam',     name: 'Steam',      icon: '🎮', category: 'gaming',    riskNote: 'One game. Then the next.' },
  { id: 'Twitch',    name: 'Twitch',     icon: '🟣', category: 'video',      riskNote: 'Live attention drain.' },
];

const AppControlPanel: React.FC = () => {
  const { appPermissions, toggleAppPermission, consistency } = useGame();
  const [pending, setPending] = useState<{ app: string; action: 'lock' | 'unlock' } | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  // The Peter's-principle fallback: if no perms have been set, treat
  // all targets as OPEN so the user sees a fresh list.
  const knownCount = Object.keys(appPermissions).length;
  const paranoidTotal = knownCount === 0 ? 0 : TARGETS.length;
  const lockedCount = Object.values(appPermissions).filter(Boolean).length;

  // Auto-add the canonical targets to localStorage on first visit so
  // the toggles become meaningful on subsequent renders.
  useEffect(() => {
    if (knownCount === 0) {
      TARGETS.forEach(t => toggleAppPermission(t.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const inFocusBlock = hour >= 9 && hour <= 17;

  const ask = (app: string, currentlyLocked: boolean) =>
    setPending({ app, action: currentlyLocked ? 'unlock' : 'lock' });

  const perform = () => {
    if (!pending) return;
    toggleAppPermission(pending.app);
    setPending(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield size={26} className="text-amber-400" />
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30 block">
              Governor Protocol
           </span>
            <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">
              Digital Discipline
           </h2>
         </div>
       </div>
        <div className="text-right">
          <div className="text-2xl font-display font-black text-amber-400">
            {lockedCount}/{paranoidTotal}
         </div>
          <span className="text-[8px] font-tech text-white/30">apps in lockdown</span>
       </div>
     </header>

      <p className="text-[11px] font-tech text-white/40 max-w-3xl leading-relaxed">
        Toggling an app to{' '}
        <span className="text-amber-400 font-bold">LOCKED</span> is a commitment, not
        a restriction. The System cannot physically stop you from opening the app —
        it can only make you hesitate. Hesitation is where discipline lives. A 7-day
        consistency of <b className="text-white">{consistency.score}%</b> means you have
        earned this platform.
     </p>

      {/* Focus block indicator */}
      <div
        className={`glass rounded-[24px] border p-4 flex items-center gap-3 ${
          inFocusBlock ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10'
        }`}
      >
        <Clock size={18} className={inFocusBlock ? 'text-amber-400' : 'text-white/40'} />
        <div className="flex-1">
          <span className="text-[8px] font-display uppercase tracking-widest text-white/30 block">
            Current Zone
         </span>
          <span
            className={`text-sm font-tech ${
              inFocusBlock ? 'text-amber-300' : 'text-white/60'
            }`}
          >
            {inFocusBlock
              ? `Focus window OPEN — now is prime discipline time`
              : `Free hours — not a focus window, lockdown is more symbolic`}
         </span>
       </div>
        {inFocusBlock && (
          <span className="text-[8px] font-mono px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ACTIVE
         </span>
        )}
     </div>

      {/* App grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TARGETS.map(app => {
          const locked = !!appPermissions[app.id];
          return (
            <motion.div
              key={app.id}
              layout
              className={`glass rounded-2xl border p-4 transition-all ${
                locked
                  ? 'border-amber-500/40 bg-amber-500/[0.04]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                    {app.icon}
                 </div>
                  <div>
                    <div className="text-xs font-display font-bold text-white">{app.name}</div>
<div className="text-[8px] font-tech text-white/40 uppercase tracking-widest">
                       {app.category}
                     </div>
                 </div>
               </div>
                <span
                  className={`text-[8px] font-display uppercase tracking-widest px-2 py-1 rounded-full border ${
                    locked
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                      : 'border-white/10 bg-white/5 text-white/30'
                  }`}
                >
                  {locked ? 'LOCKED' : 'OPEN'}
               </span>
             </div>
              <p className="text-[9px] font-tech text-white/40 mb-3 leading-relaxed min-h-[2em]">
                {app.riskNote}
             </p>
              <button
                onClick={() => ask(app.id, locked)}
                className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-[10px] font-display uppercase tracking-widest transition-all ${
                  locked
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/50 border border-white/10'
                }`}
              >
                {locked ? <Lock size={12} /> : <Unlock size={12} />}
                {locked ? 'Hold to Unlock' : 'Lock for the Day'}
             </button>
           </motion.div>
          );
        })}
     </div>

      {/* Confirmation modal */}
      {pending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.92, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            className="glass rounded-[28px] border border-white/15 p-8 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-3">
              {pending.action === 'lock' ? (
                <Lock size={20} className="text-amber-400" />
              ) : (
                <AlertTriangle size={20} className="text-red-400" />
              )}
              <h3 className="text-lg font-display font-black uppercase">
                {pending.action === 'lock' ? 'Confirm Lockdown' : 'Release Lock'}
             </h3>
           </div>
            <p className="text-sm font-tech text-white/70 leading-relaxed mb-5">
              {pending.action === 'lock' ? (
                <>
                  Locking <b className="text-white">{pending.app}</b>. This is a public
                  commitment your future self will have to override. TITAN would approve.
                </>
              ) : (
                <>
                  You’re releasing <b className="text-white">{pending.app}</b>. The Shadow
                  sees you. SHADOW will remember. Confirm only if you genuinely need it.
                </>
              )}
           </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPending(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-display uppercase tracking-widest"
              >
                Cancel
             </button>
              <button
                onClick={perform}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-display uppercase tracking-widest transition-all flex items-center gap-2 ${
                  pending.action === 'lock'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-red-500 hover:bg-red-400 text-white'
                }`}
              >
                {pending.action === 'lock' ? (
                  <>
                    <CheckCircle2 size={12} /> Commit
                  </>
                ) : (
                  <>
                    <Unlock size={12} /> Release
                  </>
                )}
             </button>
           </div>
         </motion.div>
       </motion.div>
      )}
   </div>
  );
};

export default AppControlPanel;
