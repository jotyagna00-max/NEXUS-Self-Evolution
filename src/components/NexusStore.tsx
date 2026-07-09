import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Brain, Dumbbell, Wind, Moon, Zap, Star, Timer, Check, Book, Activity, X, FileText, Download, Target, User, Gift, ArrowRight } from 'lucide-react';
import { useGame } from '../GameContext';
import { STORE_ITEMS, StoreItem } from '../types';
import { getStoreContent, StoreContent } from '../utils/storeContent';
import { generateProtocolPdf } from '../utils/protocolPdf';

const typeIcons: Record<string, any> = {
  protocol: Brain, powerup: Zap, cosmetic: Star, book: Book,
  mental: Brain, physical: Dumbbell, agility: Wind, willpower: Moon, reading: Book, habit: Activity,
};

const typeColors: Record<string, string> = {
  protocol: 'text-blue-400', powerup: 'text-yellow-400', cosmetic: 'text-pink-400', book: 'text-red-400',
  mental: 'text-blue-400', physical: 'text-red-400', agility: 'text-green-400', willpower: 'text-purple-400', reading: 'text-red-400', habit: 'text-amber-400',
};

/** v2.1 — NexusStore with full description preview modal and PDF download */
const NexusStore: React.FC = () => {
  const { credits, purchaseStoreItem, protocols, progression } = useGame();
  const [filter, setFilter] = useState<'all' | 'protocol' | 'book' | 'powerup'>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showPdfPrompt, setShowPdfPrompt] = useState<StoreItem | null>(null);

  const filteredItems = STORE_ITEMS.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if ((item.type === 'protocol' || item.type === 'book') && protocols.some(p => p.isStoreItem && p.title === item.protocolData?.title)) return false;
    return true;
  });

  const handlePurchase = async (item: StoreItem) => {
    setPurchasing(item.id);
    await new Promise(r => setTimeout(r, 500));
    const success = purchaseStoreItem(item);
    if (success) {
      setPurchaseSuccess(item.id);
      if (item.type === 'protocol' || item.type === 'book') {
        setShowPdfPrompt(item);
        setPreviewItem(null);
      }
    }
    setPurchasing(null);
    setTimeout(() => setPurchaseSuccess(null), 2000);
  };

  const handleDownloadPdf = (item: StoreItem) => {
    setPdfGenerating(true);
    setTimeout(() => {
      generateProtocolPdf(item);
      setPdfGenerating(false);
      setShowPdfPrompt(null);
    }, 300);
  };

  const totalInventoryValue = STORE_ITEMS.filter(i => i.type !== 'subscription').reduce((sum, i) => sum + i.cost, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-amber-500/5 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShoppingCart className="text-yellow-400 relative z-10" size={44} />
          </div>
          <div className="space-y-1">
            <span className="text-yellow-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(234,179,8,0.6)] block">NEXUS Market</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">App Store</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-yellow-400 font-display font-black text-lg">{credits} NC</span>
              <span className="text-white/20 font-mono text-[10px]">·</span>
              <span className="text-white/40 font-display text-[10px] uppercase tracking-widest">Level {progression.level}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {(['all', 'protocol', 'book', 'powerup'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all border ${
                filter === f ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              }`}>
              {f === 'all' ? 'All Items' : f === 'protocol' ? 'Protocols' : f === 'book' ? 'Books' : 'Power-Ups'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Balance</span>
          <div className="text-2xl font-display font-black text-yellow-400 mt-1">{credits} NC</div>
        </div>
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Inventory Value</span>
          <div className="text-2xl font-display font-black text-white mt-1">{totalInventoryValue} NC</div>
        </div>
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Protocols Owned</span>
          <div className="text-2xl font-display font-black text-emerald-400 mt-1">{protocols.filter(p => p.isStoreItem).length}</div>
        </div>
        <div className="hologram-card rounded-2xl p-6 border border-white/10">
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Total Items</span>
          <div className="text-2xl font-display font-black text-purple-400 mt-1">{STORE_ITEMS.length}</div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const Icon = typeIcons[item.type] || ShoppingCart;
          const color = typeColors[item.type] || 'text-white';
          const hasRichContent = getStoreContent(item.id) !== undefined;

          return (
            <motion.div key={item.id} layout
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative hologram-card rounded-[32px] p-8 overflow-hidden transition-all border border-white/5 hover:border-yellow-500/30"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color} group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all`}>
                    <Icon size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-display text-white/30 uppercase tracking-[0.3em]">{item.type}</span>
                    <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight leading-none mt-1 truncate">{item.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-white/40 font-tech leading-relaxed mb-4 min-h-[40px] line-clamp-2">
                  {item.protocolData?.criteria || item.description}
                </p>
                {item.type === 'book' && item.protocolData && (
                  <div className="flex items-center gap-4 mb-4 text-[9px] text-white/30 font-mono">
                    {item.protocolData.author && <span>{item.protocolData.author}</span>}
                    {item.protocolData.pages && <span>{item.protocolData.pages} pages</span>}
                    <span className="text-emerald-400/60">+{item.protocolData.gain} {item.protocolData.stat}</span>
                  </div>
                )}

                {/* Level gate warning */}
                {progression.level < item.requiredLevel && (
                  <div className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <span className="text-[9px] font-display text-red-400 uppercase tracking-widest">Requires Level {item.requiredLevel}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* Preview button */}
                  {hasRichContent && (
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-4 py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.15em] transition-all border bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10 hover:border-white/20 flex items-center gap-2"
                      title="View full description"
                    >
                      <FileText size={14} />
                      Details
                    </button>
                  )}

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id || purchaseSuccess === item.id || progression.level < item.requiredLevel}
                    className={`flex-1 py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border ${
                      progression.level < item.requiredLevel
                        ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                        : purchaseSuccess === item.id
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-white/5 hover:bg-yellow-500 hover:text-black border-white/10 hover:border-yellow-500'
                    }`}
                  >
                    {purchasing === item.id ? (
                      <span className="flex items-center justify-center gap-2"><Timer size={14} className="animate-spin" /> Processing...</span>
                    ) : purchaseSuccess === item.id ? (
                      <span className="flex items-center justify-center gap-2"><Check size={14} /> Purchased</span>
                    ) : progression.level < item.requiredLevel ? (
                      <span className="flex items-center justify-center gap-2"><Timer size={14} /> Locked</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart size={14} />
                        Buy
                      </span>
                    )}
                  </button>

                  <div className={`px-5 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[70px]`}>
                    <span className="text-[8px] text-yellow-400/60 uppercase tracking-widest font-display mb-1">Price</span>
                    <span className="text-lg font-display font-black text-yellow-400">{item.cost}</span>
                  </div>
                </div>

                {item.duration && item.duration > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-[9px] text-white/30 font-tech">
                    <Timer size={12} />
                    {item.duration}h duration
                  </div>
                )}
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-yellow-500/20 animate-scanline-fast" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-white/20 font-display uppercase tracking-widest italic">No items available in this category</p>
        </div>
      )}

      {/* ─── Preview Modal ─── */}
      <AnimatePresence>
        {previewItem && (
          <PreviewModal
            item={previewItem}
            content={getStoreContent(previewItem.id)}
            onClose={() => setPreviewItem(null)}
            onPurchase={() => handlePurchase(previewItem)}
            purchasing={purchasing === previewItem.id}
            purchaseSuccess={purchaseSuccess === previewItem.id}
            canAfford={credits >= previewItem.cost && progression.level >= previewItem.requiredLevel}
          />
        )}
      </AnimatePresence>

      {/* ─── PDF Download Prompt ─── */}
      <AnimatePresence>
        {showPdfPrompt && (
          <PdfPromptModal
            item={showPdfPrompt}
            generating={pdfGenerating}
            onDownload={() => handleDownloadPdf(showPdfPrompt)}
            onSkip={() => setShowPdfPrompt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Preview Modal — Full description before purchase
// ═══════════════════════════════════════════════════════════════

const PreviewModal: React.FC<{
  item: StoreItem;
  content?: StoreContent;
  onClose: () => void;
  onPurchase: () => void;
  purchasing: boolean;
  purchaseSuccess: boolean;
  canAfford: boolean;
}> = ({ item, content, onClose, onPurchase, purchasing, purchaseSuccess, canAfford }) => {
  const Icon = typeIcons[item.type] || ShoppingCart;
  const color = typeColors[item.type] || 'text-white';
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'quests' | 'includes'>('overview');

  if (!content) return null;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: FileText },
    { id: 'training' as const, label: 'Training Plan', icon: Target },
    { id: 'quests' as const, label: 'Quests', icon: ArrowRight },
    { id: 'includes' as const, label: "What You Get", icon: Gift },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-3xl bg-[#0a0a0f] rounded-[32px] border border-white/10 overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-lg border-b border-white/10 p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
              <Icon size={28} />
            </div>
            <div>
              <span className="text-[8px] font-display text-white/30 uppercase tracking-[0.3em]">{item.type}</span>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-none mt-1">{item.name}</h2>
              {item.type === 'book' && item.protocolData?.author && (
                <span className="text-xs text-white/40 font-tech mt-1 block">by {item.protocolData.author}{item.protocolData.pages ? ` · ${item.protocolData.pages} pages` : ''}</span>
              )}
              {item.type === 'protocol' && item.protocolData && (
                <span className="text-xs text-white/40 font-tech mt-1 block">
                  {item.protocolData.estDuration} · +{item.protocolData.gain} {item.protocolData.stat} per sync · Difficulty {item.protocolData.difficulty}/3
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center transition-all">
            <X size={18} className="text-white/60 hover:text-red-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="sticky top-[100px] z-10 bg-[#0a0a0f]/95 backdrop-blur-lg px-6 pt-4 flex gap-2 border-b border-white/5 pb-4">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all border ${
                  activeTab === tab.id
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    : 'bg-white/5 text-white/40 border-white/10 hover:text-white/70'
                }`}
              >
                <TabIcon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-display uppercase tracking-[0.3em] text-yellow-400/60 mb-3">Overview</h3>
                <p className="text-sm text-white/70 font-tech leading-relaxed">{content.overview}</p>
              </div>
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-display uppercase tracking-[0.3em] text-blue-400 mb-2">Who Is This For</h4>
                    <p className="text-sm text-white/60 font-tech leading-relaxed">{content.whoIsThisFor}</p>
                  </div>
                </div>
              </div>
              {item.protocolData && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-display block">Stat</span>
                    <span className="text-lg font-display font-black text-emerald-400 mt-1 block">{item.protocolData.stat?.toUpperCase()}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-display block">Gain/Sync</span>
                    <span className="text-lg font-display font-black text-yellow-400 mt-1 block">+{item.protocolData.gain}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-display block">Duration</span>
                    <span className="text-sm font-display font-bold text-white mt-1 block">{item.protocolData.estDuration}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'training' && (
            <div>
              <h3 className="text-[10px] font-display uppercase tracking-[0.3em] text-yellow-400/60 mb-4">Training Plan</h3>
              <div className="space-y-3">
                {content.trainingPlan.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-display font-black text-yellow-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-white/60 font-tech leading-relaxed pt-1">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div>
              <h3 className="text-[10px] font-display uppercase tracking-[0.3em] text-yellow-400/60 mb-4">Quests Assigned After Purchase</h3>
              <p className="text-xs text-white/40 font-tech mb-4">These daily quests will be auto-assigned to your QuestBoard when you sync this protocol:</p>
              <div className="space-y-4">
                {content.questsAssigned.map((quest, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-start gap-3 mb-3">
                      <Target size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-display font-bold text-emerald-400 mb-1">{quest.title}</h4>
                        <p className="text-xs text-white/50 font-tech leading-relaxed">{quest.description}</p>
                      </div>
                    </div>
                    <div className="ml-7 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 inline-block">
                      <span className="text-[9px] font-display font-bold text-yellow-400 uppercase tracking-widest">{quest.reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'includes' && (
            <div>
              <h3 className="text-[10px] font-display uppercase tracking-[0.3em] text-yellow-400/60 mb-4">What You Get</h3>
              <div className="space-y-2">
                {content.whatYouGet.map((thing, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/60 font-tech">{thing}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-3">
                <Download size={20} className="text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-white/50 font-tech">After purchase, a downloadable PDF training guide will be available with full instructions, form cues, and progression rules.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Purchase Bar */}
        <div className="sticky bottom-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-white/10 p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
              <span className="text-[8px] text-yellow-400/60 uppercase tracking-widest font-display">Price</span>
              <span className="text-xl font-display font-black text-yellow-400">{item.cost} NC</span>
            </div>
            {item.requiredLevel > 0 && (
              <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Level</span>
                <span className="text-xl font-display font-black text-white">{item.requiredLevel}+</span>
              </div>
            )}
          </div>
          <button
            onClick={onPurchase}
            disabled={purchasing || purchaseSuccess || !canAfford}
            className={`flex-1 max-w-xs py-4 rounded-2xl font-display font-bold text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 border ${
              purchaseSuccess
                ? 'bg-emerald-500 text-black border-emerald-500'
                : canAfford
                ? 'bg-yellow-500 text-black border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]'
                : 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed'
            }`}
          >
            {purchasing ? (
              <span className="flex items-center justify-center gap-2"><Timer size={14} className="animate-spin" /> Processing...</span>
            ) : purchaseSuccess ? (
              <span className="flex items-center justify-center gap-2"><Check size={14} /> Purchased!</span>
            ) : !canAfford ? (
              <span>Insufficient Balance</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart size={14} />
                Purchase — {item.cost} NC
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PDF Prompt Modal — Shown after successful purchase
// ═══════════════════════════════════════════════════════════════

const PdfPromptModal: React.FC<{
  item: StoreItem;
  generating: boolean;
  onDownload: () => void;
  onSkip: () => void;
}> = ({ item, generating, onDownload, onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[310] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={onSkip}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md bg-[#0a0a0f] rounded-[32px] border border-emerald-500/20 overflow-hidden p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Success icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6">
          <Check size={32} className="text-emerald-400" />
        </div>

        <h2 className="text-center text-xl font-display font-black text-white uppercase tracking-tight mb-2">Purchase Complete</h2>
        <p className="text-center text-sm text-white/50 font-tech mb-6">
          <span className="text-emerald-400">{item.name}</span> has been added to your Training Hub.
        </p>

        {/* PDF Download prompt */}
        <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <FileText size={20} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-display font-bold text-yellow-400 mb-1">Download Training Guide PDF</h3>
              <p className="text-xs text-white/50 font-tech leading-relaxed">
                Your purchase includes a complete PDF guide with full training instructions, form cues, progression rules, and the weekly schedule.
              </p>
            </div>
          </div>

          <button
            onClick={onDownload}
            disabled={generating}
            className="w-full py-3.5 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-500 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <><Timer size={14} className="animate-spin" /> Generating PDF...</>
            ) : (
              <><Download size={14} /> Download PDF Guide</>
            )}
          </button>
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 rounded-2xl font-display text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
        >
          Maybe Later
        </button>
      </motion.div>
    </motion.div>
  );
};

export default NexusStore;
