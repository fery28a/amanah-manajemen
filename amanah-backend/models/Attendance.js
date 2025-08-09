const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  description: String,
  jobStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  }
});

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'present', 'absent', 'break', 'completed'],
    default: 'pending'
  },
  checkIn: String,
  breakStart: Date,
  breakEnd: Date,
  breakDuration: Number,
  checkOut: String,
  jobs: [jobSchema]
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;