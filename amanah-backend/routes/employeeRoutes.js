const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Loan = require('../models/Loan');

// GET semua karyawan
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST karyawan baru
router.post('/', async (req, res) => {
  const employee = new Employee(req.body);
  try {
    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) karyawan
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE karyawan
router.delete('/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Hapus semua data absensi yang terkait dengan karyawan
    await Attendance.deleteMany({ employeeId: employeeId });

    // Hapus semua data hutang yang terkait dengan karyawan
    await Loan.deleteMany({ employeeId: employeeId });

    // Hapus data karyawan itu sendiri
    await Employee.findByIdAndDelete(employeeId);

    res.json({ message: 'Karyawan dan semua data terkait berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
