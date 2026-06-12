const jwt = require('jsonwebtoken');
const db  = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hea_super_secret_key_2025');

    const [users] = await db.execute(
      'SELECT user_id, first_name, last_name, email, role, is_active FROM users WHERE user_id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account deactivated.' });
    }

    // Attach user with consistent fields
    req.user = {
      id:         user.user_id,
      name:       `${user.first_name} ${user.last_name}`.trim(),
      first_name: user.first_name,
      last_name:  user.last_name,
      email:      user.email,
      role:       user.role
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      req.user = null;
      return next();
    }
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hea_super_secret_key_2025');
    const [users] = await db.execute(
      'SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = ?',
      [decoded.id]
    );
    req.user = users.length > 0 ? {
      id:    users[0].user_id,
      name:  `${users[0].first_name} ${users[0].last_name}`.trim(),
      email: users[0].email,
      role:  users[0].role
    } : null;
    next();
  } catch (e) {
    req.user = null;
    next();
  }
};

module.exports = { protect, optionalAuth };
