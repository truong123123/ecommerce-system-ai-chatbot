/**
 * Validated Environment Variables Configuration
 * Ensures strict enforcement of API URLs in production without insecure localhost fallbacks.
 * Allows deliberate local builds against localhost via ALLOW_LOCAL_API=true.
 */

export function validateApiBaseUrl(env: {
  NODE_ENV?: string;
  NEXT_PUBLIC_API_URL?: string;
  API_BASE_URL?: string;
  BACKEND_INTERNAL_URL?: string;
  ALLOW_LOCAL_API?: string;
} = process.env): string {
  const nodeEnv = env.NODE_ENV || 'development';
  const isServer = typeof window === 'undefined';
  const internalUrl = env.BACKEND_INTERNAL_URL || (env === process.env ? process.env.BACKEND_INTERNAL_URL : undefined);
  const envUrl = (isServer && internalUrl)
    ? internalUrl
    : (env.NEXT_PUBLIC_API_URL || env.API_BASE_URL);

  if (nodeEnv === 'production') {
    if (!envUrl) {
      throw new Error(
        'CRITICAL CONFIG ERROR: NEXT_PUBLIC_API_URL or API_BASE_URL environment variable is missing in production. Please configure NEXT_PUBLIC_API_URL in your production environment settings.'
      );
    }

    const allowLocal = env.ALLOW_LOCAL_API === 'true';
    if (!allowLocal && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      throw new Error(
        `INSECURE CONFIG ERROR: Production API_BASE_URL cannot point to localhost (${envUrl}). Set ALLOW_LOCAL_API=true if you are intentionally building locally against a local backend.`
      );
    }

    return envUrl.replace(/\/+$/, '');
  }

  // Development & Test fallback
  return (envUrl || 'http://localhost:8080/api/v1').replace(/\/+$/, '');
}

export const API_BASE_URL = validateApiBaseUrl();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_DEV: process.env.NODE_ENV !== 'production',
  API_BASE_URL,
} as const;
