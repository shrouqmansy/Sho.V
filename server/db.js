import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

let dbInstance = null;
let useStandardPg = false;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres')) {
    try {
      const pool = new pg.Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL database server via DATABASE_URL');
      dbInstance = pool;
      useStandardPg = true;
      return dbInstance;
    } catch (err) {
      console.warn('Could not connect to external PostgreSQL server, falling back to embedded PostgreSQL (PGlite):', err.message);
    }
  }

  const dataDir = path.resolve(process.cwd(), 'data', 'postgres');

  try {
    if (fs.existsSync(dataDir)) {
      const pidFile = path.join(dataDir, 'postmaster.pid');
      if (fs.existsSync(pidFile)) {
        try { fs.unlinkSync(pidFile); } catch (e) {}
      }
    } else {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const pglite = new PGlite(dataDir);
    dbInstance = pglite;
    useStandardPg = false;
    return dbInstance;
  } catch (err) {
    console.error('Failed to initialize embedded PGlite:', err);
    throw err;
  }
}

export async function query(sql, params = []) {
  const db = await getDb();
  return await db.query(sql, params);
}

export function getDeterministicProductId(p) {
  const source = (p.source || 'amazon').toLowerCase().trim();
  const sourceProductId = (p.sourceProductId || p.source_product_id || '').toLowerCase().trim();
  const sourceUrl = (p.sourceUrl || p.source_url || '').toLowerCase().trim();
  const title = (p.title || p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  let rawKey = '';
  if (sourceProductId && !sourceProductId.startsWith('pid-')) {
    rawKey = `${source}:${sourceProductId}`;
  } else if (sourceUrl) {
    rawKey = `${source}:${sourceUrl}`;
  } else {
    rawKey = `${source}:${title}`;
  }

  const hash = crypto.createHash('sha256').update(rawKey).digest('hex').substring(0, 16);
  return `prod_${hash}`;
}

export async function initDb() {
  await getDb();
  console.log('Setting up PostgreSQL database schemas & indexes...');

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      brand TEXT DEFAULT 'SHO.V',
      category TEXT NOT NULL,
      price NUMERIC NOT NULL,
      original_price NUMERIC,
      discount_price NUMERIC,
      discount_percentage INTEGER,
      currency VARCHAR(10) DEFAULT 'EGY',
      quantity INTEGER DEFAULT 10,
      availability VARCHAR(50) DEFAULT 'in_stock',
      rating NUMERIC(3,2),
      review_count INTEGER,
      source VARCHAR(50) DEFAULT 'amazon',
      source_product_id TEXT,
      source_url TEXT UNIQUE,
      source_website TEXT,
      video_url TEXT,
      is_new BOOLEAN DEFAULT false,
      is_sale BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_source_item UNIQUE(source, source_product_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      color_id VARCHAR(64)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS product_colors (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      hex_code VARCHAR(20),
      image_url TEXT,
      sku TEXT,
      source_url TEXT,
      price NUMERIC
    );
  `);

  // Ensure optional new columns exist
  await query(`ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS sku TEXT;`);
  await query(`ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS source_url TEXT;`);
  await query(`ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS price NUMERIC;`);
  await query(`ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_id VARCHAR(64);`);

  await query(`
    CREATE TABLE IF NOT EXISTS product_sizes (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
      name VARCHAR(20) NOT NULL,
      available BOOLEAN DEFAULT true
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
      author VARCHAR(100),
      rating NUMERIC(3,2),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_products_source_url ON products(source_url);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_products_source_pid ON products(source, source_product_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category, created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_products_created_desc ON products(created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_product_images_prod_pos ON product_images(product_id, position ASC);`);

  console.log('PostgreSQL database schemas ready.');
}

export function toThumbnailUrl(url, width = 300) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('jumia.is') && url.includes('/fit-in/')) {
    return url.replace(/\/fit-in\/\d+x\d+\//, `/fit-in/${width}x${width}/`);
  }
  if (url.includes('unsplash.com')) {
    return url.replace(/w=\d+/, `w=${width}`);
  }
  return url;
}

export function formatProductRecord(prod, images = [], colors = [], sizes = [], reviews = []) {
  const rawPrimaryImage = colors.length > 0 && colors[0].image_url ? colors[0].image_url : (images.length > 0 ? images[0].image_url : (prod.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop'));
  const primaryImage = toThumbnailUrl(rawPrimaryImage, 300);
  const allImageUrls = images.map(img => toThumbnailUrl(img.image_url, 300));
  if (allImageUrls.length === 0) allImageUrls.push(primaryImage);

  return {
    id: prod.id,
    name: prod.name,
    description: prod.description || '',
    brand: prod.brand || 'SHO.V',
    category: prod.category,
    price: parseFloat(prod.price),
    originalPrice: prod.original_price ? parseFloat(prod.original_price) : null,
    discountPrice: prod.discount_price ? parseFloat(prod.discount_price) : null,
    discountPercentage: prod.discount_percentage ? parseInt(prod.discount_percentage, 10) : null,
    currency: prod.currency || 'EGY',
    quantity: prod.quantity !== undefined && prod.quantity !== null ? parseInt(prod.quantity, 10) : 10,
    availability: prod.availability || 'in_stock',
    rating: prod.rating ? parseFloat(prod.rating) : null,
    reviewCount: prod.review_count ? parseInt(prod.review_count, 10) : null,
    source: prod.source || 'amazon',
    sourceProductId: prod.source_product_id || null,
    sourceUrl: prod.source_url || null,
    sourceWebsite: prod.source_website || (prod.source ? prod.source.toUpperCase() : 'Amazon'),
    videoUrl: prod.video_url || null,
    isNew: Boolean(prod.is_new),
    isSale: Boolean(prod.is_sale || prod.original_price),
    image: primaryImage,
    images: allImageUrls,
    rawImages: images.map(img => ({ id: img.id, url: img.image_url, colorId: img.color_id })),
    swatches: colors.map(c => c.hex_code).filter(Boolean),
    colors: (() => {
      let formattedColors = colors.map(c => ({
        id: c.id,
        name: c.name,
        hex: c.hex_code || '#151616',
        image_url: c.image_url,
        sku: c.sku || null,
        sourceUrl: c.source_url || null,
        price: c.price ? parseFloat(c.price) : null
      }));

      if ((formattedColors.length === 0 || (formattedColors.length === 1 && (formattedColors[0].name.toLowerCase() === 'default color' || formattedColors[0].name.toLowerCase() === 'unknown'))) && allImageUrls.length > 1) {
        const isDenim = prod.category === 'Denim' || (prod.name || '').toLowerCase().includes('jean') || (prod.name || '').toLowerCase().includes('denim');
        const colorNames = isDenim
          ? ['Light Wash', 'Medium Wash', 'Classic Blue', 'Dark Wash', 'Vintage Wash']
          : ['Shade 1', 'Shade 2', 'Shade 3', 'Shade 4', 'Shade 5'];
        const colorHexes = isDenim
          ? ['#64B5F6', '#1E88E5', '#0D47A1', '#3F51B5', '#1A237E']
          : ['#64B5F6', '#151616', '#E0E0E0', '#9C27B0', '#FF9800'];

        const baseCol = formattedColors[0] || {};
        formattedColors = allImageUrls.map((imgUrl, idx) => ({
          id: `${baseCol.id || 'col_' + prod.id}_${idx}`,
          name: colorNames[idx % colorNames.length],
          hex: colorHexes[idx % colorHexes.length],
          image_url: imgUrl,
          sku: baseCol.sku || null,
          sourceUrl: baseCol.sourceUrl || null,
          price: baseCol.price || null
        }));
      }
      return formattedColors;
    })(),
    sizes: sizes.map(s => ({ id: s.id, name: s.name, available: Boolean(s.available) })),
    reviews: reviews.map(r => ({ id: r.id, author: r.author, rating: parseFloat(r.rating), comment: r.comment }))
  };
}

export async function getProductWithRelations(productId) {
  const prodRes = await query(`SELECT * FROM products WHERE id = $1`, [productId]);
  if (prodRes.rows.length === 0) return null;

  const prod = prodRes.rows[0];
  const imagesRes = await query(`SELECT * FROM product_images WHERE product_id = $1 ORDER BY position ASC`, [productId]);
  const colorsRes = await query(`SELECT * FROM product_colors WHERE product_id = $1`, [productId]);
  const sizesRes = await query(`SELECT * FROM product_sizes WHERE product_id = $1`, [productId]);
  const reviewsRes = await query(`SELECT * FROM product_reviews WHERE product_id = $1 ORDER BY created_at DESC`, [productId]);

  return formatProductRecord(prod, imagesRes.rows, colorsRes.rows, sizesRes.rows, reviewsRes.rows);
}

// In-Memory Fast Cache for Supabase Cloud Database Performance
let cachedProductsMap = new Map();
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

export async function getAllProductsFromDb(options = {}) {
  const { category, limit = 200, offset = 0 } = options;

  // Check cache for superfast sub-millisecond responses
  const cacheKey = `${category || 'All'}_${limit}_${offset}`;
  const now = Date.now();
  if (cachedProductsMap.has(cacheKey) && (now - cacheTimestamp < CACHE_TTL_MS)) {
    return cachedProductsMap.get(cacheKey);
  }

  let sql = `SELECT * FROM products`;
  const params = [];

  if (category && category.toLowerCase() !== 'all') {
    sql += ` WHERE LOWER(category) = LOWER($1)`;
    params.push(category);
  }

  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const res = await query(sql, params);
  if (res.rows.length === 0) return [];

  const prodIds = res.rows.map(p => p.id);

  const placeholders = prodIds.map((_, i) => `$${i + 1}`).join(',');
  const [imagesRes, colorsRes, sizesRes, reviewsRes] = await Promise.all([
    query(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY position ASC`, prodIds),
    query(`SELECT * FROM product_colors WHERE product_id IN (${placeholders})`, prodIds),
    query(`SELECT * FROM product_sizes WHERE product_id IN (${placeholders})`, prodIds),
    query(`SELECT * FROM product_reviews WHERE product_id IN (${placeholders}) ORDER BY created_at DESC`, prodIds)
  ]);

  const imagesByProd = {};
  const colorsByProd = {};
  const sizesByProd = {};
  const reviewsByProd = {};

  for (const img of imagesRes.rows) {
    if (!imagesByProd[img.product_id]) imagesByProd[img.product_id] = [];
    imagesByProd[img.product_id].push(img);
  }
  for (const col of colorsRes.rows) {
    if (!colorsByProd[col.product_id]) colorsByProd[col.product_id] = [];
    colorsByProd[col.product_id].push(col);
  }
  for (const sz of sizesRes.rows) {
    if (!sizesByProd[sz.product_id]) sizesByProd[sz.product_id] = [];
    sizesByProd[sz.product_id].push(sz);
  }
  for (const rev of reviewsRes.rows) {
    if (!reviewsByProd[rev.product_id]) reviewsByProd[rev.product_id] = [];
    reviewsByProd[rev.product_id].push(rev);
  }

  const productsList = res.rows.map(prod => {
    return formatProductRecord(
      prod,
      imagesByProd[prod.id] || [],
      colorsByProd[prod.id] || [],
      sizesByProd[prod.id] || [],
      reviewsByProd[prod.id] || []
    );
  });

  cachedProductsMap.set(cacheKey, productsList);
  cacheTimestamp = Date.now();

  return productsList;
}

export async function searchProductsInDb(searchQuery) {
  if (!searchQuery || typeof searchQuery !== 'string') return [];
  const cleanQuery = searchQuery.trim().toLowerCase();
  const terms = cleanQuery.split(/\s+/).filter(t => t.length > 1);

  if (terms.length === 0) return [];

  const likePattern = `%${cleanQuery}%`;
  const res = await query(`
    SELECT * FROM products
    WHERE LOWER(name) LIKE $1
       OR LOWER(category) LIKE $1
       OR LOWER(brand) LIKE $1
       OR LOWER(description) LIKE $1
    ORDER BY created_at DESC
  `, [likePattern]);

  let matchedRows = res.rows;

  if (matchedRows.length === 0 && terms.length > 1) {
    const termConditions = terms.map((_, idx) => `(LOWER(name) LIKE $${idx + 1} OR LOWER(category) LIKE $${idx + 1} OR LOWER(description) LIKE $${idx + 1})`).join(' OR ');
    const termParams = terms.map(t => `%${t}%`);
    const termRes = await query(`SELECT * FROM products WHERE ${termConditions} ORDER BY created_at DESC`, termParams);
    matchedRows = termRes.rows;
  }

  const results = [];
  const seenIds = new Set();

  for (const prod of matchedRows) {
    if (!seenIds.has(prod.id)) {
      seenIds.add(prod.id);
      const fullProd = await getProductWithRelations(prod.id);
      if (fullProd) results.push(fullProd);
    }
  }

  return results;
}

export async function insertScrapedProduct(p) {
  if (!p || !p.name || (!p.image && (!p.images || p.images.length === 0))) {
    console.warn('[DB Error] Rejected product missing required name or image:', p);
    return null;
  }

  const source = (p.source || 'amazon').toLowerCase();
  const sourceProductId = p.sourceProductId || p.source_product_id || `pid-${Date.now()}`;
  const sourceUrl = p.sourceUrl || p.source_url || `https://${source}.com/item/${sourceProductId}`;

  const productId = p.id || getDeterministicProductId(p);
  const category = p.category || 'Hoodies';
  const price = p.price || 1500;
  const originalPrice = p.originalPrice || p.original_price || null;
  const discountPercentage = p.discountPercentage || (originalPrice ? Math.round((1 - price / originalPrice) * 100) : null);
  const brand = p.brand || `${source.toUpperCase()} Selection`;

  await query(`
    INSERT INTO products (
      id, name, description, brand, category, price, original_price,
      discount_percentage, currency, quantity, availability, rating,
      review_count, source, source_product_id, source_url, source_website, video_url, is_new
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      brand = EXCLUDED.brand,
      category = EXCLUDED.category,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      discount_percentage = EXCLUDED.discount_percentage,
      source_url = EXCLUDED.source_url,
      updated_at = CURRENT_TIMESTAMP
  `, [
    productId,
    p.name,
    p.description || `Luxury ${category} apparel.`,
    brand,
    category,
    price,
    originalPrice,
    discountPercentage,
    p.currency || 'EGY',
    p.quantity !== undefined ? p.quantity : 10,
    p.availability || 'in_stock',
    p.rating || null,
    p.reviewCount || p.review_count || null,
    source,
    sourceProductId,
    sourceUrl,
    p.sourceWebsite || p.source_website || source.toUpperCase(),
    p.videoUrl || p.video_url || null,
    true
  ]);

  // Insert Colors
  const rawColors = p.colors || [];
  await query(`DELETE FROM product_colors WHERE product_id = $1`, [productId]);
  for (let idx = 0; idx < rawColors.length; idx++) {
    const c = rawColors[idx];
    const colorId = c.id || `col-${productId}-${idx}`;
    await query(`
      INSERT INTO product_colors (id, product_id, name, hex_code, image_url, sku, source_url, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      colorId,
      productId,
      c.name || 'Color',
      c.hex || c.hex_code || '#151616',
      c.image_url || c.imageUrl || null,
      c.sku || null,
      c.sourceUrl || c.source_url || null,
      c.price || null
    ]);
  }

  // Insert Images
  const variantImages = p.variantImages || [];
  const rawImages = p.images && p.images.length > 0 ? p.images : [p.image];

  await query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
  
  if (variantImages.length > 0) {
    for (let idx = 0; idx < variantImages.length; idx++) {
      const vImg = variantImages[idx];
      const imgId = `img-${productId}-${idx}`;
      await query(`INSERT INTO product_images (id, product_id, image_url, position, color_id) VALUES ($1, $2, $3, $4, $5)`, [
        imgId,
        productId,
        vImg.image_url,
        idx,
        vImg.color_id || null
      ]);
    }
  } else {
    for (let idx = 0; idx < rawImages.length; idx++) {
      const imgUrl = rawImages[idx];
      const imgId = `img-${productId}-${idx}`;
      await query(`INSERT INTO product_images (id, product_id, image_url, position) VALUES ($1, $2, $3, $4)`, [
        imgId,
        productId,
        imgUrl,
        idx
      ]);
    }
  }

  // Insert Sizes
  const rawSizes = p.sizes || [];
  await query(`DELETE FROM product_sizes WHERE product_id = $1`, [productId]);
  for (let idx = 0; idx < rawSizes.length; idx++) {
    const s = rawSizes[idx];
    const sizeId = `size-${productId}-${idx}`;
    await query(`INSERT INTO product_sizes (id, product_id, name, available) VALUES ($1, $2, $3, $4)`, [
      sizeId,
      productId,
      s.name || s,
      s.available !== undefined ? Boolean(s.available) : true
    ]);
  }

  // Insert Reviews
  if (p.reviews && p.reviews.length > 0) {
    await query(`DELETE FROM product_reviews WHERE product_id = $1`, [productId]);
    for (let idx = 0; idx < p.reviews.length; idx++) {
      const r = p.reviews[idx];
      const revId = `rev-${productId}-${idx}`;
      await query(`INSERT INTO product_reviews (id, product_id, author, rating, comment) VALUES ($1, $2, $3, $4, $5)`, [
        revId,
        productId,
        r.author || 'Verified Buyer',
        r.rating || 5.0,
        r.comment || 'High quality material.'
      ]);
    }
  }

  return await getProductWithRelations(productId);
}
