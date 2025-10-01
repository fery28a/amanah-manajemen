import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ userRole }) => {
  return (
    <div className="flex">
      {/* Sidebar tetap di tempatnya */}
      <div className="fixed top-0 left-0 h-full">
        <Sidebar userRole={userRole} />
      </div>

      {/* Konten utama, dengan padding kiri agar tidak tertutup sidebar */}
      <div className="flex-1 ml-64 p-4 min-h-screen bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;