import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Shield,
  HelpCircle,
  Bug,
  Lightbulb,
  MessageSquare,
  Download,
  Upload,
  Server,
  Key,
  Mail,
  ChevronDown,
} from 'lucide-react';

declare global {
  interface Window {
    electronAPI?: {
      sendFeedback: (data: { category: string; label: string; message: string }) => Promise<void>;
      saveMailCredentials: (creds: { user: string; pass: string }) => Promise<void>;
      getMailCredentials: () => Promise<{ user: string; pass: string } | null>;
    };
  }
}

interface FeedbackItem {
  id: string;
  message: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('feedback');
    return saved ? JSON.parse(saved) : [];
  });
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackItem['category']>('improvement');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mailCreds, setMailCreds] = useState<{ user: string; pass: string } | null>(null);
  const [showMailSetup, setShowMailSetup] = useState(false);
  const [mailUser, setMailUser] = useState('');
  const [mailPass, setMailPass] = useState('');
  const [mailError, setMailError] = useState('');
  const isDesktop = typeof window.electronAPI !== 'undefined';

  useEffect(() => {
    localStorage.setItem('feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    if (isDesktop) {
      window.electronAPI!.getMailCredentials().then((creds) => {
        if (creds) {
          setMailCreds(creds);
          setMailUser(creds.user);
          setMailPass(creds.pass);
        }
      });
    }
  }, []);

  const labelMap: Record<string, string> = { bug: 'Bug Report', feature: 'Feature Request', improvement: 'Improvement', other: 'Other' };

  const saveCreds = async () => {
    if (!mailUser.includes('@') || !mailPass) return;
    try {
      await window.electronAPI!.saveMailCredentials({ user: mailUser, pass: mailPass });
      setMailCreds({ user: mailUser, pass: mailPass });
      setMailError('');
      setShowMailSetup(false);
    } catch { setMailError('Failed to save credentials'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setMailError('');

    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      message: message,
      category: category,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    if (isDesktop && mailCreds) {
      try {
        await window.electronAPI!.sendFeedback({
          category,
          label: labelMap[category],
          message,
        });
      } catch (err: any) {
        setMailError(err?.message || 'Mail agent failed');
      }
    } else {
      const subject = encodeURIComponent(`[NEXUS Feedback] ${labelMap[category]}`);
      const body = encodeURIComponent(
        `Category: ${labelMap[category]}\n\nMessage:\n${message}\n\n---\nSubmitted via NEXUS Self-Evolution`
      );
      window.open(`mailto:jotyagna00@gmail.com?subject=${subject}&body=${body}`, '_blank');
    }

    setFeedbackList(prev => [newFeedback, ...prev]);
    setMessage('');
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getCategoryIcon = (cat: FeedbackItem['category']) => {
    switch (cat) {
      case 'bug': return <Bug size={14} />;
      case 'feature': return <Lightbulb size={14} />;
      case 'improvement': return <MessageSquare size={14} />;
      default: return <HelpCircle size={14} />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Feedback Form */}
      <div className="glass rounded-[40px] p-10 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
          <MessageCircle size={160} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <Shield size={32} className="text-emerald-500" />
            <div className="space-y-1">
              <span className="text-emerald-500 font-display text-[10px] tracking-[0.4em] uppercase">System Communication</span>
              <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-white">Direct Feedback</h2>
            </div>
          </div>
          
          <p className="text-white/40 text-sm mb-12 max-w-xl font-tech leading-relaxed">
            Communicate directly with the Nexus System architects. Share your thoughts, report anomalies, or suggest evolution enhancements to strengthen the core protocols.
          </p>

          {/* Mail Agent */}
          <div className="mb-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setShowMailSetup(!showMailSetup)}
              className="flex items-center gap-3 text-white/40 hover:text-white/70 transition-colors w-full"
            >
              <Server size={16} className={mailCreds ? 'text-emerald-400' : ''} />
              <span className="text-[10px] font-display uppercase tracking-[0.3em]">
                Mail Agent {mailCreds ? '✓ Active' : '(Not configured)'}
              </span>
              <ChevronDown size={14} className={`ml-auto transition-transform ${showMailSetup ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showMailSetup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-white/30 font-mono">
                      Configure the Mail Agent to auto-send feedback to jotyagna00@gmail.com.
                      Use a <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">Gmail App Password</a> (not your regular password).
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4">
                        <Mail size={14} className="text-white/20 shrink-0" />
                        <input
                          value={mailUser}
                          onChange={e => setMailUser(e.target.value)}
                          placeholder="your.email@gmail.com"
                          className="w-full bg-transparent py-3 text-xs font-mono text-white/70 placeholder:text-white/10 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4">
                        <Key size={14} className="text-white/20 shrink-0" />
                        <input
                          type="password"
                          value={mailPass}
                          onChange={e => setMailPass(e.target.value)}
                          placeholder="App Password (16 letters, no spaces)"
                          className="w-full bg-transparent py-3 text-xs font-mono text-white/70 placeholder:text-white/10 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={saveCreds}
                      disabled={!mailUser.includes('@') || !mailPass}
                      className="text-[10px] font-display uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all disabled:opacity-30"
                    >
                      Save & Activate Agent
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {mailError && (
            <div className="mb-6 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono flex items-center gap-2">
              <AlertCircle size={14} />
              {mailError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex flex-wrap gap-4">
              {(['improvement', 'bug', 'feature', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-display font-bold uppercase tracking-[0.2em] transition-all border flex items-center gap-3 ${
                    category === cat 
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your feedback in detail..."
                className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-lg font-tech focus:outline-none focus:border-emerald-500/50 transition-all min-h-[200px] resize-none text-white/90 placeholder:text-white/10"
              />
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute bottom-6 right-6 flex items-center gap-3 text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 backdrop-blur-xl"
                  >
                    <CheckCircle2 size={20} />
                    <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">Transmission Received</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              disabled={isSubmitting || !message.trim()}
              className="w-full py-5 bg-white/5 hover:bg-emerald-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black rounded-3xl transition-all uppercase tracking-[0.4em] border border-white/10 hover:border-emerald-400 text-xs flex items-center justify-center gap-4 group/btn shadow-xl"
            >
              {isSubmitting ? 'Transmitting...' : 'Initiate Transmission'}
              <Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      {/* Feedback History */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6 border-l-4 border-blue-500/50 py-2">
          <div className="space-y-1">
            <span className="text-blue-400 font-display text-[10px] tracking-[0.4em] uppercase">Archive Log</span>
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white flex items-center gap-3">
              <Clock size={24} className="text-blue-400" />
              Transmission History
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {feedbackList.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-[32px] p-8 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/20 transition-all"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-display font-black uppercase tracking-[0.2em] border ${
                    item.category === 'bug' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    item.category === 'feature' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {item.category}
                  </div>
                  <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-lg text-white/70 font-tech leading-relaxed pl-4 border-l-2 border-white/5 group-hover:border-white/20 transition-colors">
                  {item.message}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[10px] font-display font-black uppercase tracking-[0.2em] shadow-sm ${
                  item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  item.status === 'reviewed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-white/5 text-white/40 border-white/10'
                }`}>
                  {item.status === 'resolved' ? <CheckCircle2 size={16} /> : 
                   item.status === 'reviewed' ? <Clock size={16} /> : 
                   <AlertCircle size={16} />}
                  {item.status}
                </div>
              </div>
            </motion.div>
          ))}

          {feedbackList.length === 0 && (
            <div className="text-center py-24 glass rounded-[40px] border border-dashed border-white/10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={32} className="text-white/10" />
              </div>
              <p className="text-white/20 font-display uppercase tracking-[0.4em] text-sm">No previous transmissions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Export / Import */}
      <div className="glass rounded-[40px] p-10 border border-white/5">
        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
          <Shield size={32} className="text-emerald-500" />
          <div className="space-y-1">
            <span className="text-emerald-500 font-display text-[10px] tracking-[0.4em] uppercase">Data Management</span>
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-white">Export / Import</h2>
          </div>
        </div>
        <p className="text-white/40 text-sm mb-8 max-w-xl font-tech leading-relaxed">
          Backup your entire NEXUS profile or restore from a previous backup.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              const data: Record<string, string> = {};
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) data[key] = localStorage.getItem(key) || '';
              }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `nexus_backup_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-display uppercase tracking-widest"
          >
            <Download size={18} />
            Export All Data
          </button>
          <label className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] font-display uppercase tracking-widest cursor-pointer">
            <Upload size={18} />
            Import Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target?.result as string);
                    Object.entries(data).forEach(([key, val]) => {
                      if (typeof val === 'string') localStorage.setItem(key, val);
                    });
                    alert('Data imported successfully. Reloading...');
                    window.location.reload();
                  } catch {
                    alert('Invalid backup file.');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
