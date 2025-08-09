import React, { useState, useEffect } from 'react';

const HutangAdminPage = () => {
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [loanRequests, setLoanRequests] = useState([]);
  const [totalMonthlyDebt, setTotalMonthlyDebt] = useState(0);
  const [paidOffMessage, setPaidOffMessage] = useState('');

  const API_URL = 'http://localhost:5012/api';
  
  const fetchLoanRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/loans?month=${selectedMonth}`);
      if (!response.ok) {
        setLoanRequests([]);
        return;
      }
      const data = await response.json();
      
      const groupedLoans = data.reduce((acc, loan) => {
        const existingEmployee = acc.find(item => item.employeeId === loan.employeeId._id);
        if (existingEmployee) {
          existingEmployee.requests.push(loan);
        } else {
          acc.push({
            employeeId: loan.employeeId._id,
            employeeName: loan.employeeId.name,
            requests: [loan],
            isPaidOff: false, // Simulasikan status lunas
          });
        }
        return acc;
      }, []);
      
      setLoanRequests(groupedLoans);
    } catch (err) {
      console.error('Failed to fetch loan requests:', err);
      setLoanRequests([]);
    }
  };

  useEffect(() => {
    fetchLoanRequests();
  }, [selectedMonth]);

  useEffect(() => {
    const total = loanRequests.reduce((sum, employee) => {
      if (!employee.isPaidOff) {
        return sum + employee.requests
          .filter(req => req.status === 'approved')
          .reduce((reqSum, req) => reqSum + req.amount, 0);
      }
      return sum;
    }, 0);
    setTotalMonthlyDebt(total);
  }, [loanRequests]);

  const handleLoanAction = async (requestId, status) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan ini?`);
    if (isConfirmed) {
      try {
        await fetch(`${API_URL}/loans/${requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        fetchLoanRequests();
        setPaidOffMessage('');
      } catch (err) {
        console.error('Failed to update loan status:', err);
      }
    }
  };

  const handleLunas = async (employeeId, employeeName) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin mencatat hutang ${employeeName} lunas?`);
    if (isConfirmed) {
      try {
        await fetch(`${API_URL}/loans/lunas/${employeeId}`, {
          method: 'PUT',
        });
        setLoanRequests(prevLoans =>
          prevLoans.map(emp => emp.employeeId === employeeId ? { ...emp, isPaidOff: true } : emp)
        );
        setPaidOffMessage(`Hutang karyawan ${employeeName} berhasil ditandai lunas.`);
        fetchLoanRequests();
      } catch (err) {
        console.error('Failed to mark loans paid:', err);
        setPaidOffMessage('Gagal menandai hutang lunas.');
      }
    }
  };

  const availableMonths = ['2025-08', '2025-07'];
  const getTotalDebtPerEmployee = (employee) => {
    return employee.requests
      .filter(req => req.status === 'approved' || req.status === 'paid')
      .reduce((total, req) => total + req.amount, 0);
  };

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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Hutang Karyawan</h1>
          <p className="text-gray-600">Total Hutang Bulan Ini:
            <span className="font-semibold text-indigo-600 ml-2">Rp {totalMonthlyDebt.toLocaleString('id-ID')}</span>
          </p>
        </div>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-md">
          {availableMonths.map(month => <option key={month} value={month}>{formatMonthName(month)}</option>)}
        </select>
      </div>

      {paidOffMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 font-semibold">
          {paidOffMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loanRequests.length > 0 ? loanRequests.map(employee => (
          <div key={employee.employeeId} className={`bg-white p-6 rounded-lg shadow-md ${employee.isPaidOff ? 'opacity-50' : ''}`}>
            <div className="border-b pb-2 mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">{employee.employeeName}</h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Hutang:</p>
                <p className="font-bold text-lg text-indigo-600">Rp {getTotalDebtPerEmployee(employee).toLocaleString('id-ID')}</p>
              </div>
            </div>
            {employee.isPaidOff && <div className="text-center bg-green-100 text-green-700 p-2 rounded-md mb-4 font-bold">LUNAS</div>}
            
            <ul className="space-y-4">
              {employee.requests.map(req => (
                <li key={req._id} className="border-b pb-2">
                  <p className="text-sm text-gray-500">Tanggal: <span className="font-semibold">{getFormattedDate(req.date)}</span></p>
                  <p className="text-sm text-gray-500">Jenis: <span className="font-semibold">{req.type}</span></p>
                  <p className="text-sm text-gray-500">Pengajuan: <span className="font-semibold">Rp {req.amount.toLocaleString('id-ID')}</span></p>
                  <p className="text-sm text-gray-500">Alasan: {req.description || req.transactionId}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`font-semibold text-sm capitalize ${req.status === 'pending' ? 'text-yellow-500' : req.status === 'approved' ? 'text-green-500' : req.status === 'paid' ? 'text-blue-500' : 'text-red-500'}`}>{req.status}</span>
                    
                    {/* Logika untuk menampilkan tombol Setujui dan Tolak */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleLoanAction(req._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition">Setujui</button>
                        <button onClick={() => handleLoanAction(req._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition">Tolak</button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {!employee.isPaidOff && (
              <div className="mt-4">
                <button onClick={() => handleLunas(employee.employeeId, employee.employeeName)} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Tandai Lunas</button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-2 text-center p-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Tidak ada pengajuan hutang pada bulan ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HutangAdminPage;