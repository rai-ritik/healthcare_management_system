const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { adminOnly, staffAndAdmin } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/dashboard', adminOnly, adminController.getDashboard);
router.get('/reports', adminOnly, adminController.generateReport);
router.get('/resources', staffAndAdmin, adminController.getResources);
router.put('/resources/:resource_id', adminOnly, adminController.updateResource);
router.get('/audit-logs', adminOnly, adminController.getAuditLogs);
router.get('/users', adminOnly, adminController.getAllUsers);
router.get('/patients', staffAndAdmin, adminController.getAllPatients);
router.get('/doctors', authenticate, adminController.getAllDoctors);
router.get('/appointments', staffAndAdmin, adminController.getAllAppointments);

module.exports = router;
