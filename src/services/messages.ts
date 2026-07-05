import React from 'react';
import { UserStats, ConsistencyData } from '../types';
import { Cpu } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

/** v1.4.0 — Optional tuner report appended to the debrief. */
export interface TunerReportAppendix {
  summary: string;
}

/**
 * Manager debrief message generator.
 * Renders one of several personalized debriefs based on the operator's
 * last task completion and overall performance. Each debrief uses
 * effort-mirror language: no "+NC" or "+XP" — only observational copy.
 *
 * v1.4.0: Accepts an optional TunerReport appendix. When present, the
 * Tuner Insight summary is appended to the body text.
 */
export function generateManagerDebrief(
  stats: UserStats,
  consistency: ConsistencyData,
  tasksCompletedToday: number,
  totalTasksToday: number,
  tunerReport?: TunerReportAppendix | null,
): { title: string; body: string; icon: React.ComponentType<any>; tone: 'acknowledge' | 'push' | 'warn' | 'rest' } {
  const score = consistency.score;
  const restTokens = consistency.graceDaysRemaining;

  let bodyText = '';

  // No tasks yet today → warn + push
  if (totalTasksToday === 0 || tasksCompletedToday === 0) {
    bodyText = 'You haven\'t logged a single effort today. The mirror is patient, but the day is not. One task is enough — start there.';
    const tone = 'warn';
    return { title: 'Day Unwritten', body: maybeAppendTuner(bodyText, tunerReport), icon: Cpu, tone };
  }

  // All tasks done → acknowledge + push
  if (tasksCompletedToday === totalTasksToday) {
    bodyText = `${tasksCompletedToday}/${totalTasksToday} logged. The mirror reflects cleanly. Rest is permitted — recovery is part of the protocol. Tomorrow's window opens at 00:00.`;
    return { title: 'Daily Obligations Fulfilled', body: maybeAppendTuner(bodyText, tunerReport), icon: Cpu, tone: 'rest' };
  }

  // Partial → push
  if (score >= 80) {
    bodyText = `${tasksCompletedToday}/${totalTasksToday} logged. Your 7-day consistency holds at ${score}%. One more effort closes the loop. Then recover — earn your rest.`;
    return { title: 'Strong Day, Partial Close', body: maybeAppendTuner(bodyText, tunerReport), icon: Cpu, tone: 'push' };
  }

  if (restTokens > 0) {
    bodyText = `${tasksCompletedToday}/${totalTasksToday} logged today. Your 7-day window holds at ${score}%. ${restTokens} rest token${restTokens === 1 ? '' : 's'} remain — spend one only if you genuinely need it.`;
    return { title: 'Effort Recorded. Window Intact.', body: maybeAppendTuner(bodyText, tunerReport), icon: Cpu, tone: 'acknowledge' };
  }

  bodyText = `${tasksCompletedToday}/${totalTasksToday} logged. 7-day consistency at ${score}%. No rest tokens remain. Every effort matters from here. Push through — the run is worth saving.`;
  return { title: 'Window At Risk', body: maybeAppendTuner(bodyText, tunerReport), icon: Cpu, tone: 'push' };
}

/** Append tuner report summary if available. */
function maybeAppendTuner(body: string, tunerReport?: TunerReportAppendix | null): string {
  if (!tunerReport || !tunerReport.summary) return body;
  return `${body}\n\n⧫ TUNER INSIGHT\n${tunerReport.summary}`;
}

/**
 * Determine if a new debrief is warranted (i.e., last debrief was on a different day).
 */
export function shouldShowNewDebrief(lastDebriefAt: string | null): boolean {
  if (!lastDebriefAt) return true;
  return lastDebriefAt.slice(0, 10) !== today();
}
