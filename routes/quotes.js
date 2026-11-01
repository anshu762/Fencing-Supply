const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

// POST /api/quotes — Submit quote request
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      organisation, contact_name, contact_phone, contact_email,
      address, city, pincode, required_date, notes, items
    } = req.body;

    if (!organisation || !contact_name || !contact_phone || !items?.length) {
      return res.status(400).json({ error: 'Organisation, contact, and items required' });
    }

    const quoteNumber = 'QT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    const result = await db.run(
      `INSERT INTO quotes (quote_number, user_id, organisation, contact_name, contact_phone,
        contact_email, address, city, pincode, required_date, notes, items_json, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        quoteNumber,
        req.user?.userId || null,
        organisation,
        contact_name,
        contact_phone,
        contact_email || null,
        address || null,
        city || null,
        pincode || null,
        required_date || null,
        notes || null,
        JSON.stringify(items)
      ]
    );

    res.json({
      quote_id: result.lastID,
      quote_number: quoteNumber,
      message: 'Quote request submitted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes — User's quotes
router.get('/', authenticate, async (req, res) => {
  try {
    let query = 'SELECT * FROM quotes';
    const params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE user_id = ?';
      params.push(req.user.userId);
    }

    query += ' ORDER BY created_at DESC';
    const quotes = await db.all(query, params);
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const quote = await db.get('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (req.user.role !== 'admin' && quote.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    quote.items = quote.items_json ? JSON.parse(quote.items_json) : [];
    res.json({ quote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;