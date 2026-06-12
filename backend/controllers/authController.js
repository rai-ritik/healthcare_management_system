const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const createAuditLog = async (userId, action, entityType, entityId, status, req) => {
    try {
        await pool.execute(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, action, entityType, entityId, req.ip || 'unknown', status]
        );
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

const register = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            first_name, last_name, email, password,
            phone, national_id, role = 'patient',
            date_of_birth, gender, blood_type, address
        } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters.'
            });
        }

        const [existing] = await connection.execute(
            'SELECT user_id FROM users WHERE email = ?', [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered. Please login instead.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await connection.beginTransaction();

        const [userResult] = await connection.execute(
            `INSERT INTO users (first_name, last_name, email, password, phone, national_id, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, phone, national_id, role]
        );

        const userId = userResult.insertId;

        if (role === 'patient') {
            await connection.execute(
                `INSERT INTO patients (user_id, date_of_birth, gender, blood_type, address)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, date_of_birth || null, gender || null, blood_type || null, address || null]
            );
        }

        await connection.commit();
        await createAuditLog(userId, 'USER_REGISTERED', 'users', userId, 'success', req);

        const token = jwt.sign(
            { user_id: userId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: { user_id: userId, first_name, last_name, email, role },
            token
        });

    } catch (error) {
        await connection.rollback();
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    } finally {
        connection.release();
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const [users] = await pool.execute(
            `SELECT u.*, p.patient_id, d.doctor_id, d.specialization, d.department
             FROM users u
             LEFT JOIN patients p ON u.user_id = p.user_id
             LEFT JOIN doctors d ON u.user_id = d.user_id
             WHERE u.email = ? AND u.is_active = TRUE`,
            [email]
        );

        if (users.length === 0) {
            await createAuditLog(null, 'LOGIN_FAILED', 'users', null, 'failed', req);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            await createAuditLog(user.user_id, 'LOGIN_FAILED', 'users', user.user_id, 'failed', req);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await createAuditLog(user.user_id, 'USER_LOGIN', 'users', user.user_id, 'success', req);

        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.first_name}!`,
            data: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

const logout = async (req, res) => {
    try {
        await createAuditLog(
            req.user.user_id, 'USER_LOGOUT',
            'users', req.user.user_id, 'success', req
        );
        res.status(200).json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed.' });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT u.user_id, u.first_name, u.last_name, u.email,
                    u.phone, u.role, u.created_at,
                    p.patient_id, p.date_of_birth, p.gender, p.blood_type,
                    d.doctor_id, d.specialization, d.department
             FROM users u
             LEFT JOIN patients p ON u.user_id = p.user_id
             LEFT JOIN doctors d ON u.user_id = d.user_id
             WHERE u.user_id = ?`,
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, data: users[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get profile.' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Both passwords are required.'
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters.'
            });
        }

        const [users] = await pool.execute(
            'SELECT password FROM users WHERE user_id = ?',
            [req.user.user_id]
        );

        const isMatch = await bcrypt.compare(old_password, users[0].password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Old password is incorrect.'
            });
        }

        const hashed = await bcrypt.hash(new_password, 12);

        await pool.execute(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashed, req.user.user_id]
        );

        await createAuditLog(
            req.user.user_id, 'PASSWORD_CHANGED',
            'users', req.user.user_id, 'success', req
        );

        res.status(200).json({ success: true, message: 'Password changed successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
};

module.exports = { register, login, logout, getMe, changePassword };