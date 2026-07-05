import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { useGame } from '../GameContext';
import { ExpHistoryEntry, THEME_PRESETS, ThemeColor } from '../types';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Build the last 4 weeks (28 days) ending today. Return oldest→newest so the
// grid renders Sun→Sat top-to-bottom with the most recent week at the bottom.
function buildCells(history: ExpHistoryEntry[]): { date: string; exp: number; credits: number; weight: number }[] {
  const map = new Map(history.map(h => [h.date, h]));
  const cells: { date: string; exp: number; credits: number; weight: number }[] = [];
  const today = new Date();

  // Find the most recent Sunday (end of the most recent week window)
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 27); // 28 days inclusive

  // Walk forward through 28 days
  const allWeights: number[] = [];
  const tempCells: { date: string; exp: number; credits: number; weight: number }[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < 28; i++) {
    const dStr = cursor.toISOString().split('T')[0];
    const hit = map.get(dStr);
    const exp = hit?.exp || 0;
    const credits = hit?.credits || 0;
    const weight = Math.min(100, Math.round((exp + credits * 0.5) * 1.2));
    tempCells.push({ date: dStr, exp, credits, weight });
    allWeights.push(weight);
    cursor.setDate(cursor.getDate() + 1);
  }
  cells.push(...tempCells);
  return cells;
}

const CalendarHeatmap: React.FC = () => {
  const { expHistory, theme, setTheme } = useGame();
  const [collapsed, setCollapsed] = React.useState(false);

  const cells = useMemo(() => buildCells(expHistory), [expHistory]);
  const totalExp = useMemo(() => cells.reduce((a, c) => a + c.exp, 0), [cells]);
  const totalCredits = useMemo(() => cells.reduce((a, c) => a + c.credits, 0), [cells]);
  const activeDays = useMemo(() => cells.filter(c => c.exp + c.credits > 0).length, [cells]);

  // Persist theme so the CSS variable applies on every render
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', THEME_PRESETS[theme].cssVar);
  }, [theme]);

  const accentClass = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    sapphire: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    crimson: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
  }[theme];

  const accentHover = {
    emerald: 'hover:border-emerald-500/50',
    sapphire: 'hover:border-blue-500/50',
    crimson: 'hover:border-red-500/50',
  }[theme];

  const cellColor = (weight: number): string => {
    if (weight === 0) return 'bg-white/5';
    const opacity = Math.max(0.2, weight / 100);
    if (theme === 'sapphire') return `bg-blue-500`;
    if (theme === 'crimson') return `bg-red-500`;
    return `bg-emerald-500`;
  };

  const cellStyle = (weight: number): React.CSSProperties => {
    if (weight === 0) return {};
    const opacity = Math.max(0.2, weight / 100);
    return {
      backgroundColor: THEME_PRESETS[theme].hex,
      opacity: opacity.toString(),
      boxShadow: `0 0 6px rgba(${THEME_PRESETS[theme].cssVar}, ${opacity * 0.5})`,
    };
  };

  // Group cells into 4 weeks of 7 columns
  const weeks = useMemo(() => {
    const w: typeof cells[] = [];
    for (let i = 0; i < 4; i++) {
      w.push(cells.slice(i * 7, i * 7 + 7));
    }
    return w;
  }, [cells]);

  return (
    <div className={`glass rounded-[32px] p-8 border border-white/10 transition-all ${accentHover}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center border`}>
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[8px] font-display uppercase tracking-[0.3em] text-white/30">R-03</span>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Effort Heatmap</h3>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 transition-all"
        >
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">Active Days</div>
              <div className={`text-lg font-mono font-bold ${accentClass.split(' ').pop()}`}>{activeDays}/28</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">EXP · 28d</div>
              <div className="text-lg font-mono font-bold text-white">{totalExp}</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">Credits · 28d</div>
              <div className="text-lg font-mono font-bold text-white">{totalCredits}</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {dayLabels.map((d, i) => (
              <div key={i} className="flex-1 text-center text-[8px] font-mono text-white/30">{d}</div>
            ))}
          </div>

          <div className="space-y-2 mb-6">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex gap-2">
                {week.map((cell, ci) => (
                  <motion.div
                    key={cell.date}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + ci) * 0.005 }}
                    className="flex-1 aspect-square rounded-lg"
                    style={cellStyle(cell.weight)}
                    title={`${cell.date}: +${cell.exp} XP, +${cell.credits} NC`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-[8px] font-mono text-white/30">
              <Palette size={10} />
              <span>THEME</span>
              <div className="flex gap-1.5">
                {(Object.keys(THEME_PRESETS) as ThemeColor[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    title={THEME_PRESETS[id].label}
                    className={`w-4 h-4 rounded-full transition-all border ${
                      theme === id ? 'border-white/60 ring-1 ring-white/40 scale-110' : 'border-white/10 hover:border-white/30'
                    } ${THEME_PRESETS[id].swatch}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[8px] font-mono text-white/30">Last 28 days</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarHeatmap;
