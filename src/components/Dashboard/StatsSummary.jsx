import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/StatsSummary.css';

export default function StatsSummary({ stats }) {
  const cards = [
    { to: '/messages', title: 'Messages', value: stats.messages, icon: '💬' },
    { to: '/forum', title: 'Forum Posts', value: stats.forum, icon: '💭' },
    { to: '/marketplace', title: 'Marketplace Items', value: stats.marketplace, icon: '🛒' },
    { to: '/profile', title: 'XP Points', value: stats.xp, icon: '⚡' },
  ];

  return (
    <section className="stats-summary">
      {cards.map(({ to, title, value, icon }) => (
        <Link key={to} to={to} className="stat-card" aria-label={`${title}: ${value}`}>
          <div className="stat-icon">{icon}</div>
          <div className="stat-info">
            <h3>{title}</h3>
            <p>{value}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
