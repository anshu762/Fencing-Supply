function validatePincode(req, res, next) {
  const pincode = req.params.pincode || req.body.pincode;
  if (pincode && !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'Invalid PIN code (6 digits required)' });
  }
  next();
}

function validatePhone(req, res, next) {
  const phone = req.body.phone;
  if (phone && !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number (10 digits required)' });
  }
  next();
}

function validateEmail(req, res, next) {
  const email = req.body.email;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  next();
}

function sanitizeInput(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim().substring(0, 5000);
      }
    }
  }
  next();
}

module.exports = { validatePincode, validatePhone, validateEmail, sanitizeInput };