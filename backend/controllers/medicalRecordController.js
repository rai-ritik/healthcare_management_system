const db = require('../config/db');

const getRecords = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const [records] = await db.execute(
      `SELECT mr.*, u.name as doctor_name
       FROM medical_records mr
       JOIN doctors d ON mr.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE mr.patient_id = (SELECT id FROM patients WHERE user_id = ?)
       ORDER BY mr.created_at DESC`,
      [userId]
    );
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRecord = async (req, res) => {
  try {
    const { patient_id, diagnosis, prescription, notes } = req.body;
    const userId = req.user ? req.user.id : 1;

    const [doctorRow] = await db.execute(
      'SELECT id FROM doctors WHERE user_id = ?', [userId]
    );
    if (doctorRow.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const [result] = await db.execute(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [patient_id, doctorRow[0].id, diagnosis, prescription, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Medical record created',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const [records] = await db.execute(
      'SELECT * FROM medical_records WHERE id = ?', [id]
    );
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, data: records[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecords, createRecord, getRecordById };
