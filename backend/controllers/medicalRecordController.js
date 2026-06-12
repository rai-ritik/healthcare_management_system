const pool = require('../config/db');

const createAuditLog = async (userId, action, entityType, entityId, status, req) => {
    try {
        await pool.execute(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, action, entityType, entityId, req.ip || 'unknown', status]
        );
    } catch (err) {}
};

const getMyMedicalRecords = async (req, res) => {
    try {
        const [records] = await pool.execute(
            `SELECT mr.*,
                    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                    d.specialization
             FROM medical_records mr
             JOIN doctors doc ON mr.doctor_id = doc.doctor_id
             JOIN users u ON doc.user_id = u.user_id
             JOIN doctors d ON mr.doctor_id = d.doctor_id
             JOIN patients p ON mr.patient_id = p.patient_id
             WHERE p.user_id = ?
             ORDER BY mr.created_at DESC`,
            [req.user.user_id]
        );

        await createAuditLog(
            req.user.user_id, 'MEDICAL_RECORDS_VIEWED',
            'medical_records', null, 'success', req
        );

        res.status(200).json({ success: true, count: records.length, data: records });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get medical records.' });
    }
};

const createMedicalRecord = async (req, res) => {
    try {
        const {
            patient_id, appointment_id, diagnosis, symptoms,
            treatment_plan, prescription, test_results,
            blood_pressure, heart_rate, temperature,
            weight, height, notes, triage_category
        } = req.body;

        const [doctors] = await pool.execute(
            'SELECT doctor_id FROM doctors WHERE user_id = ?',
            [req.user.user_id]
        );

        if (doctors.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can create medical records.'
            });
        }

        const doctor_id = doctors[0].doctor_id;

        let finalTriage = triage_category || 'non-urgent';
        if (heart_rate > 120 || heart_rate < 50 || temperature > 39.5) {
            finalTriage = 'emergency';
        }

        const [result] = await pool.execute(
            `INSERT INTO medical_records
             (patient_id, doctor_id, appointment_id, diagnosis, symptoms,
              treatment_plan, prescription, test_results, blood_pressure,
              heart_rate, temperature, weight, height, notes, triage_category)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_id, doctor_id, appointment_id || null,
                diagnosis, symptoms, treatment_plan, prescription,
                test_results, blood_pressure, heart_rate, temperature,
                weight, height, notes, finalTriage
            ]
        );

        await createAuditLog(
            req.user.user_id, 'MEDICAL_RECORD_CREATED',
            'medical_records', result.insertId, 'success', req
        );

        if (finalTriage === 'emergency') {
            const [admins] = await pool.execute(
                "SELECT user_id FROM users WHERE role = 'admin'"
            );
            for (const admin of admins) {
                await pool.execute(
                    `INSERT INTO notifications (user_id, title, message, type)
                     VALUES (?, ?, ?, ?)`,
                    [
                        admin.user_id,
                        '🚨 URGENT CASE',
                        `Patient ID ${patient_id} flagged as EMERGENCY.`,
                        'urgent'
                    ]
                );
            }
        }

        res.status(201).json({
            success: true,
            message: 'Medical record saved.',
            data: { record_id: result.insertId, triage_category: finalTriage }
        });

    } catch (error) {
        console.error('Medical record error:', error);
        res.status(500).json({ success: false, message: 'Failed to save medical record.' });
    }
};

const getPatientRecords = async (req, res) => {
    try {
        const { patient_id } = req.params;

        const [records] = await pool.execute(
            `SELECT mr.*,
                    CONCAT(u.first_name, ' ', u.last_name) as doctor_name
             FROM medical_records mr
             JOIN doctors doc ON mr.doctor_id = doc.doctor_id
             JOIN users u ON doc.user_id = u.user_id
             WHERE mr.patient_id = ?
             ORDER BY mr.created_at DESC`,
            [patient_id]
        );

        await createAuditLog(
            req.user.user_id, 'PATIENT_RECORDS_ACCESSED',
            'medical_records', parseInt(patient_id), 'success', req
        );

        res.status(200).json({ success: true, count: records.length, data: records });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get patient records.' });
    }
};

module.exports = { getMyMedicalRecords, createMedicalRecord, getPatientRecords };