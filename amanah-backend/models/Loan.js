const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Uang', 'Barang'],
    required: true
  },
  transactionId: {
    type: String
  },
  description: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  }
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;