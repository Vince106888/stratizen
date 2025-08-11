import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import strathLogo from '../assets/SU-Logo.png';
import '../styles/MainLayout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/auth');
  };

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="top-nav">
        {/* Left Side */}
        <div className="nav-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <img src={strathLogo} alt="Strathmore University" className="logo" />
        </div>

        {/* Center Branding */}
        <div className="nav-center">
          <h1 className="brand-name">Stratizen</h1>
        </div>

        {/* Right Side */}
        <div className="nav-right">
          <button className="nav-btn">🔔</button>
          <button className="nav-btn">⚙️</button>

          {/* Profile Dropdown */}
          <div
            className="profile-container"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="User"
              className="profile-img"
            />
            {dropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => navigate('/profile')}>
                  View Profile
                </button>
                <button onClick={() => navigate('/settings')}>
                  Settings
                </button>
                <hr />
                <button onClick={handleLogout} className="logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-layout">
        {sidebarOpen && <Sidebar handleLogout={handleLogout} />}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
