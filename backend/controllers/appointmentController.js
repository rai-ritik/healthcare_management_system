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

const createNotification = async (userId, title, message, type) => {
    try {
        await pool.execute(
            `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
            [userId, title, message, type]
        );
    } catch (err) {}
};

const getAvailability = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;

        if (!doctor_id || !date) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID and date are required.'
            });
        }

        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        const [schedules] = await pool.execute(
            `SELECT start_time, end_time FROM doctor_schedules
             WHERE doctor_id = ? AND day_of_week = ? AND is_available = TRUE`,
            [doctor_id, dayOfWeek]
        );

        if (schedules.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Doctor not available on this day.',
                available_slots: []
            });
        }

        const [booked] = await pool.execute(
            `SELECT appointment_time FROM appointments
             WHERE doctor_id = ? AND appointment_date = ?
             AND status NOT IN ('cancelled')`,
            [doctor_id, date]
        );

        const bookedTimes = booked.map(s => s.appointment_time.substring(0, 5));
        const slots = [];
        const schedule = schedules[0];

        let current = new Date(`1970-01-01T${schedule.start_time}`);
        const end = new Date(`1970-01-01T${schedule.end_time}`);

        while (current < end) {
            const timeStr = current.toTimeString().substring(0, 5);
            if (!bookedTimes.includes(timeStr)) {
                slots.push({ time: timeStr, available: true });
            }
            current = new Date(current.getTime() + 30 * 60000);
        }

        res.status(200).json({
            success: true,
            date,
            doctor_id,
            available_slots: slots
        });

    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get availability.'
        });
    }
};

const bookAppointment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { doctor_id, appointment_date, appointment_time, reason } = req.body;

        const [patients] = await connection.execute(
            'SELECT patient_id FROM patients WHERE user_id = ?',
            [req.user.user_id]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found.'
            });
        }

        const patient_id = patients[0].patient_id;

        const [conflicts] = await connection.execute(
            `SELECT appointment_id FROM appointments
             WHERE doctor_id = ? AND appointment_date = ?
             AND appointment_time = ? AND status NOT IN ('cancelled')`,
            [doctor_id, appointment_date, appointment_time]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'This time slot is already booked. Please choose another.'
            });
        }

        await connection.beginTransaction();

        const [result] = await connection.execute(
            `INSERT INTO appointments
             (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
             VALUES (?, ?, ?, ?, ?, 'confirmed')`,
            [patient_id, doctor_id, appointment_date, appointment_time, reason]
        );

        const appointmentId = result.insertId;
        await connection.commit();

        await createAuditLog(
            req.user.user_id, 'APPOINTMENT_BOOKED',
            'appointments', appointmentId, 'success', req
        );

        await createNotification(
            req.user.user_id,
            '✅ Appointment Confirmed',
            `Your appointment on ${appointment_date} at ${appointment_time} is confirmed.`,
            'appointment'
        );

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            data: {
                appointment_id: appointmentId,
                appointment_date,
                appointment_time,
                status: 'confirmed'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to book appointment.'
        });
    } finally {
        connection.release();
    }
};

const rescheduleAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { new_date, new_time } = req.body;

        const [appointments] = await pool.execute(
            `SELECT a.*, p.user_id FROM appointments a
             JOIN patients p ON a.patient_id = p.patient_id
             WHERE a.appointment_id = ?`,
            [appointment_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found.'
            });
        }

        const appointment = appointments[0];

        if (appointment.user_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied.'
            });
        }

        const [conflicts] = await pool.execute(
            `SELECT appointment_id FROM appointments
             WHERE doctor_id = ? AND appointment_date = ?
             AND appointment_time = ? AND status NOT IN ('cancelled')
             AND appointment_id != ?`,
            [appointment.doctor_id, new_date, new_time, appointment_id]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'New time slot is not available.'
            });
        }

        await pool.execute(
            `UPDATE appointments
             SET appointment_date = ?, appointment_time = ?, status = 'confirmed'
             WHERE appointment_id = ?`,
            [new_date, new_time, appointment_id]
        );

        await createAuditLog(
            req.user.user_id, 'APPOINTMENT_RESCHEDULED',
            'appointments', appointment_id, 'success', req
        );

        await createNotification(
            appointment.user_id,
            '🔄 Appointment Rescheduled',
            `Your appointment moved to ${new_date} at ${new_time}.`,
            'appointment'
        );

        res.status(200).json({
            success: true,
            message: 'Appointment rescheduled successfully.',
            data: { appointment_id, new_date, new_time }
        });

    } catch (error) {
        console.error('Reschedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reschedule.'
        });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { reason } = req.body;

        const [appointments] = await pool.execute(
            `SELECT a.*, p.user_id FROM appointments a
             JOIN patients p ON a.patient_id = p.patient_id
             WHERE a.appointment_id = ?`,
            [appointment_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found.'
            });
        }

        const appointment = appointments[0];

        if (appointment.user_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied.'
            });
        }

        await pool.execute(
            `UPDATE appointments SET status = 'cancelled', notes = ?
             WHERE appointment_id = ?`,
            [reason || 'Cancelled by user', appointment_id]
        );

        await createAuditLog(
            req.user.user_id, 'APPOINTMENT_CANCELLED',
            'appointments', appointment_id, 'success', req
        );

        await createNotification(
            appointment.user_id,
            '❌ Appointment Cancelled',
            `Your appointment on ${appointment.appointment_date} has been cancelled.`,
            'cancellation'
        );

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully.'
        });

    } catch (error) {
        console.error('Cancel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel.'
        });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        let query = '';
        let params = [];

        if (req.user.role === 'patient') {
            query = `
                SELECT a.*,
                       CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                       d.specialization, d.department
                FROM appointments a
                JOIN doctors doc ON a.doctor_id = doc.doctor_id
                JOIN users u ON doc.user_id = u.user_id
                JOIN doctors d ON a.doctor_id = d.doctor_id
                JOIN patients p ON a.patient_id = p.patient_id
                WHERE p.user_id = ?
                ORDER BY a.appointment_date DESC
            `;
            params = [req.user.user_id];
        } else if (req.user.role === 'doctor') {
            query = `
                SELECT a.*,
                       CONCAT(pu.first_name, ' ', pu.last_name) as patient_name,
                       pat.date_of_birth, pat.blood_type
                FROM appointments a
                JOIN patients pat ON a.patient_id = pat.patient_id
                JOIN users pu ON pat.user_id = pu.user_id
                JOIN doctors doc ON a.doctor_id = doc.doctor_id
                WHERE doc.user_id = ?
                ORDER BY a.appointment_date DESC
            `;
            params = [req.user.user_id];
        } else {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        const [appointments] = await pool.execute(query, params);

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get appointments.'
        });
    }
};

const getNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.execute(
            `SELECT * FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC LIMIT 50`,
            [req.user.user_id]
        );

        const unread = notifications.filter(n => !n.is_read).length;

        res.status(200).json({
            success: true,
            unread_count: unread,
            data: notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications.'
        });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const { notification_id } = req.params;

        await pool.execute(
            `UPDATE notifications SET is_read = TRUE
             WHERE notification_id = ? AND user_id = ?`,
            [notification_id, req.user.user_id]
        );

        res.status(200).json({
            success: true,
            message: 'Notification marked as read.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update notification.'
        });
    }
};

module.exports = {
    getAvailability,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getMyAppointments,
    getNotifications,
    markNotificationRead
};