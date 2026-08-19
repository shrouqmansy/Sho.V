export const SWATCH_COLOR_DICTIONARY = {
  // Multi-word constructs & specific shades (Sorted by length descending for longest-match priority)
  'navy blue': '#0D47A1',
  'dark blue': '#1A237E',
  'light blue': '#64B5F6',
  'royal blue': '#2962FF',
  'sky blue': '#87CEEB',
  'baby blue': '#89CFF0',
  'dark green': '#1B5E20',
  'light green': '#81C784',
  'khaki green': '#556B2F',
  'dark khaki': '#BDB76B',
  'dark brown': '#3E2723',
  'off-white': '#F5F5F0',
  'off white': '#F5F5F0',
  'hot pink': '#FF69B4',
  'lt.blue': '#64B5F6',
  'lt blue': '#64B5F6',
  'dk.blue': '#1A237E',
  'dk blue': '#1A237E',
  'd.blue': '#1A237E',
  'l.blue': '#64B5F6',

  // Single word colors
  'burgundy': '#800020',
  'maroon': '#800000',
  'wine': '#722F37',
  'navy': '#0D47A1',
  'olive': '#558B2F',
  'mint': '#80CBC4',
  'teal': '#00897B',
  'pink': '#EC407A',
  'rose': '#FF007F',
  'purple': '#7B1FA2',
  'lavender': '#E6E6FA',
  'lilac': '#C8A2C8',
  'brown': '#6D4C41',
  'camel': '#C19A6B',
  'tan': '#D2B48C',
  'beige': '#F5F5DC',
  'khaki': '#C2B280',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'grey': '#757575',
  'gray': '#757575',
  'charcoal': '#36454F',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'yellow': '#FBC02D',
  'mustard': '#FFDB58',
  'orange': '#FB8C00',
  'rust': '#B7410E',
  'coral': '#FF7F50',
  'peach': '#FFDAB9',
  'mocha': '#967969',
  'black': '#111111',
  'white': '#FFFFFF',
  'red': '#D32F2F',
  'blue': '#1E88E5',
  'green': '#2E7D32'
};

export function getSwatchStyle(colorName, colorHex) {
  if (!colorName) {
    return { backgroundColor: '#e0dad5', borderClass: 'border-gray-400', isDefault: true };
  }

  const name = colorName.toLowerCase().trim();

  // 1. Literal Default Color check
  if (name === 'default color' || name === 'default' || name === 'unknown') {
    return { backgroundColor: '#e0dad5', borderClass: 'border-gray-400', isDefault: true };
  }

  // 2. Patterned / Multi-color swatches
  if (
    name.includes('multicolor') ||
    name.includes('multi') ||
    name.includes('pattern') ||
    name.includes('printed') ||
    name.includes('floral') ||
    name.includes('leopard') ||
    name.includes('striped') ||
    name.includes('tie dye')
  ) {
    return {
      backgroundImage: 'linear-gradient(135deg, #ff0000 0%, #00ff00 33%, #0000ff 66%, #ffff00 100%)',
      borderClass: 'border-gray-300'
    };
  }

  // 3. Exact dictionary lookup (sorted by length descending for longest-match priority)
  const sortedKeys = Object.keys(SWATCH_COLOR_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const k of sortedKeys) {
    const escK = k.replace('.', '\\.');
    const pattern = new RegExp(`\\b${escK}\\b`, 'i');
    if (name === k || pattern.test(name) || name.includes(k)) {
      const hexVal = SWATCH_COLOR_DICTIONARY[k];
      return {
        backgroundColor: hexVal,
        borderClass: hexVal === '#FFFFFF' || hexVal === '#FFFFF0' || hexVal === '#FFFDD0' || hexVal === '#F5F5F0'
          ? 'border-gray-400 shadow-inner'
          : 'border-gray-300'
      };
    }
  }

  // 4. Fallback to valid colorHex if present and not default dark placeholder
  if (colorHex && colorHex !== '#151616' && colorHex !== '#000000') {
    return { backgroundColor: colorHex, borderClass: 'border-gray-300' };
  }

  // 5. Recognized name fallback -> Default to subtle slate rather than gray
  return { backgroundColor: '#c8b6a6', borderClass: 'border-gray-300' };
}
