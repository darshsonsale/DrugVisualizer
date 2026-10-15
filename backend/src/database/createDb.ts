import pg from 'pg';
import { dbConfig, getSanitizedConnectionSummary } from '../config/database.js';

const { Client } = pg;

export async function createDatabaseIfNotExists(): Promise<boolean> {
  const targetDbName = dbConfig.database;

  console.log('===================================================');
  console.log(' Drug Path Visualiser - Database Initialization');
  console.log('===================================================');
  console.log(`Target: ${getSanitizedConnectionSummary()}`);

  // Connect to the default maintenance database 'postgres' to check/create the target database
  const maintenanceClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'postgres',
    user: dbConfig.user,
    password: dbConfig.password ?? '',
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
  });

  try {
    await maintenanceClient.connect();

    const checkRes = await maintenanceClient.query<{ datname: string }>(
      'SELECT datname FROM pg_database WHERE datname = $1;',
      [targetDbName]
    );

    if (checkRes.rows.length > 0) {
      console.log(`ℹ️  Database "${targetDbName}" already exists. No creation needed.`);
      console.log('===================================================\n');
      return true;
    }

    console.log(`▶ Creating database "${targetDbName}"...`);
    // PostgreSQL identifiers cannot be parameterized in DDL, so escape double quotes safely
    const safeDbName = targetDbName.replace(/"/g, '""');
    await maintenanceClient.query(`CREATE DATABASE "${safeDbName}";`);

    console.log(`✅ Database "${targetDbName}" created successfully!`);
    console.log('===================================================\n');
    return true;
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    console.error(`❌ Failed to create database "${targetDbName}":`);
    console.error(`   ${error.message}`);

    if (error.message.includes('SASL: SCRAM-SERVER-FIRST-MESSAGE') || error.message.includes('client password must be a string')) {
      console.log('👉 Hint: Set DB_PASSWORD in backend/.env before running database scripts.');
    }
    return false;
  } finally {
    try {
      await maintenanceClient.end();
    } catch {
      // Ignore disconnect errors
    }
  }
}

// Run immediately when executed directly
if (process.argv[1]?.endsWith('createDb.ts') || process.argv[1]?.endsWith('createDb.js')) {
  createDatabaseIfNotExists()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
