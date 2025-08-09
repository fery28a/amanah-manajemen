const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'karyawan'],
    default: 'karyawan'
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;