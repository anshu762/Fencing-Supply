const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalRevenue = await db.get("SELECT COALESCE(SUM(total_amount_paise), 0) as total FROM orders WHERE status NOT IN ('cancelled', 'rejected')");
    const totalProducts = await db.get('SELECT COUNT(*) as count FROM products');
    const totalSuppliers = await db.get('SELECT COUNT(*) as count FROM suppliers');
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const pendingQuotes = await db.get("SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'");

    const statusCounts = await db.all(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC'
    );

    res.json({
      stats: {
        total_orders: totalOrders?.count || 0,
        total_revenue: totalRevenue?.total || 0,
        total_products: totalProducts?.count || 0,
        total_suppliers: totalSuppliers?.count || 0,
        total_users: totalUsers?.count || 0,
        pending_quotes: pendingQuotes?.count || 0,
        status_counts: statusCounts
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await db.all(
      `SELECT o.*, u.name as customer_name, s.name as supplier_name,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN suppliers s ON o.supplier_id = s.id
       ORDER BY o.created_at DESC LIMIT 200`
    );
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await db.all(
      `SELECT p.*, c.name as category_name, s.name as supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ORDER BY p.created_at DESC`
    );
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products/:id/toggle
router.post('/products/:id/toggle', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newActive = product.active ? 0 : 1;
    const newApproved = product.approved ? 0 : 1;
    await db.run(
      'UPDATE products SET active = ?, approved = ?, updated_at = NOW() WHERE id = ?',
      [newActive, newApproved, product.id]
    );
    res.json({ message: `Product ${newActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await db.all('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json({ suppliers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/suppliers/:id/approve
router.post('/suppliers/:id/approve', async (req, res) => {
  try {
    await db.run('UPDATE suppliers SET approved = 1, updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/quotes
router.get('/quotes', async (req, res) => {
  try {
    const quotes = await db.all('SELECT * FROM quotes ORDER BY created_at DESC');
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/tickets
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await db.all(
      `SELECT t.*, u.name as user_name FROM support_tickets t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/tickets/:id/resolve
router.post('/tickets/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    await db.run(
      "UPDATE support_tickets SET status = 'resolved', admin_notes = ?, updated_at = NOW() WHERE id = ?",
      [resolution || 'Resolved by admin', req.params.id]
    );
    res.json({ message: 'Ticket resolved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;