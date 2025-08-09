import React, { useState, useEffect } from 'react';

const MonitoringPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [monitoredEmployees, setMonitoredEmployees] = useState([]);
  const API_URL = 'http://10.10.10.100:5000/api';

  const fetchMonitoredEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance?date=${selectedDate}`);
      if (!response.ok) {
        setMonitoredEmployees([]);
        return;
      }
      const data = await response.json();
      const presentEmployeesWithJobs = data.filter(
        (att) => att.status === 'present' && att.jobs && att.jobs.length > 0
      );
      setMonitoredEmployees(presentEmployeesWithJobs);
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
      setMonitoredEmployees([]);
    }
  };

  useEffect(() => {
    fetchMonitoredEmployees();
  }, [selectedDate]);

  const handleUpdateJobStatus = async (attendanceId, jobId, newStatus) => {
    try {
      await fetch(`${API_URL}/attendance/${attendanceId}/job/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobStatus: newStatus }),
      });
      await fetchMonitoredEmployees();
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  const getFormattedDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'in-progress': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'in-progress': return 'Dikerjakan';
      case 'completed': return 'Selesai';
      default: return 'Menunggu';
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Monitoring Pekerjaan Karyawan</h1>
          <p className="text-gray-600">{getFormattedDate(selectedDate)}</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {monitoredEmployees.length > 0 ? (
          monitoredEmployees.map(employee => (
            <div key={employee._id} className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto w-full">
              <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">{employee.employeeId.name}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b border-gray-300 text-left">Pekerjaan</th>
                      <th className="py-2 px-4 border-b border-gray-300 text-left w-32">Status</th>
                      <th className="py-2 px-4 border-b border-gray-300 text-center w-48">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.jobs.map(job => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b border-gray-200">{job.description}</td>
                        <td className="py-3 px-4 border-b border-gray-200">
                          <span className={`font-semibold ${getStatusColor(job.jobStatus)}`}>
                            {getStatusText(job.jobStatus)}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-200 text-center">
                          <div className="flex justify-center gap-2">
                            {job.jobStatus !== 'completed' && (
                              <button onClick={() => handleUpdateJobStatus(employee._id, job._id, 'in-progress')} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Dikerjakan</button>
                            )}
                            {job.jobStatus !== 'completed' && (
                              <button onClick={() => handleUpdateJobStatus(employee._id, job._id, 'completed')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Selesai</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 text-center p-10 bg-white rounded-lg shadow-md max-w-4xl mx-auto w-full">
            <p className="text-gray-500">Tidak ada karyawan yang hadir atau tidak ada pekerjaan untuk tanggal ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;