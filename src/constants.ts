/**
 * NEXUS Game Balance Constants
 * Core tuning parameters for reward/penalty calculations.
 * Centralized here to allow cross-module imports and easy balancing.
 */

// Neural Credits (NC) rewards
export const NC_PER_TASK = 10;
export const NC_PER_QUEST_BASE = 50;
export const NC_PER_READ_SESSION = 25;
export const NC_PER_STREAK_3 = 50;
export const NC_PER_STREAK_7 = 200;
export const NC_PER_STREAK_30 = 1000;
export const NC_PERFECT_WEEK = 300;
export const NC_MISS_PENALTY_BASE = 10;

// Experience (EXP) rewards
export const EXP_PER_TASK = 15;
export const EXP_PER_QUEST = 50;
export const EXP_PER_READ_SESSION = 30;
