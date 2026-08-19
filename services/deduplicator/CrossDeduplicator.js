import { getDeterministicProductId } from '../../server/db.js';

export const EXTENDED_COLOR_MAP = {
  // Multi-word constructs & abbreviations (sorted by length descending for longest match)
  'navy blue': { name: 'Navy Blue', hex: '#0D47A1' },
  'dark blue': { name: 'Dark Blue', hex: '#1A237E' },
  'light blue': { name: 'Light Blue', hex: '#64B5F6' },
  'royal blue': { name: 'Royal Blue', hex: '#2962FF' },
  'sky blue': { name: 'Sky Blue', hex: '#87CEEB' },
  'baby blue': { name: 'Baby Blue', hex: '#89CFF0' },
  'lt.blue': { name: 'Light Blue', hex: '#64B5F6' },
  'lt blue': { name: 'Light Blue', hex: '#64B5F6' },
  'dk.blue': { name: 'Dark Blue', hex: '#1A237E' },
  'dk blue': { name: 'Dark Blue', hex: '#1A237E' },
  'dark green': { name: 'Dark Green', hex: '#1B5E20' },
  'light green': { name: 'Light Green', hex: '#81C784' },
  'dark khaki': { name: 'Dark Khaki', hex: '#BDB76B' },
  'dark brown': { name: 'Dark Brown', hex: '#3E2723' },
  'off-white': { name: 'Off White', hex: '#F5F5F0' },
  'off white': { name: 'Off White', hex: '#F5F5F0' },
  'hot pink': { name: 'Hot Pink', hex: '#FF69B4' },
  'd.blue': { name: 'Dark Blue', hex: '#1A237E' },
  'l.blue': { name: 'Light Blue', hex: '#64B5F6' },
  'khaki green': { name: 'Khaki Green', hex: '#556B2F' },

  // Single word colors
  'black': { name: 'Black', hex: '#111111' },
  'white': { name: 'White', hex: '#FFFFFF' },
  'red': { name: 'Red', hex: '#D32F2F' },
  'blue': { name: 'Blue', hex: '#1E88E5' },
  'navy': { name: 'Navy', hex: '#0D47A1' },
  'green': { name: 'Green', hex: '#2E7D32' },
  'olive': { name: 'Olive', hex: '#558B2F' },
  'mint': { name: 'Mint', hex: '#80CBC4' },
  'teal': { name: 'Teal', hex: '#00897B' },
  'pink': { name: 'Pink', hex: '#EC407A' },
  'rose': { name: 'Rose', hex: '#FF007F' },
  'purple': { name: 'Purple', hex: '#7B1FA2' },
  'lavender': { name: 'Lavender', hex: '#E6E6FA' },
  'lilac': { name: 'Lilac', hex: '#C8A2C8' },
  'burgundy': { name: 'Burgundy', hex: '#800020' },
  'maroon': { name: 'Maroon', hex: '#800000' },
  'wine': { name: 'Wine', hex: '#722F37' },
  'brown': { name: 'Brown', hex: '#6D4C41' },
  'camel': { name: 'Camel', hex: '#C19A6B' },
  'tan': { name: 'Tan', hex: '#D2B48C' },
  'beige': { name: 'Beige', hex: '#F5F5DC' },
  'khaki': { name: 'Khaki', hex: '#C2B280' },
  'cream': { name: 'Cream', hex: '#FFFDD0' },
  'ivory': { name: 'Ivory', hex: '#FFFFF0' },
  'grey': { name: 'Grey', hex: '#757575' },
  'gray': { name: 'Gray', hex: '#757575' },
  'charcoal': { name: 'Charcoal', hex: '#36454F' },
  'silver': { name: 'Silver', hex: '#C0C0C0' },
  'gold': { name: 'Gold', hex: '#FFD700' },
  'yellow': { name: 'Yellow', hex: '#FBC02D' },
  'mustard': { name: 'Mustard', hex: '#FFDB58' },
  'orange': { name: 'Orange', hex: '#FB8C00' },
  'rust': { name: 'Rust', hex: '#B7410E' },
  'coral': { name: 'Coral', hex: '#FF7F50' },
  'peach': { name: 'Peach', hex: '#FFDAB9' },
  'mocha': { name: 'Mocha', hex: '#967969' }
};

export function extractColorAndBaseTitle(title) {
  if (!title) return { baseTitle: '', colorName: null, hex: null };

  const cleanTitle = title.trim();

  // Stage 1: Hyphen / Delimiter Suffix Matching (e.g., "Product Name - Dark Khaki")
  const colorKeys = Object.keys(EXTENDED_COLOR_MAP).sort((a, b) => b.length - a.length);
  const suffixPattern = new RegExp(`\\s*[\\-\\|\\–\\:]\\s*(${colorKeys.map(k => k.replace('.', '\\.')).join('|')})\\b`, 'i');

  const suffixMatch = cleanTitle.match(suffixPattern);
  if (suffixMatch) {
    const rawMatched = suffixMatch[1].toLowerCase();
    const info = EXTENDED_COLOR_MAP[rawMatched] || { name: suffixMatch[1], hex: '#151616' };
    const baseTitle = cleanTitle.replace(suffixMatch[0], '').trim();
    return { baseTitle, colorName: info.name, hex: info.hex };
  }

  // Stage 2: Natural Language Prose Matching (e.g., "Ricci Black Pantsuit", "Women's Navy Blue Dress")
  for (const k of colorKeys) {
    const escK = k.replace('.', '\\.');
    const prosePattern = new RegExp(`\\b${escK}\\b`, 'i');
    if (prosePattern.test(cleanTitle)) {
      const info = EXTENDED_COLOR_MAP[k];
      const baseTitle = cleanTitle.replace(prosePattern, '').replace(/\s+/g, ' ').trim();
      return { baseTitle: baseTitle || cleanTitle, colorName: info.name, hex: info.hex };
    }
  }

  return { baseTitle: cleanTitle, colorName: null, hex: null };
}

export class CrossDeduplicator {
  static normalizeTitle(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/women'?s|men'?s|unisex|official|vol\.\s*\d+/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 2)
      .sort()
      .join(' ');
  }

  static deduplicate(productsList) {
    const stats = {
      totalInput: productsList.length,
      parentProductsCount: 0,
      totalColorVariantsCount: 0
    };

    const groupMap = new Map();

    for (const prod of productsList) {
      if (!prod || (!prod.name && !prod.title)) continue;

      const rawTitle = prod.name || prod.title;
      const { baseTitle, colorName, hex } = extractColorAndBaseTitle(rawTitle);

      const normBrand = (prod.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const normCat = (prod.category || '').toLowerCase();
      const normBaseTitle = this.normalizeTitle(baseTitle);
      const source = (prod.source || 'unknown').toLowerCase();

      // Grouping Key: Category + Source + Brand + Base Title
      const groupKey = `${normCat}_${source}_${normBrand}_${normBaseTitle}`;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          parent: { ...prod, name: baseTitle, title: baseTitle },
          variants: []
        });
      }

      const group = groupMap.get(groupKey);

      const cName = colorName || 'Default Color';
      const cHex = hex || '#151616';

      group.variants.push({
        name: cName,
        hex: cHex,
        image_url: prod.image || (prod.images && prod.images[0]),
        images: prod.images || [prod.image],
        sku: prod.sourceProductId || prod.source_product_id,
        sourceUrl: prod.sourceUrl || prod.source_url,
        price: prod.price
      });

      stats.totalColorVariantsCount++;
    }

    const finalProducts = [];

    for (const [key, group] of groupMap.entries()) {
      const parent = group.parent;
      parent.id = getDeterministicProductId(parent);

      const consolidatedColors = [];
      const consolidatedImages = [];
      const seenColorNames = new Set();

      group.variants.forEach((v, vIdx) => {
        const colorId = `col_${parent.id}_${vIdx}`;
        if (!seenColorNames.has(v.name)) {
          seenColorNames.add(v.name);
          consolidatedColors.push({
            id: colorId,
            name: v.name,
            hex: v.hex,
            image_url: v.image_url,
            sku: v.sku,
            sourceUrl: v.sourceUrl,
            price: v.price
          });
        }

        if (v.images && v.images.length > 0) {
          v.images.forEach((imgUrl) => {
            if (imgUrl && !consolidatedImages.some(i => i.image_url === imgUrl)) {
              consolidatedImages.push({
                image_url: imgUrl,
                color_id: colorId,
                position: consolidatedImages.length
              });
            }
          });
        }
      });

      parent.colors = consolidatedColors;
      parent.variantImages = consolidatedImages;
      parent.images = consolidatedImages.map(i => i.image_url);
      if (parent.images.length === 0 && parent.image) {
        parent.images = [parent.image];
      }
      parent.image = consolidatedColors[0]?.image_url || parent.images[0] || parent.image;

      finalProducts.push(parent);
    }

    stats.parentProductsCount = finalProducts.length;

    return {
      products: finalProducts,
      stats
    };
  }
}
