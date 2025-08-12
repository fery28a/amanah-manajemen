import React, { useState, useEffect } from 'react';

const AbsensiPage = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [jobs, setJobs] = useState({});
  const API_URL = '/api';
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance?date=${selectedDate}`);
      if (!response.ok) {
        setAttendance([]);
        return;
      }
      const data = await response.json();
      setAttendance(data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setAttendance([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, employees]);

  const combinedData = employees.map(emp => {
    const attRecord = attendance.find(att => String(att.employeeId._id) === String(emp._id));
    const status = attRecord?.status || 'pending';
    return { ...emp, status, attRecord };
  });

  const getCurrentTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const getFormattedDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  const getDurationString = (minutes) => {
    return minutes > 0 ? `${minutes} menit` : '-';
  };

  const handleHadir = async (employeeId) => {
    try {
      const newAttendance = { employeeId, date: selectedDate, status: 'present', checkIn: getCurrentTime() };
      await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAttendance),
      });
      fetchAttendance();
    } catch (err) {
      console.error('Failed to mark present:', err);
    }
  };

  const handleAbsen = async (employeeId) => {
    try {
      const newAttendance = { employeeId, date: selectedDate, status: 'absent' };
      await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAttendance),
      });
      fetchAttendance();
    } catch (err) {
      console.error('Failed to mark absent:', err);
    }
  };

  const updateAttendanceStatus = async (attendanceId, newStatus, updates) => {
    try {
      await fetch(`${API_URL}/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...updates }),
      });
      fetchAttendance();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
  
  const handleAddJob = async (employee) => {
    const jobDescription = jobs[employee._id];
    if (jobDescription) {
      try {
        await fetch(`${API_URL}/attendance/${employee.attRecord._id}/job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: jobDescription }),
        });
        setJobs(prevJobs => ({ ...prevJobs, [employee._id]: '' }));
        alert(`Pekerjaan untuk ${employee.name} telah ditambahkan!`);
        fetchAttendance();
      } catch (err) {
        console.error('Failed to add job:', err);
        alert('Gagal menambahkan pekerjaan.');
      }
    } else {
      alert('Deskripsi pekerjaan tidak boleh kosong.');
    }
  };
  
  const handleIstirahat = (employee) => {
    updateAttendanceStatus(employee.attRecord._id, 'break', { breakStart: new Date() });
  };
  
  const handleSelesaiIstirahat = (employee) => {
    const breakStartTime = new Date(employee.attRecord.breakStart);
    const breakEndTime = new Date();
    const durationInMinutes = Math.floor((breakEndTime - breakStartTime) / (1000 * 60));

    updateAttendanceStatus(employee.attRecord._id, 'present', { 
      breakEnd: breakEndTime, 
      breakDuration: (employee.attRecord.breakDuration || 0) + durationInMinutes
    });
  };

  const renderControls = (employee) => {
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);
    if (!isToday) return null;

    switch (employee.status) {
      case 'pending':
        return (
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleHadir(employee._id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">Hadir</button>
            <button onClick={() => handleAbsen(employee._id)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">Absen</button>
          </div>
        );
      case 'present':
        return (
          <>
            <div className="mt-4">
              <input type="text" value={jobs[employee._id] || ''} onChange={(e) => setJobs({...jobs, [employee._id]: e.target.value})} placeholder="Input pekerjaan hari ini..." className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={() => handleAddJob(employee)} className="w-full bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600 transition">Add Job</button>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleIstirahat(employee)} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition">Istirahat</button>
              <button onClick={() => updateAttendanceStatus(employee.attRecord._id, 'completed', { checkOut: getCurrentTime() })} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">Pulang</button>
            </div>
          </>
        );
      case 'break':
        return (
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleSelesaiIstirahat(employee)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">Selesai Istirahat</button>
          </div>
        );
      case 'completed':
        return (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-bold">Pulang ({employee.attRecord.checkOut})</p>
          </div>
        );
      case 'absent':
        return (
          <div className="mt-4 text-center">
            <p className="text-red-600 font-bold">Karyawan ini Absen</p>
          </div>
        );
      default:
        return null;
    }
  };

  const getOutputData = () => {
    return attendance.map(att => ({
      ...att,
      name: att.employeeId.name,
      status: att.status === 'absent' ? 'Absen' : 'Hadir',
      checkIn: att.checkIn || '-',
      breakDuration: att.breakDuration > 0 ? getDurationString(att.breakDuration) : '-',
      checkOut: att.checkOut || '-',
    }));
  };

  const outputData = getOutputData();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Absensi Harian</h1>
          <p className="text-gray-600">{getFormattedDate(selectedDate)}</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {combinedData.map(employee => (
          <div key={employee._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">{employee.name}</h2>
            </div>
            {renderControls(employee)}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Output Absensi Harian</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b border-gray-300 text-left">Tanggal</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Nama</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Status</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Jam Masuk</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Lama Istirahat</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Jam Pulang</th>
              </tr>
            </thead>
            <tbody>
              {outputData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b border-gray-300">{getFormattedDate(selectedDate)}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{data.name}</td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    <span className={`font-semibold ${data.status === 'Hadir' ? 'text-green-600' : 'text-red-600'}`}>
                      {data.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">{data.checkIn}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{data.breakDuration}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{data.checkOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AbsensiPage;