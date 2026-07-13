import { Quest, Protocol, Habit, QuestCategory, StatType } from '../types';

interface GenerationContext {
  protocols: Protocol[];
  habits: Habit[];
  stats: Record<string, number>;
  profile?: { name?: string; primaryGoal?: string; secondaryGoals?: string[]; barriers?: string[] };
  existingQuests: Quest[];
}

const WEAK_POINT_QUESTS: Record<StatType, { title: string; description: string; diff: number }[]> = {
  strength: [
    { title: 'Iron Protocol', description: 'Complete 3 sets of your main compound lift at RPE 8. Log the weight.', diff: 3 },
    { title: 'Push-up Pyramid', description: '1-2-3-4-5-6-7-6-5-4-3-2-1 push-ups. No rest between sets.', diff: 2 },
    { title: 'Stair Climber', description: 'Take stairs instead of elevator all day. Track flights climbed.', diff: 1 },
  ],
  intelligence: [
    { title: 'Deep Work Block', description: '90 minutes of uninterrupted, phone-off deep work. Track output.', diff: 4 },
    { title: 'Memory Palace Drill', description: 'Memorize 10 new items using memory palace. Recall tonight.', diff: 3 },
    { title: 'Speed Reading Drill', description: 'Practice speed reading for 15 minutes. Track WPM.', diff: 2 },
  ],
  agility: [
    { title: 'Mobility Flush', description: '15 min full-body mobility flow. Hold each stretch 30 seconds.', diff: 1 },
    { title: 'Posture Check', description: 'Every hour, check and correct posture. Set 4 reminders.', diff: 1 },
    { title: 'Reaction Drill', description: '10 minutes of reaction-time training. Track improvements.', diff: 2 },
  ],
  vitality: [
    { title: 'Conditioning Sprint', description: '5 rounds of 400m sprint with 2 min rest. Track total time.', diff: 4 },
    { title: 'Hydration Protocol', description: 'Drink 3L of water today. Track intake every 2 hours.', diff: 1 },
    { title: 'Sleep Optimization', description: 'In bed by 10 PM. No screens 30 min before. Track sleep quality.', diff: 2 },
  ],
  willpower: [
    { title: 'Dopamine Fast', description: 'No social media, no entertainment, no junk food for 4 hours.', diff: 4 },
    { title: 'Cold Shower Protocol', description: 'End your shower with 90 seconds of cold water. No exceptions.', diff: 2 },
    { title: 'Phone Curfew', description: 'No phone usage after 9 PM. Read or stretch instead.', diff: 2 },
    { title: 'Discomfort Training', description: 'Do one thing you\'ve been avoiding for 10 minutes. Start now.', diff: 2 },
    { title: 'Meditation Session', description: '15 minutes of focused meditation. Count breaths. Note wanders.', diff: 2 },
    { title: 'Sugar Blockade', description: 'No sugar or processed food today. Whole foods only.', diff: 3 },
  ],
  social: [
    { title: 'Active Listening Drill', description: 'In your next conversation, listen 80% and speak 20%.', diff: 3 },
    { title: 'Compliment Protocol', description: 'Give 3 genuine, specific compliments today. Track reactions.', diff: 1 },
    { title: 'Eye Contact Training', description: 'Maintain eye contact in all conversations. Don\'t look away first.', diff: 2 },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function calcMinDuration(difficulty: number): number {
  if (difficulty <= 1) return 15;
  if (difficulty <= 2) return 30;
  if (difficulty <= 3) return 60;
  if (difficulty <= 4) return 90;
  return 120;
}

function getWeakestStat(stats: Record<string, number>): StatType {
  const entries = Object.entries(stats) as [StatType, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0]?.[0] || 'willpower';
}

export function generateDailyQuestSet(ctx: GenerationContext): Quest[] {
  const nowISO = new Date().toISOString();
  const quests: Quest[] = [];
  const usedTitles = new Set(ctx.existingQuests.filter(q => !q.completed && !q.failed).map(q => q.title));

  const activeProtocols = ctx.protocols.filter(p => !usedTitles.has(p.title));
  for (const proto of shuffle(activeProtocols).slice(0, 3)) {
    if (quests.length >= 8) break;
    const diff = Math.max(1, Math.min(5, Math.ceil((proto.difficulty || 2) / 2)));
    const minDur = calcMinDuration(diff);
    const isBook = proto.type === 'reading';
    quests.push({
      id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_proto`,
      title: isBook ? `Read: ${proto.title}` : `Sync: ${proto.title}`,
      description: isBook
        ? `Read 15+ pages of ${proto.title}. Take 3 key notes. Apply one concept today.`
        : `Execute ${proto.title}. ${proto.criteria || 'Complete the full protocol session.'}`,
      type: 'daily' as any,
      category: isBook ? 'mental' as QuestCategory : 'fitness' as QuestCategory,
      difficulty: diff * 20,
      rewardExp: 30 + diff * 15,
      rewardCredits: 5 + diff * 2,
      rewardStatPoints: 1,
      statAffected: (proto.stat as StatType) || 'strength',
      completed: false,
      failed: false,
      createdAt: nowISO,
      minDurationMinutes: minDur,
      sourceType: isBook ? 'book' : 'protocol',
      sourceId: proto.id,
      sourceTitle: proto.title,
      lineageLabel: isBook ? `Book: ${proto.title}` : `Protocol: ${proto.title}`,
    });
    usedTitles.add(proto.title);
  }

  const activeHabits = ctx.habits.filter(h => !usedTitles.has(h.title));
  for (const habit of shuffle(activeHabits).slice(0, 2)) {
    if (quests.length >= 8) break;
    quests.push({
      id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_habit`,
      title: `Habit: ${habit.title}`,
      description: `${habit.description || 'Complete this habit today.'} ${habit.isAddiction ? 'Avoid the trigger. Use your replacement routine.' : 'Execute the cue-routine-reward loop.'}`,
      type: 'daily' as any,
      category: 'habit' as QuestCategory,
      difficulty: 20,
      rewardExp: 25,
      rewardCredits: 4,
      rewardStatPoints: 1,
      statAffected: 'willpower',
      completed: false,
      failed: false,
      createdAt: nowISO,
      minDurationMinutes: 15,
      sourceType: 'habit',
      sourceId: habit.id,
      sourceTitle: habit.title,
      lineageLabel: `Habit: ${habit.title}`,
    });
    usedTitles.add(habit.title);
  }

  if (quests.length < 5) {
    const weakest = getWeakestStat(ctx.stats);
    const pool = WEAK_POINT_QUESTS[weakest] || WEAK_POINT_QUESTS.willpower;
    for (const q of shuffle(pool)) {
      if (quests.length >= 5) break;
      if (usedTitles.has(q.title)) continue;
      const minDur = calcMinDuration(q.diff);
      quests.push({
        id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_weak`,
        title: q.title,
        description: q.description,
        type: 'daily' as any,
        category: weakest === 'strength' || weakest === 'vitality' ? 'fitness' as QuestCategory
          : weakest === 'intelligence' ? 'mental' as QuestCategory
          : weakest === 'social' ? 'social' as QuestCategory
          : 'habit' as QuestCategory,
        difficulty: q.diff * 20,
        rewardExp: 20 + q.diff * 15,
        rewardCredits: 3 + q.diff * 2,
        rewardStatPoints: 1,
        statAffected: weakest,
        completed: false,
        failed: false,
        createdAt: nowISO,
        minDurationMinutes: minDur,
      });
      usedTitles.add(q.title);
    }
  }

  return quests.slice(0, 10);
}

export function canCompleteQuest(quest: Quest): { allowed: boolean; reason?: string; remainingMinutes?: number } {
  if (!quest.createdAt || !quest.minDurationMinutes) return { allowed: true };
  const created = new Date(quest.createdAt).getTime();
  const elapsed = (Date.now() - created) / (1000 * 60);
  const remaining = quest.minDurationMinutes - elapsed;
  if (remaining > 0) {
    return { allowed: false, reason: 'Time lock active', remainingMinutes: Math.ceil(remaining) };
  }
  return { allowed: true };
}

export function needsProof(quest: Quest): boolean {
  return quest.difficulty >= 60;
}
