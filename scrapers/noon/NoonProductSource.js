import { BaseProductSource } from '../BaseProductSource.js';

export class NoonProductSource extends BaseProductSource {
  constructor() {
    super('Noon', 'NOON');
  }

  async searchProducts(query, category, limit = 10) {
    if (!this.isEnabled) {
      console.log('[Noon Adapter] Disabled via NOON_ENABLED=false.');
      return [];
    }

    if (!this.apiKey) {
      console.log('[Noon Adapter] No authorized API key configured (NOON_API_KEY). Noon adapter disabled.');
      return [];
    }

    console.log(`[Noon Adapter] Querying Noon Merchant API for '${query}'...`);
    try {
      // Authorized Noon API request template...
      return [];
    } catch (err) {
      console.error('[Noon API Error]:', err.message);
      return [];
    }
  }
}
