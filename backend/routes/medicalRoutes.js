const express = require('express');
const router = express.Router();
const c = require('../controllers/medicalRecordController');

if (c.getRecords)     router.get('/', c.getRecords);
if (c.createRecord)   router.post('/', c.createRecord);
if (c.getRecordById)  router.get('/:id', c.getRecordById);

module.exports = router;
