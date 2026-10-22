import http from 'node:http';
import { app } from './app.js';
import { config, validateProductionConfig } from './config/index.js';
import { closePool } from './database/pool.js';

// Enforce production security and configuration invariants before binding port
if (config.isProduction) {
  const validation = validateProductionConfig();
  for (const warning of validation.warnings) {
    console.warn(`[Config Warning] ${warning}`);
  }
  if (!validation.valid) {
    console.error('\n[Drug Path Visualiser Backend] CRITICAL: Production configuration validation failed:');
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    console.error('[Drug Path Visualiser Backend] Startup ABORTED to prevent insecure execution.\n');
    process.exit(1);
  }
}

// Server instance for Drug Path Visualiser backend

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`[Drug Path Visualiser Backend] Server is running in ${config.env} mode.`);
  console.log(`[Drug Path Visualiser Backend] Listening on http://localhost:${config.port}`);
  console.log(`[Drug Path Visualiser Backend] Health check available at: http://localhost:${config.port}${config.apiPrefix}/health`);
});

// Graceful shutdown handling
async function handleShutdown(signal: string) {
  console.log(`\n[Drug Path Visualiser Backend] Received ${signal}. Shutting down gracefully...`);
  
  // Close idle keep-alive connections so server.close does not wait on inactive sockets
  if (typeof (server as any).closeIdleConnections === 'function') {
    (server as any).closeIdleConnections();
  }

  // Close HTTP server to stop accepting new requests
  server.close(async (err) => {
    if (err) {
      console.error('[Drug Path Visualiser Backend] Error during server close:', err);
      process.exit(1);
    }
    console.log('[Drug Path Visualiser Backend] HTTP server closed cleanly.');

    // Drain and close database pool
    try {
      await closePool();
      console.log('[Drug Path Visualiser Backend] PostgreSQL connection pool drained.');
    } catch (poolErr) {
      console.warn('[Drug Path Visualiser Backend] Warning during pool close:', poolErr);
    }

    console.log('[Drug Path Visualiser Backend] Process exiting cleanly.');
    process.exit(0);
  });

  // Force shutdown after timeout if pending connections don't drain
  setTimeout(() => {
    console.error('[Drug Path Visualiser Backend] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
