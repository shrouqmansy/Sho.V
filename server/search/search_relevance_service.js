export const MIN_RELEVANCE_THRESHOLD = 25;

export function calculateProductRelevance(prod, queryIntent) {
  if (!prod || !queryIntent) return 0;

  const { queryClean, garment, material, color, fit, occasion, expandedTerms } = queryIntent;

  const titleLower = (prod.name || '').toLowerCase();
  const descLower = (prod.description || '').toLowerCase();
  const catLower = (prod.category || '').toLowerCase();
  const brandLower = (prod.brand || '').toLowerCase();
  const colorsList = (prod.colors || []).map(c => (c.name || '').toLowerCase());

  let score = 0;

  // 1. Exact Title Match (+100)
  if (titleLower === queryClean) {
    score += 100;
  }
  // 2. Strong Phrase Match (+80)
  else if (titleLower.includes(queryClean)) {
    score += 80;
  }

  // 3. Semantic Synonym Match (+60)
  let synonymMatched = false;
  if (expandedTerms && expandedTerms.length > 0) {
    for (const term of expandedTerms) {
      if (term !== queryClean && (titleLower.includes(term) || descLower.includes(term) || catLower.includes(term))) {
        score += 60;
        synonymMatched = true;
        break;
      }
    }
  }

  // 4. Description Match (+40)
  if (!titleLower.includes(queryClean) && descLower.includes(queryClean)) {
    score += 40;
  }

  // 5. Category Match (+30)
  if (garment && catLower.includes(garment)) {
    score += 30;
  } else if (catLower.includes(queryClean)) {
    score += 30;
  }

  // 6. Brand Match (+20)
  if (queryClean.includes(brandLower) && brandLower.length > 2) {
    score += 20;
  }

  // 7. Color Match (+20)
  if (color) {
    if (titleLower.includes(color) || descLower.includes(color) || colorsList.some(c => c.includes(color))) {
      score += 20;
    }
  }

  // 8. Attribute / Material / Fit Match (+15)
  if (material && (titleLower.includes(material) || descLower.includes(material))) {
    score += 15;
  }
  if (fit && (titleLower.includes(fit) || descLower.includes(fit))) {
    score += 15;
  }
  if (occasion && (titleLower.includes(occasion) || descLower.includes(occasion))) {
    score += 15;
  }

  // 9. Partial Keyword Match (+15 per word match)
  const words = queryClean.split(/\s+/).filter(w => w.length > 2);
  for (const w of words) {
    if (titleLower.includes(w) || descLower.includes(w) || catLower.includes(w)) {
      score += 15;
    }
  }

  return score;
}

export function rankAndFilterProducts(productsList, queryIntent) {
  if (!productsList || productsList.length === 0) return [];

  const scoredCandidates = [];
  const seenIds = new Set();

  for (const prod of productsList) {
    if (seenIds.has(prod.id)) continue;
    seenIds.add(prod.id);

    const relevanceScore = calculateProductRelevance(prod, queryIntent);

    // Apply Minimum Relevance Threshold
    if (relevanceScore >= MIN_RELEVANCE_THRESHOLD) {
      scoredCandidates.push({
        product: prod,
        relevanceScore
      });
    }
  }

  // Sort by Relevance Score DESC
  scoredCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scoredCandidates.map(c => c.product);
}
