/**
 * storeContent.ts — Rich content for NexusStore protocols and books.
 *
 * Each entry provides:
 *   - overview: What this program is and why it works
 *   - whoIsThisFor: Target audience / prerequisites
 *   - trainingPlan: Week-by-week breakdown of what you'll do
 *   - whatYouGet: Concrete deliverables included
 *   - questsAssigned: The daily quest that gets added to your QuestBoard
 *   - pdfGuide: Full multi-section text content for the downloadable PDF
 */

export interface StoreContent {
  overview: string;
  whoIsThisFor: string;
  trainingPlan: string[];
  whatYouGet: string[];
  questsAssigned: { title: string; description: string; reward: string }[];
  pdfGuide: {
    intro: string;
    sections: { heading: string; body: string }[];
    closing: string;
  };
}

export const STORE_CONTENT: Record<string, StoreContent> = {
  // ═══════════════════════════════════════════════════════════════
  // BODY PROTOCOLS
  // ═══════════════════════════════════════════════════════════════

  pure_strength: {
    overview:
      `Pure Strength Foundation is a barbell-free starter program built on the five fundamental movement patterns: push, pull, squat, hinge, and core. The philosophy is simple — master your bodyweight first, build raw strength through progressive overload, and let everything else follow. No equipment needed beyond a floor and a pull-up bar (or a table for rows). This is the protocol that turns "I can't do a push-up" into "I can do 30."`,
    whoIsThisFor:
      'Beginners who have never trained consistently, or returning athletes who lost their base. No gym membership required. If you can do 0-15 push-ups, this is your starting line.',
    trainingPlan: [
      'Week 1-2: 3×5 push-ups (knee variant OK), 3×5 bodyweight rows, 3×10 squats. Rest 2 min between sets. Train Mon/Wed/Fri.',
      'Week 3-4: Add 1 rep per set. Switch from knee push-ups to full if ready. Squats go to 3×15.',
      'Week 5-6: 3×8 push-ups, 3×8 rows, 3×15 squats + 3×30s plank. Add a 4th day if recovery allows.',
      'Week 7-8: 4×10 push-ups, 4×10 rows, 4×20 squats. Start tracking max reps in a single set.',
      'Ongoing: Add 1 rep per week. Once you hit 4×15, graduate to Muscle Builder Protocol.',
    ],
    whatYouGet: [
      '8-week progressive overload schedule',
      'Video-linked exercise demonstrations (form cues embedded in PDF)',
      'Daily quest auto-assigned to your QuestBoard (3×5 Strength)',
      '+2 STR per completed sync, +5 NC, +6 EXP',
      'Form checklist for each movement',
    ],
    questsAssigned: [
      {
        title: 'Strength: 3×5',
        description: 'Do 3 sets of 5 reps — push-ups or squats, controlled form. Rest 2 min between sets.',
        reward: '+6 EXP · +5 NC · +2 STR',
      },
    ],
    pdfGuide: {
      intro:
        'Welcome to Pure Strength Foundation. This guide is your complete reference for the 8-week program. Print it, save it to your desktop, and refer to it before every session.',
      sections: [
        {
          heading: 'The Five Fundamental Movements',
          body: 'Every human body is built around five movement patterns: PUSH (push-ups), PULL (rows), SQUAT (bodyweight squats), HINGE (glute bridges), and CORE (plank). This program develops all five in every session. You do not need isolation exercises. You do not need a gym. You need 30 minutes and a floor.',
        },
        {
          heading: 'Progressive Overload — The Only Rule',
          body: 'Strength is built by doing slightly more over time. Each week, add ONE rep to each set. If you cannot complete the rep count with clean form, stay at the previous week\'s numbers. Form > reps. Always. A clean 5 beats a sloppy 10.',
        },
        {
          heading: 'Session Structure (30 min)',
          body: 'Warm-up (3 min): Arm circles, leg swings, hip rotations.\nMain Work (20 min):\n  1. Push-ups: 3×5 → 3×8 → 3×10 (progress by week)\n  2. Bodyweight rows: 3×5 → 3×8 → 3×10\n  3. Squats: 3×10 → 3×15 → 3×20\n  4. Plank: 3×30s → 3×45s → 3×60s\nCooldown (2 min): Deep breathing, stretch.',
        },
        {
          heading: 'Form Cues',
          body: 'PUSH-UP: Body straight like a plank. Hands under shoulders. Lower until chest touches floor. Push up explosively. Do not let hips sag.\nROW: Find a sturdy table or low bar. Body straight. Pull chest to the bar. Squeeze shoulder blades together at the top.\nSQUAT: Feet shoulder-width. Lower until thighs are parallel to floor. Keep weight on heels. Drive up through heels.\nPLANK: Forearms down. Body straight. Tighten abs and glutes. Do not let hips drop or rise.',
        },
        {
          heading: 'Weekly Schedule',
          body: 'Monday: Session A (Push, Squat, Plank)\nWednesday: Session B (Pull, Hinge, Plank)\nFriday: Session A (same as Monday)\n\nRest days are when your muscles rebuild. Do not skip them. Sleep 7+ hours.',
        },
        {
          heading: 'When to Graduate',
          body: 'Once you can do 4 sets of 15 clean push-ups, 4 sets of 12 rows, and 4 sets of 20 squats in a single session — you are ready for Muscle Builder Protocol. Until then, stay here and build the base.',
        },
      ],
      closing:
        'Strength is not built in a day. It is built in the 30 minutes you show up when you don\'t feel like it. The NEXUS system tracks every sync. Every rep counts. Every set writes to your stat sheet. Now go train.',
    },
  },

  muscle_builder: {
    overview:
      'Muscle Builder Protocol shifts the focus from raw strength to hypertrophy — muscle growth. Higher rep ranges (8-12), slower negatives (3-second lowering), and more volume (4 days instead of 3). The magic is in the time under tension: by lowering slowly, you create more muscle damage (the good kind) which triggers growth during recovery. This is how you go from "strong but skinny" to "strong and built."',
    whoIsThisFor:
      'Operators who completed Pure Strength Foundation (can do 4×15 push-ups) or intermediate athletes who want visible muscle growth. Requires 40 min/session, 4 days/week.',
    trainingPlan: [
      'Week 1-2: 4×10 push-ups (3s down), 4×10 rows (3s down), 4×15 squats. Rest 90s. Train Mon/Tue/Thu/Fri.',
      'Week 3-4: Add 1 rep per set. Introduce diamond push-ups for triceps. Add 4×10 lunges.',
      'Week 5-6: 4×12 all movements. Add 4×10 Pike push-ups for shoulders. Reduce rest to 75s.',
      'Week 7-8: 5×12 all movements. Introduce super-sets (push-ups immediately followed by rows).',
      'Ongoing: Progress to Fighter Conditioning or add weight (backpack with books) for continued growth.',
    ],
    whatYouGet: [
      '8-week hypertrophy training schedule',
      'Time-under-tension technique guide (3-second negatives explained)',
      'Super-set protocols for weeks 7-8',
      'Nutrition basics for muscle growth (caloric surplus guide)',
      'Daily quest auto-assigned: Muscle Builder 4×10',
      '+3 STR per sync, +6 NC, +9 EXP',
    ],
    questsAssigned: [
      {
        title: 'Muscle Builder: 4×10',
        description: 'Do 4 sets of 10 reps with slow lowering (3 count). Squeeze at the top.',
        reward: '+9 EXP · +6 NC · +3 STR',
      },
    ],
    pdfGuide: {
      intro:
        'Muscle Builder Protocol is designed for hypertrophy — the scientific term for muscle growth. This guide covers the technique, schedule, and nutrition fundamentals you need to see visible results in 8 weeks.',
      sections: [
        {
          heading: 'Why Hypertrophy Works',
          body: 'Muscle grows when you subject it to mechanical tension beyond what it is used to. The key variables are: VOLUME (total reps per week), INTENSITY (how close to failure you go), and TIME UNDER TENSION (how long each rep takes). This program optimizes all three. The 3-second negative is the secret weapon — it doubles the time your muscle spends under load per rep, creating more growth stimulus.',
        },
        {
          heading: 'The 3-Second Negative',
          body: 'Every rep has two phases: the concentric (pushing/pulling) and the eccentric (lowering). Most people rush the lowering phase. You will not. Lower every rep over a 3-count: "one-one-thousand, two-one-thousand, three-one-thousand." Then explode up. This simple change will make 10 reps feel like 20. That is the point.',
        },
        {
          heading: 'Session Structure (40 min)',
          body: 'Warm-up (4 min): Dynamic stretches + 10 easy push-ups.\nMain Work (32 min):\n  1. Push-ups: 4×10 (3s down, explosive up) — rest 90s\n  2. Bodyweight rows: 4×10 (3s down) — rest 90s\n  3. Squats: 4×15 (3s down) — rest 90s\n  4. Plank: 4×45s — rest 60s\nCooldown (4 min): Static stretches for chest, back, legs.',
        },
        {
          heading: '4-Day Split',
          body: 'Monday: Push focus (push-ups, pike push-ups, dips)\nTuesday: Pull focus (rows, pull-up negatives, reverse flys)\nThursday: Legs focus (squats, lunges, glute bridges)\nFriday: Full body (all movements, 4×12)\n\nWed/Weekend: REST. Muscle grows during recovery, not during training.',
        },
        {
          heading: 'Nutrition for Muscle Growth',
          body: 'To build muscle, you need a caloric surplus (eating more than you burn). Aim for 300-500 calories above maintenance. Protein target: 1g per pound of bodyweight (or 2.2g per kg). Example: if you weigh 150lb, eat 150g protein/day. Good sources: eggs, chicken, lentils, Greek yogurt, tuna. Eat every 3-4 hours. Carbs fuel your training — do not fear them.',
        },
        {
          heading: 'Tracking Progress',
          body: 'Take a progress photo every Sunday (same lighting, same pose). Measure chest, waist, arms, thighs with a tape measure. The scale may not move much — muscle is denser than fat. Photos and measurements tell the truth the scale cannot.',
        },
      ],
      closing:
        'Hypertrophy is patience plus protein plus progressive overload. Show up 4 days a week. Lower slowly. Eat enough. Sleep enough. In 8 weeks, you will see the difference in the mirror. The NEXUS system tracks every session. Do not skip sync days.',
    },
  },

  fighter_conditioning: {
    overview:
      'Fighter Conditioning is a combat-sport-inspired high-intensity interval training (HIIT) protocol. It uses 40-second work intervals with 20-second rest, repeated in 3-round circuits. This mimics the energy demands of a real fight round and develops explosive power, cardiovascular endurance, and mental toughness simultaneously. No equipment needed — just your bodyweight and maximum effort.',
    whoIsThisFor:
      'Intermediate to advanced operators who want combat-level conditioning. Can do 15+ push-ups and 20+ squats in a single set. Not for beginners — the intensity is intentionally brutal.',
    trainingPlan: [
      'Week 1-2: 3 rounds of 40s work / 20s rest. Exercises: burpees, mountain climbers, push-ups, squats, high knees. 2 min rest between rounds.',
      'Week 3-4: Same structure but add 1 exercise per round. Reduce round rest to 90s.',
      'Week 5-6: 4 rounds. Add shadow boxing intervals (1-2 combos). Reduce rest to 60s.',
      'Week 7-8: 5 rounds. All-out effort. This is fight-pace conditioning.',
      'Ongoing: Use as a standalone conditioning session 3x/week, or stack after strength training.',
    ],
    whatYouGet: [
      '8-week combat conditioning progression',
      'HIIT timer structure (40/20 protocol)',
      'Exercise library with 12 combat-specific movements',
      'Round-by-round intensity targets',
      'Daily quest auto-assigned: Fighter Circuit 40/20×3',
      '+3 AGI per sync, +8 NC, +10 EXP',
    ],
    questsAssigned: [
      {
        title: 'Fighter Circuit: 40/20×3',
        description: '40s work / 20s rest. 3 rounds. Push yourself each interval.',
        reward: '+10 EXP · +8 NC · +3 AGI',
      },
    ],
    pdfGuide: {
      intro:
        'Fighter Conditioning is not a workout — it is a test. Every session asks: can you keep going when your body says stop? This guide gives you the structure, the exercises, and the progression. The effort is on you.',
      sections: [
        {
          heading: 'The 40/20 Protocol',
          body: '40 seconds of maximum-effort work. 20 seconds of rest. Repeat for all exercises in a round. Rest 2 minutes between rounds. This interval structure mirrors a boxing round (3 min work, 1 min rest) compressed into bodyweight training. Your heart rate will hit 85-95% of max. That is the zone where conditioning happens.',
        },
        {
          heading: 'The Exercise Circuit',
          body: 'Round 1: Burpees (40s) → Mountain Climbers (40s) → Push-ups (40s) → Squats (40s) → High Knees (40s)\nRound 2: Same exercises, reversed order.\nRound 3: Same exercises, original order.\n\nEach exercise: 40s all-out, 20s transition. Do not pace yourself. If you finish 40s and can keep going, you were not going hard enough.',
        },
        {
          heading: 'Form Under Fatigue',
          body: 'When you are tired, form breaks down. This is where injuries happen. Rules: 1) Never sacrifice form for speed. A slow clean rep beats a fast sloppy one. 2) If you cannot maintain form, drop to an easier variant (push-ups → knee push-ups). 3) Breathe. Inhale on the easy part, exhale on the hard part.',
        },
        {
          heading: 'Progression Rules',
          body: 'Week 1-2: 3 rounds, 2 min rest between. Focus on surviving.\nWeek 3-4: 3 rounds, 90s rest. Try to match or beat rep counts from week 1.\nWeek 5-6: 4 rounds, 60s rest. Add shadow boxing between exercises.\nWeek 7-8: 5 rounds, 60s rest. This is fight conditioning.\n\nTrack your total reps per session. The number should go up over weeks even as rounds increase.',
        },
        {
          heading: 'Recovery Protocol',
          body: 'Fighter conditioning is CNS-intensive. You need: 8+ hours sleep, 1 day complete rest between sessions, protein within 30 min post-workout, and hydration (3L+ water/day). If you feel chronically sore or weak, take 2 days off. Overtraining is real.',
        },
      ],
      closing:
        'A fighter does not stop when they are tired. They stop when the round is over. 40 seconds. All out. 20 seconds. Breathe. Repeat. The NEXUS system counts every sync. Every round writes to your stat sheet. Show up. Go hard. Survive.',
    },
  },

  calisthenics_foundation: {
    overview:
      'Calisthenics Foundation teaches you the four pillars of bodyweight mastery: push, pull, squat, and core hold. The program is built as a circuit — you move from one exercise to the next with minimal rest, hitting every major muscle group in 25 minutes. By the end, you will have the strength and control to progress to advanced calisthenics skills (muscle-ups, handstands, front levers).',
    whoIsThisFor:
      'Beginners who want a structured bodyweight routine without equipment. Perfect for home training, travel, or anyone who does not want a gym membership.',
    trainingPlan: [
      'Week 1-2: Circuit: push-ups (max) → rows (5+) → squats (15) → plank (30s). Rest 2 min, repeat 2 more rounds.',
      'Week 3-4: Increase push-up target by 3. Add 5 squats. Plank goes to 45s.',
      'Week 5-6: 4 rounds. Add pike push-ups for shoulder development.',
      'Week 7-8: 4 rounds. Add diamond push-ups for triceps. Target: 20 push-ups in a single set.',
      'Ongoing: Once you hit 25 push-ups and 10 pull-ups, graduate to Muscle Builder.',
    ],
    whatYouGet: [
      '4-pillar calisthenics circuit guide',
      'Exercise progression charts (beginner → advanced)',
      'No-equipment workout (floor + table only)',
      'Core stability progressions',
      'Daily quest auto-assigned: Bodyweight Circuit',
      '+2 STR per sync, +5 NC, +6 EXP',
    ],
    questsAssigned: [
      {
        title: 'Bodyweight Circuit',
        description: 'Push-ups → Rows → Squats → Plank. 3 rounds. Track your max per round.',
        reward: '+6 EXP · +5 NC · +2 STR',
      },
    ],
    pdfGuide: {
      intro:
        'Calisthenics Foundation is your entry point into bodyweight training mastery. This guide covers the four pillars, the circuit structure, and the progressions that will take you from beginner to advanced.',
      sections: [
        {
          heading: 'The Four Pillars',
          body: 'PUSH: Push-ups (chest, triceps, shoulders)\nPULL: Bodyweight rows using a table or low bar (back, biceps)\nSQUAT: Bodyweight squats (quads, glutes)\nCORE: Plank hold (abs, lower back, stability)\n\nEvery session hits all four. No imbalances. No skipped muscle groups.',
        },
        {
          heading: 'The Circuit (25 min)',
          body: 'Round structure: Push-ups (max reps) → 15s transition → Rows (5+ reps) → 15s transition → Squats (15 reps) → 15s transition → Plank (30s hold)\n\nRest 2 minutes between rounds. Do 3 rounds total. Track your push-up max and plank time each session.',
        },
        {
          heading: 'Progression Ladder',
          body: 'PUSH-UPS: Knee push-ups → Incline push-ups → Full push-ups → Diamond push-ups → Pike push-ups → Handstand push-ups\nROWS: Table rows → Low bar rows → Pull-up negatives → Full pull-ups\nSQUATS: Assisted squats → Full squats → Jump squats → Pistol squats\nPLANK: 30s → 45s → 60s → 90s → Plank-to-push-up transitions\n\nStay at each level until you can do 3×10 with perfect form before moving up.',
        },
        {
          heading: 'Training Schedule',
          body: 'Monday: Full circuit (3 rounds)\nWednesday: Full circuit (3 rounds)\nFriday: Full circuit (3 rounds)\n\n3 days a week is optimal for calisthenics. Your connective tissue needs 48 hours between sessions. More is not better — it is injury.',
        },
      ],
      closing:
        'Calisthenics is the purest form of strength training. No weights. No machines. Just you and gravity. Master your bodyweight and you can train anywhere, anytime. The NEXUS system tracks every circuit. Every rep writes to your stat sheet.',
    },
  },

  endurance_base: {
    overview:
      'Endurance Base builds your aerobic engine — the foundation of all physical performance. You will do 20 minutes of steady-state cardio at a "conversational pace" (you can talk but not sing). This trains your heart, lungs, and mitochondria to deliver oxygen efficiently. It is not glamorous, but it is the base that every other physical ability sits on top of.',
    whoIsThisFor:
      'All levels. Especially operators who gas out during HIIT, feel winded climbing stairs, or have never done consistent cardio. Running, cycling, rowing, or swimming all work.',
    trainingPlan: [
      'Week 1-2: 20 min steady cardio at conversational pace. 3 sessions/week.',
      'Week 3-4: 25 min. Try to keep the same pace — do not slow down.',
      'Week 5-6: 30 min. Add one interval session: 5×1 min fast / 1 min slow.',
      'Week 7-8: 35 min steady + 1 interval session: 6×2 min fast / 1 min slow.',
      'Ongoing: Build to 45 min steady sessions. Add a long Sunday session (60 min) for max aerobic development.',
    ],
    whatYouGet: [
      '8-week aerobic base building plan',
      'Heart rate zone guide (Zone 2 training explained)',
      'Interval progression for weeks 5-8',
      'Cross-training options (run, bike, row, swim)',
      'Daily quest auto-assigned: Steady Cardio 20 min',
      '+3 VIT per sync, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Steady Cardio: 20 min',
        description: '20 min cardio at conversational pace. No stopping. Feel your endurance grow.',
        reward: '+8 EXP · +6 NC · +3 VIT',
      },
    ],
    pdfGuide: {
      intro:
        'Endurance Base is the unglamorous foundation that makes everything else better. Your HIIT sessions, your strength training, your daily energy — all improve when your aerobic engine is stronger. This guide explains the science and gives you the 8-week plan.',
      sections: [
        {
          heading: 'Zone 2 Training — The Magic Zone',
          body: 'Zone 2 is 60-70% of your max heart rate. At this intensity, you can hold a conversation but not sing a song. This is the sweet spot for aerobic development. In Zone 2, your body builds mitochondria (the energy factories in your cells), increases capillary density (more blood vessels to deliver oxygen), and improves fat oxidation (using fat as fuel). Professional endurance athletes spend 80% of their training in Zone 2. It is not easy training — it is smart training.',
        },
        {
          heading: 'How to Find Zone 2',
          body: 'If you do not have a heart rate monitor, use the talk test:\n- Can sing? → Too easy (Zone 1)\n- Can talk in full sentences? → Perfect (Zone 2)\n- Can only talk in short phrases? → Too hard (Zone 3)\n- Cannot talk at all? → Way too hard (Zone 4-5)\n\nMost people start too fast. Slow down. If you need to walk, walk. The goal is 20 minutes of continuous movement at conversational pace.',
        },
        {
          heading: 'Session Structure (20-35 min)',
          body: 'Warm-up (3 min): Walk briskly, swing arms.\nMain work (20-35 min): Run, bike, row, or swim at Zone 2 pace. If your heart rate spikes, slow down. This is not a race. It is a foundation.\nCooldown (2 min): Walk, deep breathing.\n\nDo not skip the warm-up. Starting cold into cardio is how you get injured.',
        },
        {
          heading: 'Interval Introduction (Week 5+)',
          body: 'Once you have 4 weeks of steady-state base, introduce intervals:\n\nWeek 5: 5×1 min fast (Zone 4) / 1 min slow (Zone 1). Total: 10 min intervals + warm-up/cooldown.\nWeek 6: 6×1 min fast / 1 min slow.\nWeek 7: 5×2 min fast / 1 min slow.\nWeek 8: 6×2 min fast / 1 min slow.\n\nIntervals raise your VO2 max (maximum oxygen uptake). Do intervals once a week, steady-state twice.',
        },
        {
          heading: 'Cross-Training',
          body: 'Running is not the only option. Pick what you enjoy:\n- Running: Highest impact, best for bone density. Start on soft surfaces (grass, track).\n- Cycling: Low impact, great for knees. Use a real bike or stationary.\n- Rowing: Full body, low impact. Best cardio-to-time ratio.\n- Swimming: Zero impact, full body. Best if you have joint issues.\n\nMix and match. The goal is 3 sessions/week, any modality.',
        },
      ],
      closing:
        'Endurance is patience made physical. 20 minutes. Conversational pace. 3 times a week. It is simple. It is not easy. The NEXUS system tracks every session. Every minute writes to your vitality stat. Build the base. Everything else gets easier.',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // MIND PROTOCOLS
  // ═══════════════════════════════════════════════════════════════

  emotional_awareness: {
    overview:
      'Emotional Awareness is the practice of naming your emotions as they happen. Most people operate on emotional autopilot — they feel something, react to it, and never identify what the feeling actually was. This protocol interrupts that loop. Three times a day, you pause, identify the emotion you are feeling, and write down what triggered it. In two weeks, you will start catching emotions before they drive your behavior.',
    whoIsThisFor:
      'Everyone. Especially operators who feel reactive, overwhelmed, or emotionally "flat" (which is often suppressed emotion, not absence of it). No prior meditation or journaling experience needed.',
    trainingPlan: [
      'Week 1: Set 3 daily alarms (morning, afternoon, evening). When each fires: pause, name the emotion, write the trigger. 1 sentence each.',
      'Week 2: Add a 4th check-in (before bed). Notice patterns — do certain times or activities trigger specific emotions?',
      'Week 3: Start predicting. Before entering a known trigger situation, write: "I expect to feel ___." Compare to actual.',
      'Week 4: Add body awareness. Where do you feel each emotion in your body? (Chest tightness = anxiety, jaw clenched = anger, etc.)',
      'Ongoing: The goal is to move from scheduled check-ins to real-time awareness. Eventually you catch emotions as they arise.',
    ],
    whatYouGet: [
      '2-week structured emotional awareness training',
      'Emotion vocabulary wheel (50+ named emotions)',
      'Trigger mapping template',
      'Body-emotion connection chart',
      'Daily quest auto-assigned: Name Your Emotions',
      '+2 WIL per sync, +5 NC, +6 EXP',
    ],
    questsAssigned: [
      {
        title: 'Name Your Emotions',
        description: 'Pause 3 times today. Identify the emotion. Write the trigger.',
        reward: '+6 EXP · +5 NC · +2 WIL',
      },
    ],
    pdfGuide: {
      intro:
        'Emotional Awareness is the first and most important emotional intelligence skill. You cannot manage what you cannot name. This guide gives you the vocabulary, the structure, and the progression to develop real-time emotional awareness.',
      sections: [
        {
          heading: 'The Emotion Vocabulary',
          body: 'Most people use 6 words: happy, sad, angry, scared, tired, fine. This is like describing color with only "red, blue, green." Emotions are nuanced. Expand your vocabulary:\n\nANGER: frustrated, irritated, resentful, disgusted, indignant\nFEAR: anxious, worried, nervous, overwhelmed, panicked\nSADNESS: disappointed, lonely, grief, empty, heartbroken\nJOY: content, excited, grateful, proud, peaceful\nSHAME: embarrassed, guilty, inadequate, humiliated\n\nThe more precisely you name an emotion, the more control you have over it. "I feel bad" is a fog. "I feel resentful because my effort was not acknowledged" is a map.',
        },
        {
          heading: 'The 3-Check Protocol',
          body: 'Set 3 alarms: 10:00 AM, 2:00 PM, 8:00 PM (adjust to your schedule).\n\nWhen an alarm fires:\n1. STOP whatever you are doing\n2. CLOSE your eyes for 5 seconds\n3. ASK: "What am I feeling right now?"\n4. NAME the emotion (use the vocabulary above)\n5. WRITE: "I feel [emotion] because [trigger]"\n\nExample: "I feel anxious because I have a deadline tomorrow and I am not finished."\n\nThat is it. One sentence. Three times a day. The simplicity is the point.',
        },
        {
          heading: 'Trigger Mapping (Week 2+)',
          body: 'After a week of check-ins, you will notice patterns. Common triggers:\n- Social media → comparison → inadequacy\n- Morning → cortisol spike → anxiety\n- After lunch → energy crash → irritability\n- Evening → reflection → loneliness or gratitude\n\nWrite your triggers in a map: SITUATION → THOUGHT → EMOTION. This is the CBT (Cognitive Behavioral Therapy) model. It reveals that emotions do not come from situations — they come from your interpretation of situations.',
        },
        {
          heading: 'The Body-Emotion Connection',
          body: 'Emotions live in the body before they reach the mind. Learn your physical signals:\n\n- Tight chest / shallow breathing → Anxiety\n- Clenched jaw / tense shoulders → Anger\n- Heavy limbs / hollow stomach → Sadness\n- Warmth in chest / relaxed muscles → Joy\n- Pit in stomach / urge to hide → Shame\n\nWhen you feel a physical signal, catch the emotion early. This is the advanced skill — feeling the emotion before it becomes a reaction.',
        },
        {
          heading: 'Progression Path',
          body: 'Week 1-2: Scheduled check-ins (3x/day)\nWeek 3-4: Prediction + body awareness\nWeek 5-6: Real-time catching (notice emotions as they happen)\nWeek 7-8: Choice point (feel emotion → choose response instead of reacting)\n\nThe ultimate goal: when you feel angry, you do not act angry. You feel it, name it, and decide what to do. That is emotional mastery.',
        },
      ],
      closing:
        'Emotions are not weaknesses to be suppressed. They are data to be read. This protocol teaches you to read the data. Three check-ins a day. One sentence each. In 8 weeks, you will see yourself clearly for the first time. The NEXUS system tracks every sync. Every check-in writes to your willpower stat.',
    },
  },

  metacognition_training: {
    overview:
      'Metacognition Training teaches you to think about your thinking. The core practice is prediction vs reality: before any task, you predict how long it will take and how it will go. After the task, you compare. The gap between prediction and reality reveals your cognitive blind spots — the planning fallacy, optimism bias, and self-deception that quietly run your life.',
    whoIsThisFor:
      'Students, professionals, and anyone who chronically underestimates how long things take, overestimates what they can finish in a day, or feels surprised by outcomes they should have predicted.',
    trainingPlan: [
      'Week 1: Pick 1 task daily. Write predicted time before starting. Track actual time. Note the gap.',
      'Week 2: Add predicted difficulty (1-10) vs actual difficulty. Note what made it harder/easier than expected.',
      'Week 3: Predict outcome quality before starting. Compare to actual. Are you overconfident?',
      'Week 4: Pre-mortem: before any task, write "If this fails, it will be because ___." Check after.',
      'Ongoing: The goal is calibrated self-assessment — your predictions should match reality within 10%.',
    ],
    whatYouGet: [
      '4-week metacognition training framework',
      'Prediction vs reality tracking template',
      'Pre-mortem technique guide',
      'Cognitive bias identification chart',
      'Daily quest auto-assigned: Predict vs Reality',
      '+2 INT per sync, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Predict vs Reality',
        description: 'Pick a task. Predict time. Do it. Compare. Adjust your next estimate.',
        reward: '+8 EXP · +6 NC · +2 INT',
      },
    ],
    pdfGuide: {
      intro:
        'Metacognition is thinking about thinking. It is the skill that separates people who learn from experience from people who repeat the same mistakes. This guide gives you the framework to develop it.',
      sections: [
        {
          heading: 'The Planning Fallacy',
          body: 'Humans systematically underestimate how long tasks will take. This is the Planning Fallacy, identified by Daniel Kahneman and Amos Tversky. Studies show people predict 40-60% less time than tasks actually take. You do this. Everyone does. The cure is not "try harder to estimate" — it is tracking your predictions against reality until your brain recalibrates.',
        },
        {
          heading: 'The Prediction Protocol',
          body: 'Before any task, write down:\n1. PREDICTED TIME: "I think this will take ___ minutes"\n2. PREDICTED DIFFICULTY: "On a scale of 1-10, this will be a ___"\n3. PREDICTED OUTCOME: "I expect the result to be ___"\n\nAfter the task, write:\n4. ACTUAL TIME: "It took ___ minutes"\n5. ACTUAL DIFFICULTY: "It was a ___"\n6. WHAT I MISSED: "I didn\'t account for ___"\n\nDo this for one task per day. The gap between prediction and reality is your blind spot. Over weeks, the gap shrinks.',
        },
        {
          heading: 'The Pre-Mortem',
          body: 'Before starting any important task, ask: "If this goes badly, what will be the reason?" Write it down. This is called a pre-mortem (invented by Gary Klein). It forces you to consider failure before it happens, so you can prevent it.\n\nExample: "I need to finish this report by 5pm. If I fail, it will be because I got distracted by emails." → Solution: Close email while working.\n\nAfter the task, check: did the predicted failure happen? Did an unexpected failure happen? This builds prediction accuracy.',
        },
        {
          heading: 'Cognitive Biases to Watch For',
          body: 'PLANNING FALLACY: Underestimating time needed. Fix: Multiply your estimate by 1.5.\nOPTIMISM BIAS: Assuming things will go better than they usually do. Fix: Recall the last 3 times you did something similar.\nANCHORING: Latching onto the first number you hear. Fix: Generate your own estimate before looking at others.\nSURVIVORSHIP BIAS: Learning only from successes. Fix: Study failures — yours and others\'.\nDUNNING-KRUGER: Being most confident when least competent. Fix: If you feel very confident, check if you have enough information.',
        },
        {
          heading: 'The Meta-Journal',
          body: 'Keep a simple log: Date | Task | Predicted | Actual | Gap | Lesson\n\nExample:\nJan 1 | Write essay | 2 hours | 4 hours | 2h over | I forgot research takes longer than writing\nJan 2 | Workout | 45 min | 40 min | 5m under | I know my workouts well now\nJan 3 | Email reply | 10 min | 30 min | 20m over | I thought it was one email, it was a thread\n\nAfter 30 entries, patterns emerge. You will discover: "I always underestimate writing by 2x" or "I always overestimate cardio by 10 min." This self-knowledge is metacognition.',
        },
      ],
      closing:
        'The unexamined life is not worth living. The unexamined task is not worth repeating. Predict. Track. Compare. Adjust. In 4 weeks, your estimates will be sharper, your planning will be realistic, and you will catch your own cognitive blind spots in real time. The NEXUS system tracks every sync. Every prediction writes to your intelligence stat.',
    },
  },

  emotion_regulation: {
    overview:
      'Emotion Regulation teaches the 4-7-8 breathing technique and emotional labeling — two evidence-based methods for downregulating your nervous system in real time. When you feel stress or frustration building, you stop, breathe (4 in, 7 hold, 8 out), name the emotion, and continue. This creates a gap between stimulus and response. In that gap, you choose your action instead of reacting on autopilot.',
    whoIsThisFor:
      'Operators who feel emotionally reactive, get angry easily, experience anxiety spikes, or want more control over their emotional responses in high-pressure situations.',
    trainingPlan: [
      'Week 1: Practice 4-7-8 breathing 3x daily (morning, noon, night) when calm. Build the habit first.',
      'Week 2: Apply 4-7-8 in low-stress situations (waiting in line, before meals). Build the reflex.',
      'Week 3: Apply 4-7-8 when you notice mild stress. Add emotional labeling after the breath.',
      `Week 4: Apply 4-7-8 in moderate stress. Add reframing: "This emotion is telling me ___."`,
      'Ongoing: The goal is to automatically reach for 4-7-8 whenever stress spikes, without thinking.',
    ],
    whatYouGet: [
      '4-7-8 breathing technique guide (with science)',
      'Emotional labeling framework',
      'Cognitive reframing templates',
      'Stress trigger identification chart',
      'Daily quest auto-assigned: Pause & Regulate',
      '+3 WIL per sync, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Pause & Regulate',
        description: 'Next time you feel stressed: stop, breathe 4-7-8, label the emotion, continue.',
        reward: '+8 EXP · +6 NC · +3 WIL',
      },
    ],
    pdfGuide: {
      intro:
        'Emotion Regulation gives you a physical tool (breathing) and a mental tool (labeling) to manage your emotional state in real time. This guide explains the neuroscience and gives you the practice protocol.',
      sections: [
        {
          heading: 'The Neuroscience of 4-7-8',
          body: 'When you are stressed, your sympathetic nervous system activates — fight or flight. Heart rate increases, breathing becomes shallow, blood flows to muscles, and your prefrontal cortex (rational thinking) goes offline. The 4-7-8 breath activates the parasympathetic nervous system — rest and digest. The 7-second hold builds CO2 in your blood, which triggers the vagus nerve to slow your heart rate. The 8-second exhale fully empties your lungs, signaling safety to your brain. This is not woo-woo — it is physiology.',
        },
        {
          heading: 'How to Do 4-7-8',
          body: '1. INHALE through your nose for 4 seconds. Fill your belly first, then chest.\n2. HOLD your breath for 7 seconds. Keep your mouth closed. Keep your body relaxed.\n3. EXHALE through your mouth for 8 seconds. Purse your lips. Let it out slowly and completely.\n4. REPEAT 4 times (4 full cycles).\n\nTips: If 7 seconds hold is too hard, start with 4-4-6 and work up. Do not do more than 4 cycles at once — you can get lightheaded. Practice when calm so the technique is automatic when stressed.',
        },
        {
          heading: 'Emotional Labeling — "Name It to Tame It"',
          body: 'UCLA research by Dr. Matthew Lieberman showed that naming an emotion reduces activity in the amygdala (fear center) and increases activity in the prefrontal cortex (rational brain). The phrase is "Name it to tame it."\n\nAfter your 4-7-8 breath, say (or think):\n"I am feeling [emotion] because [trigger]."\n\nExample: "I am feeling angry because my colleague dismissed my idea in the meeting."\n\nDo not judge the emotion. Do not try to fix it. Just name it. The act of naming it reduces its intensity by 30-50%.',
        },
        {
          heading: 'Cognitive Reframing',
          body: 'After labeling, reframe the emotion as information:\n- Anger → "Something I value was violated. What can I do about it?"\n- Anxiety → "I am uncertain about an outcome. What can I control?"\n- Sadness → "I lost something that mattered. What do I need to process?"\n- Frustration → "My effort is not matching my expectation. Do I adjust effort or expectation?"\n\nEmotions are not problems to be solved. They are signals to be read. The reframe turns a reaction into a decision.',
        },
        {
          heading: 'Practice Progression',
          body: 'Week 1: 4-7-8 three times daily when calm. Goal: make the breath automatic.\nWeek 2: 4-7-8 in low-stress situations. Goal: build the trigger reflex.\nWeek 3: 4-7-8 + labeling in mild stress. Goal: use it when it matters.\nWeek 4: Full protocol (breath + label + reframe) in moderate stress. Goal: mastery.\n\nYou will not be perfect. You will still react sometimes. But each time you catch yourself and use the technique, the gap between stimulus and response grows. That gap is freedom.',
        },
      ],
      closing:
        'Between stimulus and response, there is a space. In that space is your power to choose your response. In your response lies your growth and your freedom. — Viktor Frankl. The 4-7-8 breath creates the space. Labeling fills it with awareness. Reframing turns it into action. The NEXUS system tracks every sync. Every regulated moment writes to your willpower stat.',
    },
  },

  stoic_practice: {
    overview:
      'Daily Stoic Practice applies 2000-year-old Stoic philosophy to modern life. The core exercise is the Dichotomy of Control: every morning, you write what you control and what you do not. Throughout the day, when you catch yourself worrying about the uncontrollable, you release it. This is not suppression — it is accurate categorization. You stop wasting energy on what you cannot change and redirect it to what you can.',
    whoIsThisFor:
      'Operators who overthink, worry about things outside their control, or feel chronically anxious about outcomes. Also for anyone interested in practical philosophy that builds resilience.',
    trainingPlan: [
      'Week 1: Morning dichotomy — write 1 thing you control and 1 you don\'t. Review at night.',
      'Week 2: Add negative visualization — "What if I lost what I have? How would I cope?" Builds gratitude + resilience.',
      'Week 3: Add the view from above — zoom out: your problem in the context of your city, planet, universe.',
      'Week 4: Evening reflection — "What did I do well? What could I do better? What will I do tomorrow?"',
      'Ongoing: Make the morning dichotomy a lifetime habit. It takes 5 minutes and changes everything.',
    ],
    whatYouGet: [
      '4-week Stoic practice progression',
      'Dichotomy of Control daily template',
      'Negative visualization guide',
      'View from above meditation script',
      'Evening reflection framework (Seneca style)',
      'Daily quest auto-assigned: Dichotomy of Control',
      '+2 WIL per sync, +5 NC, +6 EXP',
    ],
    questsAssigned: [
      {
        title: 'Dichotomy of Control',
        description: 'Write 1 thing you control and 1 you don\'t. Practice releasing the second.',
        reward: '+6 EXP · +5 NC · +2 WIL',
      },
    ],
    pdfGuide: {
      intro:
        'Stoicism is not about suppressing emotions. It is about distinguishing what you control from what you do not, and putting your energy only into the former. This guide covers the four core Stoic exercises that build this skill.',
      sections: [
        {
          heading: 'The Dichotomy of Control',
          body: 'Epictetus: "Some things are within our power, while others are not. Within our power are opinion, motivation, desire, aversion, and, in a word, whatever is of our own doing. Not within our power are our body, our property, reputation, office, and, in a word, whatever is not of our own doing."\n\nPractical version:\nI CONTROL: My effort, my response, my values, my attention, my decisions\nI DO NOT CONTROL: Other people\'s opinions, outcomes, the past, the weather, the economy\n\nEvery morning, write one item in each column. Throughout the day, when you feel stressed, ask: "Is this in my control?" If yes, act. If no, let go.',
        },
        {
          heading: 'Negative Visualization (Premeditatio Malorum)',
          body: 'Seneca: "He robs present ills of their power who has perceived their coming beforehand."\n\nOnce a day, spend 2 minutes imagining: What if I lost what I have? My health, my relationships, my possessions. Not to be morbid — to be grateful. When you imagine loss, the present becomes precious.\n\nExercise: Close your eyes. Imagine waking up and your closest person is gone. Feel the loss for 10 seconds. Then open your eyes and feel the gratitude that they are here. This is not pessimism. It is appreciation training.',
        },
        {
          heading: 'The View From Above',
          body: 'Marcus Aurelius: "How much time he gains who does not look to see what his neighbor says or does, but only to what he himself is doing, to make it just and pure."\n\nExercise: Close your eyes. Picture yourself. Zoom out — see your building, your city, your country, the Earth, the solar system. Your problems are still there, but they are small. This is not dismissal — it is perspective. The view from above does not shrink your problems. It shrinks your identification with them.',
        },
        {
          heading: 'Evening Reflection (Seneca\'s Practice)',
          body: 'Seneca reviewed his day every night:\n1. "What did I do well today?" (Acknowledge wins)\n2. "What could I have done better?" (Identify gaps)\n3. "What will I do differently tomorrow?" (Commit to change)\n\nThis is not self-criticism. It is self-coaching. The tone is that of a mentor: honest but kind. 5 minutes at night. Write it down or think it. Over time, you start catching yourself during the day because you know you will review tonight.',
        },
        {
          heading: 'The Stoic Toolkit — Daily Summary',
          body: 'MORNING (5 min):\n  - Dichotomy: 1 thing I control, 1 I don\'t\n  - Negative visualization: What if I lost ___? → Gratitude\n\nDURING DAY:\n  - When stressed: "Is this in my control?"\n  - When overwhelmed: View from above (zoom out)\n\nEVENING (5 min):\n  - What did I do well?\n  - What could I do better?\n  - What will I do tomorrow?\n\n10 minutes a day. That is the entire practice.',
        },
      ],
      closing:
        'Stoicism is not a philosophy you read. It is a philosophy you do. 10 minutes a day. Morning dichotomy, evening reflection. In 8 weeks, you will catch yourself worrying about the uncontrollable and release it without effort. The NEXUS system tracks every sync. Every reflection writes to your willpower stat.',
    },
  },

  memory_palace: {
    overview:
      'The Memory Palace (Method of Loci) is a 2500-year-old mnemonic technique used by memory champions to memorize hundreds of items in minutes. You take a familiar physical space (your home), mentally place items along a route through that space, and later "walk" the route to recall each item. The method works because human memory is spatial — we evolved to remember where things are, not what they are.',
    whoIsThisFor:
      'Students preparing for exams, professionals who need to memorize information, or anyone who wants a sharper memory. No prior memory training needed.',
    trainingPlan: [
      'Week 1: Build your first palace. Use your home. Place 5 items along a route (front door → kitchen → living room → bedroom → bathroom).',
      'Week 2: Expand to 10 items. Add vivid, bizarre imagery (the more absurd, the more memorable).',
      'Week 3: Build a second palace (your office/school). Use it for a different category of information.',
      'Week 4: Speed drill — place 10 items in 2 minutes. Recall in reverse order.',
      'Ongoing: Build palaces for each subject/topic you need. With practice, you can memorize 50+ items in one session.',
    ],
    whatYouGet: [
      'Step-by-step Memory Palace construction guide',
      'Vivid imagery techniques (bizarre = memorable)',
      'Multiple palace architecture for different topics',
      'Speed recall drills',
      'Memory champion competition techniques',
      'Daily quest auto-assigned: Build a Memory Palace',
      '+3 INT per sync, +8 NC, +10 EXP',
    ],
    questsAssigned: [
      {
        title: 'Build a Memory Palace',
        description: 'Choose a route. Place 5 items along it. Mentally walk it to recall them all.',
        reward: '+10 EXP · +8 NC · +3 INT',
      },
    ],
    pdfGuide: {
      intro:
        'The Memory Palace is the most powerful memory technique ever invented. World Memory Champions use it to memorize 500+ digits in 5 minutes. This guide teaches you how to build your first palace and progress to advanced techniques.',
      sections: [
        {
          heading: 'Why Spatial Memory Works',
          body: 'Your brain evolved to remember spatial information — where the water source is, where the predator lives, where the safe cave is. This is why you remember the layout of your childhood home perfectly but forget a phone number in 10 seconds. The Memory Palace hijacks this spatial memory system for arbitrary information. You are not memorizing data — you are memorizing locations, which your brain already does effortlessly.',
        },
        {
          heading: 'Building Your First Palace',
          body: 'STEP 1: Choose a familiar space. Your home is ideal. You must be able to "walk" through it mentally without confusion.\n\nSTEP 2: Define a route. A fixed path through the space. Example: front door → hallway → kitchen → living room → bedroom. The order must always be the same.\n\nSTEP 3: Place items along the route. Each "station" gets one item. The key: make the image VIVID and BIZARRE.\n\nExample: To memorize "eggs, milk, bread, apples, coffee":\n- Front door: A giant egg is cracking open, yolk dripping down the door\n- Hallway: A river of milk is flowing down the hallway\n- Kitchen: A loaf of bread the size of a car is on the counter\n- Living room: An apple tree is growing through the sofa\n- Bedroom: A volcano is erupting coffee instead of lava\n\nTo recall: mentally walk the route. See each image. Read the item.',
        },
        {
          heading: 'The Bizarre Image Rule',
          body: 'Normal images are forgettable. Bizarre images are unforgettable. Rules for memorable images:\n\n1. EXAGGERATE: Make it huge, tiny, or disproportionate\n2. ANIMATE: Make inanimate objects move or come alive\n3. VIOLATE: Put things where they don\'t belong (a cow in your bathtub)\n4. ENGAGE SENSES: Add sound, smell, texture, temperature\n5. EMOTIONAL: Make it funny, disgusting, or shocking\n\nThe more absurd, the more memorable. A boring egg on a counter = forgotten. A giant egg cracking on your front door with yolk everywhere = unforgettable.',
        },
        {
          heading: 'Advanced Techniques',
          body: 'MULTIPLE PALACES: Build separate palaces for different topics. Home = vocabulary. Office = history. Gym = formulas. This prevents interference.\n\nTHE JOURNEY METHOD: For long sequences (speeches, presentations), extend the route through multiple rooms. 50+ stations are possible.\n\nTHE PEG SYSTEM: For numbered lists, pre-assign fixed images to numbers (1 = gun, 2 = shoe, 3 = tree). Link items to pegs instead of locations.\n\nREVERSE RECALL: Walk the route backwards to strengthen the memory. Also walk it forwards.',
        },
        {
          heading: 'Practice Progression',
          body: 'Week 1: 5 items, one palace. Take 10 minutes to place and recall.\nWeek 2: 10 items, same palace. Reduce to 5 minutes.\nWeek 3: 10 items in a new palace. Practice recalling from both.\nWeek 4: 20 items. Speed drill: 2 minutes to place, immediate recall.\n\nWith 4 weeks of practice, you will be able to memorize a 20-item list in under 3 minutes and recall it perfectly a week later. This is not talent. It is technique.',
        },
      ],
      closing:
        'Memory is not a gift. It is a skill. The Memory Palace is the tool that turns ordinary memory into extraordinary memory. 5 items today. 50 items in a month. The NEXUS system tracks every sync. Every palace writes to your intelligence stat.',
    },
  },

  charisma_lab: {
    overview:
      'Charisma Lab develops social confidence through three core skills: active listening, storytelling, and body language awareness. The practice is simple — in your next conversation, you listen more than you speak, ask two follow-up questions, and summarize what the other person said before responding. Most people are waiting for their turn to talk. When you actually listen, people feel it — and they are drawn to you.',
    whoIsThisFor:
      'Operators who feel socially awkward, struggle in conversations, want better professional relationships, or want to be more likable without being fake.',
    trainingPlan: [
      'Week 1: In every conversation, listen 80% of the time. Ask 2 follow-up questions. Do not interrupt.',
      'Week 2: Add the summary technique — before responding, say "So what you\'re saying is ___." Check accuracy.',
      'Week 3: Practice storytelling — prepare 3 short personal stories (2 min each). Tell one per conversation.',
      'Week 4: Body language awareness — maintain eye contact, mirror posture, open gestures. Notice others\' body language.',
      'Ongoing: Charisma is a skill, not a trait. Practice daily. The goal is genuine interest, not manipulation.',
    ],
    whatYouGet: [
      'Active listening framework (80/20 rule)',
      'Follow-up question bank (50+ conversation starters)',
      'Storytelling structure (setup, tension, resolution)',
      'Body language cheat sheet',
      'Charisma assessment checklist',
      'Daily quest auto-assigned: Active Listening Drill',
      '+3 SOC per sync, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Active Listening Drill',
        description: 'In your next conversation: listen 80%, ask 2 follow-ups, summarize before responding.',
        reward: '+8 EXP · +6 NC · +3 SOC',
      },
    ],
    pdfGuide: {
      intro:
        'Charisma is not about being the loudest person in the room. It is about being the most present. This guide covers the three skills that make people feel heard, valued, and drawn to you.',
      sections: [
        {
          heading: 'Active Listening — The 80/20 Rule',
          body: 'In most conversations, people speak 50/50. But the most charismatic people listen 80% and speak 20%. This feels counterintuitive — shouldn\'t you talk more to be interesting? No. People do not remember what you said. They remember how you made them feel. When you listen deeply, they feel important. That feeling is charisma.\n\nThe rule: in your next conversation, track the ratio. If you catch yourself talking more than 50%, stop. Ask a question. Let them talk.',
        },
        {
          heading: 'The Follow-Up Question',
          body: 'Most people ask one question, get an answer, and then share their own experience. This kills the conversation. Instead, ask a FOLLOW-UP question. This shows you are actually listening and deepens the conversation.\n\nGood follow-ups:\n- "What was that like for you?"\n- "How did you handle that?"\n- "What made you choose that?"\n- "What was the hardest part?"\n- "What surprised you about that?"\n\nRule: At least 2 follow-up questions per conversation before you share your own experience.',
        },
        {
          heading: 'The Summary Technique',
          body: 'Before you respond to someone, summarize what they said: "So what you\'re saying is [their point]." This does three things:\n1. It shows you were actually listening (rare)\n2. It gives them a chance to correct if you misunderstood\n3. It makes them feel validated\n\nPeople will literally light up when you do this. Most people never feel heard. When you summarize, you are saying: "I heard you. I understood you. You matter."\n\nDo not parrot their exact words. Paraphrase. Show understanding, not echo.',
        },
        {
          heading: 'Storytelling Structure',
          body: 'Prepare 3 personal stories. Each 2 minutes long. Structure:\n\nSETUP (30 sec): Context. "Last year, I was working on a project that..."\nTENSION (60 sec): The conflict. "And then everything went wrong. The deadline moved up, the team was..." \nRESOLUTION (30 sec): The outcome + lesson. "In the end, I learned that..."\n\nGood stories have: a specific moment (not "one time" but "last March 15th"), a conflict, and a transformation. Avoid rambling. Practice your 3 stories until they are tight. Tell one per conversation.',
        },
        {
          heading: 'Body Language',
          body: 'EYE CONTACT: Maintain 60-70% of the time. More feels aggressive, less feels evasive.\nPOSTURE: Mirror the other person subtly. If they lean in, lean in. If they are relaxed, relax.\nHANDS: Visible and open. Do not cross arms (signals defensiveness). Do not fidget (signals anxiety).\nFACIAL EXPRESSION: Match the emotional tone. Serious when they are serious. Smiling when they are light.\nSPACE: Respect personal space. 2-4 feet for casual conversation. Closer for intimate.\n\nBody language is 55% of communication. Your words are 7%. Tone is 38%. Most people train only their words. Train all three.',
        },
      ],
      closing:
        'Charisma is not about being someone else. It is about being present with someone else. Listen 80%. Ask follow-ups. Summarize. Tell stories. In 4 weeks, people will seek you out because you make them feel heard. The NEXUS system tracks every sync. Every conversation writes to your social stat.',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // BOOKS
  // ═══════════════════════════════════════════════════════════════

  book_starting_strength: {
    overview:
      'Starting Strength by Mark Rippetoe is the definitive barbell training manual. It covers the five fundamental barbell lifts (squat, deadlift, press, bench press, power clean) with biomechanical precision. If you want to build real strength with a barbell, this is the book. It is not a workout program — it is a textbook on human movement under load.',
    whoIsThisFor:
      'Operators who want to train with barbells, have access to a gym, and want to understand WHY the lifts work, not just HOW. Not for bodyweight-only trainees.',
    trainingPlan: [
      'Read 10 pages per session. The book has 320 pages → ~32 reading sessions.',
      'Focus on one lift per chapter. Practice that lift in your next gym session.',
      'Take notes on form cues for each lift. Apply them immediately.',
      'The squat chapter (Chapter 2) is the most important. Read it twice.',
      'After finishing, use the Starting Strength novice program: 3×5 squat, press, deadlift. Add 5lb per session.',
    ],
    whatYouGet: [
      '320-page barbell training textbook',
      'Reading companion guide (chapter summaries + key takeaways)',
      'Form cue checklist for all 5 lifts',
      'Novice linear progression program',
      'Daily quest auto-assigned: Read Starting Strength',
      '+2 STR per read session, +5 NC, +6 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Starting Strength',
        description: 'Read 10 pages from Starting Strength. Note one technique cue.',
        reward: '+6 EXP · +5 NC · +2 STR',
      },
    ],
    pdfGuide: {
      intro:
        'This reading companion guide helps you extract maximum value from Starting Strength. It is not a replacement for the book — it is a roadmap that highlights the key concepts, form cues, and practical applications from each chapter.',
      sections: [
        {
          heading: 'Chapter 1: Strength and Training',
          body: 'Key concept: Strength is the ability to produce force against external resistance. It is the most important physical quality because all other physical qualities (endurance, power, speed) are limited by strength. A stronger runner runs faster. A stronger jumper jumps higher. Strength is the foundation.\n\nAction: Before reading further, write your current strength numbers (squat, deadlift, press, bench). These are your baseline.',
        },
        {
          heading: 'Chapter 2: The Squat',
          body: 'The squat is the most important exercise. It uses the most muscle mass, over the longest effective range of motion, with the most weight. Key form cues:\n- Bar position: Low bar (below the acromion) for most lifters\n- Stance: Shoulder-width, toes pointed out 30°\n- Descent: Sit back and down. Knees track over toes.\n- Depth: Hip crease below top of knee (below parallel)\n- Ascent: Drive hips up. Chest follows. Do not good-morning the weight.\n\nAction: In your next gym session, do 3×5 squats with an empty bar. Focus on depth and knee tracking.',
        },
        {
          heading: 'Chapter 3: The Press',
          body: 'The overhead press builds shoulder strength and stability. Key cues:\n- Grip: Shoulder-width, forearms vertical from the side\n- Start: Bar at shoulder level, tucked against the front delts\n- Press: Push the bar straight up. Lock out overhead.\n- Breathing: Brace before each rep. Exhale at lockout.\n\nThe press is hard. You will progress slowly. 5lb jumps may be too much — use 2.5lb micro-plates.\n\nAction: Practice the press with an empty bar. Focus on vertical bar path.',
        },
        {
          heading: 'Chapter 4: The Deadlift',
          body: 'The deadlift uses more muscle mass than any other lift. Key cues:\n- Stance: Narrow, feet under hips, toes pointed slightly out\n- Grip: Just outside knees. Double overhand or hook grip.\n- Setup: Bar over mid-foot. Shins touching the bar.\n- Pull: Legs first, then back. Bar stays close to the body.\n- Lockout: Hips and knees straight. Shoulders back.\n\nThe deadlift is where ego meets reality. Do not round your back. Do not jerk the bar off the floor.\n\nAction: Practice the deadlift setup with an empty bar. Focus on bar-over-mid-foot position.',
        },
        {
          heading: 'The Novice Linear Progression',
          body: 'After reading the book, run the Starting Strength novice program:\n\nWorkout A: Squat 3×5, Press 3×5, Deadlift 1×5\nWorkout B: Squat 3×5, Bench 3×5, Power Clean 5×3\nAlternate A/B, 3 days per week (Mon/Wed/Fri or Tue/Thu/Sat).\n\nAdd 5lb to squat, press, and bench each session. Add 10lb to deadlift each session. When you miss reps, deload 10% and build back up. This linear progression works for 3-9 months. Milk it for all it is worth.',
        },
      ],
      closing:
        'Starting Strength is not a book you read once. It is a reference you return to. Every time your squat stalls, re-read Chapter 2. Every time your deadlift feels off, re-read Chapter 4. The NEXUS system tracks every reading session. Every 10 pages writes to your strength stat.',
    },
  },

  book_complete_calisthenics: {
    overview:
      'Complete Calisthenics by Ashley Kalym is the most comprehensive bodyweight exercise guide available. 400 pages with 500+ photos covering exercises from beginner push-ups to advanced planches, muscle-ups, and one-arm pull-ups. If you train at home without equipment, this is your bible.',
    whoIsThisFor:
      'Operators who train at home, travel frequently, or prefer bodyweight training. No equipment required beyond a pull-up bar.',
    trainingPlan: [
      'Read 10 pages per session, focusing on one exercise family per session.',
      'Practice one new exercise from each chapter in your next workout.',
      'The progression charts (Chapter 3) are the most valuable part. Bookmark them.',
      'Take 32 reading sessions to complete the book.',
      'After finishing, build a custom routine using the exercise library.',
    ],
    whatYouGet: [
      '400-page bodyweight exercise encyclopedia',
      'Reading companion with progression charts',
      'Exercise index (beginner → advanced for each movement)',
      'Workout template builder',
      'Daily quest auto-assigned: Read Complete Calisthenics',
      '+2 STR per read session, +5 NC, +6 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Complete Calisthenics',
        description: 'Read 10 pages. Learn and practice one new exercise.',
        reward: '+6 EXP · +5 NC · +2 STR',
      },
    ],
    pdfGuide: {
      intro:
        'This companion guide helps you navigate the 400-page Complete Calisthenics book efficiently. It highlights the key exercises, progression paths, and workout structures so you can build a personalized bodyweight training program.',
      sections: [
        {
          heading: 'How to Use This Book',
          body: 'Do not read cover to cover. Instead:\n1. Read Chapters 1-2 (fundamentals + warm-up)\n2. Go to the exercise family you want to improve (push-ups, pull-ups, core, legs)\n3. Find your current level in the progression chart\n4. Read the technique for your current exercise and the NEXT exercise in the progression\n5. Practice the new exercise in your next workout\n\nThis is a reference book, not a novel. Use it as a toolbox.',
        },
        {
          heading: 'Push-Up Progression',
          body: 'Wall push-ups → Incline push-ups → Knee push-ups → Full push-ups → Diamond push-ups → Archer push-ups → One-arm push-ups\n\nStay at each level until you can do 3×10 with perfect form. Then move to the next. This progression can take 6-18 months depending on starting strength. Do not rush — connective tissue adapts slower than muscle.',
        },
        {
          heading: 'Pull-Up Progression',
          body: 'Dead hangs (30s) → Scapular pulls → Negative pull-ups → Band-assisted pull-ups → Full pull-ups → Wide pull-ups → Archer pull-ups → One-arm pull-ups\n\nThe pull-up is the hardest bodyweight exercise. Most people need 2-3 months of negatives before their first full pull-up. Be patient. The dead hang alone builds grip strength and shoulder stability.',
        },
        {
          heading: 'Core Progression',
          body: 'Plank (30s) → Plank (60s) → Plank-to-push-up → Hollow body hold → L-sit (tucked) → L-sit (full) → Dragon flag → Front lever\n\nCore is not just abs. It is the entire trunk — front, sides, and back. A strong core makes every other exercise safer and stronger.',
        },
        {
          heading: 'Building Your Routine',
          body: 'Full-body routine (3 days/week):\n1. Push exercise (current progression level): 3×10\n2. Pull exercise (current level): 3×max\n3. Leg exercise (squats or lunges): 3×15\n4. Core exercise (current level): 3×hold time\n\nEach week, try to add 1 rep or 5 seconds. When you hit 3×10 or 3×60s, move to the next exercise in the progression. This is progressive overload for calisthenics.',
        },
      ],
      closing:
        'Complete Calisthenics is a lifetime reference. You will return to it every time you master a new exercise and need the next progression. The NEXUS system tracks every reading session. Every page writes to your strength stat.',
    },
  },

  book_emotional_intelligence: {
    overview:
      'Emotional Intelligence by Daniel Goleman is the #1 bestseller that introduced EQ to the world. Goleman argues that EQ (emotional intelligence) matters more than IQ for success in life and work. The book covers five pillars: self-awareness, self-regulation, motivation, empathy, and social skills. 384 pages of research, stories, and practical frameworks.',
    whoIsThisFor:
      'Anyone who wants better relationships, more self-control, or greater professional success. Especially valuable for operators who feel their emotions hold them back.',
    trainingPlan: [
      'Read 10 pages per session. The book has 384 pages → ~38 reading sessions.',
      'Focus on one pillar per week: Week 1 = Self-Awareness, Week 2 = Self-Regulation, etc.',
      'After each chapter, identify one EQ concept and apply it that day.',
      'Keep an EQ journal — note situations where you applied (or failed to apply) a concept.',
      'After finishing, pair this with the Emotional Awareness Protocol for practical training.',
    ],
    whatYouGet: [
      '384-page EQ bestseller reading companion',
      '5-pillar EQ framework summary',
      'Chapter-by-chapter key takeaways',
      'Practical application exercises per pillar',
      'EQ self-assessment checklist',
      'Daily quest auto-assigned: Read Emotional Intelligence',
      '+3 WIL per read session, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Emotional Intelligence',
        description: 'Read 10 pages. Apply one EQ concept in real life today.',
        reward: '+8 EXP · +6 NC · +3 WIL',
      },
    ],
    pdfGuide: {
      intro:
        'This companion guide helps you extract the five pillars of emotional intelligence from Goleman\'s book and apply them practically. It is organized by pillar, not by chapter, so you can focus on the skill you need most.',
      sections: [
        {
          heading: 'Pillar 1: Self-Awareness',
          body: 'Self-awareness is knowing your emotions as they happen. Goleman calls this "metacognition" — thinking about your feelings. Key practices:\n- Emotional check-ins (3x daily, name what you feel)\n- Trigger identification (what situations reliably produce which emotions)\n- Self-honesty (admitting when you are jealous, angry, or scared)\n\nApplication: Today, name your emotion before every decision. "I am feeling ___, and I am about to decide ___. Is this a good time to decide?"',
        },
        {
          heading: 'Pillar 2: Self-Regulation',
          body: 'Self-regulation is managing your emotional responses. Not suppressing — channeling. Key practices:\n- The 6-second pause (when you feel an impulse, count to 6 before acting)\n- Reframing ("This is not a threat, this is a challenge")\n- Sleep, exercise, and nutrition (physical state drives emotional state)\n\nApplication: Today, when you feel an urge to react emotionally, pause for 6 seconds. Then decide: is this response helpful?',
        },
        {
          heading: 'Pillar 3: Motivation',
          body: 'Intrinsic motivation is doing something because it matters to you, not for external reward. Goleman identifies four elements:\n- Optimism (setbacks are temporary)\n- Hope (belief that you can improve)\n- Flow (losing yourself in meaningful work)\n- Grit (persistence through difficulty)\n\nApplication: Write down WHY you are doing your current most important task. If the answer is external (money, approval), find the internal reason. "I do this because ___ matters to me."',
        },
        {
          heading: 'Pillar 4: Empathy',
          body: 'Empathy is reading emotions in others. Three types:\n- Cognitive empathy: Understanding what someone thinks\n- Emotional empathy: Feeling what someone feels\n- Empathic concern: Caring about their wellbeing\n\nKey practice: In conversations, watch for non-verbal cues (tone, posture, facial expression). Ask: "What are they feeling right now?" Not "What are they saying?"\n\nApplication: In your next conversation, focus on the emotion behind the words. Reflect it back: "It sounds like you\'re feeling ___."',
        },
        {
          heading: 'Pillar 5: Social Skills',
          body: 'Social skills are the outward expression of the first four pillars. Key abilities:\n- Influence (persuading without manipulation)\n- Communication (clear, honest, kind)\n- Conflict management (finding win-win solutions)\n- Leadership (inspiring others through example)\n- Building bonds (genuine relationships, not networking)\n\nApplication: Practice one social skill per day. Day 1: Active listening. Day 2: Clear communication. Day 3: Conflict resolution. Day 4: Giving feedback. Day 5: Receiving feedback.',
        },
      ],
      closing:
        'Emotional intelligence is not fixed at birth. It is a set of skills that can be developed at any age. Goleman\'s book is the map. This companion guide is the action plan. The NEXUS system tracks every reading session. Every page writes to your willpower stat.',
    },
  },

  book_daily_stoic: {
    overview:
      'The Daily Stoic by Ryan Holiday presents 366 daily meditations from the three great Stoic philosophers: Marcus Aurelius, Seneca, and Epictetus. Each day has a theme, a quote, and a short reflection. It is designed to be read one page per day for a full year. This is not a book you rush — it is a book you live with.',
    whoIsThisFor:
      'Anyone who wants daily philosophical grounding. Perfect morning reading — 5 minutes a day for a year. No prior philosophy knowledge needed.',
    trainingPlan: [
      'Read one page per day (today\'s date). Write one sentence on how to apply it.',
      'Do not read ahead. The daily format is the point.',
      'Each month has a theme (January: Clarity, February: Passions, etc.). Notice the monthly arc.',
      'After finishing the year, start over. The second read reveals what you missed.',
      'Pair with the Stoic Practice Protocol for deeper application.',
    ],
    whatYouGet: [
      '366 daily meditation companion guide',
      'Monthly theme overview (12 themes for 12 months)',
      'Key Stoic principles summary',
      'Daily reflection template',
      'Stoic quote collection (50+ essential quotes)',
      'Daily quest auto-assigned: Read The Daily Stoic',
      '+2 WIL per read session, +5 NC, +6 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: The Daily Stoic',
        description: 'Read today\'s Stoic entry. Write one way to apply it.',
        reward: '+6 EXP · +5 NC · +2 WIL',
      },
    ],
    pdfGuide: {
      intro:
        'The Daily Stoic is designed to be read one page per day for a year. This companion guide gives you the monthly themes, key principles, and a reflection template to deepen your daily practice.',
      sections: [
        {
          heading: 'The 12 Monthly Themes',
          body: 'January: CLARITY — See the world as it is, not as you wish\nFebruary: PASSIONS — Master emotions, do not be mastered by them\nMarch: AWARENESS — Attention is the most valuable resource\nApril: UNBIASED THINKING — See without assumptions\nMay: RIGHT ACTION — Do the right thing, especially when hard\nJune: PROBLEM SOLVING — Every obstacle is the way\nJuly: DUTY — Know your role and fulfill it\nAugust: PRAGMATISM — Focus on what works, not what sounds good\nSeptember: FORTITUDE AND RESILIENCE — Endure what must be endured\nOctober: VIRTUE AND KINDNESS — Be good to yourself and others\nNovember: ACCEPTANCE — Love what happens\nDecember: MEDITATION ON MORTALITY — Memento mori\n\nEach month builds on the previous. By December, you have a complete Stoic framework.',
        },
        {
          heading: 'The Daily Practice',
          body: 'Every morning:\n1. Read today\'s entry (1 page, ~3 minutes)\n2. Write the key quote in your journal\n3. Write ONE sentence: "Today, I will apply this by ___"\n\nExample: If the entry is about controlling what you can, write: "Today, I will apply this by not checking the news (which I cannot control) and focusing on my work (which I can)."\n\nThis takes 5 minutes. Over 366 days, you will have a 366-entry Stoic journal. That journal is a map of your year — what you struggled with, what you learned, how you grew.',
        },
        {
          heading: 'Key Stoic Principles',
          body: '1. DICHOTOMY OF CONTROL: You control your mind. You do not control external events. Put energy only into what you control.\n\n2. MEMENTO MORI: You will die. Use this not to despair but to prioritize. What matters if this is your last day?\n\n3. AMOR FATI: Love what happens. Not passive acceptance — active embrace. The obstacle is the way.\n\n4. PREMEDITATIO MALORUM: Imagine the worst before it happens. Not to worry — to prepare.\n\n5. VIEW FROM ABOVE: Zoom out. Your problems are real but small in the cosmic scale.\n\n6. VIRTUE IS THE ONLY GOOD: Wealth, fame, pleasure are "preferred indifferents." Only virtue (wisdom, courage, justice, temperance) is truly good.',
        },
        {
          heading: 'Reflection Template',
          body: 'Date: ___\nToday\'s theme: ___\nKey quote: "___"\nMy interpretation: ___\nHow I will apply this today: ___\n\nEvening review:\nDid I apply it? Yes/No/Partially\nWhat happened: ___\nWhat I learned: ___\n\nThis template takes 3 minutes morning, 2 minutes evening. 5 minutes total. The most important 5 minutes of your day.',
        },
      ],
      closing:
        'The Daily Stoic is not a book you finish. It is a practice you maintain. One page per day. One sentence of reflection. 366 days. After a year, you will think differently. The NEXUS system tracks every reading session. Every page writes to your willpower stat.',
    },
  },

  book_atomic_habits: {
    overview:
      'Atomic Habits by James Clear is the definitive guide to building good habits and breaking bad ones. The core thesis: small changes (1% better daily) compound into massive results over time. The book provides a four-law framework: make it obvious, make it attractive, make it easy, make it satisfying. 320 pages of practical, science-backed strategies.',
    whoIsThisFor:
      'Anyone who has tried and failed to build habits. Especially operators who start strong and fade after two weeks. This book explains why habits fail and how to design them to stick.',
    trainingPlan: [
      'Read 10 pages per session. 320 pages → ~32 reading sessions.',
      'Focus on one law per week: Week 1 = Make it Obvious, Week 2 = Make it Attractive, etc.',
      'After each chapter, design one tiny habit (2-minute version) to start tomorrow.',
      'Track the habit in the NEXUS Habit Lab.',
      'After finishing, audit your current habits using the four laws.',
    ],
    whatYouGet: [
      '320-page habit science reading companion',
      'Four Laws of Behavior Change summary',
      'Habit design template (2-minute rule)',
      'Habit stacking formula guide',
      'Identity-based habits framework',
      'Daily quest auto-assigned: Read Atomic Habits',
      '+3 INT per read session, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Atomic Habits',
        description: 'Read 1 chapter. Design one 2-minute habit to start tomorrow.',
        reward: '+8 EXP · +6 NC · +3 INT',
      },
    ],
    pdfGuide: {
      intro:
        'This companion guide extracts the four laws of behavior change from Atomic Habits and gives you practical templates to apply them. The book is excellent; this guide makes it actionable.',
      sections: [
        {
          heading: 'The 1% Rule',
          body: 'James Clear\'s core thesis: 1% better every day compounds. Over a year, 1% daily improvement = 37x better. 1% worse daily = 0.03x (near zero). Habits are the compound interest of self-improvement.\n\nThe implication: you do not need to make a massive change. You need to make a small change consistently. The goal is not to run a marathon today. The goal is to put on your running shoes today. The shoes lead to the marathon.',
        },
        {
          heading: 'The Four Laws of Behavior Change',
          body: 'To BUILD a good habit:\n1. MAKE IT OBVIOUS: Design your environment so the cue is visible\n2. MAKE IT ATTRACTIVE: Pair it with something you already enjoy\n3. MAKE IT EASY: Reduce friction. 2-minute version to start.\n4. MAKE IT SATISFYING: Immediate reward. Track it. See progress.\n\nTo BREAK a bad habit (invert the laws):\n1. MAKE IT INVISIBLE: Remove the cue from your environment\n2. MAKE IT UNATTRACTIVE: Reframe the habit as harmful, not pleasurable\n3. MAKE IT DIFFICULT: Add friction. Require extra steps.\n4. MAKE IT UNSATISFYING: Accountability partner. Public commitment.',
        },
        {
          heading: 'Habit Stacking',
          body: 'The best way to build a new habit is to attach it to an existing one. Formula:\n"After [CURRENT HABIT], I will [NEW HABIT]."\n\nExamples:\n- "After I pour my morning coffee, I will write 3 priorities for the day."\n- "After I sit at my desk, I will do 10 push-ups."\n- "After I brush my teeth, I will read 2 pages."\n\nThe current habit is the trigger. The new habit rides on it. No willpower needed — the existing habit automatically cues the new one.',
        },
        {
          heading: 'The 2-Minute Rule',
          body: 'When starting a new habit, it should take less than 2 minutes to do.\n- "Read 30 minutes" → "Read 1 page"\n- "Workout 45 minutes" → "Put on workout clothes"\n- "Meditate 20 minutes" → "Sit on the cushion"\n\nThe 2-minute version is not the goal — it is the gateway. Once you start, continuing is easy. The hard part is starting. The 2-minute rule makes starting effortless. Over time, the 2-minute habit naturally expands: 1 page becomes 10, workout clothes become a workout, the cushion becomes 20 minutes.',
        },
        {
          heading: 'Identity-Based Habits',
          body: 'The most powerful habit hack: change your identity, not your behavior. Instead of "I want to read more," say "I am a reader." Instead of "I want to work out," say "I am an athlete."\n\nYour habits are votes for your identity. Every time you read a page, you cast a vote for "I am a reader." Every time you skip, you cast a vote against it.\n\nYou do not rise to the level of your goals. You fall to the level of your systems. Design the system. The identity follows.',
        },
      ],
      closing:
        'Atomic Habits is not about willpower. It is about design. Make good habits obvious, attractive, easy, and satisfying. Make bad habits invisible, unattractive, difficult, and unsatisfying. Small changes. Big results. The NEXUS system tracks every reading session. Every page writes to your intelligence stat.',
    },
  },

  book_thinking_fast_slow: {
    overview:
      'Thinking, Fast and Slow by Daniel Kahneman (Nobel Prize winner) is the masterwork on cognitive biases and decision-making. Kahneman reveals that your mind has two systems: System 1 (fast, intuitive, emotional) and System 2 (slow, deliberate, logical). Most errors in judgment come from System 1 making snap decisions that System 2 never checks. 512 pages of mind-bending research.',
    whoIsThisFor:
      'Advanced operators who want to understand why they make irrational decisions. This is a dense, academic book — not light reading. Perfect for students, professionals, and anyone who makes important decisions.',
    trainingPlan: [
      'Read 10 pages per session. 512 pages → ~51 reading sessions.',
      'Focus on one cognitive bias per session. Identify it in your own behavior.',
      'Part 1 (Two Systems) is foundational. Read it carefully before proceeding.',
      'Part 4 (Choices) contains the most practical decision-making frameworks.',
      'After finishing, create a "bias checklist" to review before major decisions.',
    ],
    whatYouGet: [
      '512-page behavioral economics reading companion',
      'System 1 vs System 2 framework summary',
      'Cognitive bias index (20+ biases explained)',
      'Decision-making quality checklist',
      'Prospect theory overview (Kahneman\'s Nobel work)',
      'Daily quest auto-assigned: Read Thinking Fast/Slow',
      '+4 INT per read session, +8 NC, +10 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Thinking Fast/Slow',
        description: 'Read 10 pages. Find one cognitive bias you experienced today.',
        reward: '+10 EXP · +8 NC · +4 INT',
      },
    ],
    pdfGuide: {
      intro:
        'Thinking, Fast and Slow is a dense book. This companion guide distills the key concepts into actionable summaries so you can extract the most value without getting lost in 512 pages of research.',
      sections: [
        {
          heading: 'System 1 vs System 2',
          body: 'SYSTEM 1: Fast, automatic, intuitive, emotional. Operates with no effort. Examples: recognizing a face, driving on an empty road, completing "bread and ___."\n\nSYSTEM 2: Slow, deliberate, logical, effortful. Requires attention. Examples: doing math, parking in a tight space, filling out a tax form.\n\nThe problem: System 1 runs constantly and makes snap judgments. System 2 is lazy — it accepts System 1\'s judgments without checking. Most errors come from System 1 making a wrong call that System 2 never reviews.\n\nApplication: When making an important decision, ask: "Is this a System 1 snap judgment? Should I engage System 2 to check it?"',
        },
        {
          heading: 'Key Cognitive Biases',
          body: 'ANCHORING: The first number you hear influences your estimate, even if irrelevant. Example: "Is the tallest redwood more or less than 1200 feet?" Then "How tall is the tallest redwood?" People who heard 1200 guess much higher than those who heard 200.\n\nAVAILABILITY: You judge frequency by how easily examples come to mind. Shark attacks feel common because they are on the news. Heart disease kills 1000x more but feels rare.\n\nREPRESENTATIVENESS: You judge probability by similarity to a stereotype. "Linda is a philosophy major. Is she more likely a banker or a feminist banker?" Most people say feminist banker — but that is a subset of banker, so it must be less likely.\n\nCONFIRMATION: You seek evidence that confirms your beliefs and ignore evidence that contradicts them. Fix: Before deciding, ask "What would change my mind?" If the answer is "nothing," you are not thinking — you are rationalizing.',
        },
        {
          heading: 'Prospect Theory (Kahneman\'s Nobel)',
          body: 'Losses hurt more than equivalent gains feel good. Losing $100 hurts roughly 2x as much as gaining $100 feels good. This asymmetry drives irrational behavior:\n- Holding losing stocks too long (to avoid realizing the loss)\n- Selling winning stocks too early (to lock in the gain)\n- Refusing to cancel sunk-cost projects (because canceling confirms the loss)\n\nApplication: When facing a decision, reframe losses as costs. "I lost $500 on this course" → "I spent $500 to learn this lesson." The information is the same. The framing changes the feeling.',
        },
        {
          heading: 'The Two Selves',
          body: 'Kahneman distinguishes the experiencing self (living in the moment) from the remembering self (evaluating the past). They often disagree:\n- A vacation was wonderful in the moment but the last day was terrible. The remembering self says "the vacation was bad."\n- A painful medical procedure with a gentle ending is remembered as less painful than one with a harsh ending.\n\nThe remembering self uses the peak-end rule: it weights the peak moment and the ending, not the average. This means:\n- To make an experience memorable, make the peak and the ending good.\n- To make a painful experience less memorable, make the ending gentle.\n\nApplication: When designing your day, your week, your year — pay attention to the peaks and the endings. They define how you remember your life.',
        },
        {
          heading: 'Decision Quality Checklist',
          body: 'Before any major decision, check:\n1. Is this a System 1 snap judgment? → Engage System 2.\n2. Am I anchored to a specific number? → Generate an independent estimate first.\n3. Is my evidence biased toward what is easily available? → Seek disconfirming evidence.\n4. Am I loss-averse? → Reframe losses as costs.\n5. Am I overconfident? → Recall past predictions and their accuracy.\n6. What would change my mind? → If "nothing," stop and reconsider.\n\nThis checklist takes 60 seconds. It catches most cognitive biases before they become decisions.',
        },
      ],
      closing:
        'Thinking, Fast and Slow is not an easy read. It is an important one. The concepts in this book explain why smart people make dumb decisions — and how to stop doing it yourself. The NEXUS system tracks every reading session. Every page writes to your intelligence stat.',
    },
  },

  book_awaken_giant: {
    overview:
      'Awaken the Giant Within by Tony Robbins is a practical guide to mastering your emotions, body, relationships, and finances. Robbins\' approach is action-oriented: identify what you want, figure out what is stopping you, and take massive action. 544 pages of exercises, stories, and frameworks for personal transformation.',
    whoIsThisFor:
      'Operators who want a high-energy, action-oriented approach to self-improvement. Robbins is motivational and practical — this is not a philosophy book, it is a "do it now" book.',
    trainingPlan: [
      'Read 10 pages per session. 544 pages → ~54 reading sessions.',
      'After each chapter, apply one strategy immediately (not tomorrow — today).',
      'Part 1 (Emotions) is the most valuable. Focus there first.',
      'Do every exercise in the book. The exercises are the book. Reading without doing is useless.',
      'After finishing, build a "personal transformation plan" using Robbins\' frameworks.',
    ],
    whatYouGet: [
      '544-page personal development reading companion',
      'Robbins\' 6 human needs framework',
      'Belief change process guide',
      'Pain/pleasure motivation mapping',
      'Goal-setting masterplan template',
      'Daily quest auto-assigned: Read Awaken the Giant',
      '+3 WIL per read session, +6 NC, +8 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Awaken the Giant',
        description: 'Read 10 pages. Apply one strategy immediately.',
        reward: '+8 EXP · +6 NC · +3 WIL',
      },
    ],
    pdfGuide: {
      intro:
        'Awaken the Giant Within is a workbook disguised as a book. This companion guide highlights the key frameworks so you can apply them immediately. Reading is not enough — you must DO the exercises.',
      sections: [
        {
          heading: 'The Pain/Pleasure Principle',
          body: 'Robbins\' core insight: every human action is driven by the desire to gain pleasure or avoid pain. And the perception of pain/pleasure is more powerful than reality.\n\nTo change any behavior, change what you link pain and pleasure to:\n- Procrastination: You link pain to doing the task NOW and pleasure to doing it LATER.\n- Fix: Link MASSIVE pain to NOT doing it now (visualize the consequences) and MASSIVE pleasure to doing it now.\n\nExercise: Pick a habit you want to change. Write 5 reasons NOT changing it will cause you massive pain. Write 5 reasons changing it NOW will give you massive pleasure.',
        },
        {
          heading: 'The Six Human Needs',
          body: 'Robbins identifies six needs that drive all behavior:\n1. CERTAINTY: Safety, predictability, control\n2. UNCERTAINTY/VARIETY: Surprise, challenge, excitement\n3. SIGNIFICANCE: Feeling important, special, needed\n4. CONNECTION/LOVE: Belonging, intimacy, friendship\n5. GROWTH: Learning, development, expansion\n6. CONTRIBUTION: Giving, serving, making a difference\n\nThe first four are needs of the personality. The last two are needs of the spirit. A fulfilled life meets all six.\n\nExercise: Rate each need 1-10 on how well your current life meets it. The lowest score is your growth area.',
        },
        {
          heading: 'Belief Change',
          body: 'Beliefs are feelings of certainty about what something means. They filter your reality. Limiting beliefs ("I am not good enough") block action. Empowering beliefs ("I can learn anything") enable action.\n\nTo change a limiting belief:\n1. Identify the belief: "I believe ___"\n2. Question it: "Is this absolutely true? What evidence contradicts it?"\n3. Find the pain: "How has this belief cost me?"\n4. Create a new belief: "I now believe ___"\n5. Reinforce it: Find evidence for the new belief. Act as if it is true until it feels true.',
        },
        {
          heading: 'The Goal-Setting Process',
          body: 'Robbins\' goal-setting method:\n1. DREAM: Write 100 things you want (no filtering). Give yourself 10 minutes.\n2. TIMEFRAME: Mark each as 1-year, 3-year, 5-year, 10-year, 25-year.\n3. PICK: Choose the top 4 one-year goals. The ones that excite you most.\n4. WHY: For each, write WHY you must achieve it. The why is the fuel.\n5. HOW: Write 3 actions for each goal. Take one action TODAY.\n\nThe "why" is more important than the "how." If the why is strong enough, the how will appear.',
        },
        {
          heading: 'Emotional Mastery',
          body: 'Robbins\' emotional management framework:\n1. IDENTIFY: Name the emotion you are feeling.\n2. ACKNOWLEDGE: Accept it without judgment. Emotions are signals.\n3. APPRECIATE: What is this emotion teaching me?\n4. CHANGE: Use physical movement, breathing, or focus shift to change your state.\n\nRobbins\' rule: "Motion creates emotion." When you feel bad, move your body. Jump, run, do push-ups. Physical state changes emotional state within 60 seconds.',
        },
      ],
      closing:
        'Awaken the Giant is not about reading. It is about doing. Every exercise in this book is a tool. Use them. The NEXUS system tracks every reading session. Every page writes to your willpower stat.',
    },
  },

  book_ultimate_conditioning: {
    overview:
      'Ultimate Conditioning for Martial Arts by Loren Landow (UFC Strength & Conditioning coach) is a complete fighter conditioning system. 360 pages covering energy systems, periodization, strength training for combat athletes, and sport-specific conditioning protocols. This is the science of making a body that can fight.',
    whoIsThisFor:
      'Martial artists, combat athletes, and operators who want combat-level conditioning. Also valuable for any athlete who wants to understand energy system training.',
    trainingPlan: [
      'Read 10 pages per session. 360 pages → ~36 reading sessions.',
      'Focus on one energy system per week: Week 1 = Aerobic, Week 2 = Anaerobic Lactic, Week 3 = Anaerobic Alactic.',
      'After each chapter, add one new drill to your training routine.',
      'The periodization chapter (Chapter 8) is the most practical. Build your fight camp timeline.',
      'After finishing, design a 12-week conditioning program using Landow\'s framework.',
    ],
    whatYouGet: [
      '360-page combat conditioning reading companion',
      'Three energy systems explained (aerobic, lactic, alactic)',
      'Periodization template for fight camps',
      'Sport-specific drill library (20+ drills)',
      'Strength training protocol for fighters',
      'Daily quest auto-assigned: Read Ultimate Conditioning',
      '+4 AGI per read session, +8 NC, +10 EXP',
    ],
    questsAssigned: [
      {
        title: 'Read: Ultimate Conditioning',
        description: 'Read 10 pages. Add one new drill from the book to your routine.',
        reward: '+10 EXP · +8 NC · +4 AGI',
      },
    ],
    pdfGuide: {
      intro:
        'Ultimate Conditioning for Martial Arts is a textbook for combat athletes. This companion guide distills the key concepts into actionable summaries so you can build a science-based conditioning program.',
      sections: [
        {
          heading: 'The Three Energy Systems',
          body: 'Your body produces energy through three systems, each for different durations:\n\nAEROBIC (2+ minutes): Oxygen-dependent. Low intensity, long duration. Examples: 5km run, sparring multiple rounds. This is your base. Without aerobic fitness, the other systems cannot recover between bursts.\n\nANAEROBIC LACTIC (30s-2 min): Produces lactate. High intensity, moderate duration. Examples: 400m sprint, 1-minute round of burpees. This is the pain zone. Fighters need high lactic tolerance.\n\nANAEROBIC ALACTIC (0-10s): ATP-PC system. Max intensity, very short. Examples: 1-rep max lift, 10s sprint, explosive takedown. This is power. Fighters need alactic capacity for explosive movements.\n\nA complete fighter trains all three. The ratio depends on the sport (boxing is more aerobic, wrestling more lactic).',
        },
        {
          heading: 'Aerobic Base Building',
          body: 'Before high-intensity work, build an aerobic base. 8-12 weeks of Zone 2 training (conversational pace, 60-70% max HR). 3 sessions per week, 30-45 minutes each.\n\nThis builds mitochondria, capillaries, and cardiac output. Without it, your recovery between rounds is slow and your conditioning plateaus early.\n\nTest: Can you run 30 minutes at conversational pace without stopping? If no, you need more aerobic base. If yes, proceed to lactic work.',
        },
        {
          heading: 'Lactic Tolerance Training',
          body: 'Once aerobic base is built, add lactic tolerance work:\n\nProtocol 1: 4×4 intervals. 4 min at 85-95% max HR, 3 min recovery. 4 rounds.\nProtocol 2: Tabata. 20s all-out, 10s rest. 8 rounds (4 min total).\nProtocol 3: 30s all-out, 30s rest. 10 rounds.\n\nDo lactic work 2x per week. It is brutal. It is necessary. This is what makes you not gas out in round 3.',
        },
        {
          heading: 'Alactic Power Training',
          body: 'For explosive power (takedowns, striking burst):\n\nSprint intervals: 10s all-out sprint, 50s walk recovery. 8-12 rounds.\nPlyometrics: Box jumps, depth jumps, clap push-ups. 5×5 with full recovery.\nHeavy lifts: Deadlift, squat, press. 3×3 at 85% 1RM. Full recovery (3-5 min).\n\nAlactic work demands FULL recovery between reps/sets. If you are breathing hard, you are doing lactic, not alactic. Rest longer.',
        },
        {
          heading: 'Fight Camp Periodization',
          body: '12-week fight camp:\n\nWeeks 1-4 (General Prep): Aerobic base 3x/week. Light strength 2x/week. Skill training daily.\nWeeks 5-8 (Specific Prep): Aerobic 2x/week + lactic 2x/week. Strength 2x/week. Sparring 2x/week.\nWeeks 9-11 (Peak): Lactic 2x/week + alactic 1x/week. Strength maintenance only. Hard sparring 2x/week.\nWeek 12 (Taper): Reduce volume 50%. Light technical work. Rest. Sleep. Hydrate.\n\nThis is a simplified version. Landow\'s book has the full detail.',
        },
      ],
      closing:
        'Conditioning is the invisible weapon. Skill wins when conditioning is equal. When conditioning is unequal, conditioning wins. Build the engine. The NEXUS system tracks every reading session. Every page writes to your agility stat.',
    },
  },
};

/**
 * Get store content for a specific item ID.
 * Returns undefined if no rich content is available.
 */
export function getStoreContent(itemId: string): StoreContent | undefined {
  return STORE_CONTENT[itemId];
}
