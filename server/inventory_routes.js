import express from 'express';
import { query } from './db.js';
import { getSkuInventory, getProductInventory, adjustInventoryAdmin } from './inventory_service.js';
import { createOrder, processOrderPayment, cancelOrder, refundOrder, getOrderById } from './order_service.js';

const router = express.Router();

// 1. GET /api/inventory/:skuId
router.get('/inventory/:skuId', async (req, res) => {
  try {
    const inv = await getSkuInventory(req.params.skuId);
    if (!inv) {
      return res.status(404).json({ success: false, error: 'SKU inventory not found' });
    }
    res.json({ success: true, inventory: inv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/products/:productId/inventory
router.get('/products/:productId/inventory', async (req, res) => {
  try {
    const variants = await getProductInventory(req.params.productId);
    res.json({ success: true, count: variants.length, inventory: variants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/orders (Create Order & Reserve Stock Atomically)
router.post('/orders', async (req, res) => {
  try {
    const { userId, tenantId, items, shippingAddress, idempotencyKey } = req.body;
    const order = await createOrder({
      userId: userId || null,
      tenantId: tenantId || null,
      items,
      shippingAddress,
      idempotencyKey
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('API Error /api/orders:', err.message);
    const status = err.message.includes('OUT_OF_STOCK') ? 409 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// 4. GET /api/orders/:orderId
router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/orders/:orderId/pay
router.post('/orders/:orderId/pay', async (req, res) => {
  try {
    const order = await processOrderPayment(req.params.orderId);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. POST /api/orders/:orderId/cancel
router.post('/orders/:orderId/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await cancelOrder(req.params.orderId, reason);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. POST /api/orders/:orderId/refund
router.post('/orders/:orderId/refund', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await refundOrder(req.params.orderId, reason);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. POST /api/admin/inventory/adjust (Manual Stock Adjustment)
router.post('/admin/inventory/adjust', async (req, res) => {
  try {
    const { skuId, type, quantity, reason, userId } = req.body;
    const inv = await adjustInventoryAdmin(skuId, type, quantity, reason, userId);
    res.json({ success: true, message: 'Stock adjusted successfully', inventory: inv });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 9. GET /api/admin/inventory/movements
router.get('/admin/inventory/movements', async (req, res) => {
  try {
    const { skuId, limit } = req.query;
    let sql = `
      SELECT m.id, m.sku_id, k.product_id, k.color_name, k.size_name, m.type, m.quantity, m.order_id, m.user_id, m.reason, m.created_at
      FROM inventory_movements m
      JOIN product_skus k ON m.sku_id = k.id
    `;
    const params = [];

    if (skuId) {
      sql += ` WHERE m.sku_id = $1`;
      params.push(skuId);
    }

    sql += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit ? parseInt(limit, 10) : 50);

    const movementsRes = await query(sql, params);
    res.json({ success: true, count: movementsRes.rows.length, movements: movementsRes.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. GET /api/admin/inventory/low-stock
router.get('/admin/inventory/low-stock', async (req, res) => {
  try {
    const lowStockRes = await query(
      `SELECT k.id AS sku_id, k.product_id, p.name AS product_name, k.color_name, k.size_name, k.sku_code,
              i.initial_quantity, i.on_hand_quantity, i.reserved_quantity, i.sold_quantity,
              (i.on_hand_quantity - i.reserved_quantity) AS available_quantity
       FROM product_skus k
       JOIN sku_inventory i ON k.id = i.sku_id
       JOIN products p ON k.product_id = p.id
       WHERE (i.on_hand_quantity - i.reserved_quantity) <= 5
       ORDER BY available_quantity ASC`
    );

    const items = lowStockRes.rows.map(row => ({
      sku_id: row.sku_id,
      product_id: row.product_id,
      product_name: row.product_name,
      color_name: row.color_name,
      size_name: row.size_name,
      sku_code: row.sku_code,
      initial_quantity: parseInt(row.initial_quantity, 10),
      on_hand_quantity: parseInt(row.on_hand_quantity, 10),
      reserved_quantity: parseInt(row.reserved_quantity, 10),
      sold_quantity: parseInt(row.sold_quantity, 10),
      available_quantity: Math.max(0, parseInt(row.available_quantity, 10)),
      status: parseInt(row.available_quantity, 10) <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
    }));

    res.json({ success: true, count: items.length, lowStockItems: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
