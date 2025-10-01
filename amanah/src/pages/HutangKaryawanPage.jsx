import React, { useState, useEffect } from 'react';

const HutangKaryawanPage = ({ employeeId }) => {
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [loanRequests, setLoanRequests] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [moneyLoanForm, setMoneyLoanForm] = useState({ description: '', amount: '' });
  const [itemLoanForm, setItemLoanForm] = useState({ transactionId: '', amount: '' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [successMessage, setSuccessMessage] = useState('');

  // --- START PERUBAHAN ---
  // Fungsi untuk menghasilkan daftar bulan yang tersedia secara dinamis (misalnya 12 bulan terakhir)
  const generateAvailableMonths = (count = 12) => {
    const months = [];
    let date = new Date();
    for (let i = 0; i < count; i++) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      months.push(`${year}-${month}`);
      date.setMonth(date.getMonth() - 1);
    }
    return months;
  };
  // --- END PERUBAHAN ---

  const API_URL = '/api';

  
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user ? user.id : null;
  const currentUserName = user ? user.name : 'Guest';

  const fetchUserLoans = async () => {
    if (!currentUserId || !selectedMonth) return;
    try {
      const response = await fetch(`${API_URL}/loans/report?employeeId=${currentUserId}&month=${selectedMonth}`);
      if (!response.ok) {
        setLoanRequests([]);
        return;
      }
      const data = await response.json();
      setLoanRequests(data);
    } catch (err) {
      console.error('Failed to fetch user loans:', err);
    }
  };

  useEffect(() => {
    fetchUserLoans();
  }, [currentUserId, selectedMonth]);

  useEffect(() => {
    const totalPendingSum = loanRequests
      .filter(req => req.status === 'pending')
      .reduce((sum, req) => sum + req.amount, 0);
    setTotalPending(totalPendingSum);

    const totalPaidSum = loanRequests
      .filter(req => req.status === 'paid')
      .reduce((sum, req) => sum + req.amount, 0);
    setTotalPaid(totalPaidSum);
  }, [loanRequests]);

  const handleMoneyLoanChange = (e) => {
    const { name, value } = e.target;
    setMoneyLoanForm({ ...moneyLoanForm, [name]: value });
  };

  const handleItemLoanChange = (e) => {
    const { name, value } = e.target;
    setItemLoanForm({ ...itemLoanForm, [name]: value });
  };
  
  const submitMoneyLoan = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert('Error: Data user tidak ditemukan. Silakan logout dan login kembali.');
      return;
    }
    if (!moneyLoanForm.description || !moneyLoanForm.amount) {
      alert('Deskripsi dan nominal hutang uang harus diisi.');
      return;
    }
    const newLoan = {
      employeeId: currentUserId,
      name: currentUserName,
      date: new Date().toISOString().slice(0, 10),
      type: 'Uang',
      description: moneyLoanForm.description,
      amount: parseFloat(moneyLoanForm.amount),
      status: 'pending'
    };
    try {
      await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan),
      });
      setSuccessMessage('Pengajuan hutang uang berhasil diajukan.');
      setMoneyLoanForm({ description: '', amount: '' });
      fetchUserLoans();
    } catch (err) {
      console.error('Failed to submit money loan:', err);
      alert('Gagal mengajukan hutang uang.');
    }
  };

  const submitItemLoan = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert('Error: Data user tidak ditemukan. Silakan logout dan login kembali.');
      return;
    }
    if (!itemLoanForm.transactionId || !itemLoanForm.amount) {
      alert('Nomor transaksi dan nominal hutang barang harus diisi.');
      return;
    }
    const newLoan = {
      employeeId: currentUserId,
      name: currentUserName,
      date: new Date().toISOString().slice(0, 10),
      type: 'Barang',
      transactionId: itemLoanForm.transactionId,
      amount: parseFloat(itemLoanForm.amount),
      status: 'pending'
    };
    try {
      await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan),
      });
      setSuccessMessage('Pengajuan hutang barang berhasil diajukan.');
      setItemLoanForm({ transactionId: '', amount: '' });
      fetchUserLoans();
    } catch (err) {
      console.error('Failed to submit item loan:', err);
      alert('Gagal mengajukan hutang barang.');
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      case 'paid': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  const formatMonthName = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // availableMonths lama: const availableMonths = ['2025-08', '2025-07'];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Hutang</h1>
          <p className="text-gray-600 mb-2">Halo, <span className="font-semibold text-indigo-600">{currentUserName}</span>!</p>
          <div className="flex gap-4">
            <p className="text-gray-600">Total Pengajuan: <span className="font-semibold text-yellow-500">Rp {totalPending.toLocaleString('id-ID')}</span></p>
            <p className="text-gray-600">Total Lunas: <span className="font-semibold text-blue-500">Rp {totalPaid.toLocaleString('id-ID')}</span></p>
          </div>
        </div>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-md">
          {availableMonths.map(month => <option key={month} value={month}>{formatMonthName(month)}</option>)}
        </select>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 font-semibold">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ajukan Hutang Uang</h2>
          <form onSubmit={submitMoneyLoan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Deskripsi Kebutuhan</label>
              <input type="text" name="description" value={moneyLoanForm.description} onChange={handleMoneyLoanChange} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Nominal</label>
              <input type="number" name="amount" value={moneyLoanForm.amount} onChange={handleMoneyLoanChange} className="w-full p-2 border rounded-md" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">Ajukan Hutang Uang</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ajukan Hutang Barang</h2>
          <form onSubmit={submitItemLoan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Nomor Transaksi</label>
              <input type="text" name="transactionId" value={itemLoanForm.transactionId} onChange={handleItemLoanChange} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Nominal Transaksi</label>
              <input type="number" name="amount" value={itemLoanForm.amount} onChange={handleItemLoanChange} className="w-full p-2 border rounded-md" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">Ajukan Hutang Barang</button>
          </form>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Riwayat Pengajuan Hutang</h2>
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
              {loanRequests.length > 0 ? loanRequests.map(loan => (
                <tr key={loan._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-gray-200">{getFormattedDate(loan.date)}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{loan.type}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{loan.transactionId || '-'}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{loan.description || '-'}</td>
                  <td className="py-2 px-4 border-b border-gray-200">Rp {loan.amount.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <span className={`font-semibold text-sm capitalize ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center py-4 text-gray-500">Tidak ada pengajuan hutang pada bulan ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HutangKaryawanPage;
