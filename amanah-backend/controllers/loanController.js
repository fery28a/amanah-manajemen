const Loan = require('../models/Loan');

exports.createLoan = async (req, res) => {
  const loan = new Loan(req.body);
  try {
    const newLoan = await loan.save();
    res.status(201).json(newLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getLoansByMonth = async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ message: 'Parameter bulan diperlukan' });
  }
  try {
    const loans = await Loan.find({ date: { $regex: `^${month}` } }).populate('employeeId', 'name');
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLoansByEmployee = async (req, res) => {
  try {
    const loans = await Loan.find({ employeeId: req.params.employeeId });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLoansByEmployeeAndMonth = async (req, res) => {
  const { employeeId } = req.params;
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ message: 'Parameter bulan diperlukan' });
  }
  try {
    const loans = await Loan.find({
      employeeId: employeeId,
      date: { $regex: `^${month}` }
    });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLoanStatus = async (req, res) => {
  try {
    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLoan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getReport = async (req, res) => {
  const { employeeId, month } = req.query;
  try {
    const loans = await Loan.find({
      employeeId,
      date: { $regex: `^${month}` }
    });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markLoansPaid = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedLoans = await Loan.updateMany(
      { employeeId: employeeId, status: 'approved' },
      { $set: { status: 'paid' } },
    );
    res.json({ message: `${updatedLoans.modifiedCount} hutang berhasil ditandai lunas.` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};