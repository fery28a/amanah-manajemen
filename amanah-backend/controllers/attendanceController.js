const Attendance = require('../models/Attendance');

exports.getAllAttendanceByDate = async (req, res) => {
  const { date } = req.query;
  try {
    const attendance = await Attendance.find({ date }).populate('employeeId', 'name');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAttendance = async (req, res) => {
  const attendance = new Attendance(req.body);
  try {
    const newAttendance = await attendance.save();
    res.status(201).json(newAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { status, breakStart, breakEnd, breakDuration, checkOut } = req.body;
    
    const updates = { status };
    if (breakStart) updates.breakStart = new Date(breakStart);
    if (breakEnd) updates.breakEnd = new Date(breakEnd);
    if (breakDuration) updates.breakDuration = breakDuration;
    if (checkOut) updates.checkOut = checkOut;
    
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    );
    res.json(updatedAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { $push: { jobs: { description } } },
      { new: true }
    );
    res.json(updatedAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { id, jobId } = req.params;
    const { jobStatus } = req.body;
    const updatedAttendance = await Attendance.findOneAndUpdate(
      { _id: id, 'jobs._id': jobId },
      { '$set': { 'jobs.$.jobStatus': jobStatus } },
      { new: true }
    );
    res.json(updatedAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getReport = async (req, res) => {
  const { employeeId, month } = req.query;
  try {
    const attendance = await Attendance.find({
      employeeId,
      date: { $regex: `^${month}` }
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyAttendanceSummary = async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ message: 'Parameter bulan diperlukan' });
  }
  try {
    const attendance = await Attendance.aggregate([
      { $match: { date: { $regex: `^${month}` } } },
      { $group: {
        _id: '$date',
        present: {
          $sum: {
            $cond: [
              { $in: ['$status', ['present', 'completed']] },
              1,
              0
            ]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        }
      }},
      { $sort: { '_id': 1 } }
    ]);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};