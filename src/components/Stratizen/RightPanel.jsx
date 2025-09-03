import React, { useState, useEffect } from "react";
import "../../styles/Stratizen/RightPanel.css";
import { useTheme } from "../../context/ThemeContext";

const RightPanel = () => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);

  // Automatically show/hide panel based on window width
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      data-theme={theme}
      className={`stratizen-rightpanel ${collapsed ? "collapsed" : ""}`}
    >
      {!collapsed && (
        <div className="rightpanel-box">
          <header className="rightpanel-header">
            <h2 className="panel-title">Explore</h2>
          </header>

          <section className="rightpanel-section pages">
            <h3>🔥 Trending</h3>
            <ul>
              <li>Strathmore Business School</li>
              <li>Innovation</li>
              <li>#Sports</li>
            </ul>
          </section>

          <section className="rightpanel-section forum">
            <h3>🤝 Network & Discover</h3>
            <ul>
              <li>John Doe</li>
              <li>Alice A</li>
              <li>Bob B</li>
            </ul>
          </section>

          <section className="rightpanel-section events">
            <h3>📅 Upcoming Events</h3>
            <ul>
              <li>Career Fair – Aug 20</li>
              <li>Innovation Week – Sep 5</li>
              <li>Sports Day – Sep 15</li>
            </ul>
          </section>
        </div>
      )}
    </aside>
  );
};

export default RightPanel;
