const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

// In-memory cart for demo (use DB in production)
const carts = new Map();

function getCartKey(req) {
  return req.user ? `user_${req.user.userId}` : `session_${req.headers['x-session-id'] || 'guest'}`;
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const key = getCartKey(req);
    const cart = carts.get(key) || { items: [], supplier_id: null, supplier_name: null };

    // Revalidate items
    for (const item of cart.items) {
      const v = await db.get('SELECT on_hand, reserved, price_paise, active FROM product_variants WHERE id = ?', [item.variant_id]);
      if (v) {
        item.available = v.on_hand - v.reserved;
        item.price_paise = v.price_paise;
        item.in_stock = item.available > 0 && v.active === 1;
      }
    }

    cart.subtotal = cart.items.reduce((sum, i) => sum + (i.price_paise * i.quantity), 0);
    cart.item_count = cart.items.length;
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body;
    if (!variant_id) return res.status(400).json({ error: 'Variant ID required' });

    const variant = await db.get(
      `SELECT pv.*, p.name as product_name, p.slug, p.image_url, p.supplier_id, p.return_eligible, s.name as supplier_name
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       JOIN suppliers s ON p.supplier_id = s.id
       WHERE pv.id = ? AND pv.active = 1 AND p.active = 1`,
      [variant_id]
    );

    if (!variant) return res.status(404).json({ error: 'Variant not found or unavailable' });

    const available = variant.on_hand - variant.reserved;
    if (available < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    const key = getCartKey(req);
    let cart = carts.get(key) || { items: [], supplier_id: null, supplier_name: null };

    // One supplier per cart rule
    if (cart.supplier_id && cart.supplier_id !== variant.supplier_id && cart.items.length > 0) {
      return res.status(409).json({
        error: 'different_supplier',
        message: `Cart has items from ${cart.supplier_name}. Replace or keep?`,
        current_supplier: cart.supplier_name,
        new_supplier: variant.supplier_name
      });
    }

    const existing = cart.items.find(i => i.variant_id === variant_id);
    if (existing) {
      if (existing.quantity + quantity > available) {
        return res.status(400).json({ error: 'Would exceed available stock' });
      }
      existing.quantity += quantity;
    } else {
      cart.items.push({
        variant_id: variant.id,
        product_id: variant.product_id,
        product_name: variant.product_name,
        slug: variant.slug,
        image_url: variant.image_url,
        sku: variant.sku,
        label: variant.label,
        size: variant.size,
        hand: variant.hand,
        price_paise: variant.price_paise,
        quantity,
        available,
        supplier_id: variant.supplier_id,
        supplier_name: variant.supplier_name,
        return_eligible: variant.return_eligible
      });
      cart.supplier_id = variant.supplier_id;
      cart.supplier_name = variant.supplier_name;
    }

    carts.set(key, cart);
    cart.subtotal = cart.items.reduce((sum, i) => sum + (i.price_paise * i.quantity), 0);
    cart.item_count = cart.items.length;
    res.json({ cart, message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/replace-supplier
router.post('/replace-supplier', async (req, res) => {
  const key = getCartKey(req);
  carts.delete(key);
  res.json({ cart: { items: [], supplier_id: null, supplier_name: null }, message: 'Cart cleared' });
});

// PUT /api/cart/update/:variant_id
router.put('/update/:variant_id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const key = getCartKey(req);
    const cart = carts.get(key);
    if (!cart) return res.status(404).json({ error: 'Cart empty' });

    const item = cart.items.find(i => i.variant_id === parseInt(req.params.variant_id));
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.variant_id !== parseInt(req.params.variant_id));
      if (cart.items.length === 0) {
        cart.supplier_id = null;
        cart.supplier_name = null;
      }
    } else {
      const v = await db.get('SELECT on_hand, reserved FROM product_variants WHERE id = ?', [item.variant_id]);
      if (v && quantity > (v.on_hand - v.reserved)) {
        return res.status(400).json({ error: 'Exceeds available stock' });
      }
      item.quantity = quantity;
    }

    carts.set(key, cart);
    cart.subtotal = cart.items.reduce((sum, i) => sum + (i.price_paise * i.quantity), 0);
    cart.item_count = cart.items.length;
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', (req, res) => {
  carts.delete(getCartKey(req));
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
