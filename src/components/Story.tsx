import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Lock, Check, Scroll, ChevronRight, X, Sparkles } from 'lucide-react';
import { useGame } from '../GameContext';
import { NarrativeChapter } from '../types';

const Story: React.FC = () => {
  const { narrativeChapters, progression, achievements, readChapter } = useGame();
  const [openChapter, setOpenChapter] = useState<NarrativeChapter | null>(null);

  const unlockedIds = useMemo(() => new Set(achievements.filter(a => a.unlocked).map(a => a.id)), [achievements]);
  const level = progression.level;

  const chapters = useMemo(() => narrativeChapters.map(ch => ({
    ...ch,
    unlocked: ch.unlocked && level >= ch.requiredLevel && ch.requiredAchievements.every(id => unlockedIds.has(id)),
  })), [narrativeChapters, level, unlockedIds]);

  const handleOpen = (ch: NarrativeChapter) => {
    if (!ch.unlocked) return;
    setOpenChapter(ch);
    readChapter(ch.id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <Scroll size={44} className="text-amber-400" />
          </div>
          <div className="space-y-1">
            <span className="text-amber-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(245,158,11,0.6)] block">Story</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Story Archive</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">
              {chapters.filter(c => c.read).length} / {chapters.length} chapters Read
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chapters.map((ch) => {
          const isLocked = !ch.unlocked;
          const isRead = ch.read;
          return (
            <motion.button
              key={ch.id}
              whileHover={isLocked ? {} : { y: -4, scale: 1.005 }}
              onClick={() => handleOpen(ch)}
              disabled={isLocked}
              className={`relative hologram-card rounded-[32px] p-8 overflow-hidden text-left transition-all border ${
                isLocked
                  ? 'border-white/5 opacity-50 cursor-not-allowed'
                  : isRead
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    isLocked
                      ? 'bg-white/5 border-white/10 text-white/30'
                      : isRead
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}>
                    {isLocked ? <Lock size={22} /> : isRead ? <Check size={22} /> : <BookOpen size={22} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-[0.3em] text-white/30 block">Chapter {ch.id}</span>
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight text-white leading-none mt-1">{ch.title}</h3>
                  </div>
                </div>
                {!isLocked && <ChevronRight size={18} className="text-white/30" />}
              </div>

              <p className="text-[11px] font-tech text-white/40 leading-relaxed line-clamp-3 mb-6 min-h-[44px]">
                {isLocked
                  ? `Locked. Requires Level ${ch.requiredLevel}${ch.requiredAchievements.length ? ' + ' + ch.requiredAchievements.length + ' achievement' + (ch.requiredAchievements.length > 1 ? 's' : '') : ''}.`
                  : ch.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ch.requiredLevel > 1 && (
                    <span className="text-[9px] font-mono px-2 py-1 rounded-md bg-white/5 text-white/40">
                      LVL {ch.requiredLevel}
                    </span>
                  )}
                  {ch.rewardCredits > 0 && (
                    <span className="text-[9px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">+{ch.rewardCredits} NC</span>
                  )}
                  {ch.rewardExp > 0 && (
                    <span className="text-[9px] font-mono px-2 py-1 rounded-md bg-amber-500/10 text-amber-400">+{ch.rewardExp} XP</span>
                  )}
                </div>
                {isRead && (
                  <span className="text-[8px] font-display uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                    <Sparkles size={10} /> Read
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {openChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpenChapter(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-[32px] border border-amber-500/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-[0_0_80px_rgba(245,158,11,0.1)]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-8 pb-6 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div>
                  <span className="text-amber-500/60 font-display text-[8px] tracking-[0.5em] uppercase">Chapter {openChapter.id}</span>
                  <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-white mt-1">{openChapter.title}</h2>
                </div>
                <button
                  onClick={() => setOpenChapter(null)}
                  className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/30 hover:text-white border border-transparent hover:border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
                  <p className="text-base font-tech text-white/80 leading-relaxed whitespace-pre-wrap">{openChapter.content}</p>
                </div>

                {(openChapter.rewardCredits > 0 || openChapter.rewardExp > 0) && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-display uppercase tracking-widest text-emerald-400">
                      Mirror awarded · +{openChapter.rewardCredits} NC · +{openChapter.rewardExp} XP
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setOpenChapter(null)}
                  className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-display uppercase tracking-widest text-xs rounded-xl transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Story;
