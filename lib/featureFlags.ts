// Feature flags for MVP
// Control which features are enabled/disabled via environment variables

export const featureFlags = {
  blog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
  affiliate: process.env.NEXT_PUBLIC_ENABLE_AFFILIATE === 'true',
  advancedAnalytics: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS === 'true',
  pwa: process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false', // Default true
};

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}

// Type-safe feature names
export type FeatureName = keyof typeof featureFlags;
























