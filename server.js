require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (skip on Vercel serverless — handled by Vercel)
if (process.env.NODE_ENV !== 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests' }
  });
  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many login attempts' }
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/supplier', require('./routes/supplier'));
app.use('/api/support', require('./routes/support'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: 'neon-postgresql',
    env: process.env.NODE_ENV || 'development'
  });
});

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// --- Vercel Export ---
module.exports = app;

// --- Local Start ---
if (require.main === module) {
  const initDatabase = require('./database/init');
  initDatabase().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🤺 Fencing Supply running at http://localhost:${PORT}`);
      console.log(`🗄️  Database: Neon PostgreSQL\n`);
    });
  }).catch(err => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
}