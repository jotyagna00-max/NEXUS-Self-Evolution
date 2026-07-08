import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, RefreshCw, MessageSquare, Check, Bell, BellRing, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Trophy, Flame, Zap, AlertTriangle, BarChart3, Activity, CalendarDays } from 'lucide-react';
import { useGame } from '../GameContext';
import { generateManagerDebrief, shouldShowNewDebrief, TunerReportAppendix } from '../services/messages';
import { showDebriefNotification, shouldFireDebrief } from '../services/notifications';
import { runTuningCycle } from '../agents/AdaptiveTuner';
import type { BehaviorProfile } from '../agents/BehaviorProfile';

const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const TONE_STYLES: Record<string, { border: string; glow: string; chip: string; chipLabel: string }> = {
  acknowledge: {
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_60px_rgba(16,185,129,0.08)]',
    chip: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    chipLabel: 'Acknowledged',
  },
  rest: {
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.08)]',
    chip: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    chipLabel: 'Rest Day',
  },
  push: {
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_60px_rgba(245,158,11,0.08)]',
    chip: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    chipLabel: 'Push Day',
  },
  warn: {
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.08)]',
    chip: 'bg-red-500/15 text-red-400 border-red-500/30',
    chipLabel: 'Wake Up',
  },
};

/** Mini bar chart rendered with pure CSS — no external chart library needed */
const MiniBarChart: React.FC<{
  data: { label: string; value: number; isToday?: boolean }[];
  color: string;
  maxValue: number;
  height?: number;
}> = ({ data, color, maxValue, height = 120 }) => {
  const safeMax = Math.max(maxValue, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / safeMax) * (height - 20));
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[7px] font-mono text-white/30">{d.value > 0 ? d.value : '-'}</span>
            <div
              className={`w-full rounded-t-md transition-all ${d.isToday ? 'ring-1 ring-white/20' : ''}`}
              style={{
                height: barH,
                background: d.isToday
                  ? `linear-gradient(to top, ${color}, ${color}cc)`
                  : `${color}40`,
                minHeight: 2,
              }}
            />
            <span className={`text-[7px] font-mono ${d.isToday ? 'text-white/60' : 'text-white/20'}`}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Mini sparkline-style line chart using SVG */
const MiniLineChart: React.FC<{
  data: { label: string; value: number }[];
  color: string;
  height?: number;
}> = ({ data, color, height = 80 }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = Math.max(maxVal - minVal, 1);
  const w = 280;
  const padding = 8;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (w - padding * 2);
    const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';
  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {areaD && <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />}
      {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} opacity={0.8} />
      ))}
    </svg>
  );
};

const MissionDebrief: React.FC = () => {
  const {
    stats, consistency, tasks, quests, pushNotification,
    behaviorProfile, eventLog, expHistory, penaltyRecords,
    progression, credits,
  } = useGame();

  const [dismissed, setDismissed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastDebriefAt, setLastDebriefAt] = useState<string | null>(() => {
    return localStorage.getItem('nexus_lastDebriefAt');
  });
  const [lastOsPushAt, setLastOsPushAt] = useState<string | null>(() => {
    return localStorage.getItem('nexus_lastOsPushAt');
  });
  const [pushing, setPushing] = useState(false);
  const [lastPushChannel, setLastPushChannel] = useState<'os' | 'in-app' | null>(null);

  const todayStr = today();
  const yesterdayStr = yesterday();
  const todays = tasks.filter(t => t.date === todayStr);
  const yesterdaysTasks = tasks.filter(t => t.date === yesterdayStr);
  const completedToday = todays.filter(t => t.completed).length;
  const totalToday = todays.length;
  const completedYesterday = yesterdaysTasks.filter(t => t.completed).length;
  const totalYesterday = yesterdaysTasks.length;

  // Yesterday's completed quests
  const yesterdaysQuests = quests.filter(q => {
    if (!q.completed || !q.completedAt) return false;
    return q.completedAt.startsWith(yesterdayStr);
  });

  // Yesterday's penalties
  const yesterdaysPenalties = penaltyRecords.filter(p => p.date === yesterdayStr);

  // Yesterday's EXP/Credits from history
  const yesterdayExpEntry = expHistory.find(e => e.date === yesterdayStr);
  const yesterdayExp = yesterdayExpEntry?.exp || 0;
  const yesterdayCredits = yesterdayExpEntry?.credits || 0;

  // 7-day history for graphs
  const last7Days = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));
  const exp7Day = last7Days.map(d => {
    const entry = expHistory.find(e => e.date === d);
    return { label: d.slice(5), value: entry?.exp || 0, isToday: d === todayStr };
  });
  const credits7Day = last7Days.map(d => {
    const entry = expHistory.find(e => e.date === d);
    return { label: d.slice(5), value: entry?.credits || 0, isToday: d === todayStr };
  });

  const maxExp7 = Math.max(...exp7Day.map(d => d.value), 1);
  const maxCredits7 = Math.max(...credits7Day.map(d => d.value), 1);

  // ── Monthly Report (last 12 months) ──
  const getMonthKey = (dateStr: string) => dateStr.slice(0, 7);
  const months = (() => {
    const result: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return result;
  })();

  const monthlyData = months.map(m => {
    const monthEntries = expHistory.filter(e => getMonthKey(e.date) === m);
    const monthTasks = tasks.filter(t => t.completed && getMonthKey(t.date) === m);
    const monthQuests = quests.filter(q => q.completed && q.completedAt && getMonthKey(q.completedAt) === m);
    const monthPenalties = penaltyRecords.filter(p => getMonthKey(p.date) === m);
    return {
      month: m,
      label: new Date(m + '-01').toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      exp: monthEntries.reduce((s, e) => s + e.exp, 0),
      credits: monthEntries.reduce((s, e) => s + e.credits, 0),
      tasks: monthTasks.length,
      quests: monthQuests.length,
      penalties: monthPenalties.length,
      penaltyAmount: monthPenalties.reduce((s, p) => s + p.amount, 0),
      activeDays: monthEntries.length,
    };
  });

  const bestMonthExp = Math.max(...monthlyData.map(m => m.exp), 1);
  const bestMonthCredits = Math.max(...monthlyData.map(m => m.credits), 1);
  const currentMonth = getMonthKey(todayStr);
  const thisMonthData = monthlyData.find(m => m.month === currentMonth);
  const totalYearExp = monthlyData.reduce((s, m) => s + m.exp, 0);

  // ── Yearly Report ──
  const getYearKey = (dateStr: string) => dateStr.slice(0, 4);
  const years = (() => {
    const result: string[] = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      result.push(String(now.getFullYear() - i));
    }
    return result;
  })();

  const yearlyData = years.map(y => {
    const yearEntries = expHistory.filter(e => getYearKey(e.date) === y);
    const yearTasks = tasks.filter(t => t.completed && getYearKey(t.date) === y);
    const yearQuests = quests.filter(q => q.completed && q.completedAt && getYearKey(q.completedAt) === y);
    const yearPenalties = penaltyRecords.filter(p => getYearKey(p.date) === y);
    return {
      year: y,
      exp: yearEntries.reduce((s, e) => s + e.exp, 0),
      credits: yearEntries.reduce((s, e) => s + e.credits, 0),
      tasks: yearTasks.length,
      quests: yearQuests.length,
      penalties: yearPenalties.length,
      penaltyAmount: yearPenalties.reduce((s, p) => s + p.amount, 0),
      activeDays: yearEntries.length,
    };
  });

  const bestYearExp = Math.max(...yearlyData.map(y => y.exp), 1);
  const currentYear = getYearKey(todayStr);
  const thisYearData = yearlyData.find(y => y.year === currentYear);

  // Day before yesterday for comparison
  const dayBeforeYesterday = daysAgo(2);
  const dayBeforeExpEntry = expHistory.find(e => e.date === dayBeforeYesterday);
  const dayBeforeExp = dayBeforeExpEntry?.exp || 0;
  const dayBeforeCredits = dayBeforeExpEntry?.credits || 0;

  const expTrend = yesterdayExp - dayBeforeExp;
  const creditsTrend = yesterdayCredits - dayBeforeCredits;

  // v1.4.0 — Tuner report: run tuning cycle using behavior profile + events
  const tunerReport = useMemo(() => {
    try {
      const report = runTuningCycle(behaviorProfile, eventLog);
      return report.adjustments ? { summary: report.summary } : null;
    } catch { return null; }
  }, [behaviorProfile, eventLog, refreshKey]);

  const debrief = useMemo(() => generateManagerDebrief(
    stats,
    consistency,
    completedToday,
    totalToday,
    tunerReport,
  ), [stats, consistency, completedToday, totalToday, tunerReport, refreshKey]);

  const showNewDebrief = shouldShowNewDebrief(lastDebriefAt);
  const isVisible = showNewDebrief && !dismissed;
  const toneStyle = TONE_STYLES[debrief.tone] || TONE_STYLES.acknowledge;
  const Icon = debrief.icon || Cpu;

  const handleAcknowledge = () => {
    setDismissed(true);
    const nowIso = new Date().toISOString();
    localStorage.setItem('nexus_lastDebriefAt', nowIso);
    setLastDebriefAt(nowIso);
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    setDismissed(false);
  };

  // Surface the new debrief as a toast once per day
  useEffect(() => {
    if (showNewDebrief && !dismissed) {
      pushNotification({
        id: `debrief_${todayStr}_${refreshKey}`,
        type: 'level_up',
        title: 'Daily Review Available',
        description: 'Your daily report is ready. Open Daily Review.',
        timestamp: new Date().toISOString(),
      });
    }
  }, [showNewDebrief, dismissed, refreshKey, pushNotification, todayStr]);

  // R-12 — automatic bi-weekly OS debrief Push Day.
  useEffect(() => {
    if (!shouldFireDebrief(lastOsPushAt, 14)) return;
    if (pushing) return;
    setPushing(true);
    const notif = {
      id: `os_debrief_${Date.now()}`,
      type: 'achievement' as const,
      title: 'Bi-Weekly Manager Debrief',
      description: 'Two weeks on the protocol. Your debrief is ready in NEXUS.',
      timestamp: new Date().toISOString(),
    };
    showDebriefNotification({
      title: notif.title,
      body: notif.description,
      fallback: notif,
    }).then(res => {
      const nowIso = new Date().toISOString();
      localStorage.setItem('nexus_lastOsPushAt', nowIso);
      setLastOsPushAt(nowIso);
      setLastPushChannel(res.via);
      if (res.via === 'in-app') {
        pushNotification(notif);
      }
    }).finally(() => setPushing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerManualPush = async () => {
    if (pushing) return;
    setPushing(true);
    const notif = {
      id: `os_debrief_manual_${Date.now()}`,
      type: 'achievement' as const,
      title: 'Manager Debrief (Manual)',
      description: 'You asked for the bi-weekly debrief. It just landed.',
      timestamp: new Date().toISOString(),
    };
    const res = await showDebriefNotification({
      title: notif.title,
      body: notif.description,
      fallback: notif,
    });
    const nowIso = new Date().toISOString();
    localStorage.setItem('nexus_lastOsPushAt', nowIso);
    setLastOsPushAt(nowIso);
    setLastPushChannel(res.via);
    if (res.via === 'in-app') pushNotification(notif);
    setPushing(false);
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUpRight size={12} className="text-emerald-400" />;
    if (value < 0) return <ArrowDownRight size={12} className="text-red-400" />;
    return <Minus size={12} className="text-white/30" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <BarChart3 size={44} className="text-purple-400" />
          </div>
          <div className="space-y-1">
            <span className="text-purple-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(168,85,247,0.6)] block">Daily Review</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Daily Review</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">
              {completedToday}/{totalToday} tasks today · Level {progression.level} {progression.rank}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-display text-xs uppercase tracking-widest transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={triggerManualPush}
            disabled={pushing}
            className="flex items-center gap-3 px-6 py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 disabled:opacity-50 rounded-2xl text-purple-300 font-display text-xs uppercase tracking-widest transition-all"
          >
            {pushing ? <BellRing size={16} className="animate-pulse" /> : <Bell size={16} />}
            OS Debrief
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* YESTERDAY'S REPORT — The core new feature          */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-emerald-400" />
          <span className="text-[10px] font-display uppercase tracking-[0.3em] text-white/40">Yesterday's Report — {yesterdayStr}</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Yesterday Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">EXP Gained</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-black text-yellow-400">{yesterdayExp}</span>
              <div className="flex items-center gap-1">
                <TrendIcon value={expTrend} />
                <span className={`text-[9px] font-mono ${expTrend > 0 ? 'text-emerald-400' : expTrend < 0 ? 'text-red-400' : 'text-white/30'}`}>
                  {expTrend > 0 ? '+' : ''}{expTrend}
                </span>
              </div>
            </div>
          </div>

          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={12} className="text-emerald-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Credits Gained</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-black text-emerald-400">{yesterdayCredits}</span>
              <div className="flex items-center gap-1">
                <TrendIcon value={creditsTrend} />
                <span className={`text-[9px] font-mono ${creditsTrend > 0 ? 'text-emerald-400' : creditsTrend < 0 ? 'text-red-400' : 'text-white/30'}`}>
                  {creditsTrend > 0 ? '+' : ''}{creditsTrend}
                </span>
              </div>
            </div>
          </div>

          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Check size={12} className="text-blue-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Tasks Done</span>
            </div>
            <div className="text-2xl font-display font-black text-blue-400">
              {completedYesterday}<span className="text-sm text-white/20">/{totalYesterday}</span>
            </div>
          </div>

          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Penalties</span>
            </div>
            <div className="text-2xl font-display font-black text-red-400">{yesterdaysPenalties.length}</div>
          </div>
        </div>

        {/* 7-Day Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-[9px] font-display uppercase tracking-widest text-white/40">7-Day EXP</span>
              </div>
              <span className="text-[9px] font-mono text-white/20">Total: {exp7Day.reduce((s, d) => s + d.value, 0)}</span>
            </div>
            <MiniBarChart data={exp7Day} color="#facc15" maxValue={maxExp7} height={100} />
          </div>

          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-emerald-400" />
                <span className="text-[9px] font-display uppercase tracking-widest text-white/40">7-Day Credits</span>
              </div>
              <span className="text-[9px] font-mono text-white/20">Total: {credits7Day.reduce((s, d) => s + d.value, 0)}</span>
            </div>
            <MiniBarChart data={credits7Day} color="#10b981" maxValue={maxCredits7} height={100} />
          </div>
        </div>

        {/* Growth/Decline Trend Line */}
        <div className="hologram-card rounded-[28px] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-purple-400" />
              <span className="text-[9px] font-display uppercase tracking-widest text-white/40">EXP Trend (7 Days)</span>
            </div>
            <div className="flex items-center gap-2">
              {expTrend > 0 ? (
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono"><TrendingUp size={10} /> Growing</span>
              ) : expTrend < 0 ? (
                <span className="flex items-center gap-1 text-[9px] text-red-400 font-mono"><TrendingDown size={10} /> Declining</span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] text-white/30 font-mono"><Minus size={10} /> Flat</span>
              )}
            </div>
          </div>
          <MiniLineChart data={exp7Day} color="#a855f7" height={70} />
        </div>

        {/* Yesterday's Completed Quests */}
        {yesterdaysQuests.length > 0 && (
          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={14} className="text-orange-400" />
              <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Quests Completed Yesterday</span>
            </div>
            <div className="space-y-2">
              {yesterdaysQuests.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-[11px] font-tech text-white/70">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="text-yellow-400">+{q.rewardExp} EXP</span>
                    <span className="text-emerald-400">+{q.rewardCredits} NC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yesterday's Penalties */}
        {yesterdaysPenalties.length > 0 && (
          <div className="hologram-card rounded-[28px] p-6 border border-red-500/10">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Penalties Yesterday</span>
            </div>
            <div className="space-y-2">
              {yesterdaysPenalties.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-red-500/10 bg-red-500/5">
                  <span className="text-[11px] font-tech text-white/60">{p.reason}</span>
                  <span className="text-[9px] font-mono text-red-400">-{p.amount} NC</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* MONTHLY REPORT — Last 12 months                     */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-cyan-400" />
          <span className="text-[10px] font-display uppercase tracking-[0.3em] text-white/40">Monthly Report — Last 12 Months</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Total EXP (12m)</span>
            </div>
            <div className="text-2xl font-display font-black text-yellow-400">{totalYearExp}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={12} className="text-emerald-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Best Month EXP</span>
            </div>
            <div className="text-2xl font-display font-black text-emerald-400">{bestMonthExp}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={12} className="text-purple-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">This Month EXP</span>
            </div>
            <div className="text-2xl font-display font-black text-purple-400">{thisMonthData?.exp || 0}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-blue-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Active Days (mo)</span>
            </div>
            <div className="text-2xl font-display font-black text-blue-400">{thisMonthData?.activeDays || 0}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={12} className="text-orange-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Quests/Month</span>
            </div>
            <div className="text-2xl font-display font-black text-orange-400">{thisMonthData?.quests || 0}</div>
          </div>
        </div>

        {/* Monthly EXP Bar Chart */}
        <div className="hologram-card rounded-[28px] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Monthly EXP (12 Months)</span>
            </div>
            <span className="text-[9px] font-mono text-white/20">{totalYearExp.toLocaleString()} total</span>
          </div>
          <MiniBarChart
            data={monthlyData.map(m => ({ label: m.label, value: m.exp, isToday: m.month === currentMonth }))}
            color="#facc15"
            maxValue={bestMonthExp}
            height={110}
          />
        </div>

        {/* Monthly Quest & Task Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-orange-400" />
                <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Quests Completed/Month</span>
              </div>
            </div>
            <MiniBarChart
              data={monthlyData.map(m => ({ label: m.label, value: m.quests, isToday: m.month === currentMonth }))}
              color="#f97316"
              maxValue={Math.max(...monthlyData.map(m => m.quests), 1)}
              height={80}
            />
          </div>
          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Penalties/Month</span>
              </div>
            </div>
            <MiniBarChart
              data={monthlyData.map(m => ({ label: m.label, value: m.penalties, isToday: m.month === currentMonth }))}
              color="#ef4444"
              maxValue={Math.max(...monthlyData.map(m => m.penalties), 1)}
              height={80}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* YEARLY REPORT                                      */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="text-rose-400" />
          <span className="text-[10px] font-display uppercase tracking-[0.3em] text-white/40">Yearly Report</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Yearly Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">This Year EXP</span>
            </div>
            <div className="text-2xl font-display font-black text-yellow-400">{thisYearData?.exp || 0}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={12} className="text-emerald-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">This Year Credits</span>
            </div>
            <div className="text-2xl font-display font-black text-emerald-400">{thisYearData?.credits || 0}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Check size={12} className="text-blue-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Tasks Done</span>
            </div>
            <div className="text-2xl font-display font-black text-blue-400">{thisYearData?.tasks || 0}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={12} className="text-orange-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Quests Done</span>
            </div>
            <div className="text-2xl font-display font-black text-orange-400">{thisYearData?.quests || 0}</div>
          </div>
          <div className="hologram-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-purple-400" />
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-display">Active Days</span>
            </div>
            <div className="text-2xl font-display font-black text-purple-400">{thisYearData?.activeDays || 0}</div>
          </div>
        </div>

        {/* Yearly EXP Bar Chart */}
        <div className="hologram-card rounded-[28px] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Yearly EXP Breakdown</span>
            </div>
          </div>
          <MiniBarChart
            data={yearlyData.map(y => ({ label: y.year, value: y.exp, isToday: y.year === currentYear }))}
            color="#facc15"
            maxValue={bestYearExp}
            height={100}
          />
        </div>

        {/* Yearly Quest & Penalty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-orange-400" />
                <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Quests/Year</span>
              </div>
            </div>
            <MiniBarChart
              data={yearlyData.map(y => ({ label: y.year, value: y.quests, isToday: y.year === currentYear }))}
              color="#f97316"
              maxValue={Math.max(...yearlyData.map(y => y.quests), 1)}
              height={80}
            />
          </div>
          <div className="hologram-card rounded-[28px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-[9px] font-display uppercase tracking-widest text-white/40">Penalties/Year</span>
              </div>
            </div>
            <MiniBarChart
              data={yearlyData.map(y => ({ label: y.year, value: y.penalties, isToday: y.year === currentYear }))}
              color="#ef4444"
              maxValue={Math.max(...yearlyData.map(y => y.penalties), 1)}
              height={80}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* DEBRIEF CARD — Existing manager debrief             */}
      {/* ═══════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.div
            key="debrief-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className={`hologram-card rounded-[40px] p-10 border-2 ${toneStyle.border} ${toneStyle.glow}`}
          >
            <div className="flex items-start gap-6 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                debrief.tone === 'warn' ? 'border-red-500/40 bg-red-500/10' :
                debrief.tone === 'push' ? 'border-amber-500/40 bg-amber-500/10' :
                debrief.tone === 'rest' ? 'border-blue-500/40 bg-blue-500/10' :
                'border-emerald-500/40 bg-emerald-500/10'
              }`}>
                <Icon size={28} className={
                  debrief.tone === 'warn' ? 'text-red-400' :
                  debrief.tone === 'push' ? 'text-amber-400' :
                  debrief.tone === 'rest' ? 'text-blue-400' :
                  'text-emerald-400'
                } />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-display text-white/30 uppercase tracking-[0.3em] block">Manager · {todayStr}</span>
                <h3 className="text-3xl font-display font-bold text-white tracking-tight mt-1">{debrief.title}</h3>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border text-[9px] font-display uppercase tracking-widest ${toneStyle.chip}`}>
                  {toneStyle.chipLabel}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-black/30 border border-white/5">
              <p className="text-sm font-tech text-white/80 leading-relaxed whitespace-pre-line">
                {debrief.body}
              </p>
            </div>

            {tunerReport && (
              <div className="mt-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-amber-400" />
                  <span className="text-[9px] font-display uppercase tracking-widest text-amber-400/80">Tuner Insight</span>
                </div>
                <p className="text-[11px] font-tech text-amber-200/70 leading-relaxed">
                  {tunerReport.summary}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
              <div className="text-[10px] font-tech text-white/30">
                7-day consistency: <span className="text-emerald-400 font-mono">{consistency.score}%</span> · window: <span className="text-emerald-400 font-mono">{consistency.last7Days.filter(d => d.completed).length}/7</span>
              </div>
              <button
                onClick={handleAcknowledge}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-400 text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                <Check size={14} />
                Acknowledge
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="debrief-closed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hologram-card rounded-[40px] p-10 border border-white/10 text-center"
          >
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/10 bg-white/5">
              <Check size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-2">Debrief Logged</h3>
            <p className="text-sm font-tech text-white/40 max-w-md mx-auto">
              The Manager has Acknowledged today's session. Come back after the next midnight for a fresh debrief.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TODAY'S TASKS + MIRROR STATE                        */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hologram-card rounded-[32px] p-8 border border-white/10">
          <span className="text-[10px] font-display uppercase tracking-[0.3em] text-white/30 block mb-4">Today</span>
          <div className="space-y-3">
            {todays.length === 0 ? (
              <p className="text-sm font-tech text-white/40">No daily tasks generated yet.</p>
            ) : (
              todays.map(t => (
                <div key={t.id} className={`p-3 rounded-xl border ${t.completed ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-tech text-white/70">{t.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-yellow-400/40">+{t.rewardExp}</span>
                      <span className={`text-[9px] font-display uppercase tracking-widest ${t.completed ? 'text-emerald-400' : 'text-white/30'}`}>
                        {t.completed ? 'DONE' : 'OPEN'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hologram-card rounded-[32px] p-8 border border-white/10">
          <span className="text-[10px] font-display uppercase tracking-[0.3em] text-white/30 block mb-4">Mirror State</span>
          <div className="space-y-3">
            {(['intelligence', 'strength', 'willpower', 'agility', 'vitality', 'social'] as const).map(stat => (
              <div key={stat} className="flex items-center justify-between">
                <span className="text-[10px] font-display uppercase tracking-widest text-white/40">{stat}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${stats[stat]}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/60 w-8 text-right">{stats[stat]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionDebrief;
