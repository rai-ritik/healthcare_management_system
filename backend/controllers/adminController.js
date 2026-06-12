const pool = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const [[{ total_patients }]] = await pool.execute('SELECT COUNT(*) as total_patients FROM patients');
        const [[{ total_doctors }]] = await pool.execute('SELECT COUNT(*) as total_doctors FROM doctors');
        const [[{ todays_appointments }]] = await pool.execute(
            `SELECT COUNT(*) as todays_appointments FROM appointments WHERE appointment_date = CURDATE() AND status NOT IN ('cancelled')`
        );
        const [[{ urgent_cases }]] = await pool.execute(
            `SELECT COUNT(*) as urgent_cases FROM medical_records WHERE triage_category = 'emergency' AND DATE(created_at) = CURDATE()`
        );
        const [[{ available_beds }]] = await pool.execute(
            `SELECT COUNT(*) as available_beds FROM resources WHERE type = 'bed' AND status = 'available'`
        );
        const [recent_appointments] = await pool.execute(
            `SELECT a.*, CONCAT(pu.first_name, ' ', pu.last_name) as patient_name, CONCAT(du.first_name, ' ', du.last_name) as doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.user_id JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users du ON d.user_id = du.user_id ORDER BY a.created_at DESC LIMIT 5`
        );
        const [monthly_stats] = await pool.execute(
            `SELECT DATE_FORMAT(appointment_date, '%Y-%m') as month, COUNT(*) as total FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY DATE_FORMAT(appointment_date, '%Y-%m') ORDER BY month ASC`
        );
        res.status(200).json({ success: true, data: { stats: { total_patients, total_doctors, todays_appointments, urgent_cases, available_beds }, recent_appointments, monthly_stats } });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
    }
};

const generateReport = async (req, res) => {
    try {
        const { type, start_date, end_date } = req.query;
        let reportData = {};
        if (!type || type === 'appointments') {
            const [appointments] = await pool.execute(
                `SELECT status, COUNT(*) as count, DATE_FORMAT(appointment_date, '%Y-%m') as month FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY status, DATE_FORMAT(appointment_date, '%Y-%m')`,
                [start_date || '2024-01-01', end_date || new Date().toISOString().split('T')[0]]
            );
            reportData.appointments = appointments;
        }
        if (!type || type === 'resources') {
            const [resources] = await pool.execute('SELECT type, status, COUNT(*) as count FROM resources GROUP BY type, status');
            reportData.resources = resources;
        }
        res.status(200).json({ success: true, generated_at: new Date().toISOString(), data: reportData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate report.' });
    }
};

const getResources = async (req, res) => {
    try {
        const [resources] = await pool.execute(`SELECT r.*, d.name as department_name FROM resources r LEFT JOIN departments d ON r.department_id = d.department_id ORDER BY r.type, r.status`);
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get resources.' });
    }
};

const updateResource = async (req, res) => {
    try {
        const { resource_id } = req.params;
        const { status, name, location } = req.body;
        await pool.execute(`UPDATE resources SET status = ?, name = ?, location = ? WHERE resource_id = ?`, [status, name, location, resource_id]);
        res.status(200).json({ success: true, message: 'Resource updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update resource.' });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const { user_id, action, start_date, end_date, limit = 100 } = req.query;
        let query = `SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) as user_name, u.email, u.role FROM audit_logs al LEFT JOIN users u ON al.user_id = u.user_id WHERE 1=1`;
        const params = [];
        if (user_id) { query += ' AND al.user_id = ?'; params.push(user_id); }
        if (action) { query += ' AND al.action LIKE ?'; params.push(`%${action}%`); }
        if (start_date) { query += ' AND DATE(al.created_at) >= ?'; params.push(start_date); }
        if (end_date) { query += ' AND DATE(al.created_at) <= ?'; params.push(end_date); }
        query += ' ORDER BY al.created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        const [logs] = await pool.execute(query, params);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get audit logs.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(`SELECT user_id, first_name, last_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC`);
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get users.' });
    }
};

const getAllPatients = async (req, res) => {
    try {
        const [patients] = await pool.execute(`SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, p.patient_id, p.date_of_birth, p.gender, p.blood_type FROM users u JOIN patients p ON u.user_id = p.user_id WHERE u.is_active = TRUE ORDER BY u.first_name`);
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get patients.' });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const [doctors] = await pool.execute(`SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, d.doctor_id, d.specialization, d.department, d.is_available FROM users u JOIN doctors d ON u.user_id = d.user_id WHERE u.is_active = TRUE ORDER BY u.first_name`);
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get doctors.' });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const { date, status } = req.query;
        let query = `SELECT a.*, CONCAT(pu.first_name, ' ', pu.last_name) as patient_name, CONCAT(du.first_name, ' ', du.last_name) as doctor_name, d.specialization, d.department FROM appointments a JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.user_id JOIN doctors doc ON a.doctor_id = doc.doctor_id JOIN users du ON doc.user_id = du.user_id JOIN doctors d ON a.doctor_id = d.doctor_id WHERE 1=1`;
        const params = [];
        if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
        if (status) { query += ' AND a.status = ?'; params.push(status); }
        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
        const [appointments] = await pool.execute(query, params);
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get appointments.' });
    }
};

module.exports = {
    getDashboard,
    generateReport,
    getResources,
    updateResource,
    getAuditLogs,
    getAllUsers,
    getAllPatients,
    getAllDoctors,
    getAllAppointments
};
