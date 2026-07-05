import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Dumbbell, Book, Moon, Sun, Wind, Plus, X, Activity, Zap, ChevronDown, BookOpen, Check, Target, Upload, FileText } from 'lucide-react';
import { useGame } from '../GameContext';
import { Protocol, ProtocolType, StatType } from '../types';
import PDFUploader from './PDFUploader';

const TrainingHub: React.FC = () => {
  const { updateStat, protocols, addProtocol, credits, updateProtocol, addCredits, pushNotification } = useGame();
  const [isAdding, setIsAdding] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    title: '', desc: '', type: 'mental' as string, stat: 'intelligence' as string, gain: 2,
    pages: 100, author: '',
  });

  const iconMap: Record<string, any> = {
    mental: Brain, physical: Dumbbell, agility: Wind, willpower: Moon, reading: Book, habit: Activity,
  };

  const colorMap: Record<string, string> = {
    mental: 'text-blue-400', physical: 'text-red-400', agility: 'text-green-400', willpower: 'text-purple-400', reading: 'text-red-400', habit: 'text-amber-400',
  };

  const borderColorMap: Record<string, string> = {
    mental: 'border-blue-500/30', physical: 'border-red-500/30', agility: 'border-green-500/30', willpower: 'border-purple-500/30', reading: 'border-red-500/30', habit: 'border-amber-500/30',
  };

  const glowMap: Record<string, string> = {
    mental: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]', physical: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]', agility: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]', willpower: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]', reading: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]', habit: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
  };

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (p: Protocol) => {
    setSyncingId(p.id);
    if (p.type === 'reading' && p.pages && p.pagesRead !== undefined) {
      const newPagesRead = Math.min(p.pages, p.pagesRead + Math.floor(p.pages * 0.1));
      const newStatus = newPagesRead >= p.pages ? 'completed' as const : p.bookStatus;
      updateProtocol(p.id, { pagesRead: newPagesRead, bookStatus: newStatus });
    }
    await updateStat(p.stat as StatType, p.gain);
    if (p.type === 'reading') {
      addCredits(25);
    }
    pushNotification({
      id: `session_${p.id}_${Date.now()}`,
      type: 'level_up',
      title: 'Effort Logged',
      description: `${p.title} · +${p.gain} ${p.stat.toUpperCase()} · Stats updated`,
      timestamp: new Date().toISOString(),
    });
    setTimeout(() => setSyncingId(null), 1500);
  };

  const handlePDFResult = (data: { title: string; description: string; type: string; stat: string; gain: number }) => {
    setNewProtocol(prev => ({
      ...prev,
      title: data.title,
      desc: data.description,
      type: data.type,
      stat: data.stat,
      gain: data.gain,
    }));
    setShowPDFUpload(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const protocolData: Partial<Protocol> = {
      title: newProtocol.title,
      desc: newProtocol.desc,
      type: newProtocol.type as ProtocolType,
      stat: newProtocol.stat as StatType,
      gain: newProtocol.gain,
    };
    if (newProtocol.type === 'reading') {
      protocolData.author = newProtocol.author;
      protocolData.pages = newProtocol.pages;
      protocolData.pagesRead = 0;
      protocolData.bookStatus = 'reading';
    }
    await addProtocol(protocolData);
    setIsAdding(false);
    setNewProtocol({ title: '', desc: '', type: 'mental', stat: 'intelligence', gain: 2, pages: 100, author: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="text-emerald-400 relative z-10" size={44} />
          </div>
          <div className="space-y-1">
            <span className="text-emerald-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(16,185,129,0.6)] block">Training Plans</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Training Hub</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">Credits: {credits} NC</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-display text-xs uppercase tracking-widest transition-all group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Add Routine
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`hologram-card p-10 rounded-[40px] border-2 mb-12 ${borderColorMap[newProtocol.type] || 'border-emerald-500/30'}`}>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">
                    {newProtocol.type === 'reading' ? 'New Book Entry' : 'New Routine'}
                  </h3>
                  <button onClick={() => setShowPDFUpload(!showPDFUpload)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[9px] font-display text-emerald-400 uppercase tracking-widest transition-all">
                    <Upload size={12} /> Upload PDF
                  </button>
                </div>
                <button onClick={() => { setIsAdding(false); setShowPDFUpload(false); }} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {showPDFUpload && (
                <PDFUploader
                  mode="protocol"
                  onResult={handlePDFResult}
                  onClose={() => setShowPDFUpload(false)}
                />
              )}

              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Title</label>
                    <input required value={newProtocol.title} onChange={e => setNewProtocol({...newProtocol, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="e.g. Neural Overclock" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Description</label>
                    <textarea required value={newProtocol.desc} onChange={e => setNewProtocol({...newProtocol, desc: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-emerald-500/50 outline-none transition-all h-32 resize-none"
                      placeholder="Define the training parameters..." />
                  </div>
                  {newProtocol.type === 'reading' && (
                    <>
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Author</label>
                        <input value={newProtocol.author} onChange={e => setNewProtocol({...newProtocol, author: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-emerald-500/50 outline-none transition-all"
                          placeholder="e.g. James Clear" />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Total Pages</label>
                        <input type="number" min="1" value={newProtocol.pages} onChange={e => setNewProtocol({...newProtocol, pages: parseInt(e.target.value) || 100})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-emerald-500/50 outline-none transition-all" />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Type</label>
                      <select value={newProtocol.type} onChange={e => setNewProtocol({...newProtocol, type: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-emerald-500/50 outline-none transition-all appearance-none">
                        <option value="mental">Mental</option>
                        <option value="physical">Physical</option>
                        <option value="agility">Agility</option>
                        <option value="willpower">Willpower</option>
                        <option value="reading">Reading</option>
                        <option value="habit">Habit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Target Stat</label>
                      <select value={newProtocol.stat} onChange={e => setNewProtocol({...newProtocol, stat: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-emerald-500/50 outline-none transition-all appearance-none">
                        <option value="intelligence">Intelligence</option>
                        <option value="strength">Strength</option>
                        <option value="agility">Agility</option>
                        <option value="vitality">Vitality</option>
                        <option value="willpower">Willpower</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Gain Value (+{newProtocol.gain})</label>
                    <input type="range" min="1" max="5" value={newProtocol.gain} onChange={e => setNewProtocol({...newProtocol, gain: parseInt(e.target.value)})}
                      className="w-full accent-emerald-500" />
                  </div>

                  <button type="submit"
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-display font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    {newProtocol.type === 'reading' ? 'Add to Library' : 'Save Routine'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protocol Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {protocols.map((p) => {
          const Icon = iconMap[p.type] || Brain;
          const color = colorMap[p.type] || 'text-blue-400';

          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative hologram-card rounded-[40px] p-10 overflow-hidden transition-all hover:border-emerald-500/40 border border-white/5"
            >
              <div className={`absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
                <Icon size={160} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color} group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all shadow-inner`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-display text-white/30 uppercase tracking-[0.4em]">
                      {p.isStoreItem ? 'STORE' : p.aiGenerated ? 'AI' : p.type} protocol
                      {p.difficulty && <span className="ml-3 text-white/20">| D:{p.difficulty}/5</span>}
                    </span>
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-none mt-1 uppercase">{p.title}</h3>
                    {p.type === 'reading' && p.author && (
                      <p className="text-[11px] text-white/40 font-mono mt-1">{p.author}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-white/50 mb-6 leading-relaxed font-tech min-h-[40px]">
                  {p.desc}
                </p>

                {p.type === 'reading' && p.pages !== undefined && p.pagesRead !== undefined && (
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-white/40">Progress</span>
                      <span className={p.bookStatus === 'completed' ? 'text-emerald-400' : 'text-red-400'}>
                        {p.pagesRead}/{p.pages} pages
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.pagesRead / p.pages) * 100}%` }}
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleSync(p)}
                    disabled={syncingId === p.id || (p.type === 'reading' && p.bookStatus === 'completed')}
                    className={`flex-1 py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border ${
                      syncingId === p.id
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : p.type === 'reading' && p.bookStatus === 'completed'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30 cursor-not-allowed'
                        : 'bg-white/5 hover:bg-emerald-500 hover:text-black border-white/10 hover:border-emerald-500'
                    }`}
                  >
                    {syncingId === p.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Activity size={14} className="animate-pulse" />
                        Logging...
                      </span>
                    ) : p.type === 'reading' ? (
                      p.bookStatus === 'completed'
                        ? <span className="flex items-center justify-center gap-2"><Check size={14} /> Mastered</span>
                        : <span className="flex items-center justify-center gap-2"><BookOpen size={14} /> Log Read Session</span>
                    ) : 'Log Session'}
                  </button>
                  <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Effort</span>
                    <span className={`text-xl font-display font-black ${color}`}>+{p.gain}</span>
                  </div>
                  {p.estDuration && (
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[80px]">
                      <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Duration</span>
                      <span className="text-[10px] font-mono text-white/40">{p.estDuration}</span>
                    </div>
                  )}
                </div>

                {p.isStoreItem && (
                  <div className="absolute top-6 right-6 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                    <span className="text-[8px] text-emerald-400 font-display uppercase tracking-widest">Purchased</span>
                  </div>
                )}

              </div>

              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20 animate-scanline-fast" />
              </div>
            </motion.div>
          );
        })}
        {protocols.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-white/20 font-display uppercase tracking-widest italic">No routines added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingHub;
