import app, { ensureDbInitialized } from '../server/app.js';

export default async function handler(req, res) {
  try {
    await ensureDbInitialized();
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Function Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
}
