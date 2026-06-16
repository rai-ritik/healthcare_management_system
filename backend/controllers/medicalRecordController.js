const db = require('../config/db');

/* =========================
   GET RECORDS
   getRecord()
========================= */
const getRecord = async (req, res) => {
  try {
    const userId = req.user.id;

    const [records] = await db.execute(
      `SELECT mr.record_id AS recordID,
              mr.diagnosis,
              mr.created_at AS recordDates,
              mr.notes,
              mr.history_id AS historyId,
              u.first_name,
              u.last_name
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.patient_id
       JOIN users u ON p.user_id = u.user_id
       WHERE mr.patient_id = (
         SELECT patient_id FROM patients WHERE user_id = ?
       )
       ORDER BY mr.created_at DESC`,
      [userId]
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
   ADD RECORD
   addRecord()
========================= */
const addRecord = async (req, res) => {
  try {
    const { patient_id, diagnosis, notes } = req.body;
    const userId = req.user.id;

    const [doctor] = await db.execute(
      'SELECT doctor_id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctor.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const doctor_id = doctor[0].doctor_id;

    const [result] = await db.execute(
      `INSERT INTO medical_records 
       (patient_id, doctor_id, diagnosis, notes, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [patient_id, doctor_id, diagnosis, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Record created',
      recordID: result.insertId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   UPDATE RECORD
   updateRecord()
========================= */
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, notes } = req.body;

    await db.execute(
      `UPDATE medical_records
       SET diagnosis = COALESCE(?, diagnosis),
           notes = COALESCE(?, notes),
           updated_at = NOW()
       WHERE record_id = ?`,
      [diagnosis, notes, id]
    );

    res.status(200).json({
      success: true,
      message: 'Record updated'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   DELETE RECORD
   deleteRecord()
========================= */
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      'DELETE FROM medical_records WHERE record_id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Record deleted'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   ADD HISTORY
   addHistory()
========================= */
const addHistory = async (req, res) => {
  try {
    const { record_id, description } = req.body;

    const [result] = await db.execute(
      `INSERT INTO medical_history (record_id, description, created_at)
       VALUES (?, ?, NOW())`,
      [record_id, description]
    );

    await db.execute(
      `UPDATE medical_records
       SET history_id = ?
       WHERE record_id = ?`,
      [result.insertId, record_id]
    );

    res.status(201).json({
      success: true,
      message: 'History added',
      historyId: result.insertId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =========================
   EXPORTS
========================= */
module.exports = {
  getRecord,
  addRecord,
  updateRecord,
  deleteRecord,
  addHistory
};
