// Fashion Dictionaries
const GARMENT_TYPES = [
  'cover up', 'coverup', 'top', 'tops', 'blouse', 'blouses', 'dress', 'dresses',
  'hoodie', 'hoodies', 'blazer', 'blazers', 'cardigan', 'cardigans', 'shirt', 'shirts',
  'jacket', 'jackets', 'jeans', 'denim', 'trousers', 'pants', 'sweater', 'sweaters',
  'coat', 'coats', 'skirt', 'skirts', 'shorts', 'suit', 'suits', 'jumpsuit', 'romper'
];

const MATERIALS = [
  'mesh', 'sheer', 'satin', 'denim', 'linen', 'fleece', 'leather', 'cotton',
  'lace', 'silk', 'velvet', 'wool', 'chiffon', 'knit', 'transparent'
];

const COLORS = [
  'black', 'burgundy', 'navy', 'white', 'red', 'green', 'beige', 'gold',
  'pink', 'blue', 'cream', 'brown', 'grey', 'gray', 'yellow', 'purple', 'orange', 'silver'
];

const FITS = [
  'oversized', 'bodycon', 'slim', 'regular', 'loose', 'relaxed', 'crop', 'cropped',
  'wide-leg', 'wide leg', 'long sleeve', 'short sleeve', 'sleeveless', 'u-neck', 'v-neck', 'backless'
];

const OCCASIONS = [
  'party', 'evening', 'cocktail', 'formal', 'office', 'summer', 'casual', 'beach',
  'work', 'wedding', 'night out'
];

const SEASONS = ['summer', 'winter', 'spring', 'autumn', 'fall'];

// Semantic Synonym Mappings for Fashion Intent Expansion
const SYNONYM_MAPPINGS = {
  'mesh cover': ['mesh cover up', 'mesh top', 'sheer mesh blouse', 'mesh cardigan', 'cover up'],
  'mesh cover up': ['mesh cover up', 'mesh top', 'sheer mesh blouse', 'mesh cardigan', 'cover up'],
  'party dress': ['evening dress', 'cocktail dress', 'bodycon dress', 'formal dress', 'party dress'],
  'party outfit': ['party dress', 'evening dress', 'cocktail dress', 'bodycon dress', 'formal dress'],
  'casual summer clothes': ['summer dress', 'shorts', 'top', 'lightweight shirt', 'linen shirt'],
  'office clothes': ['blazer', 'pantsuit', 'formal trousers', 'blouse', 'tailored jacket'],
  'office blazer': ['blazer', 'tailored jacket', 'formal blazer', 'office jacket'],
  'summer outfit': ['summer dress', 'linen shirt', 'tank top', 'wide-leg pants', 'lightweight blouse'],
  'summer dress': ['summer dress', 'sundress', 'floral dress', 'lightweight dress', 'linen dress'],
  'black oversized hoodie': ['oversized black hoodie', 'black hooded sweatshirt', 'oversized fleece hoodie', 'black hoodie'],
  'white crop top': ['white crop top', 'cropped white top', 'white tank top', 'cropped blouse'],
  'wide leg jeans': ['wide leg jeans', 'wide-leg denim', 'loose fit jeans', 'flared denim']
};

export function extractFashionIntent(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { queryClean: '', garment: null, material: null, color: null, fit: null, occasion: null, season: null, expandedTerms: [] };
  }

  const queryClean = rawQuery.toLowerCase().replace(/[^a-z0-9\s\-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = queryClean.split(/\s+/);

  let garment = null;
  let material = null;
  let color = null;
  let fit = null;
  let occasion = null;
  let season = null;

  // 1. Extract Garment Type (Check 2-word first e.g. "cover up")
  for (const g of GARMENT_TYPES) {
    if (queryClean.includes(g)) {
      garment = g;
      break;
    }
  }

  // 2. Extract Material
  for (const m of MATERIALS) {
    if (words.includes(m)) {
      material = m;
      break;
    }
  }

  // 3. Extract Color
  for (const c of COLORS) {
    if (words.includes(c)) {
      color = c;
      break;
    }
  }

  // 4. Extract Fit
  for (const f of FITS) {
    if (queryClean.includes(f)) {
      fit = f;
      break;
    }
  }

  // 5. Extract Occasion
  for (const o of OCCASIONS) {
    if (queryClean.includes(o)) {
      occasion = o;
      break;
    }
  }

  // 6. Extract Season
  for (const s of SEASONS) {
    if (words.includes(s)) {
      season = s;
      break;
    }
  }

  // 7. Get Synonym Expansions
  let expandedTerms = [queryClean];
  if (SYNONYM_MAPPINGS[queryClean]) {
    expandedTerms = [...new Set([...expandedTerms, ...SYNONYM_MAPPINGS[queryClean]])];
  } else {
    // Generate fallback expansion based on attributes
    const parts = [color, fit, material, garment, occasion].filter(Boolean);
    if (parts.length > 0) {
      expandedTerms.push(parts.join(' '));
    }
  }

  return {
    queryClean,
    garment,
    material,
    color,
    fit,
    occasion,
    season,
    expandedTerms
  };
}

export function buildScraperSearchQuery(queryIntent) {
  const { queryClean, garment, material, color, occasion } = queryIntent;
  const terms = [color, material, garment || queryClean, occasion, 'women clothing apparel'].filter(Boolean);
  return [...new Set(terms)].join(' ');
}
