import { getPool, closePool } from './pool.js';
import { dbConfig, getSanitizedConnectionSummary, validateDatabaseConfig } from '../config/database.js';

export async function checkConnection(): Promise<boolean> {
  console.log('===================================================');
  console.log(' Drug Path Visualiser - PostgreSQL Connection Check');
  console.log('===================================================');
  console.log(`Target: ${getSanitizedConnectionSummary()}`);

  const validation = validateDatabaseConfig();
  if (validation.warning) {
    console.warn(`⚠️  Notice: ${validation.warning}\n`);
  }

  const pool = getPool();

  try {
    const client = await pool.connect();
    try {
      const res = await client.query<{ version: string; current_database: string; current_user: string }>(
        'SELECT version(), current_database(), current_user;'
      );
      const row = res.rows[0];
      console.log('✅ Connection verified successfully!');
      console.log(`   Connected Database: ${row.current_database}`);
      console.log(`   Connected User:     ${row.current_user}`);
      console.log(`   Server Version:     ${row.version.split(',')[0]}`);
      console.log('===================================================\n');
      return true;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    console.error('❌ Connection failed!');
    console.error(`   Error Code:    ${error.code || 'AUTH_OR_NETWORK_ERROR'}`);
    console.error(`   Raw Message:   ${error.message}`);

    console.log('\n--- Diagnostic Advice ---');
    if (error.message.includes('SASL: SCRAM-SERVER-FIRST-MESSAGE') || error.message.includes('client password must be a string')) {
      console.log('🔍 Cause: PostgreSQL server requires SCRAM-SHA-256 password authentication, but no password was provided (DB_PASSWORD was empty or undefined).');
      console.log('👉 Solution: Add your database password to backend/.env:');
      console.log(`   DB_USER=${dbConfig.user}`);
      console.log('   DB_PASSWORD=your_actual_postgres_password');
    } else if (error.code === '28P01' || error.message.includes('password authentication failed')) {
      console.log(`🔍 Cause: Password authentication failed for user "${dbConfig.user}".`);
      console.log('👉 Solution: Check that DB_PASSWORD in backend/.env matches your PostgreSQL user password.');
    } else if (error.code === '3D000' || error.message.includes('does not exist')) {
      console.log(`🔍 Cause: The database "${dbConfig.database}" does not exist on this PostgreSQL instance.`);
      console.log(`👉 Solution: Create the database with:`);
      console.log(`   npm run db:create`);
      console.log(`   (or manually run: CREATE DATABASE ${dbConfig.database};)`);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log(`🔍 Cause: Could not reach PostgreSQL server at ${dbConfig.host}:${dbConfig.port}.`);
      console.log('👉 Solution: Confirm that the PostgreSQL service is running and listening on port 5432.');
    } else {
      console.log('👉 Solution: Review your database configuration in backend/.env.');
    }
    console.log('-------------------------\n');

    return false;
  } finally {
    await closePool();
  }
}

// Run immediately when executed directly
if (process.argv[1]?.endsWith('checkConnection.ts') || process.argv[1]?.endsWith('checkConnection.js')) {
  checkConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('[Database Check] Fatal error:', err);
      process.exit(1);
    });
}
