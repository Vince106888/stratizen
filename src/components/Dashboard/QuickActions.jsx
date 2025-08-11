import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/QuickActions.css';

function QuickActions() {
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
        {actions.map(({ to, label, icon }) => (
          <Link key={to} to={to} className="action-btn" aria-label={label}>
            <span className="action-icon">{icon}</span>
            <span className="action-label">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
