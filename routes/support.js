const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

// POST /api/support/tickets
router.post('/tickets', optionalAuth, async (req, res) => {
  try {
    const { type, order_id, subject, message, guest_name, guest_email } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message required' });
    }

    if (!req.user && (!guest_name || !guest_email)) {
      return res.status(400).json({ error: 'Name and email required for guests' });
    }

    const result = await db.run(
      `INSERT INTO support_tickets (user_id, order_id, type, subject, message, guest_name, guest_email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        req.user?.userId || null,
        order_id || null,
        type || 'general',
        subject,
        message,
        guest_name || null,
        guest_email || null
      ]
    );

    res.json({ ticket_id: result.lastID, message: 'Support ticket created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/support/tickets
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await db.all(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;