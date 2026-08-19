import crypto from 'crypto';
import { query } from './db.js';

export async function initInventoryDb() {
  console.log('Setting up Inventory & Order PostgreSQL schemas...');

  await query(`
    CREATE TABLE IF NOT EXISTS product_skus (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
      color_id VARCHAR(64) REFERENCES product_colors(id) ON DELETE CASCADE,
      color_name VARCHAR(50) NOT NULL DEFAULT 'Default Color',
      size_name VARCHAR(20) NOT NULL DEFAULT 'M',
      sku_code VARCHAR(128) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sku_inventory (
      sku_id VARCHAR(64) PRIMARY KEY REFERENCES product_skus(id) ON DELETE CASCADE,
      initial_quantity INTEGER NOT NULL DEFAULT 15 CHECK (initial_quantity >= 0),
      on_hand_quantity INTEGER NOT NULL DEFAULT 15 CHECK (on_hand_quantity >= 0),
      reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
      sold_quantity INTEGER NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_inventory_quantities CHECK (on_hand_quantity >= reserved_quantity)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS stock_reservations (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      order_id VARCHAR(64),
      sku_id VARCHAR(64) REFERENCES product_skus(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      status VARCHAR(50) NOT NULL DEFAULT 'RESERVED',
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      tenant_id VARCHAR(64),
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
      currency VARCHAR(10) DEFAULT 'EGY',
      idempotency_key VARCHAR(128) UNIQUE,
      shipping_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
      sku_id VARCHAR(64) REFERENCES product_skus(id) ON DELETE RESTRICT,
      product_name TEXT NOT NULL,
      color_name VARCHAR(50),
      size_name VARCHAR(20),
      unit_price NUMERIC NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id VARCHAR(64) PRIMARY KEY,
      sku_id VARCHAR(64) REFERENCES product_skus(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      order_id VARCHAR(64),
      user_id VARCHAR(64),
      reason TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for high performance lookup
  await query(`CREATE INDEX IF NOT EXISTS idx_skus_product ON product_skus(product_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_skus_color_size ON product_skus(product_id, color_name, size_name);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON stock_reservations(status, expires_at);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_movements_sku ON inventory_movements(sku_id);`);

  console.log('Inventory & Order PostgreSQL schemas ready.');

  // Seed SKUs and Initial Demo Inventory for existing products
  await seedInitialSkusAndInventory();
}

export async function seedInitialSkusAndInventory() {
  console.log('Checking & seeding initial SKU inventory records...');

  const productsRes = await query(`SELECT id, name FROM products`);
  const products = productsRes.rows;

  let createdSkusCount = 0;

  for (const p of products) {
    // Fetch colors
    const colorsRes = await query(`SELECT id, name FROM product_colors WHERE product_id = $1`, [p.id]);
    const colors = colorsRes.rows.length > 0 ? colorsRes.rows : [{ id: null, name: 'Default Color' }];

    // Fetch sizes
    const sizesRes = await query(`SELECT name FROM product_sizes WHERE product_id = $1`, [p.id]);
    const sizeNames = sizesRes.rows.length > 0 ? sizesRes.rows.map(s => s.name) : ['XS', 'S', 'M', 'L', 'XL'];

    for (const color of colors) {
      for (const sizeName of sizeNames) {
        const cleanColor = (color.name || 'Default Color').trim();
        const cleanSize = sizeName.trim();
        const skuCode = `SKU-${p.id.replace(/[^a-zA-Z0-9]/g, '')}-${cleanColor.toLowerCase().replace(/[^a-z0-9]/g, '')}-${cleanSize.toLowerCase()}`;
        const skuId = `sku_${crypto.createHash('sha256').update(skuCode).digest('hex').substring(0, 16)}`;

        // Insert SKU record if not exists
        const skuInsert = await query(
          `INSERT INTO product_skus (id, product_id, color_id, color_name, size_name, sku_code, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (sku_code) DO NOTHING
           RETURNING id`,
          [skuId, p.id, color.id, cleanColor, cleanSize, skuCode]
        );

        if (skuInsert.rows.length > 0) {
          createdSkusCount++;

          // Deterministic Initial Quantity Generation (range 3 - 50)
          const hashHex = crypto.createHash('sha256').update(skuCode).digest('hex');
          const hashNum = parseInt(hashHex.substring(0, 8), 16);

          let initialQty = 15;
          if (hashNum % 12 === 0) {
            initialQty = (hashNum % 3) + 3; // 3 - 5 (Low Stock)
          } else if (hashNum % 5 === 0) {
            initialQty = (hashNum % 15) + 6; // 6 - 20 (Medium Stock)
          } else {
            initialQty = (hashNum % 30) + 21; // 21 - 50 (High Stock)
          }

          // Insert Inventory Record
          await query(
            `INSERT INTO sku_inventory (sku_id, initial_quantity, on_hand_quantity, reserved_quantity, sold_quantity, updated_at)
             VALUES ($1, $2, $2, 0, 0, NOW())
             ON CONFLICT (sku_id) DO NOTHING`,
            [skuId, initialQty]
          );

          // Log Movement History
          const movId = `mov_${crypto.createHash('sha256').update(`init_${skuId}`).digest('hex').substring(0, 16)}`;
          await query(
            `INSERT INTO inventory_movements (id, sku_id, type, quantity, reason, created_at)
             VALUES ($1, $2, 'INITIAL_STOCK', $3, 'Initial deterministic demo stock allocation', NOW())
             ON CONFLICT (id) DO NOTHING`,
            [movId, skuId, initialQty]
          );
        }
      }
    }
  }

  console.log(`SKU Inventory ready (${createdSkusCount} new SKUs generated).`);
}
