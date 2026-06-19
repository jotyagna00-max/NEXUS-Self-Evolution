import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Loader2, X, Brain } from 'lucide-react';
import { useGame } from '../GameContext';

interface PDFUploaderProps {
  onResult: (data: { title: string; description: string; type: string; stat: string; gain: number }) => void;
  onClose: () => void;
  mode: 'protocol' | 'book';
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onResult, onClose, mode }) => {
  const { sendCommandToAgent } = useGame();
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted.'); return; }
    setFile(f);
    setError('');

    setExtracting(true);
    setProgress('Extracting text from PDF...');
    try {
      const text = await extractPDFText(f);
      if (!text.trim()) { setError('Could not extract text from this PDF.'); setExtracting(false); return; }
      setExtracting(false);
      setProgress('Analyzing with AI...');
      setAnalyzing(true);

      const prompt = mode === 'protocol'
        ? `Analyze this training routine or self-improvement content and convert it into a structured protocol.
Extract: title (short name), description (2-3 sentences), type (one of: mental, physical, agility, willpower, reading, habit), stat (one of: strength, intelligence, agility, vitality, willpower, social), gain (1-5).
Content: """${text.slice(0, 4000)}"""
Return ONLY a JSON object: { title, description, type, stat, gain }`

        : `Analyze this book content and create a book entry.
Extract: title, author (if mentioned), description (brief summary), stat (primary stat this book improves: strength, intelligence, agility, vitality, willpower, social), gain (1-5).
Content: """${text.slice(0, 4000)}"""
Return ONLY a JSON object: { title, author, description, stat, gain }`;

      const { response } = await sendCommandToAgent('SAGE', prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        onResult({
          title: data.title || 'Extracted Protocol',
          description: data.description || '',
          type: data.type || (mode === 'protocol' ? 'physical' : 'reading'),
          stat: data.stat || 'strength',
          gain: data.gain || 2,
        });
      } else {
        setError('AI could not parse the content. Try a different PDF.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process PDF.');
    }
    setAnalyzing(false);
    setProgress('');
  };

  const extractPDFText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');

    const canvas = document.createElement('canvas');
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    let text = '';
    for (let i = 1; i <= Math.min(doc.numPages, 20); i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Upload size={18} className="text-emerald-400" />
          <span className="text-xs font-display uppercase tracking-widest text-white/60">Upload PDF</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {!file && !extracting && !analyzing && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/30 transition-all group"
        >
          <FileText size={32} className="mx-auto text-white/20 group-hover:text-emerald-400/40 mb-3 transition-colors" />
          <p className="text-xs font-mono text-white/30">Click to upload a PDF</p>
          <p className="text-[9px] font-mono text-white/15 mt-1">{mode === 'protocol' ? 'Training routines, diet plans, etc.' : 'Books, articles, papers'}</p>
          <input ref={inputRef} type="file" accept=".pdf" onChange={handleFile} className="hidden" />
        </div>
      )}

      {(extracting || analyzing) && (
        <div className="flex flex-col items-center py-6 gap-3">
          <Loader2 size={24} className="text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-white/40">{progress}</p>
          <div className="flex gap-1.5">
            <motion.div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            <motion.div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
            <motion.div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400/80">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default PDFUploader;
