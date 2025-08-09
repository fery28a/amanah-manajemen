import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';

import DashboardAdmin from './pages/DashboardAdmin';
import DashboardKaryawan from './pages/DashboardKaryawan';
import MasterdataPage from './pages/MasterdataPage';
import AbsensiPage from './pages/AbsensiPage';
import MonitoringPage from './pages/MonitoringPage';
import HutangAdminPage from './pages/HutangAdminPage';
import HutangKaryawanPage from './pages/HutangKaryawanPage';
import LaporanPage from './pages/LaporanPage';

const NotFoundPage = () => (
  <div className="text-center p-8">
    <h1 className="text-4xl font-bold text-red-500">404</h1>
    <p className="text-gray-600 mt-2">Halaman tidak ditemukan.</p>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); 
  }, []);
  
  const isLoggedIn = !!user;
  const userRole = user?.role;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-2xl">
        Memuat...
      </div>
    );
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      const redirectPath = userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard';
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['admin', 'karyawan']}>
              <MainLayout userRole={userRole} />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              userRole === 'admin' ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <Navigate to="/employee-dashboard" replace />
              )
            }
          />
          <Route path="admin-dashboard" element={<DashboardAdmin />} />
          <Route path="employee-dashboard" element={<DashboardKaryawan />} />
          <Route
            path="masterdata"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MasterdataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="absensi"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AbsensiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="monitoring"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-debts"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HutangAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LaporanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee-debts"
            element={
              <ProtectedRoute allowedRoles={['karyawan']}>
                <HutangKaryawanPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;