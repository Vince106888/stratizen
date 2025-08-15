import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/Dashboard/QuickActions.css';

function QuickActions() {
  const location = useLocation();

  const actions = [
    { to: '/timetable', label: 'Timetable', icon: '📅' },
    { to: '/mentorship', label: 'Mentorship', icon: '🎓' },
    { to: '/innovation', label: 'Innovation Hub', icon: '🚀' },
    { to: '/careers', label: 'Careers', icon: '💼' },
  ];

  return (
    <section className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map(({ to, label, icon }) => {
          const currentPath = String(location.pathname || '');
          const targetPath = String(to);
          const isActive = currentPath === targetPath;

          return (
            <Link
              key={targetPath}
              to={targetPath}
              className={`action-btn ${isActive ? 'active' : ''}`}
              aria-label={label}
              title={label}
            >
              <span className="action-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="action-label">{label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActions;
