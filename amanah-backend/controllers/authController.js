const Employee = require('../models/Employee');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password harus diisi.' });
  }

  try {
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(400).json({ message: 'Username tidak ditemukan.' });
    }

    const isMatch = password === employee.password;
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah.' });
    }

    res.json({
      message: 'Login berhasil',
      user: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        role: employee.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};