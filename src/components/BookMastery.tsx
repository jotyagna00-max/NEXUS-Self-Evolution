import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, BookOpen, BookMarked, Archive, Plus, X, Check, TrendingUp, Target, Brain, Award, Upload } from 'lucide-react';
import { useGame } from '../GameContext';
import { Protocol } from '../types';
import PDFUploader from './PDFUploader';

const BookMastery: React.FC = () => {
  const { protocols, addProtocol, updateProtocol, addCredits, addExp, credits, sendCommandToAgent, updateStat } = useGame();
  const [isAdding, setIsAdding] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', pages: 100, gain: 2, stat: 'intelligence' });
  const [quizBook, setQuizBook] = useState<Protocol | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<'pass' | 'fail' | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const books = protocols.filter(p => p.type === 'reading');
  const reading = books.filter(b => b.bookStatus === 'reading');
  const completed = books.filter(b => b.bookStatus === 'completed');
  const totalPagesRead = books.reduce((sum, b) => sum + (b.pagesRead || 0), 0);

  const handlePDFResult = (data: { title: string; description: string; type: string; stat: string; gain: number }) => {
    setNewBook(prev => ({
      ...prev,
      title: data.title,
      author: data.description.includes('by') ? data.description.split('by')[1]?.trim() || prev.author : prev.author,
      stat: data.stat,
      gain: data.gain,
    }));
    setShowPDFUpload(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;
    addProtocol({
      title: newBook.title,
      desc: `Book: ${newBook.title} by ${newBook.author || 'Unknown'}`,
      type: 'reading',
      stat: newBook.stat as any,
      gain: newBook.gain,
      author: newBook.author || 'Unknown',
      pages: newBook.pages || 100,
      pagesRead: 0,
      bookStatus: 'reading',
      notes: '',
    });
    setNewBook({ title: '', author: '', pages: 100, gain: 2, stat: 'intelligence' });
    setIsAdding(false);
  };

  const handleSync = async (book: Protocol) => {
    setSyncingId(book.id);
    const newPagesRead = Math.min(book.pages || 100, (book.pagesRead || 0) + Math.floor((book.pages || 100) * 0.1));
    const newStatus = newPagesRead >= (book.pages || 100) ? 'completed' as const : 'reading';
    updateProtocol(book.id, { pagesRead: newPagesRead, bookStatus: newStatus });

    const adjustedGain = Math.round((book.gain || 1));
    await updateStat(book.stat as any, adjustedGain);
    addCredits(25);
    addExp(30);

    if (newStatus === 'completed' && book.bookStatus !== 'completed') {
      setTimeout(() => triggerQuiz(book), 1000);
    }

    setTimeout(() => setSyncingId(null), 1500);
  };

  const triggerQuiz = async (book: Protocol) => {
    setQuizLoading(true);
    setQuizBook(book);
    setQuizResult(null);
    setQuizAnswers({});
    try {
      const promptText = `Generate a 3-question quiz about the book "${book.title}" by ${book.author || 'Unknown'}. 
        Each question should test comprehension and key concepts. 
        Return a JSON array of objects with fields: question (string), options (array of 4 strings), correctIndex (number 0-3).
        Only return the JSON array, no other text.`;

      const { response } = await sendCommandToAgent('SAGE', promptText);
      let questions;
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
        else throw new Error('No JSON array found');
      } catch {
        questions = [
          { question: `What is the main theme of "${book.title}"?`, options: ['Self-discipline', 'Strategy', 'Philosophy', 'Science'], correctIndex: 0 },
          { question: 'Which concept is central to this book?', options: ['Consistency', 'Talent', 'Luck', 'Genetics'], correctIndex: 0 },
          { question: 'What does the author emphasize most?', options: ['Action', 'Theory', 'History', 'Debate'], correctIndex: 0 },
        ];
      }
      setQuizQuestions(questions);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setQuizQuestions([
        { question: `What did you learn from "${book.title}"?`, options: ['New perspective', 'Practical skills', 'Deep knowledge', 'All of the above'], correctIndex: 3 },
        { question: 'How will you apply this knowledge?', options: ['Daily practice', 'Teaching others', 'Writing notes', 'All of the above'], correctIndex: 3 },
        { question: 'What is the key takeaway?', options: ['Consistency matters', 'Knowledge is power', 'Growth takes time', 'All of the above'], correctIndex: 3 },
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!quizBook) return;
    const correct = quizQuestions.filter((q, i) => quizAnswers[i] === q.options[q.correctIndex]).length;
    const passed = correct >= 2;
    setQuizResult(passed ? 'pass' : 'fail');

    if (passed) {
      addCredits(200);
      addExp(100);
      updateStat(quizBook.stat as any, 2);
    }
  };

  const closeQuiz = () => {
    setQuizBook(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Book className="text-red-400 relative z-10" size={44} />
          </div>
          <div className="space-y-1">
            <span className="text-red-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(239,68,68,0.6)] block">Knowledge Acquisition</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Book Mastery</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">Credits: {credits} NC</p>
          </div>
        </div>

        <button onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-display text-xs uppercase tracking-widest transition-all group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Add Book
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hologram-card rounded-[32px] p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400"><BookOpen size={24} /></div>
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Currently Reading</span>
              <div className="text-3xl font-display font-black text-white">{reading.length}</div>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${reading.length > 0 ? (reading[0]?.pagesRead || 0) / (reading[0]?.pages || 1) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="hologram-card rounded-[32px] p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400"><BookMarked size={24} /></div>
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Completed</span>
              <div className="text-3xl font-display font-black text-white">{completed.length}</div>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${completed.length > 0 ? 100 : 0}%` }} />
          </div>
        </div>
        <div className="hologram-card rounded-[32px] p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400"><TrendingUp size={24} /></div>
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Total Pages Read</span>
              <div className="text-3xl font-display font-black text-white">{totalPagesRead}</div>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="hologram-card p-10 rounded-[40px] border-2 border-red-500/30 mb-12">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">New Book Entry</h3>
                  <button onClick={() => setShowPDFUpload(!showPDFUpload)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[9px] font-display text-emerald-400 uppercase tracking-widest transition-all">
                    <Upload size={12} /> Upload PDF
                  </button>
                </div>
                <button onClick={() => { setIsAdding(false); setShowPDFUpload(false); }} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              {showPDFUpload && (
                <PDFUploader
                  mode="book"
                  onResult={handlePDFResult}
                  onClose={() => setShowPDFUpload(false)}
                />
              )}

              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Book Title</label>
                    <input required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-red-500/50 outline-none transition-all" placeholder="e.g. Atomic Habits" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Author</label>
                    <input value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-red-500/50 outline-none transition-all" placeholder="e.g. James Clear" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Total Pages</label>
                    <input type="number" min="1" value={newBook.pages} onChange={e => setNewBook({...newBook, pages: parseInt(e.target.value) || 100})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-red-500/50 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Stat Boost on Read</label>
                    <select value={newBook.stat} onChange={e => setNewBook({...newBook, stat: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-red-500/50 outline-none transition-all">
                      <option value="intelligence">Intelligence</option>
                      <option value="willpower">Willpower</option>
                      <option value="social">Social</option>
                      <option value="strength">Strength</option>
                      <option value="agility">Agility</option>
                      <option value="vitality">Vitality</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-display mb-2 block">Gain per Session (+{newBook.gain})</label>
                    <input type="range" min="1" max="5" value={newBook.gain} onChange={e => setNewBook({...newBook, gain: parseInt(e.target.value)})} className="w-full accent-red-500" />
                  </div>
                  <button type="submit"
                    className="w-full py-5 bg-red-500 hover:bg-red-400 text-black rounded-2xl font-display font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    Add to Library
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Quiz Modal */}
      <AnimatePresence>
        {quizBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
              className="max-w-2xl w-full hologram-card rounded-[40px] p-12 border-2 border-red-500/30">
              <div className="flex items-center gap-4 mb-8">
                <Brain className="text-purple-400" size={32} />
                <div>
                  <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Knowledge Verification</h3>
                  <p className="text-white/40 text-sm font-tech mt-1">SAGE is testing your comprehension of "{quizBook.title}"</p>
                </div>
                <button onClick={closeQuiz} className="ml-auto text-white/40 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              {quizLoading ? (
                <div className="py-20 text-center">
                  <Brain size={48} className="mx-auto text-purple-400 animate-pulse mb-6" />
                  <p className="text-white/40 font-tech">SAGE is generating quiz questions...</p>
                </div>
              ) : quizResult ? (
                <div className="text-center py-12">
                  {quizResult === 'pass' ? (
                    <>
                      <Award size={64} className="mx-auto text-yellow-400 mb-6" />
                      <h4 className="text-3xl font-display font-black text-emerald-400 uppercase tracking-wider mb-4">Knowledge Verified</h4>
                      <p className="text-white/60 font-tech mb-8">You have demonstrated mastery of this material.</p>
                      <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center"><span className="text-2xl font-display font-black text-yellow-400">+200</span><p className="text-[10px] text-white/30 uppercase tracking-widest">NC Bonus</p></div>
                        <div className="text-center"><span className="text-2xl font-display font-black text-emerald-400">+100</span><p className="text-[10px] text-white/30 uppercase tracking-widest">EXP</p></div>
                        <div className="text-center"><span className="text-2xl font-display font-black text-blue-400">+2</span><p className="text-[10px] text-white/30 uppercase tracking-widest">Extra Stat</p></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <BookOpen size={64} className="mx-auto text-red-400 mb-6" />
                      <h4 className="text-3xl font-display font-black text-red-400 uppercase tracking-wider mb-4">Review Required</h4>
                      <p className="text-white/60 font-tech mb-8">Your comprehension needs reinforcement. Re-read and try again.</p>
                    </>
                  )}
                  <button onClick={closeQuiz}
                    className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-display text-xs uppercase tracking-widest transition-all">
                    {quizResult === 'pass' ? 'Continue' : 'Close'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {quizQuestions.map((q, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-sm text-white font-tech mb-4">
                        <span className="text-red-400 mr-2">Q{i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt: string, oi: number) => (
                          <button key={oi} onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: opt }))}
                            className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-tech ${
                              quizAnswers[i] === opt
                                ? 'bg-red-500/20 border-red-500/50 text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                            }`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="w-full py-5 bg-gradient-to-r from-red-500 to-purple-500 text-black rounded-2xl font-display font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-50">
                    Submit Answers
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {books.map((book) => (
          <motion.div key={book.id} whileHover={{ y: -8, scale: 1.01 }}
            className="group relative hologram-card rounded-[40px] p-10 overflow-hidden transition-all hover:border-red-500/40 border border-white/5">
            <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity text-red-400">
              <Book size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all shadow-inner">
                  {book.bookStatus === 'completed' ? <Check size={28} /> : <BookOpen size={28} />}
                </div>
                <div>
                  <span className="text-[10px] font-display text-white/30 uppercase tracking-[0.4em]">
                    {book.bookStatus === 'reading' ? 'Currently Reading' : book.bookStatus === 'completed' ? 'Completed' : 'Planned'}
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-none mt-1 uppercase">{book.title}</h3>
                  <p className="text-[11px] text-white/40 font-mono mt-1">{book.author}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-white/40">Progress</span>
                  <span className="text-red-400">{book.pagesRead}/{book.pages} pages</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((book.pagesRead || 0) / (book.pages || 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => handleSync(book)}
                  disabled={syncingId === book.id || book.bookStatus === 'completed'}
                  className={`flex-1 py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border ${
                    syncingId === book.id
                      ? 'bg-red-500 text-black border-red-500'
                      : book.bookStatus === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-not-allowed'
                      : 'bg-white/5 hover:bg-red-500 hover:text-black border-white/10 hover:border-red-500'
                  }`}>
                  {syncingId === book.id ? (
                    <span className="flex items-center justify-center gap-2"><Target size={14} className="animate-pulse" /> Syncing...</span>
                  ) : book.bookStatus === 'completed' ? (
                    <span className="flex items-center justify-center gap-2"><Award size={14} /> Mastered</span>
                  ) : 'Read Session'}
                </button>
                <div className="px-4 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[70px]">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">Gain</span>
                  <span className="text-lg font-display font-black text-red-400">+{book.gain}</span>
                </div>
                <div className="px-4 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[70px]">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mb-1">NC</span>
                  <span className="text-lg font-display font-black text-yellow-400">+25</span>
                </div>
              </div>

              {book.bookStatus === 'completed' && (
                <div className="absolute top-6 right-6 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                  <span className="text-[8px] text-emerald-400 font-display uppercase tracking-widest">Quiz Ready</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500/20 animate-scanline-fast" />
            </div>
          </motion.div>
        ))}
        {books.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-white/20 font-display uppercase tracking-widest italic">No books in your library</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookMastery;
