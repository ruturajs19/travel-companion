export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  corsOrigins: string[];
  apiPrefix: string;
  databaseUrl: string;
  auth: AuthConfig;
  ai: AiConfig;
  cloudinary?: CloudinaryConfig;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface AuthConfig {
  accessTokenSecret: string;
  accessTokenTtl: number;
  refreshTokenSecret: string;
  refreshTokenTtl: number;
  oauth: OAuthConfig;
}

export interface AiConfig {
  provider: 'gemini' | 'mock';
  geminiApiKey: string;
  model: string;
  embeddingModel: string;
  embeddingDimensions: number;
  perMinute: number;
  perDay: number;
  cacheTtlSeconds: number;
}

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface OAuthConfig {
  successRedirect: string;
  failureRedirect: string;
  google?: OAuthProviderConfig;
  github?: OAuthProviderConfig;
}

function loadOAuthProvider(
  idVar: string,
  secretVar: string,
  callbackVar: string,
  defaultCallback: string,
): OAuthProviderConfig | undefined {
  const clientId = process.env[idVar];
  const clientSecret = process.env[secretVar];
  const callback = process.env[callbackVar] || defaultCallback;
  if (!clientId || !clientSecret || !callback) {
    return undefined;
  }
  return {
    clientId,
    clientSecret,
    callbackUrl: callback,
  };
}

export function loadConfiguration(): AppConfig {
  const nodeEnv =
    (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development';
  const port = parseInt(process.env.PORT || '3001');
  const corsOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return {
    nodeEnv,
    port: Number.isNaN(port) ? 3001 : port,
    corsOrigins,
    apiPrefix: process.env.API_PREFIX || 'api',
    databaseUrl: process.env.DATABASE_URL || '',
    auth: {
      accessTokenSecret:
        process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
      accessTokenTtl: parseInt(process.env.JWT_ACCESS_TTL || '900'),
      refreshTokenSecret:
        process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
      refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TTL || '2592000'),
      oauth: {
        successRedirect:
          process.env.OAUTH_SUCCESS_REDIRECT ||
          'http://localhost:3000/auth/callback',
        failureRedirect:
          process.env.OAUTH_FAILURE_REDIRECT || 'http://localhost:3000/sign-in',
        google: loadOAuthProvider(
          'GOOGLE_CLIENT_ID',
          'GOOGLE_CLIENT_SECRET',
          'GOOGLE_CALLBACK_URL',
          'http://localhost:3001/api/auth/google/callback',
        ),
        github: loadOAuthProvider(
          'GITHUB_CLIENT_ID',
          'GITHUB_CLIENT_SECRET',
          'GITHUB_CALLBACK_URL',
          'http://localhost:3001/api/auth/github/callback',
        ),
      },
    },
    ai: {
      provider:
        (process.env.AI_PROVIDER as AiConfig['provider']) ??
        (process.env.GEMINI_API_KEY ? 'gemini' : 'mock'),
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      embeddingModel:
        process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
      embeddingDimensions: parseInt(process.env.GEMINI_EMBEDDING_DIMS || '768'),
      perMinute: parseInt(process.env.AI_RATE_PER_MINUTE || '10'),
      perDay: parseInt(process.env.AI_RATE_PER_DAY || '200'),
      cacheTtlSeconds: parseInt(process.env.AI_CACHE_TTL || '86400'),
    },
    cloudinary:
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
        ? {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
          }
        : undefined,
  };
}

export function assertProductionConfig(config: AppConfig): void {
  if (config.nodeEnv !== 'production') return;

  const missing: string[] = [];
  if (!process.env.JWT_ACCESS_SECRET) missing.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (missing.length > 0) {
    throw new Error(`Missing PROD env vars: ${missing.join(', ')}`);
  }
}
