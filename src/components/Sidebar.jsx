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

      <Link to="/stratizen" className="sidebar-link">
        <span className="icon">🌐</span> Stratizen
      </Link>

      {/* Study Hub Link */}
      <Link to="/studyhub" className="sidebar-link">
        <span className="icon">📚</span> Study
      </Link>

      {/* Mentorship Link */}
      <Link to="/mentorship" className="sidebar-link">
        <span className="icon">🎓</span> Mentorship
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
        <span className="icon">🛒</span> Market
      </Link>

      {/*Resources Link */}
      <Link to="/resource-library" className="sidebar-link">
        <span className="icon">📚</span> Resources
      </Link>

      <Link to="/innovation" className="sidebar-link">
        <span className="icon">🚀</span> Innovation Hub
      </Link>

      <Link to="/careers" className="sidebar-link">
        <span className="icon">💼</span> Careers
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
