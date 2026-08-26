import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, getAllProductsFromDb, getProductWithRelations } from './db.js';
import { initAuthDb } from './db_auth_schema.js';
import { initInventoryDb } from './db_inventory_schema.js';
import { initRecommendationsDb } from './db_recommendations_schema.js';
import { cleanupExpiredReservations } from './inventory_service.js';
import authRoutes from './auth_routes.js';
import inventoryRoutes from './inventory_routes.js';
import recommendationRoutes from './recommendation_routes.js';
import { seedProducts } from './seed.js';
import { searchOrDiscoverProducts, getSourceStatus } from './search_service.js';
import { handleImageThumbnailProxy } from './image_proxy.js';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', recommendationRoutes);

// GET /api/images/thumbnail - Controlled Cached Image Proxy Endpoint
app.get('/api/images/thumbnail', handleImageThumbnailProxy);

// GET /api/products - Get all products from PostgreSQL
app.get('/api/products', async (req, res) => {
  try {
    const { category, limit, offset } = req.query;
    const products = await getAllProductsFromDb({
      category,
      limit: limit ? parseInt(limit, 10) : 12,
      offset: offset ? parseInt(offset, 10) : 0
    });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('API Error /api/products:', err.stack || err);
    res.status(500).json({ success: false, error: err.message || 'Database error fetching products' });
  }
});

// GET /api/products/search?q=<query> - PostgreSQL Search + Product Discovery Service
app.get('/api/products/search', async (req, res) => {
  try {
    const queryStr = req.query.q || '';
    console.log(`[API Request] GET /api/products/search?q="${queryStr}"`);

    const result = await searchOrDiscoverProducts(queryStr);
    res.json({
      success: true,
      query: queryStr,
      isClothing: result.isClothing,
      source: result.source,
      triggeredAgent: result.triggeredAgent,
      count: result.products ? result.products.length : 0,
      products: result.products || [],
      message: result.message || null
    });
  } catch (err) {
    console.error('API Error /api/products/search:', err.stack || err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to search or discover products',
      products: []
    });
  }
});

// GET /api/sources/status - Expose status of marketplace sources
app.get('/api/sources/status', (req, res) => {
  res.json({ success: true, sources: getSourceStatus() });
});

// GET /api/products/:id - Get single product details from PostgreSQL
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductWithRelations(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found in PostgreSQL' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error(`API Error /api/products/${req.params.id}:`, err.stack || err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch product' });
  }
});

// POST /api/seed - Trigger Database Re-Seeding / Clear
app.post('/api/seed', async (req, res) => {
  try {
    await seedProducts();
    const products = await getAllProductsFromDb();
    res.json({ success: true, message: 'Database re-seeded successfully', count: products.length, products });
  } catch (err) {
    console.error('API Error /api/seed:', err.stack || err);
    res.status(500).json({ success: false, error: err.message || 'Failed to seed database' });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sho.V AI Recommendations, Inventory & Multi-Tenant SaaS Backend', time: new Date().toISOString() });
});

// Single-flight DB schema & dataset initialization for both local server and serverless environments
let dbInitPromise = null;

export async function ensureDbInitialized() {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      await initDb();
      await initAuthDb();
      await initInventoryDb();
      await initRecommendationsDb();
      let existing = await getAllProductsFromDb({ limit: 1 });
      if (existing.length === 0) {
        console.log('[Server Init] Database is empty. Auto-seeding catalog...');
        await seedProducts();
      }
      console.log('[Server Init] PostgreSQL database ready.');
    } catch (err) {
      dbInitPromise = null; // reset promise on failure to allow retry
      throw err;
    }
  })();

  return dbInitPromise;
}

export default app;
