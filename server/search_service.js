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
  // Log Search Event asynchronously
  const effectiveSessionId = sessionId || `sess_search_${Date.now()}`;
  setImmediate(() => {
    logSearchEvent(effectiveSessionId, userId, queryClean, intent, rankedDbResults.length);
  });

  // Fallback to wider catalog if exact search yielded 0 items so customer ALWAYS sees products immediately!
  let returnProducts = rankedDbResults;
  if (returnProducts.length === 0) {
    returnProducts = allCatalogCandidates.slice(0, 12);
  }

  return {
    query: queryClean,
    isClothing: true,
    products: returnProducts,
    source: 'database',
    scraped: false,
    scrapingInBackground,
    count: returnProducts.length
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
