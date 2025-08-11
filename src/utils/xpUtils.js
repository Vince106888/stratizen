// src/utils/xpUtils.js

// Maximum XP considered for each skill to normalize scores (can be adjusted)
const MAX_XP_PER_SKILL = 500;

// Calculate normalized skill score (0-100) for radar chart display
export function calculateSkillScore(currentXP) {
  if (!currentXP || currentXP <= 0) return 0;
  return Math.min((currentXP / MAX_XP_PER_SKILL) * 100, 100);
}

// Calculate total XP from the xp object (skill => xp)
export function calculateTotalXP(xpObj = {}) {
  return Object.values(xpObj).reduce((total, xp) => total + (xp || 0), 0);
}

// Calculate user level based on total XP using custom thresholds
export function calculateLevel(totalXP) {
  if (totalXP < 100) return 1;
  if (totalXP < 300) return 2;
  if (totalXP < 600) return 3;
  if (totalXP < 1000) return 4;
  if (totalXP < 1500) return 5;
  // For higher levels, every 300 XP is one level
  return Math.floor(totalXP / 300);
}

// Calculate rank string based on level
export function calculateRank(level) {
  if (level < 3) return "Bronze";
  if (level < 5) return "Silver";
  if (level < 7) return "Gold";
  return "Platinum";
}
