const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hash, 'customer']
    );

    const user = await db.get('SELECT id, name, email, phone, role FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.json({ user, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, phone, role FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await db.run('UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
      [name || req.user.name, phone || null, req.user.userId]);
    const user = await db.get('SELECT id, name, email, phone, role FROM users WHERE id = ?', [req.user.userId]);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/addresses
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [req.user.userId]);
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/addresses
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, is_default } = req.body;
    if (is_default) {
      await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.userId]);
    }
    const result = await db.run(
      'INSERT INTO addresses (user_id, name, phone, line1, line2, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, name, phone, line1, line2 || null, city, state, pincode, is_default ? 1 : 0]
    );
    res.json({ address_id: result.lastID, message: 'Address saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    await db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
