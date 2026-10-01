// Entry point.
// Loads env config, connects to MongoDB (Phase 3), mounts app.js,
// starts the HTTPS-ready HTTP server on PORT.
// TLS termination happens at the hosting platform in deployment (SEC-1).
import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function main() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[api] DepressionAlert AI backend listening on http://localhost:${config.port}/api`);
    console.log(`[api] CORS origin: ${config.clientUrl} · ML service: ${config.mlServiceUrl}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received — shutting down.`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (err) => {
  console.error('[api] Unhandled rejection:', err);
});

main().catch((err) => {
  console.error('[api] Startup failed:', err.message);
  process.exit(1);
});
