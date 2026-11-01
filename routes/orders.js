const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

// POST /api/orders — Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, address, fulfilment_method = 'standard_shipping', pincode } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ error: 'No items' });
    if (!address || !pincode) return res.status(400).json({ error: 'Address and PIN required' });

    // Check PIN serviceability
    const pin = await db.get('SELECT * FROM serviceable_pins WHERE pincode = ?', [pincode]);
    if (!pin) return res.status(400).json({ error: 'PIN code not serviceable' });
    if (fulfilment_method === 'express_delivery' && !pin.express_delivery) {
      return res.status(400).json({ error: 'Express delivery not available for this PIN' });
    }
    if (fulfilment_method === 'standard_shipping' && !pin.standard_shipping) {
      return res.status(400).json({ error: 'Standard shipping not available for this PIN' });
    }

    // Validate items and calculate server-side
    let subtotal = 0;
    let supplierId = null;
    const orderItems = [];

    for (const item of items) {
      const v = await db.get(
        `SELECT pv.*, p.name as product_name, p.image_url, p.supplier_id, p.return_eligible, s.name as supplier_name
         FROM product_variants pv
         JOIN products p ON pv.product_id = p.id
         JOIN suppliers s ON p.supplier_id = s.id
         WHERE pv.id = ? AND pv.active = 1`,
        [item.variant_id]
      );

      if (!v) return res.status(400).json({ error: `Variant ${item.variant_id} not found` });
      if ((Number(v.on_hand) - Number(v.reserved)) < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${v.product_name}` });
      }
      if (supplierId && supplierId !== v.supplier_id) {
        return res.status(400).json({ error: 'One supplier per order' });
      }

      supplierId = v.supplier_id;
      const lineTotal = Number(v.price_paise) * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product_id: v.product_id,
        variant_id: v.id,
        product_name: v.product_name,
        variant_label: v.label,
        sku: v.sku,
        unit_price_paise: Number(v.price_paise),
        quantity: item.quantity,
        return_eligible: v.return_eligible,
        image_url: v.image_url
      });
    }

    // Calculate totals server-side
    const deliveryFee = 15000;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + deliveryFee + tax;

    // Supplier deadline
    const supplier = await db.get('SELECT response_time_minutes FROM suppliers WHERE id = ?', [supplierId]);
    const deadlineMinutes = supplier?.response_time_minutes || 60;
    const deadline = new Date(Date.now() + deadlineMinutes * 60 * 1000).toISOString();

    // Create order — RETURNING id for PostgreSQL
    const orderNumber = 'FS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const inserted = await db.get(
      `INSERT INTO orders (order_number, user_id, supplier_id, status, fulfilment_method,
        subtotal_paise, delivery_fee_paise, tax_paise, total_amount_paise,
        address_name, address_phone, address_line1, address_line2, address_city, address_state, address_pincode,
        supplier_response_deadline)
       VALUES (?, ?, ?, 'awaiting_supplier_confirmation', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [orderNumber, req.user.userId, supplierId, fulfilment_method,
        subtotal, deliveryFee, tax, total,
        address.name, address.phone, address.line1, address.line2 || null,
        address.city, address.state, pincode, deadline]
    );

    const orderId = inserted.id;

    // Insert order items (immutable snapshot)
    for (const oi of orderItems) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_label, sku, unit_price_paise, quantity, return_eligible, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, oi.product_id, oi.variant_id, oi.product_name, oi.variant_label, oi.sku, oi.unit_price_paise, oi.quantity, oi.return_eligible, oi.image_url]
      );
    }

    // Log event
    await db.run(
      'INSERT INTO order_events (order_id, event_type, note, actor_id, actor_role) VALUES (?, ?, ?, ?, ?)',
      [orderId, 'order_created', 'Order placed by customer', req.user.userId, 'customer']
    );

    res.json({
      order_id: orderId,
      order_number: orderNumber,
      total_amount: total,
      status: 'awaiting_supplier_confirmation',
      message: 'Order created. Awaiting supplier confirmation.'
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `SELECT o.*, u.name as customer_name, s.name as supplier_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               LEFT JOIN suppliers s ON o.supplier_id = s.id
               ORDER BY o.created_at DESC LIMIT 100`;
      params = [];
    } else {
      query = `SELECT o.*, s.name as supplier_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
               FROM orders o
               LEFT JOIN suppliers s ON o.supplier_id = s.id
               WHERE o.user_id = ?
               ORDER BY o.created_at DESC`;
      params = [req.user.userId];
    }
    const orders = await db.all(query, params);
    const normalised = orders.map(o => ({
      ...o,
      subtotal: Number(o.subtotal_paise || 0),
      delivery_fee: Number(o.delivery_fee_paise || 0),
      tax_amount: Number(o.tax_paise || 0),
      total_amount: Number(o.total_amount_paise || 0),
      item_count: Number(o.item_count || 0)
    }));
    res.json({ orders: normalised });
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await db.get(
      `SELECT o.*, s.name as supplier_name, u.name as customer_name
       FROM orders o
       LEFT JOIN suppliers s ON o.supplier_id = s.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const events = await db.all('SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at ASC', [order.id]);

    const normalisedOrder = {
      ...order,
      subtotal: Number(order.subtotal_paise || 0),
      delivery_fee: Number(order.delivery_fee_paise || 0),
      tax_amount: Number(order.tax_paise || 0),
      total_amount: Number(order.total_amount_paise || 0),
      items: items.map(it => ({
        ...it,
        unit_price: Number(it.unit_price_paise || 0),
        unit_price_paise: Number(it.unit_price_paise || 0),
        quantity: Number(it.quantity || 0)
      })),
      events
    };

    res.json({ order: normalisedOrder });
  } catch (err) {
    console.error('Order detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cancellable = ['awaiting_supplier_confirmation', 'awaiting_payment', 'confirmed'];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    for (const item of items) {
      await db.run(
        'UPDATE product_variants SET reserved = GREATEST(0, reserved - ?) WHERE id = ?',
        [item.quantity, item.variant_id]
      );
    }

    await db.run("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [order.id]);
    await db.run(
      'INSERT INTO order_events (order_id, event_type, note, actor_id) VALUES (?, ?, ?, ?)',
      [order.id, 'cancelled', req.body.reason || 'Customer cancelled', req.user.userId]
    );

    res.json({ message: 'Order cancelled' });
  } catch (err) {
    console.error('Order cancel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/pay (sandbox)
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'awaiting_payment') {
      return res.status(400).json({ error: 'Order not awaiting payment' });
    }

    await db.run("UPDATE orders SET status = 'confirmed', updated_at = NOW() WHERE id = ?", [order.id]);
    await db.run(
      'INSERT INTO order_events (order_id, event_type, note) VALUES (?, ?, ?)',
      [order.id, 'payment_confirmed', 'Sandbox payment verified']
    );

    res.json({ message: 'Payment confirmed' });
  } catch (err) {
    console.error('Order pay error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;