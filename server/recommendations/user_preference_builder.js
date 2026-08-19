import { query } from '../db.js';

const DEFAULT_EVENT_WEIGHTS = {
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

export async function getEventWeights() {
  try {
    const res = await query(`SELECT value FROM recommendation_config WHERE key = 'event_weights'`);
    if (res.rows.length > 0) {
      return typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
    }
  } catch (err) {
    console.warn('[PreferenceBuilder] Warning fetching config weights:', err.message);
  }
  return DEFAULT_EVENT_WEIGHTS;
}

/**
 * Exponential 14-day half-life decay function
 * Today = 1.0, 7d = ~0.707, 14d = 0.5, 30d = ~0.228
 */
export function computeTimeDecayedWeight(eventTimestamp, halfLifeDays = 14) {
  const eventDate = new Date(eventTimestamp);
  const now = new Date();
  const daysElapsed = Math.max(0, (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.exp((-Math.LN2 * daysElapsed) / halfLifeDays);
}

/**
 * Normalizes dictionary values to max scale 1.0
 */
function normalizeScores(scoreDict) {
  const keys = Object.keys(scoreDict);
  if (keys.length === 0) return {};
  const maxVal = Math.max(...Object.values(scoreDict));
  if (maxVal <= 0) return {};

  const normalized = {};
  for (const k of keys) {
    if (scoreDict[k] > 0) {
      normalized[k] = parseFloat((scoreDict[k] / maxVal).toFixed(3));
    }
  }
  return normalized;
}

/**
 * Rebuild user preference profile from PostgreSQL events with 14-day exponential half-life time decay
 */
export async function rebuildUserPreferenceProfile(userOrSessionId, isUser = false) {
  if (!userOrSessionId) return null;

  const eventWeights = await getEventWeights();

  let sql = `
    SELECT e.event_type, e.category, e.color, e.brand, e.price, e.timestamp, p.category AS prod_cat, p.brand AS prod_brand
    FROM user_events e
    LEFT JOIN products p ON e.product_id = p.id
  `;
  const params = [userOrSessionId];

  if (isUser) {
    sql += ` WHERE e.user_id = $1`;
  } else {
    sql += ` WHERE e.session_id = $1`;
  }
  sql += ` ORDER BY e.timestamp DESC LIMIT 500`;

  const eventsRes = await query(sql, params);
  const events = eventsRes.rows;

  const categoryScores = {};
  const colorScores = {};
  const brandScores = {};
  const prices = [];

  for (const e of events) {
    const rawWeight = eventWeights[e.event_type] || 1.0;
    const timeDecay = computeTimeDecayedWeight(e.timestamp);
    const weight = rawWeight * timeDecay;

    // Category
    const cat = e.category || e.prod_cat;
    if (cat) {
      categoryScores[cat] = (categoryScores[cat] || 0) + weight;
    }

    // Color
    if (e.color && e.color.toLowerCase() !== 'default color') {
      colorScores[e.color] = (colorScores[e.color] || 0) + weight;
    }

    // Brand
    const br = e.brand || e.prod_brand;
    if (br) {
      brandScores[br] = (brandScores[br] || 0) + weight;
    }

    // Price
    if (e.price && !isNaN(parseFloat(e.price))) {
      prices.push(parseFloat(e.price));
    }
  }

  const normCategories = normalizeScores(categoryScores);
  const normColors = normalizeScores(colorScores);
  const normBrands = normalizeScores(brandScores);

  let priceMin = 0;
  let priceMax = 100000;
  let priceAvg = 0;

  if (prices.length > 0) {
    priceMin = Math.min(...prices);
    priceMax = Math.max(...prices);
    priceAvg = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
  }

  const profileData = {
    user_or_session_id: userOrSessionId,
    is_user: isUser,
    category_scores: normCategories,
    color_scores: normColors,
    brand_scores: normBrands,
    price_min: priceMin,
    price_max: priceMax,
    price_avg: priceAvg,
    total_events_count: events.length
  };

  await query(
    `INSERT INTO user_preference_profiles
     (user_or_session_id, is_user, category_scores, color_scores, brand_scores, price_min, price_max, price_avg, total_events_count, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (user_or_session_id) DO UPDATE SET
       is_user = EXCLUDED.is_user,
       category_scores = EXCLUDED.category_scores,
       color_scores = EXCLUDED.color_scores,
       brand_scores = EXCLUDED.brand_scores,
       price_min = EXCLUDED.price_min,
       price_max = EXCLUDED.price_max,
       price_avg = EXCLUDED.price_avg,
       total_events_count = EXCLUDED.total_events_count,
       updated_at = NOW()`,
    [
      userOrSessionId,
      isUser,
      JSON.stringify(normCategories),
      JSON.stringify(normColors),
      JSON.stringify(normBrands),
      priceMin,
      priceMax,
      priceAvg,
      events.length
    ]
  );

  return profileData;
}

export async function getUserPreferenceProfile(userOrSessionId, isUser = false) {
  if (!userOrSessionId) return null;

  const res = await query(`SELECT * FROM user_preference_profiles WHERE user_or_session_id = $1`, [userOrSessionId]);
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return {
      user_or_session_id: row.user_or_session_id,
      is_user: row.is_user,
      category_scores: typeof row.category_scores === 'string' ? JSON.parse(row.category_scores) : (row.category_scores || {}),
      color_scores: typeof row.color_scores === 'string' ? JSON.parse(row.color_scores) : (row.color_scores || {}),
      brand_scores: typeof row.brand_scores === 'string' ? JSON.parse(row.brand_scores) : (row.brand_scores || {}),
      price_min: parseFloat(row.price_min),
      price_max: parseFloat(row.price_max),
      price_avg: parseFloat(row.price_avg),
      total_events_count: row.total_events_count
    };
  }

  // If missing, build dynamically
  return await rebuildUserPreferenceProfile(userOrSessionId, isUser);
}
