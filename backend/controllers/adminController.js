const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const [users]    = await db.execute('SELECT COUNT(*) as total FROM users');
    const [patients] = await db.execute('SELECT COUNT(*) as total FROM patients');
    const [doctors]  = await db.execute('SELECT COUNT(*) as total FROM doctors');

    let appointmentTotal = 0;
    try {
      const [appts] = await db.execute('SELECT COUNT(*) as total FROM appointments');
      appointmentTotal = appts[0].total;
    } catch(e) {}

    res.status(200).json({
      success: true,
      data: {
        totalUsers:        users[0].total,
        totalPatients:     patients[0].total,
        totalDoctors:      doctors[0].total,
        totalAppointments: appointmentTotal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResources = async (req, res) => {
  try {
    const [resources] = await db.execute('SELECT * FROM resources');
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.execute(
      `SELECT al.*,
              CONCAT(u.first_name,' ',u.last_name) as name,
              u.email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getReports, getResources, getAuditLogs };
