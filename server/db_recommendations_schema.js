import { query } from './db.js';

export async function initRecommendationsDb() {
  console.log('Setting up Recommendation System PostgreSQL schemas...');

  await query(`
    CREATE TABLE IF NOT EXISTS user_events (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      session_id VARCHAR(64) NOT NULL,
      product_id VARCHAR(64),
      color VARCHAR(50),
      size VARCHAR(20),
      sku_id VARCHAR(64),
      event_type VARCHAR(50) NOT NULL,
      search_query TEXT,
      category VARCHAR(100),
      brand VARCHAR(100),
      price NUMERIC,
      metadata JSONB,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_preference_profiles (
      user_or_session_id VARCHAR(64) PRIMARY KEY,
      is_user BOOLEAN DEFAULT false,
      category_scores JSONB DEFAULT '{}',
      color_scores JSONB DEFAULT '{}',
      brand_scores JSONB DEFAULT '{}',
      price_min NUMERIC DEFAULT 0,
      price_max NUMERIC DEFAULT 100000,
      price_avg NUMERIC DEFAULT 0,
      total_events_count INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS recommendation_analytics (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      session_id VARCHAR(64) NOT NULL,
      recommendation_type VARCHAR(50) NOT NULL,
      product_id VARCHAR(64) NOT NULL,
      action VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS recommendation_config (
      key VARCHAR(64) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Indexes for high performance lookup
  await query(`CREATE INDEX IF NOT EXISTS idx_user_events_session ON user_events(session_id, timestamp);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id, timestamp);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_user_events_product ON user_events(product_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_rec_analytics_action ON recommendation_analytics(action, recommendation_type);`);

  // Seed default configurable weights if not present
  await seedDefaultConfig();

  console.log('Recommendation System PostgreSQL schemas ready.');
}

async function seedDefaultConfig() {
  const defaultEventWeights = {
    PURCHASE: 10.0,
    WISHLIST_ADD: 8.0,
    CART_ADD: 7.0,
    COLOR_SELECTED: 4.0,
    SIZE_SELECTED: 3.0,
    PRODUCT_VIEW: 3.0,
    PRODUCT_CLICK: 3.0,
    SEARCH: 2.0,
    CHECKOUT_START: 5.0,
    WISHLIST_REMOVE: -5.0,
    CART_REMOVE: -4.0
  };

  const defaultHybridWeights = {
    content_similarity: 0.30,
    user_preferences: 0.25,
    behavior: 0.20,
    collaborative: 0.10,
    popularity: 0.10,
    freshness: 0.05
  };

  await query(
    `INSERT INTO recommendation_config (key, value, updated_at)
     VALUES ('event_weights', $1, NOW())
     ON CONFLICT (key) DO NOTHING`,
    [JSON.stringify(defaultEventWeights)]
  );

  await query(
    `INSERT INTO recommendation_config (key, value, updated_at)
     VALUES ('hybrid_weights', $1, NOW())
     ON CONFLICT (key) DO NOTHING`,
    [JSON.stringify(defaultHybridWeights)]
  );
}
