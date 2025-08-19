export const flags = {
  push: process.env.ENABLE_PUSH === 'true',
  reviews: process.env.ENABLE_REVIEWS === 'true',
  share: process.env.ENABLE_SHARE === 'true',
  leaderboard: process.env.ENABLE_LEADERBOARD === 'true',
  deeplinks: process.env.ENABLE_DEEP_LINKS === 'true',
  analytics: process.env.ENABLE_ANALYTICS === 'true',
} as const;

export type FeatureFlag = keyof typeof flags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flags[flag];
}

export function getFeatureFlags() {
  return { ...flags };
}
