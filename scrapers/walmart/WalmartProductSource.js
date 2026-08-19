import { BaseProductSource } from '../BaseProductSource.js';

export class WalmartProductSource extends BaseProductSource {
  constructor() {
    super('Walmart', 'WALMART');
  }

  async searchProducts(query, category, limit = 10) {
    if (!this.isEnabled) {
      console.log('[Walmart Adapter] Disabled via WALMART_ENABLED=false.');
      return [];
    }

    if (!this.apiKey) {
      console.log('[Walmart Adapter] No authorized API key configured (WALMART_API_KEY). Walmart adapter disabled.');
      return [];
    }

    console.log(`[Walmart Adapter] Querying Walmart Affiliate/Data API for '${query}'...`);
    try {
      // Authorized Walmart API request template...
      return [];
    } catch (err) {
      console.error('[Walmart API Error]:', err.message);
      return [];
    }
  }
}
