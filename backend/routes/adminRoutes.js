const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');

if (c.getDashboard)  router.get('/dashboard', c.getDashboard);
if (c.getReports)    router.get('/reports', c.getReports);
if (c.getResources)  router.get('/resources', c.getResources);
if (c.getAuditLogs)  router.get('/audit-logs', c.getAuditLogs);

module.exports = router;
