import React, { useState, useEffect } from 'react';

const MasterdataPage = () => {
  const [employees, setEmployees] = useState([]);
  const [formInput, setFormInput] = useState({
    name: '',
    username: '',
    password: '',
    role: 'karyawan' // Tambahkan role default
  });
  const [editingId, setEditingId] = useState(null);

  // URL API backend
  const API_URL = 'http://localhost:5012/api/employees';

  // Fetch data karyawan dari backend
  const fetchEmployees = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Gagal mengambil data karyawan');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      alert('Gagal memuat data karyawan: ' + error.message);
    }
  };

  // Panggil fetchEmployees saat komponen pertama kali dimuat
  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({ ...formInput, [name]: value });
  };

  // Menambah atau mengedit karyawan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formInput.name || !formInput.username || !formInput.password) {
      alert('Semua kolom harus diisi!');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formInput),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data karyawan');
      }

      // Perbarui daftar karyawan dari backend
      await fetchEmployees();
      // Reset form
      setFormInput({ name: '', username: '', password: '', role: 'karyawan' });
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan data: ' + error.message);
    }
  };

  // Mengisi form untuk diedit
  const handleEdit = (employee) => {
    setFormInput({
      name: employee.name,
      username: employee.username,
      password: employee.password,
      role: employee.role,
    });
    setEditingId(employee._id); // Gunakan _id dari MongoDB
  };

  // Menghapus karyawan
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Gagal menghapus data karyawan');
        }
        // Perbarui daftar karyawan
        await fetchEmployees();
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus data: ' + error.message);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Masterdata Karyawan</h1>

      {/* Form Input */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {editingId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nama</label>
            <input
              type="text"
              name="name"
              value={formInput.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formInput.username}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formInput.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            {editingId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormInput({ name: '', username: '', password: '', role: 'karyawan' });
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 mt-2"
            >
              Batalkan
            </button>
          )}
        </form>
      </div>

      {/* Tabel Output */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Data Karyawan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b border-gray-300 text-left">Nama</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Username</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Password</th>
                <th className="py-2 px-4 border-b border-gray-300 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b border-gray-300">{employee.name}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{employee.username}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{employee.password}</td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="bg-yellow-500 text-white py-1 px-3 rounded-md text-sm hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="bg-red-500 text-white py-1 px-3 rounded-md text-sm hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterdataPage;