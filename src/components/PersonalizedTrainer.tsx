import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, StopCircle, AlertTriangle } from 'lucide-react';
import { useGame } from '../GameContext';
import { streamTrainerResponse } from '../services/trainerService';
import { getArchetype } from '../services/archetypes';

interface Message {
  id: string;
  role: 'user' | 'trainer';
  text: string;
  agentType?: string;
}

const AGENT_MAP: Record<string, { label: string; color: string }> = {
  MANAGER: { label: 'MANAGER', color: 'text-emerald-400' },
  SAGE: { label: 'SAGE', color: 'text-blue-400' },
  TITAN: { label: 'TITAN', color: 'text-red-400' },
  CHRONOS: { label: 'CHRONOS', color: 'text-yellow-400' },
  ERROR: { label: 'ERROR', color: 'text-red-400' },
};

const PersonalizedTrainer: React.FC = () => {
  const { stats, userProfile, protocols, credits, spendCredits, isPro, selectedCharacter } = useGame();
  const archetype = getArchetype(selectedCharacter);
  const opName = userProfile.name || 'Operator';
  const archetypeGreeting = archetype.greetingTemplate.replace('{name}', opName);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'trainer',
      text: archetypeGreeting,
      agentType: 'MANAGER',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      if (e.clipboardData.items[i].type.startsWith('image/')) {
        e.preventDefault();
        setToast('Image input is not supported by this model');
        return;
      }
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isProcessing) return;

    // Credit gating: 50 NC per message, free for Pro users
    if (!isPro) {
      if (credits < 50) {
        setToast('Insufficient NC. Earn credits through quests and tasks, or upgrade to Pro.');
        return;
      }
      spendCredits(50);
    }

    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      let fullResponse = '';

      await streamTrainerResponse(
        text,
        { stats, protocols, character: 'Strategic Coach', profile: userProfile, history: messages.slice(-10) },
        (chunk: string) => {
          fullResponse += chunk;
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === 'trainer') {
              copy[copy.length - 1] = { ...last, text: fullResponse };
            } else {
              copy.push({ id: `resp-${Date.now()}`, role: 'trainer', text: fullResponse, agentType: 'MANAGER' });
            }
            return copy;
          });
        },
      );
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('clipboard') || msg.includes('image')) {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'trainer',
          text: 'This model does not support image input. Please send text only.',
          agentType: 'ERROR',
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'trainer',
          text: msg || 'Neural link unstable. Please try again.',
          agentType: 'ERROR',
        }]);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, stats, protocols, userProfile, messages, credits, isPro, spendCredits]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 px-5 py-3 rounded-2xl text-xs font-mono backdrop-blur-xl"
          >
            <AlertTriangle size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-2 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-emerald-400" />
          <span className="font-display text-sm tracking-wider text-white/80">NEXUS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[9px] text-yellow-400 font-mono">{credits} NC</span>
            {isPro && <span className="text-[8px] text-purple-400 font-display uppercase tracking-wider">Pro</span>}
            {!isPro && <span className="text-[8px] text-white/30 font-mono">50/msg</span>}
          </div>
          {['SAGE', 'TITAN', 'CHRONOS'].map(a => (
            <span key={a} className={`text-[9px] font-mono uppercase tracking-widest ${AGENT_MAP[a]?.color || 'text-white/30'} opacity-50`}>
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-2 space-y-5 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'trainer' && msg.agentType && (
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${AGENT_MAP[msg.agentType]?.color || 'text-white/30'}`}>
                      {AGENT_MAP[msg.agentType]?.label || msg.agentType}
                    </span>
                  </div>
                )}

                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white rounded-2xl rounded-br-md'
                      : msg.agentType === 'ERROR'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl'
                      : 'bg-white/5 border border-white/10 text-white/80 rounded-2xl rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-tech">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-white/30">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 pt-4 pb-2">
        <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-emerald-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask me about fitness, focus, habits, schedule, recovery..."
            rows={1}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-white placeholder-white/20 font-tech text-sm outline-none resize-none max-h-[200px] disabled:opacity-40"
          />
          {isProcessing ? (
            <div className="text-white/20 p-1">
              <StopCircle size={20} />
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="text-emerald-400 disabled:text-white/10 p-1 transition-colors hover:text-emerald-300"
            >
              <Send size={20} />
            </button>
          )}
        </div>
        <p className="text-[9px] font-mono text-white/10 text-center mt-2 tracking-wider">
          NEXUS may display inaccurate info. Verify critical advice.
        </p>
      </div>
    </div>
  );
};

export default PersonalizedTrainer;
