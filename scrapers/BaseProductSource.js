import dotenv from 'dotenv';
dotenv.config();

export class BaseProductSource {
  constructor(sourceName, envPrefix) {
    this.sourceName = sourceName;
    this.envPrefix = envPrefix;
    this.isEnabled = process.env[`${envPrefix}_ENABLED`] === 'true';
    this.apiKey = process.env[`${envPrefix}_API_KEY`] || null;
  }

  // Common interface enforced for all source adapters: searchProducts(query, category, limit)
  async searchProducts(query, category, limit = 10) {
    if (!this.isEnabled) {
      console.log(`[${this.sourceName} Adapter] Source is disabled (${this.envPrefix}_ENABLED=false). Skipping.`);
      return [];
    }
    return [];
  }
}
