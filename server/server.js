import app, { ensureDbInitialized } from './app.js';
import { cleanupExpiredReservations } from './inventory_service.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await ensureDbInitialized();

    // Start 60-second periodic background reservation cleanup worker
    setInterval(async () => {
      await cleanupExpiredReservations();
    }, 60000);

    app.listen(PORT, () => {
      console.log(`Sho.V AI Recommendation & Inventory API Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();
