import { Quest, Protocol, Habit, QuestCategory, StatType } from '../types';

interface GenerationContext {
  protocols: Protocol[];
  habits: Habit[];
  stats: Record<string, number>;
  profile?: { name?: string; primaryGoal?: string; secondaryGoals?: string[]; barriers?: string[] };
  existingQuests: Quest[];
}

const FITNESS_QUEST_POOL = [
  { title: 'Iron Protocol', description: 'Complete 3 sets of your main lift at RPE 8. Record the weight.', stat: 'strength' as StatType, diff: 3 },
  { title: 'Conditioning Sprint', description: '5 rounds of 400m sprint with 2 min rest. Track total time.', stat: 'vitality' as StatType, diff: 4 },
  { title: 'Mobility Flush', description: '15 minute full-body mobility flow. Hold each stretch 30 seconds.', stat: 'agility' as StatType, diff: 1 },
  { title: 'Push-up Pyramid', description: '1-2-3-4-5-6-7-6-5-4-3-2-1 push-ups. No rest between sets.', stat: 'strength' as StatType, diff: 2 },
  { title: 'Cold Shower Protocol', description: 'End your shower with 90 seconds of cold water. No exceptions.', stat: 'willpower' as StatType, diff: 2 },
  { title: 'Posture Check', description: 'Every hour, check your posture and correct it. Set 4 reminders.', stat: 'agility' as StatType, diff: 1 },
  { title: 'Stair Climber', description: 'Take stairs instead of elevator for the entire day. Track flights climbed.', stat: 'vitality' as StatType, diff: 1 },
];

const MENTAL_QUEST_POOL = [
  { title: 'Deep Work Block', description: '90 minutes of uninterrupted, phone-off deep work. Track what you completed.', stat: 'intelligence' as StatType, diff: 4 },
  { title: 'Memory Palace Drill', description: 'Memorize 10 new items using the memory palace technique. Recall them tonight.', stat: 'intelligence' as StatType, diff: 3 },
  { title: 'Mental Math Set', description: 'Solve 20 mental math problems without a calculator. Track time.', stat: 'intelligence' as StatType, diff: 2 },
  { title: 'Reading Sprint', description: 'Read 20 pages of a non-fiction book. Take 3 key notes.', stat: 'intelligence' as StatType, diff: 2 },
  { title: 'Journal Reflection', description: 'Write 200 words on what you learned today and what to improve tomorrow.', stat: 'willpower' as StatType, diff: 1 },
  { title: 'Speed Reading Drill', description: 'Practice speed reading for 15 minutes. Track words per minute.', stat: 'intelligence' as StatType, diff: 2 },
  { title: 'Concept Teaching', description: 'Explain a complex concept you learned recently as if teaching a 12-year-old.', stat: 'intelligence' as StatType, diff: 3 },
];

const WILLPOWER_QUEST_POOL = [
  { title: 'Dopamine Fast', description: 'No social media, no entertainment, no junk food for 4 hours. Track urges.', stat: 'willpower' as StatType, diff: 4 },
  { title: 'Early Rising', description: 'Wake up at your target time. No snooze. First action: drink water + sunlight.', stat: 'willpower' as StatType, diff: 3 },
  { title: 'Meditation Session', description: '15 minutes of focused meditation. Count breaths. Note mind-wanders.', stat: 'willpower' as StatType, diff: 2 },
  { title: 'Sugar Blockade', description: 'No sugar or processed food today. Whole foods only.', stat: 'willpower' as StatType, diff: 3 },
  { title: 'Phone Curfew', description: 'No phone usage after 9 PM. Read or stretch instead.', stat: 'willpower' as StatType, diff: 2 },
  { title: 'Discomfort Training', description: 'Do one thing you\'ve been avoiding for 10 minutes. Start now.', stat: 'willpower' as StatType, diff: 2 },
];

const SOCIAL_QUEST_POOL = [
  { title: 'Active Listening Drill', description: 'In your next conversation, listen 80% and speak 20%. Note observations.', stat: 'social' as StatType, diff: 3 },
  { title: 'Compliment Protocol', description: 'Give 3 genuine, specific compliments today. Track reactions.', stat: 'social' as StatType, diff: 1 },
  { title: 'Social Approach', description: 'Start a conversation with someone you wouldn\'t normally talk to.', stat: 'social' as StatType, diff: 3 },
  { title: 'Eye Contact Training', description: 'Maintain eye contact in all conversations today. Don\'t look away first.', stat: 'social' as StatType, diff: 2 },
];

const POOL_MAP: Record<string, typeof FITNESS_QUEST_POOL> = {
  fitness: FITNESS_QUEST_POOL,
  mental: MENTAL_QUEST_POOL,
  willpower: WILLPOWER_QUEST_POOL,
  social: SOCIAL_QUEST_POOL,
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

export function generateDailyQuestSet(ctx: GenerationContext): Quest[] {
  const nowISO = new Date().toISOString();
  const quests: Quest[] = [];
  const usedTitles = new Set(ctx.existingQuests.map(q => q.title));

  const targetCount = 5 + Math.floor(Math.random() * 3);

  const categories = ['fitness', 'mental', 'willpower', 'social'];
  const shuffledCats = shuffle(categories);

  for (const cat of shuffledCats) {
    if (quests.length >= targetCount) break;
    const pool = POOL_MAP[cat];
    if (!pool) continue;

    const candidates = shuffle(pool).filter(q => !usedTitles.has(q.title));
    if (candidates.length === 0) continue;

    const pick = candidates[0];
    const minDur = calcMinDuration(pick.diff);
    quests.push({
      id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_${cat}`,
      title: pick.title,
      description: pick.description,
      type: 'daily' as any,
      category: cat as QuestCategory,
      difficulty: pick.diff * 20,
      rewardExp: 20 + pick.diff * 15,
      rewardCredits: 3 + pick.diff * 2,
      rewardStatPoints: 1,
      statAffected: pick.stat,
      completed: false,
      failed: false,
      createdAt: nowISO,
      minDurationMinutes: minDur,
    });
    usedTitles.add(pick.title);
  }

  if (ctx.protocols.length > 0 && quests.length < targetCount) {
    const activeProtocols = ctx.protocols.filter(p => !usedTitles.has(p.title));
    const shuffledProtos = shuffle(activeProtocols).slice(0, 2);
    for (const proto of shuffledProtos) {
      if (quests.length >= targetCount) break;
      const diff = Math.max(1, Math.min(5, Math.ceil((proto.difficulty || 2) / 2)));
      const minDur = calcMinDuration(diff);
      quests.push({
        id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_proto`,
        title: `Sync: ${proto.title}`,
        description: `Execute ${proto.title}. ${proto.criteria || 'Complete the full protocol session.'}`,
        type: 'daily' as any,
        category: (proto.type === 'mental' || proto.type === 'reading') ? 'mental' : 'fitness',
        difficulty: diff * 20,
        rewardExp: 30 + diff * 15,
        rewardCredits: 5 + diff * 2,
        rewardStatPoints: 1,
        statAffected: (proto.stat as StatType) || 'strength',
        completed: false,
        failed: false,
        createdAt: nowISO,
        minDurationMinutes: minDur,
        sourceType: 'protocol',
        sourceId: proto.id,
        sourceTitle: proto.title,
        lineageLabel: `Protocol: ${proto.title}`,
      });
      usedTitles.add(proto.title);
    }
  }

  if (ctx.habits.length > 0 && quests.length < targetCount) {
    const activeHabits = ctx.habits.filter(h => !h.isAddiction && !usedTitles.has(h.title));
    const shuffledHabits = shuffle(activeHabits).slice(0, 2);
    for (const habit of shuffledHabits) {
      if (quests.length >= targetCount) break;
      quests.push({
        id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_habit`,
        title: `Habit: ${habit.title}`,
        description: `${habit.description || 'Complete this habit today.'} ${habit.isAddiction ? 'Avoid the trigger and use your replacement routine.' : 'Execute the cue-routine-reward loop.'}`,
        type: 'daily' as any,
        category: 'habit',
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
  }

  const readingProtocols = ctx.protocols.filter(p => p.type === 'reading');
  if (readingProtocols.length > 0 && quests.length < targetCount) {
    const shuffledBooks = shuffle(readingProtocols).slice(0, 2);
    for (const book of shuffledBooks) {
      if (quests.length >= targetCount) break;
      quests.push({
        id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_book`,
        title: `Read: ${book.title}`,
        description: `Read 15+ pages of ${book.title}. Take 3 key notes. Apply one concept today.`,
        type: 'daily' as any,
        category: 'mental',
        difficulty: 25,
        rewardExp: 30,
        rewardCredits: 5,
        rewardStatPoints: 1,
        statAffected: 'intelligence',
        completed: false,
        failed: false,
        createdAt: nowISO,
        minDurationMinutes: 30,
        sourceType: 'book',
        sourceId: book.id,
        sourceTitle: book.title,
        lineageLabel: `Book: ${book.title}`,
      });
      usedTitles.add(book.title);
    }
  }

  while (quests.length < 5) {
    const fallbackPool = shuffle([...WILLPOWER_QUEST_POOL, ...MENTAL_QUEST_POOL]);
    for (const q of fallbackPool) {
      if (quests.length >= 5) break;
      if (usedTitles.has(q.title)) continue;
      const minDur = calcMinDuration(q.diff);
      quests.push({
        id: `q_${Date.now()}_${Math.floor(Math.random() * 10000)}_extra`,
        title: q.title,
        description: q.description,
        type: 'daily' as any,
        category: q.stat === 'social' ? 'social' : q.stat === 'willpower' ? 'habit' : 'mental',
        difficulty: q.diff * 20,
        rewardExp: 20 + q.diff * 15,
        rewardCredits: 3 + q.diff * 2,
        rewardStatPoints: 1,
        statAffected: q.stat,
        completed: false,
        failed: false,
        createdAt: nowISO,
        minDurationMinutes: minDur,
      });
      usedTitles.add(q.title);
    }
    break;
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
