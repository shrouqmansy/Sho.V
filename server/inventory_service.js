import crypto from 'crypto';
import { query } from './db.js';

/**
 * Calculates human-readable inventory availability badge
 * 0: OUT_OF_STOCK
 * 1-5: ONLY_X_LEFT
 * 6+: IN_STOCK
 */
export function getAvailabilityStatus(availableQty) {
  if (availableQty <= 0) {
    return { code: 'OUT_OF_STOCK', label: 'Out of stock', available: 0 };
  } else if (availableQty <= 5) {
    return { code: 'LOW_STOCK', label: `Only ${availableQty} left`, available: availableQty };
  } else {
    return { code: 'IN_STOCK', label: 'In stock', available: availableQty };
  }
}

/**
 * Atomic Transactional Stock Reservation using PostgreSQL row-level locking (SELECT ... FOR UPDATE)
 */
export async function reserveStock(userId, orderId, skuId, quantity) {
  if (!skuId || !quantity || quantity <= 0) {
    return { success: false, error: 'Invalid SKU or quantity parameter' };
  }

  // Start Transaction
  await query('BEGIN');

  try {
    // 1. Lock the SKU inventory row with FOR UPDATE to prevent race conditions
    const invRes = await query(
      `SELECT i.sku_id, i.on_hand_quantity, i.reserved_quantity, (i.on_hand_quantity - i.reserved_quantity) AS available_quantity
       FROM sku_inventory i
       WHERE i.sku_id = $1
       FOR UPDATE`,
      [skuId]
    );

    if (invRes.rows.length === 0) {
      await query('ROLLBACK');
      return { success: false, error: 'SKU_NOT_FOUND' };
    }

    const currentAvailable = parseInt(invRes.rows[0].available_quantity, 10);

    // 2. Re-read and verify available quantity
    if (quantity > currentAvailable) {
      await query('ROLLBACK');
      return {
        success: false,
        error: 'OUT_OF_STOCK',
        requested: quantity,
        available: Math.max(0, currentAvailable)
      };
    }

    // 3. Increment reserved_quantity
    await query(
      `UPDATE sku_inventory
       SET reserved_quantity = reserved_quantity + $1, updated_at = NOW()
       WHERE sku_id = $2`,
      [quantity, skuId]
    );

    // 4. Create stock_reservations record (15-minute expiration)
    const reservationId = `res_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await query(
      `INSERT INTO stock_reservations (id, user_id, order_id, sku_id, quantity, status, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, 'RESERVED', $6, NOW())`,
      [reservationId, userId || null, orderId || null, skuId, quantity, expiresAt]
    );

    // 5. Log Inventory Movement Audit Record
    const movId = `mov_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await query(
      `INSERT INTO inventory_movements (id, sku_id, type, quantity, order_id, user_id, reason, created_at)
       VALUES ($1, $2, 'ORDER_RESERVED', $3, $4, $5, $6, NOW())`,
      [movId, skuId, -quantity, orderId || null, userId || null, 'Checkout 15-minute stock reservation']
    );

    // Commit Transaction
    await query('COMMIT');

    const newAvailable = currentAvailable - quantity;

    return {
      success: true,
      reservationId,
      skuId,
      quantity,
      expiresAt,
      available: newAvailable
    };
  } catch (err) {
    await query('ROLLBACK');
    console.error(`[reserveStock Transaction Error] SKU ${skuId}:`, err);
    throw err;
  }
}

/**
 * Release an active or expired reservation back to available stock
 */
export async function releaseReservation(reservationId, reason = 'Reservation cancelled or expired') {
  await query('BEGIN');

  try {
    const resRow = await query(
      `SELECT id, user_id, order_id, sku_id, quantity, status
       FROM stock_reservations
       WHERE id = $1
       FOR UPDATE`,
      [reservationId]
    );

    if (resRow.rows.length === 0) {
      await query('ROLLBACK');
      return { success: false, error: 'RESERVATION_NOT_FOUND' };
    }

    const res = resRow.rows[0];
    if (res.status !== 'RESERVED') {
      await query('ROLLBACK');
      return { success: false, error: 'RESERVATION_ALREADY_PROCESSED', status: res.status };
    }

    // Lock SKU inventory row
    await query(
      `SELECT sku_id FROM sku_inventory WHERE sku_id = $1 FOR UPDATE`,
      [res.sku_id]
    );

    // Decrease reserved_quantity
    await query(
      `UPDATE sku_inventory
       SET reserved_quantity = GREATEST(0, reserved_quantity - $1), updated_at = NOW()
       WHERE sku_id = $2`,
      [res.quantity, res.sku_id]
    );

    // Mark reservation as EXPIRED or RELEASED
    const newStatus = reason.includes('expired') ? 'EXPIRED' : 'RELEASED';
    await query(
      `UPDATE stock_reservations SET status = $1 WHERE id = $2`,
      [newStatus, reservationId]
    );

    // Audit Movement Log
    const movId = `mov_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await query(
      `INSERT INTO inventory_movements (id, sku_id, type, quantity, order_id, user_id, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [movId, res.sku_id, newStatus === 'EXPIRED' ? 'EXPIRED_RESERVATION' : 'ORDER_CANCELLED', res.quantity, res.order_id, res.user_id, reason]
    );

    await query('COMMIT');
    return { success: true, reservationId, skuId: res.sku_id, releasedQuantity: res.quantity };
  } catch (err) {
    await query('ROLLBACK');
    console.error(`[releaseReservation Error] ID ${reservationId}:`, err);
    throw err;
  }
}

/**
 * Periodically find and release expired reservations
 */
export async function cleanupExpiredReservations() {
  try {
    const expiredRes = await query(
      `SELECT id FROM stock_reservations WHERE status = 'RESERVED' AND expires_at < NOW()`
    );

    let count = 0;
    for (const r of expiredRes.rows) {
      await releaseReservation(r.id, 'Automatic 15-minute reservation cleanup');
      count++;
    }

    if (count > 0) {
      console.log(`[Inventory Worker] Released ${count} expired stock reservations.`);
    }
    return count;
  } catch (err) {
    console.error('[Inventory Worker Error] Cleanup failed:', err);
    return 0;
  }
}

/**
 * Manual Admin Inventory Adjustment with mandatory reason requirement
 */
export async function adjustInventoryAdmin(skuId, type, quantity, reason, userId = null) {
  if (!skuId || !type || quantity === undefined || !reason || !reason.trim()) {
    throw new Error('SKU ID, movement type, quantity, and reason are required');
  }

  const validTypes = ['RESTOCK', 'DAMAGED', 'LOST', 'MANUAL_ADJUSTMENT'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid movement type: ${type}. Must be one of ${validTypes.join(', ')}`);
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Quantity must be a positive integer');
  }

  await query('BEGIN');

  try {
    const invRes = await query(
      `SELECT sku_id, on_hand_quantity, reserved_quantity FROM sku_inventory WHERE sku_id = $1 FOR UPDATE`,
      [skuId]
    );

    if (invRes.rows.length === 0) {
      await query('ROLLBACK');
      throw new Error(`SKU ${skuId} not found in inventory`);
    }

    let deltaOnHand = 0;
    if (type === 'RESTOCK' || type === 'MANUAL_ADJUSTMENT') {
      deltaOnHand = qty;
    } else if (type === 'DAMAGED' || type === 'LOST') {
      deltaOnHand = -qty;
    }

    await query(
      `UPDATE sku_inventory
       SET on_hand_quantity = GREATEST(reserved_quantity, on_hand_quantity + $1), updated_at = NOW()
       WHERE sku_id = $2`,
      [deltaOnHand, skuId]
    );

    const movId = `mov_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    await query(
      `INSERT INTO inventory_movements (id, sku_id, type, quantity, user_id, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [movId, skuId, type, deltaOnHand, userId, reason.trim()]
    );

    await query('COMMIT');

    return await getSkuInventory(skuId);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

/**
 * Fetch detailed SKU inventory with availability thresholds
 */
export async function getSkuInventory(skuId) {
  const res = await query(
    `SELECT k.id AS sku_id, k.product_id, k.color_name, k.size_name, k.sku_code,
            i.initial_quantity, i.on_hand_quantity, i.reserved_quantity, i.sold_quantity,
            (i.on_hand_quantity - i.reserved_quantity) AS available_quantity
     FROM product_skus k
     JOIN sku_inventory i ON k.id = i.sku_id
     WHERE k.id = $1`,
    [skuId]
  );

  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  const available = Math.max(0, parseInt(row.available_quantity, 10));
  const status = getAvailabilityStatus(available);

  return {
    sku_id: row.sku_id,
    product_id: row.product_id,
    color_name: row.color_name,
    size_name: row.size_name,
    sku_code: row.sku_code,
    initial_quantity: parseInt(row.initial_quantity, 10),
    on_hand_quantity: parseInt(row.on_hand_quantity, 10),
    reserved_quantity: parseInt(row.reserved_quantity, 10),
    sold_quantity: parseInt(row.sold_quantity, 10),
    available_quantity: available,
    status
  };
}

/**
 * Fetch inventory for all color/size variants of a product
 */
export async function getProductInventory(productId) {
  const res = await query(
    `SELECT k.id AS sku_id, k.product_id, k.color_name, k.size_name, k.sku_code,
            i.initial_quantity, i.on_hand_quantity, i.reserved_quantity, i.sold_quantity,
            (i.on_hand_quantity - i.reserved_quantity) AS available_quantity
     FROM product_skus k
     JOIN sku_inventory i ON k.id = i.sku_id
     WHERE k.product_id = $1
     ORDER BY k.color_name, k.size_name`,
    [productId]
  );

  return res.rows.map(row => {
    const available = Math.max(0, parseInt(row.available_quantity, 10));
    return {
      sku_id: row.sku_id,
      product_id: row.product_id,
      color_name: row.color_name,
      size_name: row.size_name,
      sku_code: row.sku_code,
      initial_quantity: parseInt(row.initial_quantity, 10),
      on_hand_quantity: parseInt(row.on_hand_quantity, 10),
      reserved_quantity: parseInt(row.reserved_quantity, 10),
      sold_quantity: parseInt(row.sold_quantity, 10),
      available_quantity: available,
      status: getAvailabilityStatus(available)
    };
  });
}
