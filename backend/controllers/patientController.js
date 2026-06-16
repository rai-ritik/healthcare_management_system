const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get patient record
    const [patientRow] = await db.execute(
      'SELECT * FROM patients WHERE user_id = ?', [userId]
    );

    // Get appointment stats
    let stats = { total: 0, completed: 0, upcoming: 0, cancelled: 0 };
    let upcomingAppointments = [];
    let recentRecords = [];

    if (patientRow.length > 0) {
      const patientId = patientRow[0].patient_id || patientRow[0].id;

      try {
        const [countRows] = await db.execute(
          `SELECT
             COUNT(*) as total,
             SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
             SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) as upcoming,
             SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled
           FROM appointments WHERE patient_id = ?`,
          [patientId]
        );
        stats = countRows[0];
      } catch(e) { console.log('Stats error:', e.message); }

      try {
        const [appts] = await db.execute(
          `SELECT a.*,
                  CONCAT(u.first_name,' ',u.last_name) as doctor_name,
                  d.specialization
           FROM appointments a
           JOIN doctors d ON a.doctor_id = d.doctor_id
           JOIN users u ON d.user_id = u.user_id
           WHERE a.patient_id = ? AND a.appointment_date >= CURDATE()
           AND a.status != 'cancelled'
           ORDER BY a.appointment_date ASC LIMIT 5`,
          [patientId]
        );
        upcomingAppointments = appts;
      } catch(e) { console.log('Appointments error:', e.message); }

      try {
        const [recs] = await db.execute(
          `SELECT mr.*, CONCAT(u.first_name,' ',u.last_name) as doctor_name
           FROM medical_records mr
           JOIN doctors d ON mr.doctor_id = d.doctor_id
           JOIN users u ON d.user_id = u.user_id
           WHERE mr.patient_id = ?
           ORDER BY mr.created_at DESC LIMIT 3`,
          [patientId]
        );
        recentRecords = recs;
      } catch(e) { console.log('Records error:', e.message); }
    }

    res.status(200).json({
      success: true,
      data: {
        stats,
        upcomingAppointments,
        recentRecords,
        notifications: []
      }
    });
await db.execute(
  `INSERT INTO appointments
   (patient_id, doctor_id, appointment_date, status)
   VALUES (?, ?, ?, 'scheduled')`,
  [patientId, doctorId, appointmentDate]
);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
await db.execute(
  `UPDATE appointments
   SET status = 'cancelled'
   WHERE appointment_id = ?`,
  [appointmentId]
);

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [result] = await db.execute(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.role,
              p.date_of_birth, p.gender, p.blood_type, p.allergies, p.address
       FROM users u
       LEFT JOIN patients p ON u.user_id = p.user_id
       WHERE u.user_id = ?`,
      [userId]
    );
    res.status(200).json({ success: true, data: result[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone, address, date_of_birth, gender, blood_type, allergies } = req.body;

    await db.execute(
      `UPDATE users SET
         first_name = COALESCE(?, first_name),
         last_name  = COALESCE(?, last_name),
         phone      = COALESCE(?, phone),
         updated_at = NOW()
       WHERE user_id = ?`,
      [first_name, last_name, phone, userId]
    );

    const [existing] = await db.execute('SELECT id FROM patients WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      await db.execute(
        `UPDATE patients SET
           address       = COALESCE(?, address),
           date_of_birth = COALESCE(?, date_of_birth),
           gender        = COALESCE(?, gender),
           blood_type    = COALESCE(?, blood_type),
           allergies     = COALESCE(?, allergies)
         WHERE user_id = ?`,
        [address, date_of_birth, gender, blood_type, allergies, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [patientRow] = await db.execute('SELECT * FROM patients WHERE user_id = ?', [userId]);
    if (patientRow.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    const patientId = patientRow[0].patient_id || patientRow[0].id;
    const [appointments] = await db.execute(
      `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) as doctor_name, d.specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users u ON d.user_id = u.user_id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC`,
      [patientId]
    );
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute(
      `SELECT d.doctor_id, d.specialization, d.consultation_fee,
              CONCAT(u.first_name,' ',u.last_name) as name,
              u.email,
              dept.name as department_name
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       LEFT JOIN departments dept ON d.department_id = dept.department_id
       WHERE u.is_active = 1
       ORDER BY u.first_name ASC`
    );
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getAppointmentHistory,
  getDoctors,
  getNotifications
};
