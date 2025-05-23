import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ handleLogout }) => {
  return (
    <nav className="sidebar-nav">
      {/* Profile Link */}
      <Link to="/profile" className="sidebar-link">
        <span className="icon">👤</span> Profile
      </Link>

      {/* Dashboard Link */}
      <Link to="/dashboard" className="sidebar-link">
        <span className="icon">🏠</span> Dashboard
      </Link>

      {/* Study Hub Link */}
      <Link to="/studyhub" className="sidebar-link">
        <span className="icon">📚</span> Study Hub
      </Link>

      {/* Forum Link */}
      <Link to="/forum" className="sidebar-link">
        <span className="icon">💬</span> Forum
      </Link>

      {/* Messages Link */}
      <Link to="/messages" className="sidebar-link">
        <span className="icon">📩</span> Messages
      </Link>

      {/* Marketplace Link */}
      <Link to="/marketplace" className="sidebar-link">
        <span className="icon">🛒</span> Marketplace
      </Link>

      {/* Mentorship Link */}
      <Link to="/mentorship" className="sidebar-link">
        <span className="icon">🎓</span> Mentorship
      </Link>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="sidebar-link text-red-500"
      >
        <span className="icon">🚪</span> Logout
      </button>
    </nav>
  );
};

export default Sidebar;
