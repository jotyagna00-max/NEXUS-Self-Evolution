import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Brain, Dumbbell, Wind, Moon, Shield, Zap, Crown, Star, Timer, Check, Lock, Sparkles, Book, Activity } from 'lucide-react';
import { useGame } from '../GameContext';
import { STORE_ITEMS, StoreItem } from '../types';

const typeIcons: Record<string, any> = {
  protocol: Brain, powerup: Zap, cosmetic: Star, subscription: Crown, book: Book,
  mental: Brain, physical: Dumbbell, agility: Wind, willpower: Moon, reading: Book, habit: Activity,
};

const typeColors: Record<string, string> = {
  protocol: 'text-blue-400', powerup: 'text-yellow-400', cosmetic: 'text-pink-400', subscription: 'text-purple-400', book: 'text-red-400',
  mental: 'text-blue-400', physical: 'text-red-400', agility: 'text-green-400', willpower: 'text-purple-400', reading: 'text-red-400', habit: 'text-amber-400',
};

const NexusStore: React.FC = () => {
  const { credits, purchaseStoreItem, isPro, setProStatus, protocols, addProtocol, spendCredits } = useGame();
  const [filter, setFilter] = useState<'all' | 'protocol' | 'book' | 'powerup' | 'subscription'>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const filteredItems = STORE_ITEMS.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (item.type === 'subscription' && isPro) return false;
    if ((item.type === 'protocol' || item.type === 'book') && protocols.some(p => p.isStoreItem && p.title === item.protocolData?.title)) return false;
    return true;
  });

  const handlePurchase = async (item: StoreItem) => {
    setPurchasing(item.id);
    await new Promise(r => setTimeout(r, 500));

    if (item.type === 'subscription') {
      if (credits >= item.cost) {
        if (!spendCredits(item.cost)) {
          setPurchasing(null);
          return;
        }
        setProStatus(true);
        setPurchaseSuccess(item.id);
      }
    } else {
      const success = purchaseStoreItem(item);
      if (success) setPurchaseSuccess(item.id);
    }

    setPurchasing(null);
    setTimeout(() => setPurchaseSuccess(null), 2000);
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
              {isPro && (
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-lg text-[8px] text-purple-400 font-display uppercase tracking-widest">Pro</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {(['all', 'protocol', 'book', 'powerup', 'subscription'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all border ${
                filter === f ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              }`}>
              {f === 'all' ? 'All Items' : f === 'protocol' ? 'Protocols' : f === 'book' ? 'Books' : f === 'powerup' ? 'Power-Ups' : 'Pro'}
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
          <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Pro Status</span>
          <div className={`text-2xl font-display font-black mt-1 ${isPro ? 'text-purple-400' : 'text-white/40'}`}>{isPro ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const Icon = typeIcons[item.type] || ShoppingCart;
          const color = typeColors[item.type] || 'text-white';

          return (
            <motion.div key={item.id} layout
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative hologram-card rounded-[32px] p-8 overflow-hidden transition-all border border-white/5 hover:border-yellow-500/30"
            >
              <div className={`absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
                <Icon size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${color} group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all`}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <span className="text-[8px] font-display text-white/30 uppercase tracking-[0.3em]">{item.type}</span>
                    <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight leading-none mt-1">{item.name}</h3>
                  </div>
                  {item.exclusive && (
                    <div className="ml-auto px-2 py-1 bg-purple-500/20 border border-purple-500/40 rounded">
                      <span className="text-[7px] text-purple-400 font-display uppercase tracking-widest">Pro</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-white/40 font-tech leading-relaxed mb-4 min-h-[40px]">
                  {item.protocolData?.criteria || item.description}
                </p>
                {item.type === 'book' && item.protocolData && (
                  <div className="flex items-center gap-4 mb-4 text-[9px] text-white/30 font-mono">
                    {item.protocolData.author && <span>{item.protocolData.author}</span>}
                    {item.protocolData.pages && <span>{item.protocolData.pages} pages</span>}
                    <span className="text-emerald-400/60">+{item.protocolData.gain} {item.protocolData.stat}</span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id || purchaseSuccess === item.id || (item.exclusive && !isPro) || credits < item.cost}
                    className={`flex-1 py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border ${
                      purchaseSuccess === item.id
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : credits < item.cost
                        ? 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed'
                        : 'bg-white/5 hover:bg-yellow-500 hover:text-black border-white/10 hover:border-yellow-500'
                    }`}
                  >
                    {purchasing === item.id ? (
                      <span className="flex items-center justify-center gap-2"><Timer size={14} className="animate-spin" /> Processing...</span>
                    ) : purchaseSuccess === item.id ? (
                      <span className="flex items-center justify-center gap-2"><Check size={14} /> Purchased</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart size={14} />
                        {item.exclusive && !isPro ? 'Pro Required' : 'Buy'}
                      </span>
                    )}
                  </button>

                  <div className={`px-5 py-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[70px] ${
                    credits >= item.cost ? '' : 'opacity-40'
                  }`}>
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
    </div>
  );
};

export default NexusStore;
