const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authenticate(req, res, next) {
  try {
    let token = null;

    // Check cookie first
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Then check Authorization header
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.cookies?.token) token = req.cookies.token;
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Ignore — user is optional
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: `Role '${role}' required` });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuth, requireRole };