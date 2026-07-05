/**
 * Shadow Interrogation Questions.
 *
 * The Shadow needs real data to be useful — it cannot hand-wave intelligence
 * or motivation. It has to have *actual things* the user said so it can quote
 * them back at the right moment. This file defines the seed questions that
 * fire on first Shadow-tab visit.
 *
 * Design principles:
 *   - One question on screen at a time. Never show a list of 12 at once.
 *   - Mix of multiple choice + free text. Free text gets used in deep
 *     taunts and Penalty Zone; MC gives Shadow concrete buckets.
 *   - Questions are interrogative, not assessment-form. The bot's voice
 *     carries them, not a clinical survey frame.
 *   - User can skip. Skipping degrades personalization, doesn't block.
 */

export type QuestionKind = 'single' | 'multi' | 'text';

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ShadowQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  framing?: string;
  follow?: string;
  options?: QuestionOption[];
  minChars?: number;
  placeholder?: string;
  tag: ShadowTag;
}

export type ShadowTag =
  | 'schedule'
  | 'weak_spot'
  | 'identity_aspiration'
  | 'broken_commitment'
  | 'analysis_paralysis'
  | 'kestone_loss'
  | 'comparison_trap'
  | 'reward_grammar'
  | 'hard_limit'
  | 'deep_memory'
  | 'self_bet'
  | 'callsign';

export const SHADOW_QUESTIONS: ShadowQuestion[] = [
  {
    id: 'q1_day_window',
    kind: 'single',
    tag: 'schedule',
    framing: 'We start with the obvious. Skip if you want — chronos gets harder to calibrate without this.',
    prompt: 'When does your day actually start? When does it actually end?',
    options: [
      { value: 'early_bird',   label: 'Early bird',   hint: 'Awake by 6 AM, lights out by 11 PM' },
      { value: 'standard',     label: 'Standard',     hint: 'Up 7-9 AM, sleep 11 PM-1 AM' },
      { value: 'night_owl',    label: 'Night owl',    hint: 'Effective after 8 PM, sleep 1-3 AM' },
      { value: 'chaotic',      label: 'Chaotic',      hint: 'No predictable schedule' },
      { value: 'shift_worker', label: 'Shift worker', hint: 'Rotating hours' },
    ],
  },
  {
    id: 'q2_weak_spot',
    kind: 'single',
    tag: 'weak_spot',
    framing: 'I am not asking what you wish was your weakness. I am asking what actually breaks you.',
    prompt: 'What reliably breaks your discipline?',
    options: [
      { value: 'phone',          label: 'Phone / social media', hint: 'Instagram, TikTok, X, Reddit, Reels' },
      { value: 'fatigue',        label: 'Fatigue / low energy', hint: 'After 9 PM, after school' },
      { value: 'food',           label: 'Food / blood sugar',   hint: 'Emotional eating, missed meals' },
      { value: 'people',         label: 'Other people',          hint: 'Friends, peer pressure, family noise' },
      { value: 'inner',          label: 'Inner voice',           hint: 'Overthinking, second-guessing, doubt' },
      { value: 'entertainment',  label: 'Binge escape',          hint: 'Streaming, gaming, scrolling' },
    ],
  },
  {
    id: 'q3_identity_aspiration',
    kind: 'text',
    tag: 'identity_aspiration',
    framing: 'Atomic Habits lesson 1: change comes from identity, not outcomes.',
    prompt: 'If a friend had to describe you in a year, what is one trait you would want them to mention — without hesitation?',
    placeholder: 'I want them to say: "they actually finish what they start."',
    minChars: 12,
    follow: 'This becomes the title the System uses for you. You can change it later, but rarely do.',
  },
  {
    id: 'q4_broken_commitment',
    kind: 'text',
    tag: 'broken_commitment',
    framing: 'I do not want aspirational answers. I want the real one.',
    prompt: 'Name something you said you would start — and did not.',
    placeholder: 'A morning routine. Going to the gym. Reading every day. Whatever actually happened.',
    minChars: 8,
    follow: 'I will hold this. When you do the equivalent in NEXUS, you will hear from me.',
  },
  {
    id: 'q5_analysis_paralysis',
    kind: 'single',
    tag: 'analysis_paralysis',
    framing: 'A specific kind of failure mode — and very common.',
    prompt: 'Have you been "preparing" for something for more than two weeks without actually starting?',
    options: [
      { value: 'yes_course',   label: 'Yes — course / skill',  hint: 'Bought the course, never opened it' },
      { value: 'yes_project',  label: 'Yes — project / plan',   hint: 'Designed the plan, never executed' },
      { value: 'yes_app',      label: 'Yes — app / stack',      hint: 'Configured the system, never used it' },
      { value: 'yes_body',     label: 'Yes — body / diet',      hint: 'Researched the diet, never started' },
      { value: 'no',           label: 'No',                     hint: 'Clean record' },
    ],
  },
  {
    id: 'q6_keystone_loss',
    kind: 'text',
    tag: 'kestone_loss',
    framing: 'Lie to me and I will find out later. Tell me the real thing now.',
    prompt: 'If the Shadow wins in 30 days — you give up — what would you have lost? One sentence. No hedging.',
    placeholder: 'The feeling that I could still become more than I currently am.',
    minChars: 12,
    follow: 'This gets quoted back to you. Not today. Next time you are in Penalty Zone.',
  },
  {
    id: 'q7_comparison_trap',
    kind: 'text',
    tag: 'comparison_trap',
    framing: 'I will not mock you for the answer. Everyone has one.',
    prompt: 'Who is one person you compare yourself to, even though you know you should not?',
    placeholder: 'A friend who seems to be nailing it. A classmate who got the internship. A sibling.',
    minChars: 6,
  },
  {
    id: 'q8_reward_grammar',
    kind: 'single',
    tag: 'reward_grammar',
    prompt: 'What is a small win that would make today feel undeniably worth it?',
    options: [
      { value: 'streak_progress', label: 'Streak / progress',  hint: 'Watching a number go up' },
      { value: 'task_close',      label: 'Crossing off tasks', hint: 'The visual checkmark' },
      { value: 'anticipation',    label: 'Planning tomorrow',  hint: '"Tomorrow I will..." feels like momentum' },
      { value: 'message',         label: 'Mentor / AI insight',hint: 'A line from SAGE that hits' },
      { value: 'shadow_taunt',    label: 'A good Shadow line', hint: 'Being roasted correctly' },
      { value: 'silent',          label: 'Quiet confidence',   hint: 'Knowing it is in the system, no fanfare' },
    ],
  },
  {
    id: 'q9_hard_limit',
    kind: 'text',
    tag: 'hard_limit',
    framing: 'I will respect this. The Shadow will never push you past it.',
    prompt: 'What is one thing you refuse to do — no matter how much the System pressures you?',
    placeholder: 'Cold showers before 6 AM. Public failure-logging. Calorie counting. Anything.',
    minChars: 6,
  },
  {
    id: 'q10_deep_memory',
    kind: 'text',
    tag: 'deep_memory',
    framing: 'This is the slot the Shadow uses when everything else fails. Be honest. Be unfiltered.',
    prompt: 'What is something you have never told anyone here that is affecting your discipline right now?',
    placeholder: 'A fight with a parent. A deadline you missed. A secret hobby you feel ashamed of. Anything true.',
    minChars: 10,
    follow: 'Stored encrypted on this device. Never sent anywhere. The Shadow can quote it back when needed.',
  },
  {
    id: 'q11_self_bet',
    kind: 'text',
    tag: 'self_bet',
    prompt: 'If the Shadow could force you to do one thing tomorrow, what would it be?',
    placeholder: 'A 10-minute walk before class. Reading 5 pages of a book. Sending an email I have been avoiding.',
    minChars: 8,
    follow: 'This becomes a non-negotiable quest. You will not be able to skip it without a real Penalty Zone.',
  },
  {
    id: 'q12_callsign',
    kind: 'text',
    tag: 'callsign',
    framing: 'Last question. This one matters most.',
    prompt: 'What should I call you?',
    placeholder: 'Your first name works. So does the name you are trying to grow into.',
    minChars: 2,
    follow: 'Done. Welcome to the System.',
  },
];

export type ShadowAnswers = Partial<Record<ShadowTag, string | string[]>>;

export const questionAt = (i: number): ShadowQuestion | null =>
  SHADOW_QUESTIONS[i] ?? null;

export const TOTAL_QUESTIONS = SHADOW_QUESTIONS.length;
