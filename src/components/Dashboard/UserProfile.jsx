import React from 'react';
import '../../styles/Dashboard/UserProfile.css';

export default function UserProfile({ user, stats }) {
  const xpPercent = Math.min((stats.xp / 1000) * 100, 100);

  return (
    <section className="user-profile">
      <div className="user-info">
        <h1>Welcome back, <span className="username">{user.username}</span>!</h1>
        <p className="purpose">{user.purpose}</p>

        <div
          className="xp-bar"
          role="progressbar"
          aria-valuenow={xpPercent.toFixed(0)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`XP progress: ${xpPercent.toFixed(0)}%`}
        >
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>

        <div className="level-rank">
          <div className="level">Level {stats.level}</div>
          <div className="rank" title={`Rank #${stats.rank || 'N/A'}`}>
            🏅 #{stats.rank || 'N/A'}
          </div>
        </div>
      </div>
    </section>
  );
}
