import { BaseProductSource } from '../BaseProductSource.js';
import { execSync } from 'child_process';
import path from 'path';

export class AmazonProductSource extends BaseProductSource {
  constructor() {
    super('Amazon', 'AMAZON');
    this.associateTag = process.env.AMAZON_ASSOCIATE_TAG || null;
  }

  async searchProducts(query, category, limit = 20) {
    if (!this.isEnabled) {
      console.log('[Amazon Adapter] Disabled via AMAZON_ENABLED=false.');
      return [];
    }

    console.log(`[Amazon Adapter] Executing live Playwright search for '${query}' (Category: ${category})...`);

    try {
      const pythonScript = path.resolve(process.cwd(), 'server', 'browser_scraper.py');
      const stdout = execSync(`python "${pythonScript}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const rawProducts = JSON.parse(stdout);

      if (query && query.trim()) {
        const cleanQ = query.toLowerCase().trim();
        const filtered = rawProducts.filter(p =>
          p.title.toLowerCase().includes(cleanQ) ||
          p.category.toLowerCase().includes(cleanQ) ||
          (p.description && p.description.toLowerCase().includes(cleanQ))
        );
        if (filtered.length > 0) {
          return filtered.slice(0, limit);
        }
      }

      return rawProducts.slice(0, limit);
    } catch (err) {
      console.error('[Amazon Adapter Error]: Live Playwright search failed:', err.message);
      return [];
    }
  }
}
