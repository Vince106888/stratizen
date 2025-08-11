import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/Leaderboard.css';

export default function Leaderboard({ currentUserRank }) {
  // Placeholder top users list - replace with Firestore data in production
  const topUsers = [
    { username: 'Alice', rank: 1, xp: 980 },
    { username: 'Bob', rank: 2, xp: 940 },
    { username: 'Charlie', rank: 3, xp: 900 },
    { username: 'David', rank: 4, xp: 870 },
    { username: 'Eve', rank: 5, xp: 850 },
  ];

  return (
    <section className="leaderboard">
      <h3>Leaderboard</h3>
      <ul className="leaderboard-list" aria-label="Top users leaderboard">
        {topUsers.map(({ username, rank, xp }) => (
          <li
            key={rank}
            className={`leaderboard-item ${rank === currentUserRank ? 'current-user' : ''}`}
            title={`XP: ${xp}`}
          >
            <span className="rank">#{rank}</span>
            <span className="username">{username}</span>
            <span className="xp">{xp} XP</span>
          </li>
        ))}
      </ul>
      <Link to="/leaderboard" className="view-more">
        View Full Leaderboard
      </Link>
    </section>
  );
}
