import { BaseProductSource } from '../BaseProductSource.js';

export class TargetProductSource extends BaseProductSource {
  constructor() {
    super('Target', 'TARGET');
  }

  async searchProducts(query, category, limit = 10) {
    if (!this.isEnabled) {
      console.log('[Target Adapter] Disabled via TARGET_ENABLED=false.');
      return [];
    }

    if (!this.apiKey) {
      console.log('[Target Adapter] No authorized API key configured (TARGET_API_KEY). Target adapter disabled.');
      return [];
    }

    console.log(`[Target Adapter] Querying Target Data API for '${query}'...`);
    try {
      // Authorized Target API request template...
      return [];
    } catch (err) {
      console.error('[Target API Error]:', err.message);
      return [];
    }
  }
}
