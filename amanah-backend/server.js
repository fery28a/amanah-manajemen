const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Import rute
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const loanRoutes = require('./routes/loanRoutes');

// Gunakan rute
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/loans', loanRoutes);

// Konfigurasi koneksi MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/amanah';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Terhubung ke database MongoDB');
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Koneksi database gagal:', err.message);
  });

app.get('/', (req, res) => {
  res.send('Amanah Backend API is running!');
});