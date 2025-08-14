import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/Leaderboard.css';

export default function Leaderboard({ leaderboard, currentUserRank, isLoading }) {
  return (
    <section className="leaderboard">
      <h3>Leaderboard</h3>

      {isLoading ? (
        <p className="loading-message">Loading leaderboard...</p>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <p className="empty-message">No leaderboard data available yet.</p>
      ) : (
        <>
          <ul className="leaderboard-list" aria-label="Top users leaderboard">
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
                  <span className="xp">{xp} XP</span>
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
