import React, { useState, useEffect } from 'react';

const DashboardKaryawan = () => {
  const [attendanceSummary, setAttendanceSummary] = useState({ hadir: 0, absen: 0 });
  const [loanSummary, setLoanSummary] = useState({ hutangUang: 0, hutangBarang: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://10.10.10.100:5000/api';
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user ? user.id : null;
  const currentUserName = user ? user.name : 'Guest';
  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchDashboardData = async () => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const attendanceRes = await fetch(`${API_URL}/attendance/report?employeeId=${currentUserId}&month=${currentMonth}`);
      const attendanceData = await attendanceRes.ok ? await attendanceRes.json() : [];
      
      const totalHadir = attendanceData.filter(att => att.status === 'present' || att.status === 'completed').length;
      const totalAbsen = attendanceData.filter(att => att.status === 'absent').length; // Perubahan di sini
      
      setAttendanceSummary({ hadir: totalHadir, absen: totalAbsen });

      const loansRes = await fetch(`${API_URL}/loans/employee/${currentUserId}/month?month=${currentMonth}`);
      const loanData = await loansRes.ok ? await loansRes.json() : [];

      const totalUang = loanData.filter(l => l.type === 'Uang' && (l.status === 'approved' || l.status === 'paid')).reduce((sum, l) => sum + l.amount, 0);
      const totalBarang = loanData.filter(l => l.type === 'Barang' && (l.status === 'approved' || l.status === 'paid')).reduce((sum, l) => sum + l.amount, 0);
      setLoanSummary({ hutangUang: totalUang, hutangBarang: totalBarang });

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUserId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Karyawan</h1>
      <p className="text-gray-600 mb-6">Selamat datang, <span className="font-semibold text-indigo-600">{currentUserName}</span>!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ringkasan Absensi Bulan Ini</h2>
          <div className="flex flex-col gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-green-700">Total Hari Hadir:</p>
              <p className="text-2xl font-bold text-green-900">{attendanceSummary.hadir} hari</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-red-700">Total Hari Absen:</p>
              <p className="text-2xl font-bold text-red-900">{attendanceSummary.absen} hari</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ringkasan Hutang Bulan Ini</h2>
          <div className="flex flex-col gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-700">Total Hutang Uang Disetujui:</p>
              <p className="text-2xl font-bold text-blue-900">Rp {loanSummary.hutangUang.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-700">Total Hutang Barang Disetujui:</p>
              <p className="text-2xl font-bold text-purple-900">Rp {loanSummary.hutangBarang.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardKaryawan;