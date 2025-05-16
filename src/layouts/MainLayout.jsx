import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth/session info
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Navigate to login
    navigate('/auth');
  };

  return (
    <div className="main-layout flex">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
