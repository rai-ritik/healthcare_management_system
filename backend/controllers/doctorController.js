const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const [doctors] = await db.execute(
      'SELECT * FROM doctors WHERE user_id = ?', [userId]
    );
    res.status(200).json({
      success: true,
      message: 'Doctor dashboard',
      data: { doctor: doctors[0] || {} }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const [result] = await db.execute(
      `SELECT u.id, u.name, u.email,
              d.specialization, d.consultation_fee, d.experience_years, d.bio,
              dept.name as department_name
       FROM users u
       LEFT JOIN doctors d ON u.id = d.user_id
       LEFT JOIN departments dept ON d.department_id = dept.id
       WHERE u.id = ?`,
      [userId]
    );
    res.status(200).json({ success: true, data: result[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const { name, specialization, consultation_fee, experience_years, bio } = req.body;

    if (name) {
      await db.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }
    await db.execute(
      `UPDATE doctors SET
         specialization = COALESCE(?, specialization),
         consultation_fee = COALESCE(?, consultation_fee),
         experience_years = COALESCE(?, experience_years),
         bio = COALESCE(?, bio)
       WHERE user_id = ?`,
      [specialization, consultation_fee, experience_years, bio, userId]
    );
    res.status(200).json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const [doctorRow] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (doctorRow.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const [schedule] = await db.execute(
      'SELECT * FROM doctor_schedules WHERE doctor_id = ?',
      [doctorRow[0].id]
    );
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Schedule updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const [doctorRow] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (doctorRow.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const [appointments] = await db.execute(
      `SELECT a.*, u.name as patient_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC`,
      [doctorRow[0].id]
    );
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(
      "UPDATE appointments SET status = 'completed' WHERE id = ?", [id]
    );
    res.status(200).json({ success: true, message: 'Appointment completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPatients = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const [doctorRow] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (doctorRow.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const [patients] = await db.execute(
      `SELECT DISTINCT u.name, u.email, p.date_of_birth, p.gender, p.phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE a.doctor_id = ?`,
      [doctorRow[0].id]
    );
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getSchedule,
  updateSchedule,
  getAppointments,
  completeAppointment,
  getMyPatients
};
