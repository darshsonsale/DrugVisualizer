import type { PoolConfig } from 'pg';
import './env.js'; // Ensure env is loaded

export interface DatabaseConfig {
  connectionString?: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

function parseDbPort(rawPort?: string): number {
  if (!rawPort) return 5432;
  const parsed = parseInt(rawPort, 10);
  return Number.isNaN(parsed) ? 5432 : parsed;
}

function cleanCredential(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  // Strip placeholder patterns like <your-db-password>
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) return undefined;
  if (trimmed === '') return undefined;
  return trimmed;
}

const rawDatabaseUrl = cleanCredential(process.env.DATABASE_URL);
const hasValidFullUrl = Boolean(rawDatabaseUrl && rawDatabaseUrl.startsWith('postgresql://'));

const resolvedUser = cleanCredential(process.env.DB_USER) || 'postgres';
const resolvedPassword = cleanCredential(process.env.DB_PASSWORD);

export const dbConfig: DatabaseConfig = Object.freeze({
  connectionString: hasValidFullUrl ? rawDatabaseUrl : undefined,
  host: process.env.DB_HOST?.trim() || 'localhost',
  port: parseDbPort(process.env.DB_PORT),
  database: process.env.DB_NAME?.trim() || 'drug_visualizer_dev',
  user: resolvedUser,
  password: resolvedPassword,
  ssl: process.env.DB_SSL === 'true',
  maxConnections: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export function getSanitizedConnectionSummary(): string {
  if (dbConfig.connectionString) {
    try {
      const parsed = new URL(dbConfig.connectionString);
      return `URL: ${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}`;
    } catch {
      return 'URL: postgresql://***@configured-url';
    }
  }

  const hasPassword = Boolean(dbConfig.password && dbConfig.password.length > 0);
  return `${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (password: ${hasPassword ? 'configured' : 'NOT SET'}, ssl: ${dbConfig.ssl})`;
}

export function validateDatabaseConfig(): { valid: boolean; warning?: string } {
  if (dbConfig.connectionString) {
    return { valid: true };
  }

  if (!dbConfig.password) {
    return {
      valid: true,
      warning: 'DB_PASSWORD is empty or undefined. If your PostgreSQL instance requires password authentication, set DB_PASSWORD in backend/.env.'
    };
  }

  return { valid: true };
}

export function getPoolConfig(): PoolConfig {
  if (dbConfig.connectionString) {
    return {
      connectionString: dbConfig.connectionString,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
      max: dbConfig.maxConnections,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
    };
  }

  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password ?? '',
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    max: dbConfig.maxConnections,
    idleTimeoutMillis: dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
  };
}
