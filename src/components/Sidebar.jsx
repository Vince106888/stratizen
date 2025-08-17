import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/Sidebar.css';

const Sidebar = ({ handleLogout, isOpen }) => {
  const { theme } = useTheme();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/profile', label: 'Profile', icon: '👤' },
    { to: '/stratizen', label: 'Stratizen', icon: '🌐' },
    { to: '/studyhub', label: 'Study', icon: '📚' },
    { to: '/mentorship', label: 'Mentorship', icon: '🎓' },
    { to: '/noticeboard', label: 'Noticeboard', icon: '📰' },
    { to: '/messages', label: 'Messages', icon: '📩' },
    { to: '/marketplace', label: 'Market', icon: '🛒' },
    { to: '/resource-library', label: 'Resources', icon: '📚' },
    { to: '/innovation', label: 'Innovation Hub', icon: '🚀' },
    { to: '/careers', label: 'Careers', icon: '💼' },
  ];

  return (
    <aside className={`sidebar ${theme} ${isOpen ? 'sidebar-open' : ''}`}>
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="sidebar-link logout-btn">
          <span className="icon">🚪</span> Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
