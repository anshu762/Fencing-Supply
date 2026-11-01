const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

function requireSupplier(req, res, next) {
  if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Supplier access required' });
  }
  next();
}

router.use(authenticate, requireSupplier);

// GET /api/supplier/orders
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT o.*, u.name as customer_name,
                 (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                 FROM orders o LEFT JOIN users u ON o.user_id = u.id`;
    const params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE o.supplier_id = ?';
      params.push(req.user.userId);
    } else {
      query += ' WHERE 1=1';
    }

    if (status === 'awaiting_supplier_confirmation') {
      query += " AND o.status = 'awaiting_supplier_confirmation'";
    } else if (status === 'active') {
      query += " AND o.status IN ('awaiting_payment','confirmed','preparing','dispatched')";
    }

    query += ' ORDER BY o.created_at DESC LIMIT 100';
    const orders = await db.all(query, params);

    for (const o of orders) {
      if (o.status === 'awaiting_supplier_confirmation') {
        o.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      }
    }

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supplier/orders/:id/accept
router.post('/orders/:id/accept', async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.supplier_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (order.status !== 'awaiting_supplier_confirmation') {
      return res.status(400).json({ error: 'Order not awaiting confirmation' });
    }

    // Recheck stock availability
    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    for (const item of items) {
      const v = await db.get('SELECT on_hand, reserved FROM product_variants WHERE id = ?', [item.variant_id]);
      if (!v || (v.on_hand - v.reserved) < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product_name}` });
      }
    }

    // Atomic reservation
    for (const item of items) {
      await db.run(
        'UPDATE product_variants SET reserved = reserved + ? WHERE id = ? AND (on_hand - reserved) >= ?',
        [item.quantity, item.variant_id, item.quantity]
      );
    }

    // Determine next status
    const nextStatus = order.fulfilment_method === 'cod' ? 'confirmed' : 'awaiting_payment';
    const paymentDeadline = nextStatus === 'awaiting_payment'
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      : null;

    await db.run(
      'UPDATE orders SET status = ?, payment_deadline = ?, updated_at = NOW() WHERE id = ?',
      [nextStatus, paymentDeadline, order.id]
    );

    await db.run(
      'INSERT INTO order_events (order_id, event_type, note, actor_id, actor_role) VALUES (?, ?, ?, ?, ?)',
      [order.id, 'supplier_accepted', 'Supplier accepted the order', req.user.userId, req.user.role]
    );

    res.json({ message: 'Order accepted', status: nextStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supplier/orders/:id/reject
router.post('/orders/:id/reject', async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.supplier_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (order.status !== 'awaiting_supplier_confirmation') {
      return res.status(400).json({ error: 'Cannot reject at this stage' });
    }

    await db.run("UPDATE orders SET status = 'rejected', updated_at = NOW() WHERE id = ?", [order.id]);
    await db.run(
      'INSERT INTO order_events (order_id, event_type, note, actor_id, actor_role) VALUES (?, ?, ?, ?, ?)',
      [order.id, 'supplier_rejected', req.body.reason || 'Rejected by supplier', req.user.userId, req.user.role]
    );

    res.json({ message: 'Order rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supplier/orders/:id/status
router.post('/orders/:id/status', async (req, res) => {
  try {
    const { status, courier_reference } = req.body;
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.supplier_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not your order' });
    }

    const validTransitions = {
      'confirmed': ['preparing'],
      'preparing': ['dispatched'],
      'dispatched': ['delivered']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${order.status} to ${status}` });
    }

    const updates = ['status = ?', 'updated_at = NOW()'];
    const params = [status];

    if (courier_reference && status === 'dispatched') {
      updates.push('courier_reference = ?');
      params.push(courier_reference);
    }

    params.push(order.id);
    await db.run(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    await db.run(
      'INSERT INTO order_events (order_id, event_type, note, actor_id, actor_role) VALUES (?, ?, ?, ?, ?)',
      [order.id, status, courier_reference ? `Courier: ${courier_reference}` : null, req.user.userId, req.user.role]
    );

    res.json({ message: `Order marked as ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supplier/products
router.get('/products', async (req, res) => {
  try {
    const products = await db.all(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.supplier_id = ? ORDER BY p.created_at DESC`,
      [req.user.userId]
    );
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supplier/stock
router.get('/stock', async (req, res) => {
  try {
    const stock = await db.all(
      `SELECT pv.*, p.name as product_name,
              (pv.on_hand - pv.reserved) as available
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE p.supplier_id = ?
       ORDER BY p.name, pv.label`,
      [req.user.userId]
    );
    res.json({ stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;