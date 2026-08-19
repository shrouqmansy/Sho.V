import { BaseProductSource } from '../BaseProductSource.js';
import { execSync } from 'child_process';
import path from 'path';

export class HmProductSource extends BaseProductSource {
  constructor() {
    super('H&M Egypt', 'HM');
  }

  async searchProducts(query, category, limit = 20) {
    if (!this.isEnabled) {
      console.log('[H&M Adapter] Disabled.');
      return [];
    }

    console.log(`[H&M Adapter] Executing live Playwright search for '${query}' (Category: ${category})...`);

    try {
      const pythonScript = path.resolve(process.cwd(), 'server', 'browser_scraper.py');
      const stdout = execSync(`python "${pythonScript}"`, { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 });
      const rawProducts = JSON.parse(stdout);
      const hmOnly = rawProducts.filter(p => p.source === 'hm');

      if (query && query.trim()) {
        const cleanQ = query.toLowerCase().trim();
        const filtered = hmOnly.filter(p =>
          p.title.toLowerCase().includes(cleanQ) ||
          p.category.toLowerCase().includes(cleanQ)
        );
        if (filtered.length > 0) return filtered.slice(0, limit);
      }

      return hmOnly.slice(0, limit);
    } catch (err) {
      console.error('[H&M Adapter Error]: Live Playwright search failed:', err.message);
      return [];
    }
  }
}
