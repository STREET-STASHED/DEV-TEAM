// Production configuration and environment variables
export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  // Google Maps Configuration
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  },

  // Application Configuration
  app: {
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    websocketUrl:
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000",
    name: "StreetStashed",
    version: "1.0.0",
  },

  // Feature Flags
  features: {
    websockets: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === "true",
    googleMaps: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_MAPS === "true",
    stripe: process.env.NEXT_PUBLIC_ENABLE_STRIPE === "true",
    pushNotifications:
      process.env.NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === "true",
  },

  // Environment
  env: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Email
  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },

  // Storage
  storage: {
    bucket: process.env.STORAGE_BUCKET!,
    region: process.env.STORAGE_REGION || "us-east-1",
  },

  // Analytics
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },
};

// Validation function to ensure all required config is present
export const validateConfig = () => {
  const required = [
    "supabase.url",
    "supabase.anonKey",
    "stripe.publishableKey",
    "stripe.secretKey",
    "googleMaps.apiKey",
  ];

  const missing: string[] = [];

  required.forEach((key) => {
    const value = key.split(".").reduce((obj: Record<string, unknown>, k) => {
      return (obj as Record<string, unknown>)?.[k] as Record<string, unknown>;
    }, config as Record<string, unknown>);
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }

  return true;
};

// Feature flag helpers
export const isFeatureEnabled = (
  feature: keyof typeof config.features,
): boolean => {
  return config.features[feature];
};

// Environment helpers
export const isDevelopment = (): boolean => config.env.isDevelopment;
export const isProduction = (): boolean => config.env.isProduction;
export const isTest = (): boolean => config.env.isTest;

// Configuration for different environments
export const getEnvironmentConfig = () => {
  if (isProduction()) {
    return {
      ...config,
      app: {
        ...config.app,
        url: "https://streetstashed.com",
        websocketUrl: "wss://streetstashed.com",
      },
      features: {
        ...config.features,
        websockets: true,
        googleMaps: true,
        stripe: true,
        pushNotifications: true,
      },
    };
  }

  if (isDevelopment()) {
    return {
      ...config,
      features: {
        ...config.features,
        websockets: true,
        googleMaps: true,
        stripe: true,
        pushNotifications: true,
      },
    };
  }

  return config;
};
