# NEXUS — First-Launch Calibration Queries
*Continuation design doc. Pairs with the prior message that was cut off mid-Phase-2.*

The principle for every screen below: **the onboarding is a scene, not a form.** Solo Leveling's System interface — black canvas, monospaced text appearing line by line, terse Commands — is the aesthetic reference. Every question should feel like the System is interrogating you, not like Medium dot com asking for your email.

---

## Phase 3: Baseline Calibration (The Real Stats)

This is the phase that maps to the `InitialAssessment` component in your codebase — the one that gates access to the main dashboard. The questions so far gave the System *context*. These give it *numbers*.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #7                                 │
│                                                  │
│  Body — Strength baseline                         │
│                                                  │
│  How many pushups can you do in one clean set    │
│  before form breaks?                             │
│                                                  │
│  ○  0–10    (uncalibrated)                       │
│  ○  11–25   (passive baseline)                   │
│  ○  26–45   (trained baseline)                   │
│  ○  46–70   (operator-grade)                     │
│  ○  70+     (anomaly — verified later)           │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why the app needs this:** Sets the starting STR (strength) stat. Also lets TITAN calibrate progressive overload. A 16-year-old answering "0–10" gets a 30-day ramp quest that opens with knee-pushups. A person answering "50–70" gets a different challenge curve entirely. The System would lose weeks guessing otherwise.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #8                                 │
│                                                  │
│  Body — Vitality baseline                        │
│                                                  │
│  Over the last month, how often did you feel      │
│  physically exhausted by mid-afternoon?          │
│                                                  │
│  ○  Almost every day (chronic low energy)         │
│  ○  3–4 times a week (frequent crashes)          │
│  ○  1–2 times a week (normal variance)           │
│  ○  Rarely  (wakeful and steady)                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** Sets VIT and gives CHRONOS a signal. If the user reports chronic exhaustion, the System *doesn't* pile on physical quests — it generates a recovery quest ("Walk 15 min outside, drink 500 ml water, sleep before midnight") and only later adds intensity.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #9                                 │
│                                                  │
│  Mind — Intelligence baseline                    │
│                                                  │
│  How many minutes could you read a non-fiction    │
│  book today without your focus collapsing?       │
│                                                  │
│  ○  I can't — never tested                       │
│  ○  5–10 minutes                                 │
│  ○  15–30 minutes                                │
│  ○  30–60 minutes                                │
│  ○  60+ minutes (rare)                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** Sets INT and gives SAGE its starting territory. A 17-year-old who answers "5–10 minutes" gets a reading quest that starts at *8 minutes* — not 30. They see the number on the bar go up from the very first completion. That early visible win is the most important zero-to-one moment in the whole app.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #10                                │
│                                                  │
│  Will — Delay gratification durability           │
│                                                  │
│  You're studying. Your phone buzzes.             │
│  You know it's nothing urgent. What happens?     │
│                                                  │
│  ○  I check it every time, can't help it         │
│  ○  I check it after 5–10 minutes                │
│  ○  I wait until my block ends                   │
│  ○  Phone stays in another room — non-negotiable │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** Sets WIL. Also flags the user as a candidate for the Digital Discipline Governor (AppControlPanel) from day one. No judgment — just routing. The System now knows whether WIL quests should start with "delay checking phone by 1 minute" or "90-minute focus block, phone in drawer."

### Optional micro-tests (post-onboarding)

The above are *self-reported*. Honest, fast, complete. For a deeper baseline, the System can offer an *optional* live test the day after onboarding — "Verified Calibration" — where the user actually does 20 pushups, a 10-min focus block, and a cold shower. TITAN observes, logs, and *overwrites* the self-report with measured values. Self-report ≠ fact.

---

## Phase 4: Vulnerability Mapping (Seeding The Shadow)

This is the emotionally delicate part. The questions below look like "weakness detection," and they are — but they're phrased so the user doesn't feel interrogated. They feel *seen*.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #11                                │
│                                                  │
│  What is the most common pattern that pulls      │
│  you off your mission?                           │
│                                                  │
│  ○  📱  Phone / social media                     │
│  ○  😴  Fatigue / burnout                        │
│  ○  🍔  Emotional eating / junk food spirals     │
│  ○  🎮  Gaming / binge-watching                  │
│  ○  🤔  Overthinking / analysis paralysis        │
│  ○  👥  Social friction / people pleasing         │
│  ○  🤷  I don't know — I just stop                │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** Seeds the Shadow's taunt library. If the user picks "Phone," the Shadow weeks later will quote their own words: *"You said your phone was the leak. It's 9:47 PM and your screen time says 4.2 hours. We're both surprised, or just me?"* That specificity is what makes the Shadow feel like a person, not a notification.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #12                                │
│                                                  │
│  When you start something and later fail at it,  │
│  what story do you tell yourself?               │
│                                                  │
│  ○  "I never had enough time"                    │
│  ○  "I'm just not the kind of person who can do  │
│      this"                                       │
│  ○  "I'll restart Monday / next month / someday" │
│  ○  "I tried. It's not my fault."                │
│  ○  I don't usually fail — I just quietly stop   │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** Sage uses this to calibrate its 1 AM de-escalation language. CHRONOS uses it for the Time Audit ("Operator — you said you run out of time. Let's actually measure whether that's true."). REWARD/PENALTY uses it for the failure-state UX (a "Monday person" gets a re-entry script that *names Monday* and pre-empts the loop).

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #13                                │
│                                                  │
│  How honest do you want the System to be?        │
│                                                  │
│  ○  🥇  Brutal — call me out on everything        │
│  ○  🥈  Direct — honest but kind                 │
│  ○  🥉  Gentle — encouragement over challenge    │
│                                                  │
│  (You can change this later in Settings.)        │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** This adjusts the tone dial for ALL agents. "Brutal" unlocks the full Shadow experience — antagonistic, stat-quoting, comparison-heavy. "Gentle" tones the Shadow down to a quiet whisper, leans on SAGE mentorship, and rechristens the rival as **"The Drift"** — still tracked, but never mocked. A 14-year-old should default to Direct; a 24-year-old chasing peak performance often picks Brutal.

This single question is the strongest safety rail in the entire app.

---

## Phase 5: Direction Setting

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #14                                │
│                                                  │
│  Where do you want your stats to be in 90 days?  │
│                                                  │
│  (The System will not reset this. Choose what    │
│   actually matters to you, not what sounds       │
│   impressive.)                                   │
│                                                  │
│  Top priority — pick one:                        │
│                                                  │
│  ○  💪 Body — strength, energy, appearance       │
│  ○  🧠 Mind — focus, learning, clarity           │
│  ○  🔥 Discipline — habits, consistency, will    │
│  ○  👥 Social — confidence, relationships        │
│  ○  ⚖️ Balance — all of the above, no extremes   │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** The first 90 days of side-quest weight distribution are now biased toward this priority — but *not exclusively*. A "Body" priority still gets INT quests 2x/week and SAGE book recommendations. Blind pursuit of one stat is what causes the "I became fit but boring" anti-pattern. The System prevents it by design.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #15                                │
│                                                  │
│  If the Shadow wins and you abandon this vessel  │
│  in 30 days, what would you have lost?           │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │                                          │    │
│  │                                          │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  (Free text. One sentence is enough.)            │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** This is the single most important answer the user gives. It's stored verbatim. When the user is in Penalty Zone or staring at a broken streak, this is the sentence *quoted back to them by their own voice*. It is the failsafe for quitting.

The user wrote it. The System remembers. The Shadow reads it at the user with full dramatic irony.

---

## Phase 6: System Personality Calibration

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #16                                │
│                                                  │
│  Default tone of the System voice:               │
│                                                  │
│  ○  ❄️  Cold / tactical (Operator reports only)  │
│  ○  🗡️  Intense / drill-sergeant (no excuses)    │
│  ○  🌑  Dark / atmospheric  (the world's bleak,  │
│         you rise anyway)                         │
│  ○  🌅  Mystic / growth-oriented (you awaken)    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** Aesthetic and tonal preference. Maps to a CSS theme variant on the dashboard (color palette + agent dialogue flavor). One of the lowest-stakes questions, but important for the "this is *my* app, not a generic one" feeling. A 17-year-old player of Solo Leveling or Omniscient Reader will pick ❄️ or 🗡️ automatically.

```
┌──────────────────────────────────────────────────┐
│  SYSTEM QUERY #17 — FINAL                        │
│                                                  │
│  Do you consent to the System remembering        │
│  everything you do, say, and skip, in order to   │
│  become more useful to you over time?            │
│                                                  │
│  ○  Yes. Full memory. The System knows me.       │
│  ○  Partial. Stats + quests only, no chat logs.  │
│  ○  Minimal. Only what is needed to function.    │
│                                                  │
│  [Privacy & data are stored only on this device. │
│   The System has no phone line home.]            │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Why:** A radical transparency moment. The local-first architecture claim from your CLAUDE.md gets *acted out* at the moment of trust. The user consents to memory depth. SAGE's depth of personalization, and Shadow's depth of taunt data, both scale with this answer. The "Minimal" choice still works — it just makes the agents more generic.

---

## Calibration Complete

After Query #17, the screen transitions. Not a "success ✓" — a *system boot sequence.*

```
[CALIBRATION COMPLETE]

Initializing Operator profile...
Writing protocol signature...
Configuring Shadow Self...

████████████████████████████░░░░  92%

...

[SYSTEM ONLINE]

Welcome, Operator.

Level 1.  E-Rank Hunter.
Base stats recorded.
Daily quest protocol: ACTIVE.
Shadow Self: AWAKENING.

Open your eyes.

[ENTER NEXUS →]
```

---

## Design Principles — How To Build This

If you're actually implementing this rather than just designing it, here are the principles the questions above were built around:

### 1. Never ask more than 6 questions in one screen
Long forms kill apps. Cap each phase at 6, and break phases with a 2-second "Processing..." transition. Beat Saber taught the industry that loading screens are *moments*, not friction.

### 2. Every question must have a reason
No "What is your favorite color?" No "Pick your spirit animal." Every Query ties back to a specific agent behavior or stat setting. If you can't answer "what does the System *do differently* because of this answer?" — cut the question.

### 3. Multiple choice > free text for 90% of cases
Sliders and radio buttons feel like a game. Free text is vulnerable to typos, slang, and spelling. The one place free text matters is the vulnerability and the "what would you lose" answer — and only because the raw words get quoted back at the user later.

### 4. Save progress aggressively
If the user bails mid-Phase-3, the answers they've already given must persist. Returning to the app should drop them at the next unanswered Query, not Phase 1 again. This thing is `localStorage` first — there is no excuse for losing calibration data.

### 5. The Shadow is introduced AFTER calibration, not during
Onboarding about the rival is jarring. The user has just answered 17 personal questions. Slapping them with "your Shadow is watching" right after feels like a Slack notification from a SaaS. The Shadow *appears*, quietly, on the dashboard around Day 3. By then the user has earned stats worth being rivaled over.

### 6. The "what would you lose" answer must be visually distinct
Store it. Render it back to the user in italic, in their own words, on day 7, day 30, day 90. Eventually the user sees that sentence as *theirs* — that's the moment the app stops being software and becomes a mirror.

### 7. Each Query screen should be skippable with a default
Every question has a sensible default. If the user closes the app at Query #8 and reopens a week later, the System completes the calibration with the median answers for their profile. Better an E-Rank profile than no profile.

---

## What's Next

This design doc pairs with the rest of the conversation. To actually ship it, the work breaks into:

1. **A new `Onboarding` component** that wraps the `InitialAssessment` and gates the dashboard
2. **A `Calibration` data model** stored in localStorage with version field for future migrations
3. **`OperatorContext` hydration** — pull from the calibration on every page load
4. **Agent prompts updated per Calibration tier** — SAGE reads priorities, Shadow reads vulnerability answer, TITAN/VIT starts from baseline values
5. **A "Restart Calibration"** option in user Profile for those who want to reseed

The three agents most affected by the calibration answers: **Shadow** (gets the user's own vulnerability quote and the "what would you lose" sentence as taunt material), **QuestGenerator** (biases daily quest distribution toward the 90-day priority), and **Chronos** (uses the "I run out of time" answer shape to pick its audit language).

---

*If generation comes back online, the rest of the architecture trace (event cascade, OperatorContext object, retention phases) lives in the previous message thread. Ask and I'll regenerate or rewrite it to file.*
