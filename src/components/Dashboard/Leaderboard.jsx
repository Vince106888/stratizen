// src/components/Dashboard/Leaderboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/Leaderboard.css';

/**
 * Leaderboard component showing top users
 */
export default function Leaderboard({ leaderboard = [], currentUserRank, isLoading }) {
  return (
    <section className="leaderboard" role="region" aria-label="Top users leaderboard">
      <h3>Leaderboard</h3>

      {isLoading ? (
        <p className="loading-message" aria-live="polite">Loading leaderboard...</p>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <p className="empty-message" aria-live="polite">No leaderboard data available yet.</p>
      ) : (
        <>
          <ul className="leaderboard-list">
            {leaderboard.slice(0, 5).map((user) => {
              const { username = 'Unknown', rank, xp = 0 } = user;
              const isCurrent = rank === currentUserRank;

              return (
                <li
                  key={rank}
                  className={`leaderboard-item ${isCurrent ? 'current-user' : ''}`}
                  title={`XP: ${xp}`}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  <span className="rank">#{rank}</span>
                  <span className="username">{username}</span>
                  <span className="xp">{xp.toLocaleString()} XP</span>
                </li>
              );
            })}
          </ul>
          <Link to="/leaderboard" className="view-more">
            View Full Leaderboard
          </Link>
        </>
      )}
    </section>
  );
}
