const express = require('express');
const router = express.Router();
const c = require('../controllers/doctorController');

if (c.getDashboard)        router.get('/dashboard', c.getDashboard);
if (c.getProfile)          router.get('/profile', c.getProfile);
if (c.updateProfile)       router.put('/profile', c.updateProfile);
if (c.getSchedule)         router.get('/schedule', c.getSchedule);
if (c.updateSchedule)      router.put('/schedule', c.updateSchedule);
if (c.getAppointments)     router.get('/appointments', c.getAppointments);
if (c.completeAppointment) router.put('/appointments/:id/complete', c.completeAppointment);
if (c.getMyPatients)       router.get('/patients', c.getMyPatients);

module.exports = router;
