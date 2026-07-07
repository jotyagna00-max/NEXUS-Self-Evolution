/**
 * NEXUS Game Balance Constants
 * Core tuning parameters for reward/penalty calculations.
 * v2.0 — Progression rebalanced: EXP curve is now n^3 * 20.
 * Rewards are reduced ~3-4x to make leveling meaningful.
 */

// Neural Credits (NC) rewards — reduced to make credits feel earned
export const NC_PER_TASK = 3;
export const NC_PER_QUEST_BASE = 15;
export const NC_PER_READ_SESSION = 8;
export const NC_PER_STREAK_3 = 20;
export const NC_PER_STREAK_7 = 75;
export const NC_PER_STREAK_30 = 400;
export const NC_PERFECT_WEEK = 100;
export const NC_MISS_PENALTY_BASE = 5;

// Experience (EXP) rewards — reduced to match harder n^3 * 20 curve
export const EXP_PER_TASK = 5;
export const EXP_PER_QUEST = 15;
export const EXP_PER_READ_SESSION = 10;
