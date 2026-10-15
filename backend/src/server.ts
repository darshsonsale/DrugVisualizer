import http from 'node:http';
import { app } from './app.js';
import { config } from './config/index.js';

// Server instance for Drug Path Visualiser backend

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`[Drug Path Visualiser Backend] Server is running in ${config.env} mode.`);
  console.log(`[Drug Path Visualiser Backend] Listening on http://localhost:${config.port}`);
  console.log(`[Drug Path Visualiser Backend] Health check available at: http://localhost:${config.port}${config.apiPrefix}/health`);
});

// Graceful shutdown handling
function handleShutdown(signal: string) {
  console.log(`\n[Drug Path Visualiser Backend] Received ${signal}. Shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      console.error('[Drug Path Visualiser Backend] Error during server close:', err);
      process.exit(1);
    }
    console.log('[Drug Path Visualiser Backend] HTTP server closed cleanly. Process exiting.');
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
