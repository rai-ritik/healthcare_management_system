const db = require('../config/db');

/* =========================
   GET DOCTOR (PROFILE + INFO)
   doctorID, specialization, availability
========================= */
const getDoctor = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;

    const [doctor] = await db.execute(
      `SELECT 
          d.doctor_id,
          d.specialization,
          d.is_available,
          u.first_name,
          u.last_name,
          u.email
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: doctor[0] || {}
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   VIEW MEDICAL RECORDS
   viewRecord()
========================= */
const viewRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const [records] = await db.execute(
      `SELECT mr.*, 
              u.first_name, u.last_name
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.patient_id
       JOIN users u ON p.user_id = u.user_id
       WHERE mr.doctor_id = (
         SELECT doctor_id FROM doctors WHERE user_id = ?
       )
       ORDER BY mr.created_at DESC`,
      [doctorId]
    );

    res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   WRITE MEDICAL RECORD
   writeRecord()
========================= */
const writeRecord = async (req, res) => {
  try {
    const { patient_id, diagnosis, prescription, notes } = req.body;
    const userId = req.user.id;

    const [doctorRow] = await db.execute(
      'SELECT doctor_id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctorRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const doctor_id = doctorRow[0].doctor_id;

    const [result] = await db.execute(
      `INSERT INTO medical_records 
       (patient_id, doctor_id, diagnosis, prescription, notes, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [patient_id, doctor_id, diagnosis, prescription, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Medical record created',
      record_id: result.insertId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   UPDATE MEDICAL RECORD
   updateRecord()
========================= */
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes } = req.body;

    await db.execute(
      `UPDATE medical_records 
       SET diagnosis = COALESCE(?, diagnosis),
           prescription = COALESCE(?, prescription),
           notes = COALESCE(?, notes),
           updated_at = NOW()
       WHERE record_id = ?`,
      [diagnosis, prescription, notes, id]
    );

    res.status(200).json({
      success: true,
      message: 'Medical record updated'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   UPDATE AVAILABILITY
   (maps to attribute: availability:boolean)
========================= */
const updateAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;
    const userId = req.user.id;

    await db.execute(
      `UPDATE doctors 
       SET is_available = ? 
       WHERE user_id = ?`,
      [is_available, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Availability updated'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   EXPORTS
========================= */
module.exports = {
  getDoctor,
  viewRecord,
  writeRecord,
  updateRecord,
  updateAvailability
};
