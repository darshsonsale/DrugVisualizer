import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deterministically compute backend root and project root regardless of process.cwd()
export const backendDir = path.resolve(__dirname, '../..');
export const projectRootDir = path.resolve(backendDir, '..');

// Candidates for .env in order of priority:
// 1. backend/.env (local backend overrides)
// 2. process.cwd()/.env (if executed from somewhere with a specific .env)
// 3. projectRootDir/.env (shared workspace environment)
const candidatePaths = [
  path.resolve(backendDir, '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(projectRootDir, '.env')
];

const loadedPaths = new Set<string>();

for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate) && !loadedPaths.has(candidate)) {
    dotenv.config({ path: candidate });
    loadedPaths.add(candidate);
  }
}

export interface AuthConfig {
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  adminEmails: string[];
}

export interface AppConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;
  corsOrigin: string[] | string | boolean;
  apiPrefix: string;
  auth: AuthConfig;
}

function parseCorsOrigins(rawOrigin?: string): string[] | string {
  if (!rawOrigin || rawOrigin.trim() === '') {
    // Sensible development defaults supporting common Vite ports
    return ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
  }
  if (rawOrigin.includes(',')) {
    return rawOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
  }
  return rawOrigin.trim();
}

function parsePort(rawPort?: string): number {
  if (!rawPort) return 3000;
  const parsed = parseInt(rawPort, 10);
  return Number.isNaN(parsed) ? 3000 : parsed;
}

const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
const port = parsePort(process.env.PORT);
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Warn if JWT_SECRET is unconfigured in production
const jwtSecret =
  process.env.JWT_SECRET ||
  (nodeEnv === 'production' ? '' : 'development-insecure-jwt-secret-must-be-min-32-chars');

if (nodeEnv === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  console.warn('[Security Warning] JWT_SECRET is not configured or too short for production use.');
}

const rawAdminEmails = process.env.ADMIN_EMAILS || 'admin@biolumen.org,demo.admin@biolumen.org';
const parsedAdminEmails = rawAdminEmails
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const config: AppConfig = Object.freeze({
  port,
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),
  apiPrefix,
  auth: Object.freeze({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri:
      process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}${apiPrefix}/auth/google/callback`,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    adminEmails: parsedAdminEmails
  })
});

