export class ProductNormalizer {
  static normalize(rawItem, sourceName) {
    if (!rawItem) return null;

    const sourceProductId = rawItem.sourceProductId || rawItem.asin || rawItem.id || rawItem.sku || rawItem.productId || `item-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const sourceUrl = rawItem.sourceUrl || rawItem.productUrl || rawItem.url || rawItem.source_url || `https://${sourceName.toLowerCase()}.com/item/${sourceProductId}`;

    const price = rawItem.price !== null && rawItem.price !== undefined ? parseFloat(rawItem.price) : null;
    const originalPrice = rawItem.originalPrice !== null && rawItem.originalPrice !== undefined ? parseFloat(rawItem.originalPrice) : null;
    let discountPercentage = rawItem.discountPercentage || null;
    if (!discountPercentage && price && originalPrice && originalPrice > price) {
      discountPercentage = Math.round((1 - price / originalPrice) * 100);
    }

    const images = Array.isArray(rawItem.images) && rawItem.images.length > 0
      ? rawItem.images.filter(img => typeof img === 'string' && img.startsWith('http'))
      : (rawItem.image ? [rawItem.image] : []);

    const colors = Array.isArray(rawItem.colors)
      ? rawItem.colors.map(c => typeof c === 'string' ? { name: c, hex: '#151616' } : c)
      : [];

    const sizes = Array.isArray(rawItem.sizes)
      ? rawItem.sizes.map(s => typeof s === 'string' ? { name: s, available: true } : s)
      : [];

    return {
      name: (rawItem.title || rawItem.name || 'Clothing Product').trim(),
      description: rawItem.description || `Luxury clothing apparel from ${sourceName}.`,
      brand: rawItem.brand || `${sourceName} Selection`,
      category: rawItem.category || 'Hoodies',
      price,
      originalPrice,
      discountPercentage,
      currency: rawItem.currency || 'EGY',
      images,
      colors,
      sizes,
      quantity: rawItem.quantity !== undefined ? parseInt(rawItem.quantity, 10) : 10,
      availability: rawItem.availability || (price ? 'in_stock' : 'out_of_stock'),
      rating: rawItem.rating ? parseFloat(rawItem.rating) : null,
      reviewCount: rawItem.reviewCount ? parseInt(rawItem.reviewCount, 10) : null,
      videoUrl: rawItem.videoUrl || rawItem.video_url || null,
      source: (rawItem.source || sourceName).toLowerCase(),
      sourceProductId: String(sourceProductId),
      sourceUrl
    };
  }
}
