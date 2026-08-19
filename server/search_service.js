import crypto from 'crypto';
import { query, searchProductsInDb, getAllProductsFromDb } from './db.js';
import { ProductDiscoveryService } from '../services/productDiscovery/ProductDiscoveryService.js';
import { extractFashionIntent, buildScraperSearchQuery } from './search/fashion_intent_service.js';
import { rankAndFilterProducts } from './search/search_relevance_service.js';

const discoveryService = new ProductDiscoveryService();

export function isClothingSearch(searchQuery) {
  if (!searchQuery || typeof searchQuery !== 'string') return false;
  const intent = extractFashionIntent(searchQuery);
  // Any query containing fashion garments, materials, colors, fits, or occasions is valid clothing search
  return Boolean(intent.garment || intent.material || intent.color || intent.fit || intent.occasion || intent.season || intent.queryClean.length > 2);
}

export async function searchOrDiscoverProducts(searchQuery, sessionId = null, userId = null) {
  if (!searchQuery || !searchQuery.trim()) {
    const allDbProds = await getAllProductsFromDb({ limit: 100 });
    return { isClothing: true, products: allDbProds, source: 'database', scraped: false, count: allDbProds.length };
  }

  const queryClean = searchQuery.trim();
  const intent = extractFashionIntent(queryClean);

  console.log(`[Intelligent Search] Query: '${queryClean}' | Intent:`, {
    garment: intent.garment,
    material: intent.material,
    color: intent.color,
    fit: intent.fit,
    expanded: intent.expandedTerms
  });

  // STAGE 1: PostgreSQL Database Search with Semantic Relevance Ranking
  console.log(`[Intelligent Search STAGE 1] Querying PostgreSQL for '${queryClean}'...`);
  const rawDbCandidates = await searchProductsInDb(queryClean);
  let allCatalogCandidates = rawDbCandidates;

  // Also pull wider catalog candidates if exact term DB results are low
  if (rawDbCandidates.length < 15) {
    const wideCatalog = await getAllProductsFromDb({ limit: 400 });
    allCatalogCandidates = [...rawDbCandidates, ...wideCatalog];
  }

  // Apply Weighted Relevance Scoring & Minimum Threshold Filtering (Threshold = 25)
  const rankedDbResults = rankAndFilterProducts(allCatalogCandidates, intent);

  console.log(`[Intelligent Search STAGE 1] Found ${rankedDbResults.length} relevant products in PostgreSQL (Min Threshold = 25).`);

  // Log Search Event to PostgreSQL for AI Recommendations
  const effectiveSessionId = sessionId || `sess_search_${Date.now()}`;
  setImmediate(() => {
    logSearchEvent(effectiveSessionId, userId, queryClean, intent, rankedDbResults.length);
  });

  // If Database contains relevant products (>= 1) -> return database results immediately
  if (rankedDbResults.length >= 1) {
    return {
      query: queryClean,
      isClothing: true,
      products: rankedDbResults,
      source: 'database',
      scraped: false,
      count: rankedDbResults.length
    };
  }

  // STAGE 2: Scraper Fallback with Expanded Clothing Search Query
  console.log(`[Intelligent Search STAGE 2] Insufficient DB results (${rankedDbResults.length}). Launching Scraper Fallback...`);

  const expandedScraperQuery = buildScraperSearchQuery(intent);
  const categoryMatch = (intent.garment || 'TOPS').toUpperCase();

  console.log(`[Intelligent Search STAGE 2] Expanded Scraper Query: '${expandedScraperQuery}'`);

  const discoveredItems = await discoveryService.discoverProducts(expandedScraperQuery, categoryMatch);

  // Re-query PostgreSQL database after scraper normalization & deduplication insertion
  const updatedDbCandidates = await searchProductsInDb(queryClean);
  const wideCatalogAfter = await getAllProductsFromDb({ limit: 400 });
  const finalRankedResults = rankAndFilterProducts([...updatedDbCandidates, ...wideCatalogAfter], intent);

  return {
    query: queryClean,
    isClothing: true,
    products: finalRankedResults.length > 0 ? finalRankedResults : rankedDbResults,
    source: discoveredItems.length > 0 ? 'database+scraper' : 'database_fallback',
    scraped: discoveredItems.length > 0,
    countDiscovered: discoveredItems.length,
    count: finalRankedResults.length
  };
}

async function logSearchEvent(sessionId, userId, queryClean, intent, resultCount) {
  try {
    const eventId = `evt_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await query(
      `INSERT INTO user_events (id, user_id, session_id, event_type, search_query, category, color, metadata, timestamp)
       VALUES ($1, $2, $3, 'SEARCH', $4, $5, $6, $7, NOW())`,
      [
        eventId,
        userId || null,
        sessionId,
        queryClean,
        intent.garment || null,
        intent.color || null,
        JSON.stringify({ resultCount, expandedTerms: intent.expandedTerms })
      ]
    );
  } catch (e) {
    console.warn('[Log Search Event Error]:', e.message);
  }
}

export function getSourceStatus() {
  return discoveryService.getSourceStatus();
}
