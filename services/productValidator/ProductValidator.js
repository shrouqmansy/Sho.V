const CLOTHING_CATEGORIES = [
  'hoodies', 'hoodie', 't-shirts', 't-shirt', 'tshirt', 'tshirts', 'denim', 'jeans',
  'dresses', 'dress', 'blazers', 'blazer', 'shirts', 'shirt', 'jackets', 'jacket',
  'coats', 'coat', 'pants', 'trousers', 'skirts', 'skirt', 'sweaters', 'sweater',
  'cardigans', 'cardigan', 'shorts', 'tops', 'top', 'suits', 'suit', 'accessories'
];

export class ProductValidator {
  static isValidProduct(prod) {
    if (!prod || typeof prod !== 'object') {
      console.warn('[Validator] Rejected null or invalid product object.');
      return false;
    }

    if (!prod.name || typeof prod.name !== 'string' || prod.name.trim().length < 3) {
      console.warn('[Validator] Rejected product with missing or empty name:', prod);
      return false;
    }

    if (!prod.source || !prod.sourceUrl) {
      console.warn(`[Validator] Rejected product missing source or sourceUrl (${prod.name}).`);
      return false;
    }

    if (!prod.images || !Array.isArray(prod.images) || prod.images.length === 0) {
      console.warn(`[Validator] Rejected product without valid images (${prod.name}).`);
      return false;
    }

    const categoryClean = (prod.category || '').toLowerCase();
    const isClothingCat = CLOTHING_CATEGORIES.some(cat => categoryClean.includes(cat));

    if (!isClothingCat) {
      console.warn(`[Validator] Rejected non-clothing category product (${prod.name} - Cat: ${prod.category}).`);
      return false;
    }

    if (!prod.price || isNaN(prod.price) || prod.price <= 0) {
      console.warn(`[Validator] Rejected product without valid price (${prod.name}).`);
      return false;
    }

    return true;
  }
}
