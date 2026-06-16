const db = require('../config/db');

// ============================
// ADMIN DASHBOARD
// ============================
const getDashboard = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [patients] = await db.execute('SELECT COUNT(*) as total FROM patients');
    const [doctors] = await db.execute('SELECT COUNT(*) as total FROM doctors');
    const [appointments] = await db.execute('SELECT COUNT(*) as total FROM appointments');

    res.status(200).json({
      success: true,
      data: {
        totalUsers: users[0].total,
        totalPatients: patients[0].total,
        totalDoctors: doctors[0].total,
        totalAppointments: appointments[0].total
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// REPORTS
// ============================
const getReports = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// RESOURCES
// ============================
const getResources = async (req, res) => {
  try {
    const [resources] = await db.execute('SELECT * FROM resources');

    res.status(200).json({
      success: true,
      data: resources
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// AUDIT LOGS
// ============================
const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.execute(`
      SELECT al.*,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.status(200).json({
      success: true,
      data: logs
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// ASSIGN ROOM (NEW)
// ============================
const assignRoom = async (req, res) => {
  try {
    const { appointment_id, room_id } = req.body;

    await db.execute(
      `UPDATE appointments 
       SET room_id = ? 
       WHERE appointment_id = ?`,
      [room_id, appointment_id]
    );

    res.status(200).json({
      success: true,
      message: 'Room assigned successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// MANAGE USER (NEW)
// ============================
const manageUser = async (req, res) => {
  try {
    const { user_id, action, role } = req.body;

    if (action === 'deactivate') {
      await db.execute(
        'UPDATE users SET is_active = 0 WHERE user_id = ?',
        [user_id]
      );
    }

    if (action === 'activate') {
      await db.execute(
        'UPDATE users SET is_active = 1 WHERE user_id = ?',
        [user_id]
      );
    }

    if (action === 'update_role' && role) {
      await db.execute(
        'UPDATE users SET role = ? WHERE user_id = ?',
        [role, user_id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// EXPORTS
// ============================
module.exports = {
  getDashboard,
  getReports,
  getResources,
  getAuditLogs,
  assignRoom,
  manageUser
};
