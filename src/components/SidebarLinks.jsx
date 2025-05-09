// SidebarLinks.js
import React from 'react';
import { Link } from 'react-router-dom';

const SidebarLinks = ({ handleLogout }) => {
  const links = [
    { to: '/profile', label: 'Profile' },
    { to: '/forum', label: 'Forum' },
    { to: '/messages', label: 'Messages' },
    { to: '/marketplace', label: 'Marketplace' }
  ];

  return (
    <nav className="space-y-4">
      {links.map(({ to, label }) => (
        <Link key={to} to={to} className="block text-gray-300 hover:text-purple-500 transition font-medium dashboard-link">
          {label}
        </Link>
      ))}

      {/* Logout Button */}
      <button onClick={handleLogout} className="text-red-500 font-semibold hover:text-red-700">
        Logout
      </button>
    </nav>
  );
};

export default SidebarLinks;
