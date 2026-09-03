export type UniverseScoreInput = {
  apsScore: number;
  maxAps?: number;
  profileCompletion: number;
  xpPoints: number;
  maxXp?: number;
  portfolioItems: number;
  maxPortfolio?: number;
};

export type UniverseScoreResult = {
  score: number;
  tier: string;
  tierColor: string;
  breakdown: {
    academic: number;
    profile: number;
    engagement: number;
    portfolio: number;
  };
};

const TIERS: { min: number; label: string; color: string }[] = [
  { min: 901, label: "Universe Master", color: "#FE4A23" },
  { min: 751, label: "Scholar", color: "#774DFF" },
  { min: 601, label: "Achiever", color: "#A78BFF" },
  { min: 401, label: "Pathfinder", color: "#6366F1" },
  { min: 0, label: "Explorer", color: "#94A3B8" },
];

/** Composite score (0–1000) from APS, profile, XP, and portfolio */
export function calculateUniverseScore(input: UniverseScoreInput): UniverseScoreResult {
  const maxAps = input.maxAps ?? 42;
  const maxXp = input.maxXp ?? 500;
  const maxPortfolio = input.maxPortfolio ?? 10;

  const academic = Math.min(100, (input.apsScore / maxAps) * 100);
  const profile = Math.min(100, input.profileCompletion);
  const engagement = Math.min(100, (input.xpPoints / maxXp) * 100);
  const portfolio = Math.min(100, (input.portfolioItems / maxPortfolio) * 100);

  const composite = academic * 0.45 + profile * 0.25 + engagement * 0.15 + portfolio * 0.15;
  const score = Math.round(composite * 10);

  const tier = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];

  return {
    score,
    tier: tier.label,
    tierColor: tier.color,
    breakdown: {
      academic: Math.round(academic),
      profile: Math.round(profile),
      engagement: Math.round(engagement),
      portfolio: Math.round(portfolio),
    },
  };
}
