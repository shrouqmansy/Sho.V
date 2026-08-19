import crypto from 'crypto';
import { query } from './db.js';
import { reserveStock, releaseReservation, getSkuInventory } from './inventory_service.js';

export async function createOrder({ userId = null, tenantId = null, items, shippingAddress = '', idempotencyKey = null }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order items array cannot be empty');
  }

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existing = await query(`SELECT id, status, total_amount, created_at FROM orders WHERE idempotency_key = $1`, [idempotencyKey]);
    if (existing.rows.length > 0) {
      console.log(`[Order Idempotency] Returning existing order for key ${idempotencyKey}`);
      return await getOrderById(existing.rows[0].id);
    }
  }

  // 2. Validate all items and recalculate total server-side (NEVER trust frontend price or stock)
  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    if (!item.skuId || !item.quantity || item.quantity <= 0) {
      throw new Error('Every item must contain a valid skuId and positive quantity');
    }

    // Verify SKU exists and fetch price from product
    const sku = await getSkuInventory(item.skuId);
    if (!sku) {
      throw new Error(`SKU ${item.skuId} does not exist`);
    }

    const prodRes = await query(`SELECT name, price, currency FROM products WHERE id = $1`, [sku.product_id]);
    if (prodRes.rows.length === 0) {
      throw new Error(`Product for SKU ${item.skuId} not found`);
    }

    const prod = prodRes.rows[0];
    const unitPrice = parseFloat(prod.price);
    const itemTotal = unitPrice * item.quantity;
    totalAmount += itemTotal;

    processedItems.push({
      skuId: sku.sku_id,
      productName: prod.name,
      colorName: sku.color_name,
      sizeName: sku.size_name,
      unitPrice,
      quantity: item.quantity
    });
  }

  const orderId = `ord_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

  await query('BEGIN');

  try {
    // 3. Create Order Record (Status: PENDING)
    await query(
      `INSERT INTO orders (id, user_id, tenant_id, status, total_amount, currency, idempotency_key, shipping_address, created_at, updated_at)
       VALUES ($1, $2, $3, 'PENDING', $4, 'EGY', $5, $6, NOW(), NOW())`,
      [orderId, userId, tenantId, totalAmount, idempotencyKey, shippingAddress]
    );

    // 4. Create Order Items and Reserve Stock for each item inside PostgreSQL transaction
    const reservations = [];
    for (const item of processedItems) {
      const itemId = `item_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
      await query(
        `INSERT INTO order_items (id, order_id, sku_id, product_name, color_name, size_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [itemId, orderId, item.skuId, item.productName, item.colorName, item.sizeName, item.unitPrice, item.quantity]
      );

      // Reserve stock with row-level locking
      const res = await reserveStock(userId, orderId, item.skuId, item.quantity);
      if (!res.success) {
        throw new Error(`Stock reservation failed for ${item.productName} (${item.colorName}/${item.sizeName}): ${res.error}`);
      }
      reservations.push(res);
    }

    // Update order status to RESERVED
    await query(`UPDATE orders SET status = 'RESERVED', updated_at = NOW() WHERE id = $1`, [orderId]);

    await query('COMMIT');

    return await getOrderById(orderId);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

export async function processOrderPayment(orderId) {
  await query('BEGIN');

  try {
    const orderRes = await query(`SELECT id, status FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
    if (orderRes.rows.length === 0) {
      await query('ROLLBACK');
      throw new Error('Order not found');
    }

    const order = orderRes.rows[0];
    if (order.status !== 'RESERVED' && order.status !== 'PENDING') {
      await query('ROLLBACK');
      throw new Error(`Order cannot be paid in current status: ${order.status}`);
    }

    // Mark reservations as COMMITTED
    await query(`UPDATE stock_reservations SET status = 'COMMITTED' WHERE order_id = $1 AND status = 'RESERVED'`, [orderId]);

    // Update order status to PAID
    await query(`UPDATE orders SET status = 'PAID', updated_at = NOW() WHERE id = $1`, [orderId]);

    await query('COMMIT');
    return await getOrderById(orderId);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

export async function cancelOrder(orderId, reason = 'Customer requested cancellation') {
  await query('BEGIN');

  try {
    const orderRes = await query(`SELECT id, status FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
    if (orderRes.rows.length === 0) {
      await query('ROLLBACK');
      throw new Error('Order not found');
    }

    const order = orderRes.rows[0];
    if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
      await query('ROLLBACK');
      throw new Error(`Order cannot be cancelled in status: ${order.status}`);
    }

    // Release any active stock reservations
    const reservations = await query(`SELECT id FROM stock_reservations WHERE order_id = $1 AND status = 'RESERVED'`, [orderId]);
    for (const r of reservations.rows) {
      await releaseReservation(r.id, reason);
    }

    await query(`UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1`, [orderId]);

    await query('COMMIT');
    return await getOrderById(orderId);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

export async function refundOrder(orderId, reason = 'Customer refund requested') {
  await query('BEGIN');

  try {
    const orderRes = await query(`SELECT id, status FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
    if (orderRes.rows.length === 0) {
      await query('ROLLBACK');
      throw new Error('Order not found');
    }

    const order = orderRes.rows[0];
    if (order.status !== 'PAID' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
      await query('ROLLBACK');
      throw new Error(`Order cannot be refunded in status: ${order.status}`);
    }

    // Fetch order items and return stock to available inventory
    const itemsRes = await query(`SELECT sku_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
    for (const item of itemsRes.rows) {
      await query(
        `UPDATE sku_inventory
         SET on_hand_quantity = on_hand_quantity + $1, updated_at = NOW()
         WHERE sku_id = $2`,
        [item.quantity, item.sku_id]
      );

      const movId = `mov_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
      await query(
        `INSERT INTO inventory_movements (id, sku_id, type, quantity, order_id, reason, created_at)
         VALUES ($1, $2, 'ORDER_REFUNDED', $3, $4, $5, NOW())`,
        [movId, item.sku_id, item.quantity, orderId, reason]
      );
    }

    await query(`UPDATE orders SET status = 'REFUNDED', updated_at = NOW() WHERE id = $1`, [orderId]);

    await query('COMMIT');
    return await getOrderById(orderId);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

export async function getOrderById(orderId) {
  const orderRes = await query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
  if (orderRes.rows.length === 0) return null;

  const itemsRes = await query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);
  const reservationsRes = await query(`SELECT * FROM stock_reservations WHERE order_id = $1`, [orderId]);

  return {
    ...orderRes.rows[0],
    items: itemsRes.rows,
    reservations: reservationsRes.rows
  };
}
