import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, RefreshCw, MessageSquare, Check, Bell, BellRing, TrendingUp } from 'lucide-react';
import { useGame } from '../GameContext';
import { generateManagerDebrief, shouldShowNewDebrief, TunerReportAppendix } from '../services/messages';
import { showDebriefNotification, shouldFireDebrief } from '../services/notifications';
import { runTuningCycle } from '../agents/AdaptiveTuner';
import type { BehaviorProfile } from '../agents/BehaviorProfile';

const today = () => new Date().toISOString().split('T')[0];

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

const MissionDebrief: React.FC = () => {
  const { stats, consistency, tasks, pushNotification, behaviorProfile, eventLog } = useGame();
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
  const todays = tasks.filter(t => t.date === todayStr);
  const completedToday = todays.filter(t => t.completed).length;
  const totalToday = todays.length;

  // v1.4.0 — Tuner report: run tuning cycle using behavior profile + events
  const tunerReport = useMemo(() => {
    try {
      const report = runTuningCycle(behaviorProfile, eventLog.map(e => e.event));
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
        title: 'Daily Debrief Available',
        description: 'The Manager has logged your day. Open Daily Review.',
        timestamp: new Date().toISOString(),
      });
    }
  }, [showNewDebrief, dismissed, refreshKey, pushNotification, todayStr]);

  // R-12 — automatic bi-weekly OS debrief Push Day. Fires once when the cadence expires
  // (and only when the panel is mounted, which is on first launch / dashboard open).
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
      // Always Push Day to in-app as well so the operator can review inside NEXUS
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

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <MessageSquare size={44} className="text-purple-400" />
          </div>
          <div className="space-y-1">
            <span className="text-purple-500 font-display text-[10px] tracking-[0.3em] uppercase shadow-[0_0_15px_rgba(168,85,247,0.6)] block">Daily Review</span>
            <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white leading-none">Daily Review</h2>
            <p className="text-[10px] text-white/30 font-mono tracking-wider">
              {completedToday}/{totalToday} efforts logged today
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
            title="Trigger an OS-level Push Day notification (also fires in-app if OS unsupported)"
          >
            {pushing ? <BellRing size={16} className="animate-pulse" /> : <Bell size={16} />}
            Trigger OS Debrief
          </button>
        </div>
        {lastPushChannel && (
          <span className="text-[9px] font-mono text-white/30 mt-2 block">
            Last Push Day channel: <span className={lastPushChannel === 'os' ? 'text-emerald-400' : 'text-amber-400'}>{lastPushChannel === 'os' ? 'OS notification fired' : 'in-app fallback (OS unsupported)'}</span>
          </span>
        )}
      </div>

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
                debrief.tone === 'Push Day' ? 'border-amber-500/40 bg-amber-500/10' :
                debrief.tone === 'rest' ? 'border-blue-500/40 bg-blue-500/10' :
                'border-emerald-500/40 bg-emerald-500/10'
              }`}>
                <Icon size={28} className={
                  debrief.tone === 'warn' ? 'text-red-400' :
                  debrief.tone === 'Push Day' ? 'text-amber-400' :
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

            {/* v1.4.0 — Tuner Insight sub-panel */}
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
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">Logged</div>
                <div className="text-xl font-mono text-emerald-400 font-bold">{completedToday}</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">Window</div>
                <div className="text-xl font-mono text-emerald-400 font-bold">{consistency.last7Days.filter(d => d.completed).length}/7</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="text-[8px] font-display uppercase tracking-widest text-white/30 mb-1">Rest</div>
                <div className="text-xl font-mono text-purple-400 font-bold">×{consistency.graceDaysRemaining}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <span className={`text-[9px] font-display uppercase tracking-widest ${t.completed ? 'text-emerald-400' : 'text-white/30'}`}>
                      {t.completed ? 'DONE' : 'OPEN'}
                    </span>
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
