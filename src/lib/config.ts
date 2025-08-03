/**
 * Centralized configuration file for environment variables
 * This file validates and exports all environment variables used throughout the app
 */

// AI Configuration - Support multiple key names for better compatibility
export const AI_CONFIG = {
  // Check for multiple possible API key environment variable names
  apiKey:
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY,
  hasApiKey: Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY,
  ),
  model: "googleai/gemini-2.0-flash",
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  databaseUrl: process.env.DATABASE_URL,
};

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  publicCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  hasConfig: Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  ),
};

// App Configuration
export const APP_CONFIG = {
  nodeEnv: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
};

// Configuration validation function
export function validateConfig() {
  const issues: string[] = [];

  // Check Supabase configuration
  if (!SUPABASE_CONFIG.url) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is missing");
  }
  if (!SUPABASE_CONFIG.anonKey) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  }

  // Check AI configuration (optional for demo mode)
  if (!AI_CONFIG.hasApiKey && !APP_CONFIG.demoMode) {
    issues.push(
      "AI API key is missing (GEMINI_API_KEY, GOOGLE_GENAI_API_KEY, or GOOGLE_AI_API_KEY)",
    );
  }

  // Check Cloudinary configuration (optional)
  if (!CLOUDINARY_CONFIG.hasConfig) {
    //do nothing
  }

  // Check Google OAuth (optional)
  if (!GOOGLE_CONFIG.clientId) {
    //do nothing
  }

  return {
    isValid: issues.length === 0,
    issues,
    configs: {
      supabase: {
        hasUrl: Boolean(SUPABASE_CONFIG.url),
        hasAnonKey: Boolean(SUPABASE_CONFIG.anonKey),
        hasDatabaseUrl: Boolean(SUPABASE_CONFIG.databaseUrl),
      },
      ai: {
        hasApiKey: AI_CONFIG.hasApiKey,
        keySource: AI_CONFIG.hasApiKey
          ? process.env.GEMINI_API_KEY
            ? "GEMINI_API_KEY"
            : process.env.GOOGLE_GENAI_API_KEY
              ? "GOOGLE_GENAI_API_KEY"
              : "GOOGLE_AI_API_KEY"
          : "none",
      },
      cloudinary: {
        hasConfig: CLOUDINARY_CONFIG.hasConfig,
        hasCloudName: Boolean(CLOUDINARY_CONFIG.cloudName),
        hasApiKey: Boolean(CLOUDINARY_CONFIG.apiKey),
        hasApiSecret: Boolean(CLOUDINARY_CONFIG.apiSecret),
      },
      google: {
        hasClientId: Boolean(GOOGLE_CONFIG.clientId),
      },
      app: {
        environment: APP_CONFIG.nodeEnv,
        demoMode: APP_CONFIG.demoMode,
      },
    },
  };
}

// Log configuration status on import (only in development)
if (APP_CONFIG.isDevelopment) {
  const validation = validateConfig();
  if (validation.issues.length > 0) {
    //do nothing
  } else {
  }
}
