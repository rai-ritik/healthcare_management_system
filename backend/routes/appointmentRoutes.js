const express = require('express');
const router = express.Router();
const c = require('../controllers/appointmentController');

if (c.bookAppointment)      router.post('/book', c.bookAppointment);
if (c.cancelAppointment)    router.put('/:id/cancel', c.cancelAppointment);
if (c.rescheduleAppointment) router.put('/:id/reschedule', c.rescheduleAppointment);
if (c.getAvailability)      router.get('/availability', c.getAvailability);
if (c.getAppointments)      router.get('/', c.getAppointments);

module.exports = router;
