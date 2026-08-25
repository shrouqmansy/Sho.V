import { query, getAllProductsFromDb, getProductWithRelations } from '../db.js';
import { getProductInventory } from '../inventory_service.js';
import { getUserPreferenceProfile, computeTimeDecayedWeight } from './user_preference_builder.js';

/**
 * Base Abstract Strategy Engine Interface for Recommendation Engines.
 * Allows replacing Hybrid Engine with Future ML Engines (Matrix Factorization, LightFM, XGBoost)
 * without rewriting APIs or frontend code.
 */
export class RecommendationEngine {
  async generateRecommendations(params) {
    throw new Error('generateRecommendations must be implemented by concrete subclass');
  }
}

/**
 * Concrete Production Hybrid Scoring Recommendation Engine
 */
export class HybridRecommendationEngine extends RecommendationEngine {

  /**
   * Main Recommendation Entrypoint
   */
  async generateRecommendations({
    userOrSessionId,
    isUser = false,
    type = 'for_you', // 'for_you', 'similar', 'wishlist', 'history', 'trending'
    sourceProductId = null,
    limit = 12
  }) {
    // 1. Fetch Configurable Hybrid Model Weights
    const weights = await this.getHybridModelWeights();

    // 2. Fetch User Preference Profile
    const profile = await getUserPreferenceProfile(userOrSessionId, isUser);

    // 3. Fetch Recent Session Events (Short-term session signals & Already-seen counts)
    const { sessionCategories, sessionColors, seenCounts, recentSearches } = await this.fetchRecentSessionContext(userOrSessionId, isUser);

    // 4. Fetch Active Wishlist Product IDs
    const wishlistProductIds = await this.fetchUserWishlistProducts(userOrSessionId, isUser);

    // 5. Candidate Generation: Fetch Catalog Products from PostgreSQL
    const allProducts = await getAllProductsFromDb({ limit: 400 });

    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // Source product object if type === 'similar'
    let sourceProduct = null;
    if (sourceProductId) {
      sourceProduct = await getProductWithRelations(sourceProductId);
    }

    // BULK FETCH 1: Fetch all SKU inventory for all candidates in 1 SINGLE BATCH QUERY
    const allSkusRes = await query(`
      SELECT ps.product_id, ps.id AS sku_id, ps.color_name, si.on_hand_quantity, si.reserved_quantity
      FROM product_skus ps
      JOIN sku_inventory si ON si.sku_id = ps.id
    `);

    const inventoryByProd = {};
    for (const row of allSkusRes.rows) {
      const avail = row.on_hand_quantity - row.reserved_quantity;
      if (avail > 0) {
        if (!inventoryByProd[row.product_id]) inventoryByProd[row.product_id] = [];
        inventoryByProd[row.product_id].push({
          sku_id: row.sku_id,
          color_name: row.color_name,
          available_quantity: avail
        });
      }
    }

    // BULK FETCH 2: Fetch collaborative counts for all products in 1 SINGLE BATCH QUERY
    const collabRes = await query(`
      SELECT product_id, COUNT(DISTINCT session_id) AS co_count
      FROM user_events
      WHERE event_type IN ('WISHLIST_ADD', 'CART_ADD', 'PURCHASE') AND product_id IS NOT NULL
      GROUP BY product_id
    `);
    const collabCounts = {};
    for (const row of collabRes.rows) {
      collabCounts[row.product_id] = parseInt(row.co_count, 10);
    }

    // 6. Calculate Hybrid Scores for Candidates
    const candidates = [];

    for (const prod of allProducts) {
      // Skip source product itself in similar recommendations
      if (sourceProductId && prod.id === sourceProductId) continue;

      // Fast in-memory Inventory Filter
      const availableVariants = inventoryByProd[prod.id] || [{ sku_id: `sku_${prod.id}_default`, color_name: 'Default Color', available_quantity: 10 }];

      // Color-Variant Selection: Choose variant matching user's preferred color, or first available
      const preferredColorName = this.selectBestVariantColor(prod, availableVariants, profile?.color_scores, sessionColors);
      const matchedVariant = availableVariants.find(
        v => v.color_name.toLowerCase() === preferredColorName.toLowerCase()
      ) || availableVariants[0];

      // --- SCORING MODULES ---
      // A. Content Similarity Score (0 to 1)
      const contentScore = sourceProduct
        ? this.computeContentSimilarity(sourceProduct, prod)
        : this.computeCatalogContentScore(prod, profile, recentSearches);

      // B. User Preference Score (0 to 1)
      const prefScore = this.computeUserPreferenceScore(prod, profile);

      // C. Short-term Session Behavior Boost (0 to 1)
      const sessionScore = this.computeSessionScore(prod, sessionCategories, sessionColors);

      // D. Fast Collaborative Signal Score (In-Memory)
      const coCount = collabCounts[prod.id] || 0;
      const collabScore = Math.min(1.0, coCount / 10.0);

      // E. Wishlist Signal Boost
      const wishlistBoost = wishlistProductIds.includes(prod.id) ? 0.3 : 0.0;

      // F. Popularity & Freshness Scores
      const popScore = Math.min(1.0, ((prod.review_count || 0) + (prod.rating || 4.0) * 10) / 100);
      const freshScore = prod.is_new ? 1.0 : 0.3;

      // G. Soft Already-Seen Penalty
      const seenCount = seenCounts[prod.id] || 0;
      const seenPenalty = Math.min(0.5, seenCount * 0.15);

      // H. Price Range Soft Penalty
      const pricePenalty = this.computePricePenalty(prod.price, profile);

      // --- HYBRID WEIGHTED AGGREGATION ---
      let rawScore = 0;

      if (type === 'trending') {
        rawScore = 0.5 * popScore + 0.3 * freshScore + 0.2 * prefScore;
      } else if (type === 'similar' && sourceProduct) {
        rawScore = 0.6 * contentScore + 0.2 * prefScore + 0.2 * popScore;
      } else if (type === 'wishlist') {
        rawScore = 0.5 * this.computeWishlistSimilarity(prod, wishlistProductIds, allProducts) + 0.3 * prefScore + 0.2 * popScore;
      } else {
        // Standard 'for_you' hybrid score
        rawScore =
          weights.content_similarity * contentScore +
          weights.user_preferences * prefScore +
          weights.behavior * sessionScore +
          weights.collaborative * collabScore +
          weights.popularity * popScore +
          weights.freshness * freshScore +
          wishlistBoost -
          seenPenalty -
          pricePenalty;
      }

      const finalScore = parseFloat(Math.max(0.01, rawScore).toFixed(3));

      // Construct Human-Readable Reason
      const reason = this.buildRecommendationReason(type, prod, sourceProduct, profile, wishlistProductIds);

      candidates.push({
        product: prod,
        score: finalScore,
        recommended_color: preferredColorName,
        matched_sku_id: matchedVariant.sku_id,
        available_quantity: matchedVariant.available_quantity,
        reason,
        matched_features: {
          category: Boolean(profile?.category_scores?.[prod.category]),
          color: Boolean(profile?.color_scores?.[preferredColorName]),
          price: pricePenalty === 0
        }
      });
    }

    // 7. Sort Candidates by Final Hybrid Score DESC
    candidates.sort((a, b) => b.score - a.score);

    // 8. Diversity Re-Ranking Filter (Enforce category balance)
    const reranked = this.applyDiversityFilter(candidates, profile);

    return reranked.slice(0, limit);
  }

  /**
   * Content Similarity between 2 products (Category, Colors, Brand, Price Range, Title)
   */
  computeContentSimilarity(p1, p2) {
    let score = 0;

    // Category match (0.4)
    if (p1.category && p2.category && p1.category.toLowerCase() === p2.category.toLowerCase()) {
      score += 0.4;
    }

    // Brand match (0.2)
    if (p1.brand && p2.brand && p1.brand.toLowerCase() === p2.brand.toLowerCase()) {
      score += 0.2;
    }

    // Price range match (0.2)
    const ratio = Math.min(p1.price, p2.price) / Math.max(p1.price, p2.price);
    if (ratio > 0.7) {
      score += 0.2 * ratio;
    }

    // Title overlap (0.2)
    const words1 = p1.name.toLowerCase().split(/\s+/);
    const words2 = p2.name.toLowerCase().split(/\s+/);
    const common = words1.filter(w => w.length > 3 && words2.includes(w));
    if (common.length > 0) {
      score += 0.2 * Math.min(1.0, common.length / 3);
    }

    return parseFloat(Math.min(1.0, score).toFixed(3));
  }

  computeCatalogContentScore(prod, profile, recentSearches) {
    let score = 0;
    if (profile?.category_scores?.[prod.category]) {
      score += 0.4 * profile.category_scores[prod.category];
    }
    if (recentSearches && recentSearches.length > 0) {
      for (const q of recentSearches) {
        if (q && prod.name.toLowerCase().includes(q.toLowerCase())) {
          score += 0.3;
          break;
        }
      }
    }
    return Math.min(1.0, score);
  }

  computeUserPreferenceScore(prod, profile) {
    if (!profile) return 0.2;
    let score = 0;

    // Category affinity
    if (profile.category_scores && profile.category_scores[prod.category]) {
      score += 0.5 * profile.category_scores[prod.category];
    }

    // Brand affinity
    if (prod.brand && profile.brand_scores && profile.brand_scores[prod.brand]) {
      score += 0.3 * profile.brand_scores[prod.brand];
    }

    return Math.min(1.0, score);
  }

  computeSessionScore(prod, sessionCategories, sessionColors) {
    let score = 0;
    if (sessionCategories[prod.category]) {
      score += 0.6;
    }

    if (prod.colors && Array.isArray(prod.colors)) {
      for (const c of prod.colors) {
        if (c.name && sessionColors[c.name]) {
          score += 0.4;
          break;
        }
      }
    }
    return Math.min(1.0, score);
  }

  async computeCollaborativeScore(productId, wishlistProductIds) {
    if (wishlistProductIds.length === 0) return 0.1;

    // Lightweight co-view / co-wishlist overlap across users
    const res = await query(
      `SELECT COUNT(DISTINCT session_id) AS co_count
       FROM user_events
       WHERE product_id = $1 AND event_type IN ('WISHLIST_ADD', 'CART_ADD', 'PURCHASE')`,
      [productId]
    );

    const count = parseInt(res.rows[0]?.co_count || 0, 10);
    return Math.min(1.0, count / 10.0);
  }

  computeWishlistSimilarity(prod, wishlistProductIds, allProducts) {
    if (wishlistProductIds.length === 0) return 0;

    const wishlistProds = allProducts.filter(p => wishlistProductIds.includes(p.id));
    let maxSim = 0;

    for (const wp of wishlistProds) {
      const sim = this.computeContentSimilarity(wp, prod);
      if (sim > maxSim) maxSim = sim;
    }
    return maxSim;
  }

  computePricePenalty(price, profile) {
    if (!profile || !profile.price_avg || profile.price_avg <= 0) return 0;
    const p = parseFloat(price);
    if (isNaN(p)) return 0;

    // Soft penalty if product price is > 2.5x user's average price
    if (p > profile.price_avg * 2.5) {
      return 0.25;
    }
    return 0;
  }

  selectBestVariantColor(prod, availableVariants, profileColors = {}, sessionColors = {}) {
    if (!availableVariants || availableVariants.length === 0) return 'Default Color';

    let bestColor = availableVariants[0].color_name;
    let maxScore = -1;

    for (const v of availableVariants) {
      const cName = v.color_name;
      let score = 0;
      if (profileColors && profileColors[cName]) {
        score += profileColors[cName] * 2.0;
      }
      if (sessionColors && sessionColors[cName]) {
        score += 3.0;
      }
      if (score > maxScore) {
        maxScore = score;
        bestColor = cName;
      }
    }
    return bestColor;
  }

  /**
   * Diversity Filter: Prevents 5 consecutive items of the same category
   */
  applyDiversityFilter(candidates, profile) {
    const topCatScore = profile?.category_scores ? Math.max(0, ...Object.values(profile.category_scores)) : 0;

    // If user has > 0.85 preference for a single category, allow category focus
    if (topCatScore > 0.85) return candidates;

    const categoryCounts = {};
    const result = [];

    for (const item of candidates) {
      const cat = item.product.category;
      const count = categoryCounts[cat] || 0;

      // Penalize candidates if category already appears 2+ times in top list
      if (count >= 2) {
        item.score = parseFloat((item.score * 0.7).toFixed(3));
      }

      categoryCounts[cat] = count + 1;
      result.push(item);
    }

    result.sort((a, b) => b.score - a.score);
    return result;
  }

  async fetchRecentSessionContext(userOrSessionId, isUser = false) {
    const sessionCategories = {};
    const sessionColors = {};
    const seenCounts = {};
    const recentSearches = [];

    if (!userOrSessionId) return { sessionCategories, sessionColors, seenCounts, recentSearches };

    let sql = `
      SELECT event_type, product_id, category, color, search_query, timestamp
      FROM user_events
    `;
    const params = [userOrSessionId];
    if (isUser) {
      sql += ` WHERE user_id = $1`;
    } else {
      sql += ` WHERE session_id = $1`;
    }
    sql += ` ORDER BY timestamp DESC LIMIT 100`;

    const res = await query(sql, params);
    for (const r of res.rows) {
      if (r.product_id) {
        seenCounts[r.product_id] = (seenCounts[r.product_id] || 0) + 1;
      }

      // Check events in last 15 mins for short-term session boost
      const minsAgo = (Date.now() - new Date(r.timestamp).getTime()) / (1000 * 60);
      if (minsAgo <= 15) {
        if (r.category) sessionCategories[r.category] = true;
        if (r.color) sessionColors[r.color] = true;
      }

      if (r.event_type === 'SEARCH' && r.search_query) {
        recentSearches.push(r.search_query);
      }
    }

    return { sessionCategories, sessionColors, seenCounts, recentSearches };
  }

  async fetchUserWishlistProducts(userOrSessionId, isUser = false) {
    if (!userOrSessionId) return [];

    let sql = `SELECT product_id FROM user_events WHERE event_type = 'WISHLIST_ADD'`;
    const params = [userOrSessionId];
    if (isUser) {
      sql += ` AND user_id = $1`;
    } else {
      sql += ` AND session_id = $1`;
    }

    const res = await query(sql, params);
    return [...new Set(res.rows.map(r => r.product_id))];
  }

  async getHybridModelWeights() {
    try {
      const res = await query(`SELECT value FROM recommendation_config WHERE key = 'hybrid_weights'`);
      if (res.rows.length > 0) {
        return typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
      }
    } catch (e) {}
    return {
      content_similarity: 0.30,
      user_preferences: 0.25,
      behavior: 0.20,
      collaborative: 0.10,
      popularity: 0.10,
      freshness: 0.05
    };
  }

  buildRecommendationReason(type, prod, sourceProd, profile, wishlistProductIds) {
    if (type === 'similar' && sourceProd) {
      return `Because you viewed ${sourceProd.name}`;
    }
    if (type === 'wishlist' || wishlistProductIds.includes(prod.id)) {
      return `Based on items in your wishlist`;
    }
    if (profile?.category_scores?.[prod.category] > 0.5) {
      return `Recommended based on your interest in ${prod.category}`;
    }
    return `Trending in Quiet Luxury`;
  }
}
