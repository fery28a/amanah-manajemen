import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: userRole === 'admin' ? '/admin-dashboard' : '/employee-dashboard', roles: ['admin', 'karyawan'] },
    { name: 'Masterdata', path: '/masterdata', roles: ['admin'] },
    { name: 'Absensi', path: '/absensi', roles: ['admin'] },
    { name: 'Monitoring', path: '/monitoring', roles: ['admin'] },
    { name: 'Hutang', path: userRole === 'admin' ? '/admin-debts' : '/employee-debts', roles: ['admin', 'karyawan'] },
    { name: 'Laporan', path: '/reports', roles: ['admin'] },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload(); 
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-300 w-64 border-r border-gray-700 shadow-lg">
      <div className="flex items-center justify-center h-20 bg-gray-900 text-3xl font-bold text-indigo-400 border-b border-gray-700">
        Amanah
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.filter(item => item.roles.includes(userRole)).map(item => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 transform ${
                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-300"
        >
          <FiLogOut className="text-xl" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;