const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'hea_super_secret_key_2025',
    { expiresIn: '24h' }
  );
};

// ============================================
// REGISTER
// ============================================
const register = async (req, res) => {
  try {
    const { first_name, last_name, name, email, password, role, phone } = req.body;

    // Accept either name or first_name/last_name
    let fname = first_name;
    let lname = last_name || '';
    if (!fname && name) {
      const parts = name.trim().split(' ');
      fname = parts[0];
      lname = parts.slice(1).join(' ') || '';
    }

    if (!fname || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and role'
      });
    }

    const validRoles = ['patient', 'doctor', 'nurse', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be patient, doctor, nurse, or admin'
      });
    }

    // Check existing email
    const [existing] = await db.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [fname, lname, email.toLowerCase(), hashedPassword, phone || null, role]
    );

    const userId = result.insertId;

    // Create role record
    if (role === 'patient') {
      try {
        await db.execute(
          'INSERT INTO patients (user_id, created_at) VALUES (?, NOW())',
          [userId]
        );
      } catch(e) { console.log('Patient record note:', e.message); }
    } else if (role === 'doctor') {
      try {
        await db.execute(
          `INSERT INTO doctors (user_id, specialization, created_at)
           VALUES (?, 'General Practice', NOW())`,
          [userId]
        );
      } catch(e) { console.log('Doctor record note:', e.message); }
    }

    // Audit log
    try {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, description, created_at)
         VALUES (?, 'REGISTER', 'users', 'New user registered', NOW())`,
        [userId]
      );
    } catch(e) { /* optional */ }

    const token = generateToken(userId);
    const fullName = `${fname} ${lname}`.trim();

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id:    userId,
        name:  fullName,
        first_name: fname,
        last_name:  lname,
        email: email.toLowerCase(),
        role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  }
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account deactivated. Contact administrator.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Audit log
    try {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, description, created_at)
         VALUES (?, 'LOGIN', 'users', 'User logged in', NOW())`,
        [user.user_id]
      );
    } catch(e) { /* optional */ }

    const token    = generateToken(user.user_id);
    const fullName = `${user.first_name} ${user.last_name}`.trim();

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id:         user.user_id,
        name:       fullName,
        first_name: user.first_name,
        last_name:  user.last_name,
        email:      user.email,
        role:       user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ============================================
// GET ME
// ============================================
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hea_super_secret_key_2025');

    const [users] = await db.execute(
      'SELECT user_id, first_name, last_name, email, role, created_at FROM users WHERE user_id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const u = users[0];
    res.status(200).json({
      success: true,
      user: {
        id:         u.user_id,
        name:       `${u.first_name} ${u.last_name}`.trim(),
        first_name: u.first_name,
        last_name:  u.last_name,
        email:      u.email,
        role:       u.role
      }
    });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hea_super_secret_key_2025');

    const [users] = await db.execute(
      'SELECT * FROM users WHERE user_id = ?', [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?',
      [hashed, decoded.id]
    );

    res.status(200).json({ success: true, message: 'Password changed successfully!' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed: ' + error.message });
  }
};

module.exports = { register, login, logout, getMe, changePassword };
