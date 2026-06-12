const express = require('express');
const router = express.Router();
const c = require('../controllers/patientController');

if (c.getDashboard)          router.get('/dashboard', c.getDashboard);
if (c.getProfile)            router.get('/profile', c.getProfile);
if (c.updateProfile)         router.put('/profile', c.updateProfile);
if (c.getAppointmentHistory) router.get('/appointments', c.getAppointmentHistory);
if (c.getDoctors)            router.get('/doctors', c.getDoctors);
if (c.getNotifications)      router.get('/notifications', c.getNotifications);

module.exports = router;
