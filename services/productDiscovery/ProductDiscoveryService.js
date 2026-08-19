import { AmazonProductSource } from '../../scrapers/amazon/AmazonProductSource.js';
import { TargetProductSource } from '../../scrapers/target/TargetProductSource.js';
import { WalmartProductSource } from '../../scrapers/walmart/WalmartProductSource.js';
import { TemuProductSource } from '../../scrapers/temu/TemuProductSource.js';
import { NoonProductSource } from '../../scrapers/noon/NoonProductSource.js';
import { ProductNormalizer } from '../productNormalizer/ProductNormalizer.js';
import { ProductValidator } from '../productValidator/ProductValidator.js';
import { insertScrapedProduct } from '../../server/db.js';

export class ProductDiscoveryService {
  constructor() {
    this.sources = [
      new AmazonProductSource(),
      new TargetProductSource(),
      new WalmartProductSource(),
      new TemuProductSource(),
      new NoonProductSource()
    ];
    this.minProducts = parseInt(process.env.DISCOVERY_MIN_PRODUCTS || '5', 10);
    this.timeoutMs = parseInt(process.env.DISCOVERY_TIMEOUT || '30000', 10);
  }

  // Get active configuration status of all sources
  getSourceStatus() {
    return this.sources.map(src => ({
      source: src.sourceName,
      enabled: src.isEnabled,
      hasApiKey: Boolean(src.apiKey)
    }));
  }

  async discoverProducts(query, category) {
    const enabledSources = this.sources.filter(s => s.isEnabled);
    console.log(`[Product Discovery Service] Starting multi-source discovery for query: '${query}' across ${enabledSources.length} enabled sources.`);

    if (enabledSources.length === 0) {
      console.log('[Product Discovery Service] No external sources are currently enabled in .env.');
      return [];
    }

    const discoveryPromise = (async () => {
      // Query enabled sources concurrently
      const sourcePromises = enabledSources.map(async (src) => {
        try {
          const rawItems = await src.searchProducts(query, category, 10);
          return rawItems.map(item => ProductNormalizer.normalize(item, src.sourceName));
        } catch (err) {
          console.error(`[Discovery Service Error] Source ${src.sourceName} failed:`, err.message);
          return [];
        }
      });

      const resultsPerSource = await Promise.all(sourcePromises);
      const allNormalized = resultsPerSource.flat();

      console.log(`[Product Discovery Service] Collected ${allNormalized.length} raw normalized items. Running validation & deduplication...`);

      const validProducts = [];
      const seenKeys = new Set();

      for (const prod of allNormalized) {
        if (!ProductValidator.isValidProduct(prod)) continue;

        const uniqueKey = `${prod.source}_${prod.sourceProductId}`;
        if (seenKeys.has(uniqueKey) || seenKeys.has(prod.sourceUrl)) {
          console.log(`[Deduplicator] Skipped duplicate item: ${uniqueKey}`);
          continue;
        }

        seenKeys.add(uniqueKey);
        seenKeys.add(prod.sourceUrl);
        validProducts.push(prod);

        if (validProducts.length >= this.minProducts * 4) break;
      }

      console.log(`[Product Discovery Service] Validated & deduplicated ${validProducts.length} items. Persisting to PostgreSQL...`);

      const savedProducts = [];
      for (const item of validProducts) {
        const saved = await insertScrapedProduct(item);
        if (saved) savedProducts.push(saved);
      }

      console.log(`[Product Discovery Service] Successfully persisted ${savedProducts.length} new products to PostgreSQL.`);
      return savedProducts;
    })();

    // Timeout safety wrapper
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn(`[Product Discovery Service] Discovery timeout reached (${this.timeoutMs}ms). Returning collected results.`);
        resolve([]);
      }, this.timeoutMs);
    });

    return await Promise.race([discoveryPromise, timeoutPromise]);
  }
}
