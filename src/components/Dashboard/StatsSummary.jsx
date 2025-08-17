// src/components/Dashboard/StatsSummary.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Dashboard/StatsSummary.css";

export default function StatsSummary({ stats = {} }) {
  const cards = [
    { to: "/messages", title: "Messages", value: stats.messages ?? 0, icon: "💬" },
    { to: "/forum", title: "Forum Posts", value: stats.forum ?? 0, icon: "💭" },
    { to: "/marketplace", title: "Marketplace Items", value: stats.marketplace ?? 0, icon: "🛒" },
    { to: "/profile", title: "XP Points", value: stats.xp ?? 0, icon: "⚡" },
  ];

  return (
    <section className="stats-summary" role="region" aria-label="User statistics summary">
      {cards.map(({ to, title, value, icon }) => (
        <Link
          key={to}
          to={to}
          className="stat-card"
          aria-label={`${title}: ${value}`}
        >
          <div className="stat-icon" aria-hidden="true">{icon}</div>
          <div className="stat-info">
            <h3>{title}</h3>
            <p>{value.toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
