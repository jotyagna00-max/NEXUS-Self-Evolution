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
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { exportJsonFull, exportJsonSection, exportCsvFlat, validateImport, IMPORTABLE_SECTIONS } from '../utils/exporters';

interface FeedbackItem {
  id: string;
  message: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const labelMap: Record<string, string> = { bug: 'Bug Report', feature: 'Feature Request', improvement: 'Improvement', other: 'Other' };
const API_ENDPOINT = '/api/feedback/send';

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('feedback');
    return saved ? JSON.parse(saved) : [];
  });
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackItem['category']>('improvement');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    localStorage.setItem('feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSendError('');

    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      message: message,
      category: category,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, label: labelMap[category], message }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setSendError(data?.error || 'Failed to send');
      }
    } catch (err: any) {
      setSendError(err?.message || 'Could not send.');
    }

    setFeedbackList(prev => [newFeedback, ...prev]);
    setMessage('');
    setIsSubmitting(false);
  };

  const getCategoryIcon = (cat: FeedbackItem['category']) => {
    switch (cat) {
      case 'bug': return <Bug size={14} />;
      case 'feature': return <Lightbulb size={14} />;
      case 'improvement': return <MessageSquare size={14} />;
      default: return <HelpCircle size={14} />;
    }
  };

  // R-08 — export controls
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'section'>('json');
  const [exportSection, setExportSection] = useState<string>(IMPORTABLE_SECTIONS[0].key);
  const [importError, setImportError] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleExport = () => {
    if (exportFormat === 'json') exportJsonFull();
    else if (exportFormat === 'csv') exportCsvFlat();
    else if (exportFormat === 'section') exportJsonSection(exportSection);
  };

  const handleImportFile = (file: File) => {
    setImportError(null);
    setImportNotice(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const err = validateImport(raw);
      if (err) { setImportError(err); return; }
      try {
        const data = JSON.parse(raw);
        let count = 0;
        const ALLOWED_PREFIXES = ['nexus_', 'feedback'];
        for (const [key, val] of Object.entries(data)) {
          if (typeof val === 'string' && ALLOWED_PREFIXES.some(p => key.startsWith(p))) {
            localStorage.setItem(key, val);
            count++;
          }
        }
        setImportNotice(`Imported ${count} keys. Reloading…`);
        setTimeout(() => window.location.reload(), 800);
      } catch (e: any) {
        setImportError(`Parse error: ${e?.message || 'unknown'}`);
      }
    };
    reader.readAsText(file);
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

          {sendError && (
            <div className="mb-6 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono flex items-center gap-2">
              <AlertCircle size={14} />
              {sendError}
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
          Backup your NEXUS data — full JSON snapshot, flat CSV, or per-section JSON. Restore from a full backup at any time.
        </p>

        {/* Segmented format control */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/10 w-fit">
            <button
              onClick={() => setExportFormat('json')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-display uppercase tracking-widest transition-all border ${
                exportFormat === 'json' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <FileJson size={14} /> JSON · full
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-display uppercase tracking-widest transition-all border ${
                exportFormat === 'csv' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <FileSpreadsheet size={14} /> CSV · flat
            </button>
            <button
              onClick={() => setExportFormat('section')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-display uppercase tracking-widest transition-all border ${
                exportFormat === 'section' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Layers size={14} /> Section
            </button>
          </div>

          {exportFormat === 'section' && (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-blue-500/15">
              <span className="text-[10px] font-display uppercase tracking-widest text-white/40">Pick section</span>
              <div className="relative">
                <select
                  value={exportSection}
                  onChange={e => setExportSection(e.target.value)}
                  className="appearance-none bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-blue-500/50"
                >
                  {IMPORTABLE_SECTIONS.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleExport}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all text-[10px] font-display uppercase tracking-widest border ${
                exportFormat === 'json' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' :
                exportFormat === 'csv' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              <Download size={18} />
              {exportFormat === 'json' && 'Export Full Backup'}
              {exportFormat === 'csv' && 'Export CSV'}
              {exportFormat === 'section' && `Export ${IMPORTABLE_SECTIONS.find(s => s.key === exportSection)?.label || exportSection}`}
            </button>

            <label className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-[10px] font-display uppercase tracking-widest cursor-pointer">
              <Upload size={18} />
              Import Backup
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>

          <AnimatePresence>
            {importError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono flex items-center gap-2"
              >
                <AlertCircle size={14} /> {importError}
              </motion.div>
            )}
            {importNotice && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> {importNotice}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
