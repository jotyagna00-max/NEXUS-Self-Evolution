import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Terminal, Cpu, Zap, Brain, Dumbbell, Clock, User } from 'lucide-react';
import { AgentType } from '../services/agentService';
import { useGame } from '../GameContext';

const NeuralFlow: React.FC<{ activeAgent: AgentType; isProcessing: boolean }> = ({ activeAgent, isProcessing }) => {
  const specialists: AgentType[] = ['SAGE', 'TITAN', 'CHRONOS'];

  return (
    <div className="relative h-48 w-full flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 mb-6 overflow-hidden">
      <div className="absolute inset-0 opacity-10" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={
            isProcessing
              ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  '0 0 0px rgba(16,185,129,0)',
                  '0 0 26px rgba(16,185,129,0.55)',
                  '0 0 0px rgba(16,185,129,0)',
                ],
              }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-16 h-16 rounded-full glass border-2 flex items-center justify-center transition-colors ${activeAgent === 'MANAGER' ? 'border-emerald-500 text-emerald-400' : 'border-white/20 text-white/40'
            }`}
        >
          <Cpu size={24} />
        </motion.div>
        <span className="text-[8px] font-display uppercase tracking-widest mt-2 text-white/40">Neural Manager</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-around px-12">
        {specialists.map((type, i) => {
          const Icon = type === 'SAGE' ? Brain : type === 'TITAN' ? Dumbbell : Clock;
          const isActive = activeAgent === type || (activeAgent === 'MANAGER' && isProcessing);

          return (
            <div key={type} className="flex flex-col items-center gap-2">
              <motion.div
                animate={
                  isActive && isProcessing
                    ? {
                      y: [0, -4, 0],
                      borderColor: ['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.85)', 'rgba(16,185,129,0.2)'],
                    }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className={`w-12 h-12 rounded-xl glass border flex items-center justify-center transition-all ${isActive
                    ? 'border-emerald-500/55 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.22)]'
                    : 'border-white/10 text-white/20'
                  }`}
              >
                <Icon size={18} />
              </motion.div>
              <span className="text-[7px] font-mono uppercase tracking-tighter text-white/30">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AgentConsole: React.FC = () => {
  const { streamCommandToAgent } = useGame();
  const [activeAgent, setActiveAgent] = useState<AgentType>('MANAGER');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string; agentType?: AgentType }>([
    { role: 'agent', text: 'Neural Manager online. All specialists standing by.', agentType: 'MANAGER' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const agents: { type: AgentType; icon: any; color: string; label: string }[] = [
    { type: 'MANAGER', icon: Cpu, color: 'text-emerald-400', label: 'Manager' },
    { type: 'SAGE', icon: Brain, color: 'text-blue-400', label: 'Sage' },
    { type: 'TITAN', icon: Dumbbell, color: 'text-red-400', label: 'Titan' },
    { type: 'CHRONOS', icon: Clock, color: 'text-yellow-400', label: 'Chronos' },
    { type: 'VOICE', icon: Zap, color: 'text-purple-400', label: 'Voice' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      let currentResponse = '';
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: '',
          agentType: activeAgent,
        },
      ]);

      await streamCommandToAgent(activeAgent, userMsg, (chunk) => {
        currentResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            lastMsg.text = currentResponse;
          }
          return newMessages;
        });
      });
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: error.message || 'Neural link unstable. Synchronization failed.', agentType: activeAgent },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-black/60 rounded-[40px] border border-white/10 overflow-hidden backdrop-blur-3xl relative">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl glass border border-emerald-500/30 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent" />
            <Terminal size={20} className="text-emerald-400 relative z-10" />
          </div>
          <div>
            <h2 className="text-sm font-display uppercase tracking-[0.3em] text-white">Neural Console</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_18px_rgba(16,185,129,0.6)]" />
              <span className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-widest">System Synchronized</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {agents.map((agent) => (
            <button
              key={agent.type}
              onClick={() => setActiveAgent(agent.type)}
              className={`p-3 rounded-xl transition-all border ${activeAgent === agent.type
                  ? 'bg-emerald-500/10 border-emerald-500/55 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.12)]'
                  : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
                }`}
              title={agent.label}
              aria-label={agent.label}
            >
              <agent.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-6">
        <NeuralFlow activeAgent={activeAgent} isProcessing={isTyping} />

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`flex items-center gap-2 text-[8px] uppercase tracking-widest opacity-45 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                >
                  {msg.role === 'user' ? <User size={10} /> : <Cpu size={10} />}
                  <span>{msg.role === 'user' ? 'Operator' : `${msg.agentType} Agent`}</span>
                </div>

                <div
                  className={`p-5 rounded-[26px] border ${msg.role === 'user'
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-white shadow-[0_0_0_rgba(0,0,0,0)]'
                      : 'bg-white/5 border-white/10 text-white/90'
                    }`}
                >
                  <p className="leading-relaxed text-sm font-tech whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-emerald-500/15 p-4 rounded-[18px] flex items-center gap-3 shadow-[0_0_22px_rgba(16,185,129,0.08)]">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest">Generating reply...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-8 border-t border-white/10 bg-white/5">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Enter command for ${activeAgent.toLowerCase()} interface...`}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 font-mono text-sm transition-all pr-16 placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-black p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentConsole;
