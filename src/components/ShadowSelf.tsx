import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Send, Dumbbell, Brain, Wind, Heart, Moon, Users, AlertTriangle } from 'lucide-react';
import { useGame } from '../GameContext';

const statIcons: Record<string, any> = {
  strength: Dumbbell, intelligence: Brain, agility: Wind, vitality: Heart, willpower: Moon, social: Users
};

const ShadowSelf: React.FC = () => {
  const { shadowState, stats, streamCommandToAgent } = useGame();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'shadow'; text: string }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userAvg = (Object.values(stats) as number[]).reduce((a: number, b: number) => a + b, 0) / 6;
  const shadowAvg = [shadowState.strength, shadowState.intelligence, shadowState.agility, shadowState.vitality, shadowState.willpower, shadowState.social].reduce((a: number, b: number) => a + b, 0) / 6;
  const isDominant = shadowState.isDominant || shadowAvg > userAvg;

  const diff = (Object.entries(stats) as [string, number][]).map(([key, val]) => ({
    stat: key,
    userVal: val,
    shadowVal: (shadowState as any)[key] || 0,
    diff: val - ((shadowState as any)[key] || 0),
  }));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendShadowMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsStreaming(true);

    let shadowResponse = '';
    setMessages(prev => [...prev, { role: 'shadow', text: '' }]);

    try {
      await streamCommandToAgent('SHADOW' as any, userMsg, (chunk) => {
        shadowResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'shadow', text: shadowResponse };
          return updated;
        });
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'shadow', text: 'The mirror is clouded. Try again.' };
        return updated;
      });
    }
    setIsStreaming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-[32px] border overflow-hidden flex flex-col ${
        isDominant ? 'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.12)]' : 'border-white/5'
      }`}
      style={{ background: '#000' }}
    >
      {/* Ambient glow */}
      <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${
        isDominant ? 'bg-red-500/10' : 'bg-purple-500/5'
      }`} />

      {/* Header */}
      <div className="relative z-10 p-6 pb-3">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl ${isDominant ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/20'}`}>
            <Skull size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/20">Shadow Self</span>
              {isDominant && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[8px] text-red-400 font-display uppercase tracking-wider">
                  <AlertTriangle size={10} /> Dominant
                </span>
              )}
            </div>
            <h3 className="text-lg font-display font-bold text-white/90 uppercase tracking-tight">
              {isDominant ? 'Shadow Overwhelming' : 'Shadow Contained'}
            </h3>
          </div>
          {/* Shadow sync ring */}
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15" fill="none"
                stroke={isDominant ? '#ef4444' : '#a855f7'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${Math.min(shadowAvg / Math.max(userAvg, 1), 1) * 94.2} 94.2`}
                initial={{ strokeDasharray: '0 94.2' }}
                animate={{ strokeDasharray: `${Math.min(shadowAvg / Math.max(userAvg, 1), 1) * 94.2} 94.2` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono text-white/30">
              {Math.round((shadowAvg / Math.max(userAvg, 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Stat bars */}
        <div className="grid grid-cols-3 gap-1.5">
          {diff.map(({ stat, userVal, shadowVal, diff: d }) => {
            const Icon = statIcons[stat] || Brain;
            const isLosing = d < 0;
            return (
              <div key={stat} className="bg-white/[0.03] rounded-xl px-2.5 py-2 border border-white/[0.03]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={9} className={isLosing ? 'text-red-400' : 'text-white/20'} />
                  <span className="text-[7px] font-display uppercase tracking-wider text-white/20 flex-1">{stat}</span>
                  <span className={`text-[8px] font-mono ${isLosing ? 'text-red-400' : 'text-white/30'}`}>{userVal}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (userVal / 100) * 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.6), rgba(16,185,129,0.2))' }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (shadowVal / 100) * 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className={`h-full ${isLosing ? 'bg-red-500/50' : 'bg-white/5'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="relative z-10 border-t border-white/[0.03]">
        <div className="h-[220px] overflow-y-auto px-5 py-3 space-y-2.5 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Skull size={24} className="text-white/5 mb-2" />
              <p className="text-[10px] font-mono text-white/15">The mirror awaits your question.</p>
              <p className="text-[8px] font-mono text-white/10 mt-1">Ask your shadow for the truth.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-white/5 border border-white/5'
                      : 'bg-red-500/5 border border-red-500/10'
                  }`}>
                    {msg.role === 'shadow' && !msg.text && isStreaming && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </span>
                    ) : (
                      <p className={`text-[11px] font-mono leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'shadow' ? 'text-red-200/60' : 'text-white/60'
                      }`}>{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendShadowMessage(); }}}
              placeholder="Speak to your shadow..."
              disabled={isStreaming}
              className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5 text-xs font-mono text-white/60 placeholder:text-white/15 focus:outline-none focus:border-red-500/30 transition-all disabled:opacity-40"
            />
            <button
              onClick={sendShadowMessage}
              disabled={!chatInput.trim() || isStreaming}
              className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-30 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShadowSelf;
