// src/components/Stratizen/Sidebar.jsx
import React, { useEffect } from "react";
import { Menu, X } from "lucide-react"; // Modern icons
import "../../styles/Stratizen/Sidebar.css";

const Sidebar = ({
  menuItems,
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  // Collapse on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      {!sidebarCollapsed && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <aside
        className={`stratizen-sidebar ${sidebarCollapsed ? "collapsed" : "open"}`}
      >
        <div className="sidebar-box">
          {/* Header */}
          <div className="sidebar-header">
            {!sidebarCollapsed && <h2 className="sidebar-title">Stratizen</h2>}

            {/* Collapse/Expand Button */}
            <button
              className={`collapse-btn ${sidebarCollapsed ? "" : "open"}`}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
            >
              <div className="icon-wrapper">
                <Menu
                  size={22}
                  strokeWidth={2}
                  className={`icon-menu ${sidebarCollapsed ? "visible" : "hidden"}`}
                />
                <X
                  size={22}
                  strokeWidth={2}
                  className={`icon-x ${!sidebarCollapsed ? "visible" : "hidden"}`}
                />
              </div>
            </button>
          </div>

          {/* Menu */}
          <nav className="sidebar-menu">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`sidebar-btn ${activeTab === item.key ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
                title={sidebarCollapsed ? item.label : ""}
              >
                <span className="menu-icon">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="menu-text">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            {!sidebarCollapsed && (
              <small className="footer-text">
                © {new Date().getFullYear()} Stratizen
              </small>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
