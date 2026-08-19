export class CategoryClassifier {
  static classify(item) {
    if (!item) return null;

    const title = (item.title || item.name || '').toLowerCase().trim();
    if (!title) return null;

    const testMatch = (pattern) => new RegExp(pattern, 'i').test(title);

    // -------------------------------------------------------------
    // PRIORITY 1: DENIM (Genuine Single-Garment Denim Items Only)
    // -------------------------------------------------------------
    const isDenimPositive = testMatch('\\b(jeans|denim jeans|denim jacket|denim skirt|denim pants|selvedge denim)\\b');
    const isDenimNegative = testMatch('\\b(2-piece|two-piece|set|outfit|co-ord)\\b');

    if (isDenimPositive && !isDenimNegative) {
      return 'Denim';
    }

    // -------------------------------------------------------------
    // PRIORITY 2: DRESSES (Genuine One-Piece Dresses / Gowns / Blazer Dresses Only)
    // -------------------------------------------------------------
    // Explicit exception for Blazer Dresses (One-Piece Dresses styled like blazers)
    if (testMatch('\\b(blazer dress|blazer-dress)\\b')) {
      return 'Dresses';
    }

    // Explicitly reject: jumpsuits, rompers, dressy, dress pants, dress shirts, skirts, pants, sets, suits
    const isDressPositive = testMatch('\\b(dress|dresses|gown|gowns|sundress|sundresses|maxi dress|midi dress|mini dress|slip dress|bodycon dress|evening dress|cocktail dress|shirt dress|wrap dress)\\b');
    const isDressNegative = testMatch('\\b(jumpsuit|jumpsuits|romper|rompers|dressy|dress pants|dress shirt|shirt|top|blouse|skirt|pants|trousers|jeans|suit|suits|blazer|blazers|set|sets|two-piece|2-piece|co-ord|outfit)\\b');

    if (isDressPositive && !isDressNegative) {
      return 'Dresses';
    }

    // -------------------------------------------------------------
    // PRIORITY 3: HOODIES (Genuine Hooded Sweatshirts / Hoodies Only)
    // -------------------------------------------------------------
    // Reject crewnecks, hoodless pullovers, sweaters, cardigans, pants
    const isHoodiePositive = testMatch('\\b(hoodie|hoodies|hooded sweatshirt|zip-up hoodie|pullover hoodie|hooded)\\b');
    const isHoodieNegative = testMatch('\\b(crewneck|hoodless|sweater|cardigan|pants|jeans|trousers|suit|suits|set|sets)\\b');

    if (isHoodiePositive && !isHoodieNegative) {
      return 'Hoodies';
    }

    // -------------------------------------------------------------
    // PRIORITY 4: SUITS (Genuine Formal Suits / Blazers / Pantsuits Only)
    // -------------------------------------------------------------
    // Accept: blazer, blazer set, blazer suit, pantsuit, pant suit, trouser suit, business suit, formal suit, tailored suit
    // Reject: training suit, tracksuit, track suit, sports suit, training, jogger, lounge, sweatshirt, hooded, pajama, pyjama, casual set, trouser, trousers, slacks
    const isSuitPositive = testMatch('\\b(blazer|blazer set|blazer suit|pantsuit|pant suit|trouser suit|business suit|formal suit|tailored suit)\\b');
    const isSuitNegative = testMatch('\\b(training suit|tracksuit|track suit|sports suit|training|jogger|lounge|sweatshirt|hooded|pajama|pyjama|casual set|trouser|trousers|slacks)\\b');

    if (isSuitPositive && !isSuitNegative) {
      return 'Suits';
    }

    // -------------------------------------------------------------
    // PRIORITY 5: TOPS (Standalone Tops, Shirts, Blouses, T-Shirts Only)
    // -------------------------------------------------------------
    // Reject complete multi-piece sets, suits, pants, dresses, gowns, jumpsuits
    const isTopPositive = testMatch('\\b(top|tops|shirt|shirts|t-shirt|tshirt|tee|tees|blouse|blouses|crop top|tank top|camisole|corset top|vest|sweatshirt|pullover|sweater|tunic)\\b');
    const isTopNegative = testMatch('\\b(suit|suits|blazer|blazers|pants|trousers|jeans|dress|dresses|gown|gowns|jumpsuit|jumpsuits|romper|rompers|two-piece|2-piece|co-ord|matching set|outfit set|set|sets)\\b');

    if (isTopPositive && !isTopNegative) {
      return 'Tops';
    }

    // -------------------------------------------------------------
    // REJECT / UNCLASSIFIED (No Description or Search Query Fallback)
    // -------------------------------------------------------------
    return null;
  }
}
