const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
    getMyMedicalRecords,
    createMedicalRecord,
    getPatientRecords
} = require('../controllers/medicalRecordController');

router.use(authenticate);

router.get('/my-records', authorize('patient'), getMyMedicalRecords);
router.post('/create', authorize('doctor'), createMedicalRecord);
router.get('/patient/:patient_id', authorize('doctor', 'admin', 'nurse'), getPatientRecords);

module.exports = router;