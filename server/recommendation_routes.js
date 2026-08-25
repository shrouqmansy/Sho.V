import express from 'express';
import crypto from 'crypto';
import { query } from './db.js';
import { HybridRecommendationEngine } from './recommendations/recommendation_engine.js';
import { rebuildUserPreferenceProfile } from './recommendations/user_preference_builder.js';

const router = express.Router();
const engine = new HybridRecommendationEngine();

// 1. POST /api/recommendations/events (Track User Behavior Event)
router.post('/recommendations/events', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      productId,
      variantId,
      skuId,
      eventType,
      searchQuery,
      category,
      color,
      size,
      brand,
      price,
      metadata
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    if (!eventType) {
      return res.status(400).json({ success: false, error: 'eventType is required' });
    }

    const eventId = `evt_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    await query(
      `INSERT INTO user_events (id, user_id, session_id, product_id, color, size, sku_id, event_type, search_query, category, brand, price, metadata, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
      [
        eventId,
        userId || null,
        sessionId,
        productId || null,
        color || null,
        size || null,
        skuId || null,
        eventType,
        searchQuery || null,
        category || null,
        brand || null,
        price ? parseFloat(price) : null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    // Asynchronously update user preference profile (non-blocking)
    const targetId = userId || sessionId;
    const isUser = Boolean(userId);
    setImmediate(() => {
      rebuildUserPreferenceProfile(targetId, isUser).catch(e => {
        console.warn('[Event Tracker Profile Error]:', e.message);
      });
    });

    res.status(201).json({ success: true, eventId });
  } catch (err) {
    console.error('API Error /api/recommendations/events:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const recCache = new Map();
const REC_CACHE_TTL = 60000; // 60 seconds

// 2. GET /api/recommendations/for-you
router.get('/recommendations/for-you', async (req, res) => {
  try {
    const { userId, sessionId, limit } = req.query;
    const targetId = userId || sessionId || 'anonymous';
    const isUser = Boolean(userId);
    const cacheKey = `for_you_${targetId}_${limit || 12}`;

    const now = Date.now();
    if (recCache.has(cacheKey) && (now - recCache.get(cacheKey).ts < REC_CACHE_TTL)) {
      const recommendations = recCache.get(cacheKey).data;
      return res.json({ success: true, type: 'for_you', count: recommendations.length, recommendations });
    }

    const recommendations = await engine.generateRecommendations({
      userOrSessionId: targetId,
      isUser,
      type: 'for_you',
      limit: limit ? parseInt(limit, 10) : 12
    });

    recCache.set(cacheKey, { ts: now, data: recommendations });

    // Track impressions asynchronously
    setImmediate(() => {
      trackImpressions(targetId, isUser, 'for_you', recommendations);
    });

    res.json({ success: true, type: 'for_you', count: recommendations.length, recommendations });
  } catch (err) {
    console.error('API Error /api/recommendations/for-you:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. GET /api/recommendations/similar/:productId
router.get('/recommendations/similar/:productId', async (req, res) => {
  try {
    const { userId, sessionId, limit } = req.query;
    const targetId = userId || sessionId || 'anonymous';
    const isUser = Boolean(userId);

    const recommendations = await engine.generateRecommendations({
      userOrSessionId: targetId,
      isUser,
      type: 'similar',
      sourceProductId: req.params.productId,
      limit: limit ? parseInt(limit, 10) : 8
    });

    setImmediate(() => {
      trackImpressions(targetId, isUser, 'similar', recommendations);
    });

    res.json({ success: true, type: 'similar', count: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. GET /api/recommendations/from-wishlist
router.get('/recommendations/from-wishlist', async (req, res) => {
  try {
    const { userId, sessionId, limit } = req.query;
    const targetId = userId || sessionId || 'anonymous';
    const isUser = Boolean(userId);

    const recommendations = await engine.generateRecommendations({
      userOrSessionId: targetId,
      isUser,
      type: 'wishlist',
      limit: limit ? parseInt(limit, 10) : 8
    });

    res.json({ success: true, type: 'wishlist', count: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET /api/recommendations/from-history
router.get('/recommendations/from-history', async (req, res) => {
  try {
    const { userId, sessionId, limit } = req.query;
    const targetId = userId || sessionId || 'anonymous';
    const isUser = Boolean(userId);

    const recommendations = await engine.generateRecommendations({
      userOrSessionId: targetId,
      isUser,
      type: 'history',
      limit: limit ? parseInt(limit, 10) : 8
    });

    res.json({ success: true, type: 'history', count: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET /api/recommendations/trending (Cold-start fallback)
router.get('/recommendations/trending', async (req, res) => {
  try {
    const { limit } = req.query;
    const recommendations = await engine.generateRecommendations({
      userOrSessionId: 'anonymous',
      isUser: false,
      type: 'trending',
      limit: limit ? parseInt(limit, 10) : 12
    });

    res.json({ success: true, type: 'trending', count: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET /api/recommendations/analytics (Admin Recommendation Conversion & CTR Metrics)
router.get('/api/recommendations/analytics', async (req, res) => {
  try {
    const totalImpressions = await query(`SELECT COUNT(*) FROM recommendation_analytics WHERE action = 'IMPRESSION'`);
    const totalClicks = await query(`SELECT COUNT(*) FROM recommendation_analytics WHERE action = 'CLICK'`);
    const totalConversions = await query(`SELECT COUNT(*) FROM recommendation_analytics WHERE action IN ('CART_CONVERSION', 'PURCHASE_CONVERSION')`);

    const impCount = parseInt(totalImpressions.rows[0].count, 10);
    const clickCount = parseInt(totalClicks.rows[0].count, 10);
    const convCount = parseInt(totalConversions.rows[0].count, 10);

    const ctr = impCount > 0 ? parseFloat(((clickCount / impCount) * 100).toFixed(2)) : 0;
    const convRate = clickCount > 0 ? parseFloat(((convCount / clickCount) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      metrics: {
        impressions: impCount,
        clicks: clickCount,
        conversions: convCount,
        ctr_percent: ctr,
        conversion_rate_percent: convRate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function trackImpressions(targetId, isUser, type, recommendations) {
  try {
    for (const rec of recommendations) {
      const id = `anl_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
      await query(
        `INSERT INTO recommendation_analytics (id, user_id, session_id, recommendation_type, product_id, action, timestamp)
         VALUES ($1, $2, $3, $4, $5, 'IMPRESSION', NOW())`,
        [id, isUser ? targetId : null, targetId, type, rec.product.id]
      );
    }
  } catch (e) {}
}

export default router;
