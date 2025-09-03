import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/Sidebar.css";

const Sidebar = ({ handleLogout, isOpen, setIsOpen }) => {
  const { theme } = useTheme();
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/profile", label: "Profile", icon: "👤" },
    { to: "/stratizen", label: "Stratizen", icon: "🌐" },
    { to: "/studyhub", label: "Study", icon: "📚" },
    { to: "/mentorship", label: "Mentorship", icon: "🎓" },
    { to: "/noticeboard", label: "Noticeboard", icon: "📰" },
    { to: "/messages", label: "Messages", icon: "📩" },
    { to: "/marketplace", label: "Market", icon: "🛒" },
    { to: "/resource-library", label: "Resources", icon: "📚" },
    { to: "/innovation", label: "Innovation Hub", icon: "🚀" },
    { to: "/careers", label: "Careers", icon: "💼" },
  ];

  // Close sidebar on route change (mobile only)
  React.useEffect(() => {
    if (window.innerWidth <= 768 && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${theme} ${isOpen ? "sidebar-open" : ""}`}>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={() => setIsOpen(false)} // close after click
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            handleLogout();
            setIsOpen(false);
          }}
          className="sidebar-link logout-btn"
        >
          <span className="icon">🚪</span> Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
