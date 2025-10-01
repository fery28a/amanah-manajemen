const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAllAttendanceByDate);
router.post('/', attendanceController.createAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.post('/:id/job', attendanceController.addJob);
router.put('/:id/job/:jobId', attendanceController.updateJobStatus);
router.get('/report', attendanceController.getReport);
router.get('/summary', attendanceController.getMonthlyAttendanceSummary);

module.exports = router;