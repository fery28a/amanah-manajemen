import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardAdmin = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [totalHutangUang, setTotalHutangUang] = useState(0);
  const [totalHutangBarang, setTotalHutangBarang] = useState(0);

  const API_URL = 'http://10.10.10.100:5000/api';

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, loansRes] = await Promise.all([
        fetch(`${API_URL}/attendance/summary?month=${selectedMonth}`),
        fetch(`${API_URL}/loans?month=${selectedMonth}`)
      ]);

      const attendance = await attendanceRes.json();
      const loans = await loansRes.json();
      
      setAttendanceData(attendance.map(item => ({
        date: item._id,
        hadir: item.present,
        absen: item.absent
      })));
      setLoanData(loans);

      const totalUang = loans.filter(l => l.type === 'Uang' && l.status === 'approved').reduce((sum, l) => sum + l.amount, 0);
      const totalBarang = loans.filter(l => l.type === 'Barang' && l.status === 'approved').reduce((sum, l) => sum + l.amount, 0);
      setTotalHutangUang(totalUang);
      setTotalHutangBarang(totalBarang);

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const formatMonthName = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };
  
  const getFormattedDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const availableMonths = ['2025-08', '2025-07'];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-md">
          {availableMonths.map(month => <option key={month} value={month}>{formatMonthName(month)}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Grafik Absensi Bulanan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" fill="#8884d8" name="Hadir" />
              <Bar dataKey="absen" fill="#82ca9d" name="Absen" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Hutang Karyawan</h2>
          <div className="flex flex-col gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-700">Total Hutang Uang:</p>
              <p className="text-2xl font-bold text-blue-900">Rp {totalHutangUang.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <p className="text-sm font-semibold text-purple-700">Total Hutang Barang:</p>
              <p className="text-2xl font-bold text-purple-900">Rp {totalHutangBarang.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Detail Hutang Karyawan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b border-gray-300 text-left">Nama</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Tanggal</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Jenis</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Nominal</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {loanData.length > 0 ? (
                loanData.map((loan) => (
                  <tr key={loan._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-gray-200">{loan.employeeId.name}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{getFormattedDate(loan.date)}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{loan.type}</td>
                    <td className="py-2 px-4 border-b border-gray-200">Rp {loan.amount.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <span className={`font-semibold capitalize ${
                        loan.status === 'pending' ? 'text-yellow-500' : loan.status === 'approved' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Tidak ada data hutang pada bulan ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;