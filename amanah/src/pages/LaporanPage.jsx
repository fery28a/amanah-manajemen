import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const LaporanPage = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeSubMenu, setActiveSubMenu] = useState('absensi');
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [loanReport, setLoanReport] = useState([]);

  const API_URL = '/api';


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${API_URL}/employees`);
        const data = await response.json();
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployeeId(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchReports = async () => {
    if (!selectedEmployeeId || !selectedMonth) return;
    try {
      const attendanceRes = await fetch(`${API_URL}/attendance/report?employeeId=${selectedEmployeeId}&month=${selectedMonth}`);
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendanceReport(attendanceData);
      } else {
        setAttendanceReport([]);
      }
      const loanRes = await fetch(`${API_URL}/loans/report?employeeId=${selectedEmployeeId}&month=${selectedMonth}`);
      if (loanRes.ok) {
        const loanData = await loanRes.json();
        setLoanReport(loanData);
      } else {
        setLoanReport([]);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedEmployeeId, selectedMonth, activeSubMenu]);

  const getFormattedDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getAllDatesInMonth = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const dates = [];
    const totalDays = new Date(year, month, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month - 1, i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  };

  const allDatesInMonth = getAllDatesInMonth(selectedMonth);

  const totalHadir = attendanceReport.filter((att) => att.status === 'present' || att.status === 'completed').length;
  const totalAbsen = attendanceReport.filter((att) => att.status === 'absent').length;

  const totalHutangUang = loanReport
    .filter((loan) => loan.type === 'Uang' && (loan.status === 'approved' || loan.status === 'paid'))
    .reduce((sum, loan) => sum + loan.amount, 0);

  const totalHutangBarang = loanReport
    .filter((loan) => loan.type === 'Barang' && (loan.status === 'approved' || loan.status === 'paid'))
    .reduce((sum, loan) => sum + loan.amount, 0);

  const formatMonthName = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const availableMonths = ['2025-08', '2025-07'];

  const getLoanStatusText = (status) => {
    switch(status) {
      case 'pending':
        return <span className="font-semibold text-yellow-500">Pending</span>;
      case 'approved':
        return <span className="font-semibold text-green-500">Disetujui</span>;
      case 'rejected':
        return <span className="font-semibold text-red-500">Ditolak</span>;
      case 'paid':
        return <span className="font-semibold text-blue-500">Lunas</span>;
      default:
        return <span>-</span>;
    }
  };

  const handleExportExcel = () => {
    let dataToExport = [];
    let fileName = '';

    if (activeSubMenu === 'absensi') {
      fileName = `Laporan_Absensi_${employees.find(e => e._id === selectedEmployeeId)?.name}_${selectedMonth}.xlsx`;
      dataToExport = allDatesInMonth.map(date => {
        const attendanceRecord = attendanceReport.find(att => att.date === date);
        const status = (attendanceRecord?.status === 'present' || attendanceRecord?.status === 'completed') ? 'Hadir' : (attendanceRecord?.status === 'absent' ? 'Absen' : 'Belum tercatat');
        return {
          'Tanggal': getFormattedDate(date),
          'Status': status,
          'Jam Hadir': attendanceRecord?.checkIn || '-',
          'Lama Istirahat': attendanceRecord?.breakDuration ? `${attendanceRecord.breakDuration} menit` : '-',
          'Jam Pulang': attendanceRecord?.checkOut || '-'
        };
      });
    } else {
      fileName = `Laporan_Hutang_${employees.find(e => e._id === selectedEmployeeId)?.name}_${selectedMonth}.xlsx`;
      dataToExport = loanReport.map(loan => ({
        'Tanggal': getFormattedDate(loan.date),
        'Jenis': loan.type,
        'Nomor Transaksi': loan.transactionId || '-',
        'Deskripsi': loan.description || '-',
        'Nominal': loan.amount,
        'Status': loan.status
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan Karyawan</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Pilih Karyawan</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Pilih Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>{formatMonthName(month)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveSubMenu('absensi')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeSubMenu === 'absensi' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Laporan Absensi
          </button>
          <button
            onClick={() => setActiveSubMenu('hutang')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeSubMenu === 'hutang' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Laporan Hutang
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
            Export Excel
          </button>
        </div>
      </div>

      {activeSubMenu === 'absensi' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Laporan Absensi Bulan {formatMonthName(selectedMonth)}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Tanggal</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Status</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Jam Hadir</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Lama Istirahat</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Jam Pulang</th>
                </tr>
              </thead>
              <tbody>
                {allDatesInMonth.map((date) => {
                  const attendanceRecord = attendanceReport.find(att => att.date === date);
                  const status = (attendanceRecord?.status === 'present' || attendanceRecord?.status === 'completed') ? 'Hadir' : (attendanceRecord?.status === 'absent' ? 'Absen' : 'Belum tercatat');
                  return (
                    <tr key={date} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">{getFormattedDate(date)}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <span className={`font-semibold ${status === 'Hadir' ? 'text-green-600' : (status === 'Absen' ? 'text-red-600' : 'text-gray-500')}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {attendanceRecord?.checkIn || '-'}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {attendanceRecord?.breakDuration ? `${attendanceRecord.breakDuration} menit` : '-'}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {attendanceRecord?.checkOut || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4 text-center text-sm font-semibold">
            <div className="flex-1 p-4 bg-green-100 rounded-lg">
              Total Hari Hadir: <span className="text-lg font-bold text-green-700">{totalHadir}</span>
            </div>
            <div className="flex-1 p-4 bg-red-100 rounded-lg">
              Total Hari Absen: <span className="text-lg font-bold text-red-700">{totalAbsen}</span>
            </div>
          </div>
        </div>
      )}

      {activeSubMenu === 'hutang' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Laporan Hutang Bulan {formatMonthName(selectedMonth)}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Tanggal</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Jenis</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Nomor Transaksi</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Deskripsi</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Nominal</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loanReport.length > 0 ? (
                  loanReport.map((loan) => (
                    <tr key={loan._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200">{getFormattedDate(loan.date)}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{loan.type}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{loan.transactionId || '-'}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{loan.description || '-'}</td>
                      <td className="py-2 px-4 border-b border-gray-200">Rp {loan.amount.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{getLoanStatusText(loan.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">Tidak ada data hutang pada bulan ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4 text-center text-sm font-semibold">
            <div className="flex-1 p-4 bg-blue-100 rounded-lg">
              Total Hutang Uang: <span className="text-lg font-bold text-blue-700">Rp {totalHutangUang.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex-1 p-4 bg-purple-100 rounded-lg">
              Total Hutang Barang: <span className="text-lg font-bold text-purple-700">Rp {totalHutangBarang.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporanPage;