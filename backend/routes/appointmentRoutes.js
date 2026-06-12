const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/availability', authenticate, appointmentController.getAvailability);
router.post('/book', authenticate, authorize('patient'), appointmentController.bookAppointment);
router.put('/:appointment_id/reschedule', authenticate, appointmentController.rescheduleAppointment);
router.put('/:appointment_id/cancel', authenticate, appointmentController.cancelAppointment);
router.get('/my-appointments', authenticate, appointmentController.getMyAppointments);
router.get('/notifications', authenticate, appointmentController.getNotifications);
router.put('/notifications/:notification_id/read', authenticate, appointmentController.markNotificationRead);

module.exports = router;